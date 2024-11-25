import React, { useState, useEffect } from 'react';
import Header from './SuperAdminHeader';
import '../styles/CreateAdmin.css';

const CreateAdmin = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        contactNumber: '',
        services: [],
        branch: '',
    });
    const [servicesList, setServicesList] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [serviceFilter, setServiceFilter] = useState('All'); // Filter state
    const [branchesList, setBranchesList] = useState([]);
    const [message, setMessage] = useState('');

    // Fetch services from the API
    const fetchServices = async () => {
        try {
            const response = await fetch('https://vynceianoani.helioho.st/getservices.php');
            const data = await response.json();
            setServicesList(data.services);
            setFilteredServices(data.services); // Initial all services
        } catch (error) {
            console.error('Error fetching services:', error);
            setServicesList([]);
            setFilteredServices([]);
        }
    };

    // Fetch branches from the API
    const fetchBranches = async () => {
        try {
            const response = await fetch('https://vynceianoani.helioho.st/getbranches.php');
            const data = await response.json();
            setBranchesList(data.branches);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle checkbox for services
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            services: checked
                ? [...prevFormData.services, value]
                : prevFormData.services.filter((service) => service !== value),
        }));
    };

    // Handle service filter change
    const handleFilterChange = (e) => {
        const selectedCategory = e.target.value;
        setServiceFilter(selectedCategory);

        // Filter services based on the selected category
        if (selectedCategory === 'All') {
            setFilteredServices(servicesList); // Show all services
        } else {
            const filtered = servicesList.filter(
                (service) => service.type && service.type === selectedCategory
            );
            setFilteredServices(filtered); // Filtered services by category
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('https://vynceianoani.helioho.st/createadmin.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'success') {
                    setMessage('Admin account created successfully!');
                    setFormData({
                        fullName: '',
                        email: '',
                        password: '',
                        contactNumber: '',
                        services: [],
                        branch: '',
                    });
                } else {
                    setMessage(data.message || 'An error occurred.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setMessage('An error occurred while creating the account.');
            });
    };

    // On component mount, fetch services and branches
    useEffect(() => {
        fetchServices();
        fetchBranches();
    }, []);

    return (
        <div>
            <div className="background-nice"></div>
            <Header />
            <div className="create-admin-container">
                <h2 className="header-title">Create Admin Account</h2>
                {message && <div className="message">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-columns">
                        {/* First Column: Form Inputs */}
                        <div className="column">
                            <div className="form-group">
                                <label>Full Name:</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Number:</label>
                                <input
                                    type="text"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={11}
                                />
                            </div>
                            <div className="form-group">
                                <label>Branch:</label>
                                <select
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a Branch</option>
                                    {branchesList.map((branch, index) => (
                                        <option key={index} value={branch.id}>
                                            {branch.name} - {branch.address}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Second Column: Services */}
                        <div className="column">
                            <div className="form-group">
                                <select value={serviceFilter} onChange={handleFilterChange}>
                                    <option value="All">All Services</option>
                                    <option value="Nails">Nails Services</option>
                                    <option value="Lash and Brow">Lash and Brow Services</option>
                                    <option value="Waxing">Waxing Services</option>
                                    <option value="Hair and Make-up">Hair and Make-up</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Services Offered:</label>
                                <div className="services-scrollable1">
                                    <table className="services-table">
                                        <tbody>
                                            {filteredServices.length > 0 ? (
                                                filteredServices.map((service, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                value={service.name}
                                                                checked={formData.services.includes(service.name)}
                                                                onChange={handleCheckboxChange}
                                                            />
                                                        </td>
                                                        <td>
                                                            <label>{service.name}</label>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2">No services found for the selected category.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <button type="submit" className='create-employee1'>Create Admin</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAdmin;
