import React, { useEffect, useState } from 'react';
import '../styles/AdminProfile.css';
import Header from './AdminHeader'; // Import the Header component
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase functions
import { storage } from '../firebaseConfig'; // Import the initialized Firebase storage
import img from '../images/default-profile.jpg';
import Modal from 'react-modal';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImageHelper'; // Helper function for cropping

Modal.setAppElement('#root'); // Ensure accessibility for the modal

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        const response = await fetch('https://vynceianoani.helioho.st/getprofileadmin.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (data.status === 'success') {
          setUserData(data.data);
          setImageUrl(data.data.profileImageUrl || ''); // Fetch existing profile image if available

          if (email.includes('@chicstation')) {
            // Fetch services for the employee if applicable
            const servicesResponse = await fetch('https://vynceianoani.helioho.st/getemployee_services.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ employeeId: data.data.id }),
            });

            const servicesData = await servicesResponse.json();
            if (servicesData.status === 'success') {
              setServices(servicesData.services);
            } else {
              setError(servicesData.message || 'Failed to fetch services.');
            }
          }
        } else {
          setError(data.message || 'Failed to fetch user data.');
        }
      } catch (error) {
        setError('An error occurred while fetching user data.');
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageFile(imageUrl);
      setIsCropModalOpen(true); // Open the crop modal immediately
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropComplete = async () => {
    try {
      const croppedImage = await getCroppedImg(imageFile, croppedAreaPixels);
      setImageFile(croppedImage);
      uploadImage(croppedImage);
      setIsCropModalOpen(false);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  const uploadImage = async (croppedImage) => {
    if (!croppedImage) return;

    try {
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      const imageRef = ref(storage, `profile_pictures/${userData.email}`);
      await uploadBytes(imageRef, blob);
      const url = await getDownloadURL(imageRef);

      // Optionally, update the user's profile picture URL in your backend
      const updateResponse = await fetch('https://vynceianoani.helioho.st/updateEmployeeImage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          profileImage: url,
        }),
      });

      const updateData = await updateResponse.json();
      if (updateData.status === 'success') {
        setImageUrl(url); // Update the profile image URL in the UI
      } else {
        setError('Failed to update profile image.');
      }
    } catch (error) {
      setError('An error occurred while uploading the image.');
    }
  };

  const handleUploadClick = () => {
    handleCropComplete();
  };

  const handleCancelClick = () => {
    setIsCropModalOpen(false);
    setImageFile(null);
  };

  if (error) {
    return <div className="admin-profile error">{error}</div>;
  }

  if (!userData) {
    return <div className="admin-profile">Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className="admin-profile-container">
        <div className="admin-profile">
          <div className="admin-profile-content">
            <div className="admin-profile-left">
              <div className="admin-profile-picture">
                <img
                  src={imageUrl || img}
                  alt="Profile"
                  className="profile-img"
                />
                <div
                  className="camera-icon"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  📷
                </div>
                <div>
                  <p className="profile-name">{userData.fullName}</p> {/* Add user's name */}
                </div>
              </div>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }} // Inline style as an object
                onChange={handleFileChange}
              />
            </div>
            <div className="admin-profile-right">
              <h1>Staff Information</h1>
              <div className="admin-profile-info">
                <p>Assigned {userData.branchName}: {userData.address}</p>
                <div className="admin-profile-row">
                  <label>Full Name:</label>
                  <span>{userData.fullName}</span>
                </div>
                <div className="admin-profile-row">
                  <label>Email:</label>
                  <span>{userData.email}</span>
                </div>
                <div className="admin-profile-row">
                  <label>Contact Number:</label>
                  <span>{userData.contactNumber}</span>
                </div>
                {services.length > 0 && (
                  <div className="admin-profile-services">
                    {services.map((service, index) => (
                      <div key={index} className="admin-profile-service-box">
                        <h3>{service.name}</h3>
                        <p>{service.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCropModalOpen}
        onRequestClose={handleCancelClick}
        contentLabel="Crop Image Modal"
      >
        <div className="crop-modal-content1">
          <h2>Adjust Your Image</h2>
          <div className="cropper-preview-container1">
            <Cropper
              image={imageFile}
              crop={crop}
              zoom={zoom}
              aspect={1} // Keeps it square
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="crop-modal-buttons1">
            <button onClick={handleUploadClick}>Upload</button>
            <button onClick={handleCancelClick}>Cancel</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ProfilePage;
