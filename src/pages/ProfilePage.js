import React, { useEffect, useState } from 'react';
import '../styles/ProfilePage.css'; // Import your CSS
import Header from '../pages/Header'; // Import the Header component
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase functions
import { storage } from '../firebaseConfig'; // Import the initialized Firebase storage
import img from '../images/default-profile.jpg';
import Modal from 'react-modal';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImageHelper'; // Helper function for cropping

Modal.setAppElement('#root'); // Ensure accessibility for the modal

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [totalReservations, setTotalReservations] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedEmail = localStorage.getItem("userEmail");
        const response = await fetch("https://vynceianoani.helioho.st/getprofile.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: storedEmail }),
        });

        const data = await response.json();
        if (data.status === "success") {
          setUserData(data.data);
          setFullName(data.data.fullName);
          setContactNumber(data.data.contactNumber);
          setEmail(data.data.email);
          setImageUrl(data.data.profileImageUrl || "");
          if (data.data.id) {
            fetchReservationStats(data.data.id);
          }
        } else {
          setError(data.message || "Failed to fetch user data.");
        }
      } catch (error) {
        setError("An error occurred while fetching user data.");
      }
    };

    const fetchReservationStats = async (id) => {
      try {
        const response = await fetch("https://vynceianoani.helioho.st/getUserReservationStat.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: id }),
        });

        const data = await response.json();
        if (data.status === "success") {
          setTotalReservations(data.totalReservations || 0);
          setTotalSpent(data.totalSpent || 0);
        } else {
          setError(data.message || "Failed to fetch reservation stats.");
        }
      } catch (error) {
        setError("An error occurred while fetching reservation stats.");
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageFile(imageUrl);
      setIsCropModalOpen(true); // Open the crop modal
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleUploadImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageFile, croppedAreaPixels);
      setImageFile(croppedImage);
      uploadImage(croppedImage);
      setIsCropModalOpen(false); // Close the modal after upload
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  const handleCancelCrop = () => {
    setIsCropModalOpen(false); // Simply close the modal without changes
  };

  const uploadImage = async (croppedImage) => {
    if (!croppedImage) return;

    try {
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      const imageRef = ref(storage, `profile_pictures/${email}`);
      await uploadBytes(imageRef, blob);
      const url = await getDownloadURL(imageRef);

      const updateResponse = await fetch('https://vynceianoani.helioho.st/updateProfileImage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
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

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch("https://vynceianoani.helioho.st/updateProfile.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldEmail: userData.email,
          fullName,
          contactNumber,
          email,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setUserData((prev) => ({
          ...prev,
          fullName,
          contactNumber,
          email,
        }));
        localStorage.setItem("userEmail", email); // Update localStorage with the new email
        setIsEditing(false); // Exit editing mode after successful update
      } else {
        setError("Failed to update profile.");
      }
    } catch (error) {
      setError("An error occurred while updating the profile.");
    }
  };

  if (error) {
    return <div className="profile-page error">{error}</div>;
  }

  if (!userData) {
    return <div className="profile-page-loading">Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className="profile-page-container">
        <div className="profile-page">
          <div className="profile-content">
            <div className="profile-upload-section">
              <div className="profile-picture">
                <img src={imageUrl || img} alt="Profile" className="profile-img" />
                <div
                  className="camera-icon1"
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
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            <div className="profile-info">
              <h1>Profile Information</h1>
              {isEditing ? (
                <>
                  <div className="profile-row">
                    <label>Full Name:</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="profile-row">
                    <label>Contact Number:</label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </div>
                  <div className="profile-row">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button
                    className="profile-save-button"
                    onClick={handleProfileUpdate}
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <div className="profile-row">
                    <label>Full Name:</label>
                    <span>{userData.fullName}</span>
                  </div>
                  <div className="profile-row">
                    <label>Contact Number:</label>
                    <span>{userData.contactNumber}</span>
                  </div>
                  <div className="profile-row">
                    <label>Email:</label>
                    <span>{userData.email}</span>
                  </div>
                  <div className="profile-row">
                    <label>Total Reservations:</label>
                    <span>{totalReservations}</span>
                  </div>
                  <div className="profile-row">
                    <label>Total Amount Spent:</label>
                    <span>₱{totalSpent}</span>
                  </div>
                  {!isEditing && (
                    <button
                      className="profile-edit-button"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for image cropping */}
      <Modal isOpen={isCropModalOpen} onRequestClose={() => setIsCropModalOpen(false)}>
        <div className="crop-modal-content">
          <Cropper
            image={imageFile}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="cropper-preview-container">
            <button onClick={handleUploadImage}>Upload</button>
            <button onClick={handleCancelCrop}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
