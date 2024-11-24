import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.js';
import '../styles/Billing.css';

const BillingList = () => {
  const [billings, setBillings] = useState([]);
  const [filteredBillings, setFilteredBillings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Paid');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [billingToCancel, setBillingToCancel] = useState(null);
  const navigate = useNavigate();

  // Fetch billings when the component mounts
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      navigate('/login');
      return;
    }

    setLoading(true);

    fetch('https://vynceianoani.helioho.st/fetchBillings.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.status === 'success') {
          setBillings(data.billings);
          setFilteredBillings(data.billings.filter(billing => billing.status === 'paid'));
        } else {
          setError(data.message || 'Failed to fetch billings.');
        }
      })
      .catch((error) => {
        setLoading(false);
        setError('An error occurred while fetching billings.');
      });
  }, [navigate]);

  // Handle tab change and filter billings accordingly
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'Paid') {
      setFilteredBillings(billings.filter(billing => billing.status === 'paid'));
    } else if (tab === 'Unpaid') {
      setFilteredBillings(billings.filter(billing => billing.status === 'pending'));
    } else if (tab === 'Cancelled') {
      setFilteredBillings(billings.filter(billing => billing.status === 'cancelled'));
    }
  };

  // Navigate to payment page
  const handlePayNow = (billing) => {
    navigate('/finalize-billing', { state: { billing } });
  };

  // Show confirmation modal for cancelling billing
  const confirmCancelBilling = (billing) => {
    setBillingToCancel(billing);
    setShowConfirmation(true);
  };

  // Cancel billing when confirmed
  const handleCancelBilling = () => {
    const email = localStorage.getItem('userEmail');
    if (!email || !billingToCancel) return;

    setLoading(true);
    fetch('https://vynceianoani.helioho.st/cancelBilling.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ billingId: billingToCancel.billing_id, email }),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.status === 'success') {
          setBillings((prevBillings) =>
            prevBillings.map((billing) =>
              billing.billing_id === billingToCancel.billing_id ? { ...billing, status: 'cancelled' } : billing
            )
          );
          setFilteredBillings((prevFilteredBillings) =>
            prevFilteredBillings.map((billing) =>
              billing.billing_id === billingToCancel.billing_id ? { ...billing, status: 'cancelled' } : billing
            )
          );
        } else {
          setError(data.message || 'Failed to cancel billing.');
        }
        setShowConfirmation(false);
        setBillingToCancel(null);
      })
      .catch((error) => {
        setLoading(false);
        setError('An error occurred while canceling the billing.');
        setShowConfirmation(false);
        setBillingToCancel(null);
      });
  };

  return (
    <div>
      <Header />
      <div className='sticky-header'></div>
      <div className="billing-list-container">

          <h2 className='h22'>Your Billings</h2>
          <div className="reservation-tabs">
            {['Paid', 'Unpaid', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            ))}
          
        </div>

        {loading && <p>Loading...</p>}
        {error && <div className="error-message">{error}</div>}

        <div className="billing-grid">
          {filteredBillings.length > 0 ? (
            filteredBillings.map((billing) => (
              <div key={billing.billing_id} className="billing-item">
                <div>
                  <p><strong>Billing ID:</strong> {billing.billing_id}</p>
                  <p><strong>Total Price:</strong> ${billing.total_price}</p>
                  <p><strong>Status:</strong> {billing.status}</p>
                  <p><strong>Date:</strong> {billing.billing_date}</p>
                  <p><strong>Time:</strong> {billing.billing_time}</p>
                </div>
                {billing.status === 'pending' && (
                  <div>
                    <button
                      className="pay-now-button"
                      onClick={() => handlePayNow(billing)}
                    >
                      Pay Now
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() => confirmCancelBilling(billing)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No billings found.</p>
          )}
        </div>

        {showConfirmation && (
          <div className="confirmation-modal">
            <div className="modal-content">
              <h3>Confirm Cancellation</h3>
              <p>Are you sure you want to cancel this billing?</p>
              <button
                className="confirm-button"
                onClick={handleCancelBilling}
              >
                Yes, Cancel
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setShowConfirmation(false);
                  setBillingToCancel(null);
                }}
              >
                No, Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingList;
