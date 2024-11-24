import React, { useState, useEffect } from 'react';
import Header from './SuperAdminHeader';
import '../styles/ManageUserEmployees.css';

const ManageUsersEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [deleteMessage, setDeleteMessage] = useState('');

    useEffect(() => {
        fetchBranches();
        fetchEmployees('all'); // Fetch employees for the initial branch (default 'all')
    }, []);

    useEffect(() => {
        if (deleteMessage) {
            const timer = setTimeout(() => {
                setDeleteMessage('');
            }, 4000); // Clear message after 2 seconds

            return () => clearTimeout(timer); // Cleanup timeout if component unmounts
        }
    }, [deleteMessage]);

    const fetchBranches = () => {
        fetch('https://vynceianoani.helioho.st/getbranches.php')
            .then((response) => response.json())
            .then((data) => setBranches(data.branches || []))
            .catch((error) => console.error('Error fetching branches:', error));
    };

    const fetchEmployees = (branch) => {
        fetch('https://vynceianoani.helioho.st/getadmins.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ branch }),
        })
            .then((response) => response.json())
            .then((data) => setEmployees(data.employees || []))
            .catch((error) => console.error('Error fetching employees:', error));
    };

    const handleTabChange = (branch) => {
        setSelectedBranch(branch);
        fetchEmployees(branch);
    };

    const deactivateEmployee = (employeeId) => {
        fetch('https://vynceianoani.helioho.st/deleteadmin.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: employeeId }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'success') {
                    setDeleteMessage('Employee deactivated successfully!');
                    fetchEmployees(selectedBranch);
                } else {
                    setDeleteMessage(data.message || 'An error occurred.');
                }
            })
            .catch((error) => setDeleteMessage('Error deactivating employee.'));
    };

    const activateEmployee = (employeeId) => {
        fetch('https://vynceianoani.helioho.st/activateadmin.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: employeeId }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'success') {
                    setDeleteMessage('Employee activated successfully!');
                    fetchEmployees(selectedBranch);
                } else {
                    setDeleteMessage(data.message || 'An error occurred.');
                }
            })
            .catch((error) => setDeleteMessage('Error activating employee.'));
    };

    const activeEmployees = employees.filter((employee) => employee.status === 'active');
    const inactiveEmployees = employees.filter((employee) => employee.status === 'inactive');

    return (
        <>
            <Header />
            <div className="background"></div>
            
            {/* Success message container */}
            {deleteMessage && <div className="delete-message">{deleteMessage}</div>}
            
            <div className="manage-users-employees-container">
                <h2 className="header-title">Manage Employees</h2>
    
                <div className="filter-tabs1">
                    <button
                        className={`filter-tab ${selectedBranch === 'all' ? 'active-tab' : ''}`}
                        onClick={() => handleTabChange('all')}
                    >
                        All Branches
                    </button>
                    {branches.map((branch) => (
                        <button
                            key={branch.id}
                            className={`filter-tab ${selectedBranch === branch.id ? 'active-tab' : ''}`}
                            onClick={() => handleTabChange(branch.id)}
                        >
                            {branch.name}
                        </button>
                    ))}
                </div>
    
                <div className="employees-container">
                    <div className="employees-section">
                        <h3 className="manage">Active Employees</h3>
                        <div className="scrollable-table-container">
                            <table className="employees-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeEmployees.map((employee) => (
                                        <tr key={employee.id}>
                                            <td>{employee.fullName}</td>
                                            <td>{employee.email}</td>
                                            <td>
                                                <button
                                                    onClick={() => deactivateEmployee(employee.id)}
                                                    className="action-button deactivate"
                                                >
                                                    Deactivate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="employees-section">
                        <h3 className="manage">Inactive Employees</h3>
                        <div className="scrollable-table-container">
                            <table className="employees-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inactiveEmployees.map((employee) => (
                                        <tr key={employee.id}>
                                            <td>{employee.fullName}</td>
                                            <td>{employee.email}</td>
                                            <td>
                                                <button
                                                    onClick={() => activateEmployee(employee.id)}
                                                    className="action-button activate"
                                                >
                                                    Activate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
    
};

export default ManageUsersEmployees;
