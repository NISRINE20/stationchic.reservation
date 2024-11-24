import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css'; 
import Header from './Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'; // Import Font Awesome icons

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState({});
  const [offsets, setOffsets] = useState({});
  const [hovered, setHovered] = useState(false);
  const [flippedCardIndex, setFlippedCardIndex] = useState(null); // Track the flipped card index

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('https://vynceianoani.helioho.st/getsales.php');
        const data = await response.json();

        if (data.services && Array.isArray(data.services)) {
          const sortedServices = data.services.sort((a, b) => b.service_count - a.service_count);
          const recommendedServices = sortedServices.slice(0, 5);
          setServices(recommendedServices);
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    const fetchAllServices = async () => {
      try {
        const response = await fetch('https://vynceianoani.helioho.st/servicespic.php');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const formattedServices = data.map(service => ({
            name: service.name,
            image: service.image_url,
            type: service.type,
            price: service.price,
            description: service.description
          }));

          const servicesByType = formattedServices.reduce((acc, service) => {
            if (!acc[service.type]) {
              acc[service.type] = [];
            }
            acc[service.type].push(service);
            return acc;
          }, {});

          setAllServices(servicesByType);
        }
      } catch (error) {
        console.error('Error fetching all services:', error);
      }
    };

    fetchSalesData();
    fetchAllServices();
  }, []);

  const enrichedRecommendedServices = services.map(service => {
    const foundService = Object.values(allServices).flat().find(s => s.name === service.service_name);
    return foundService ? { ...service, image: foundService.image, price: foundService.price, description: foundService.description } : service;
  });

  const handleNext = () => {
    const currentOffset = offsets['recommended'] || 0;
    if (currentOffset + 5 < enrichedRecommendedServices.length) {
      setOffsets(prev => ({ ...prev, recommended: currentOffset + 1 }));
    }
  };

  const handlePrev = () => {
    const currentOffset = offsets['recommended'] || 0;
    if (currentOffset > 0) {
      setOffsets(prev => ({ ...prev, recommended: currentOffset - 1 }));
    }
  };

  const handleNextType = (type) => {
    const currentOffset = offsets[type] || 0;
    if (currentOffset + 5 < (allServices[type] || []).length) {
      setOffsets(prev => ({ ...prev, [type]: currentOffset + 1 }));
    }
  };

  const handlePrevType = (type) => {
    const currentOffset = offsets[type] || 0;
    if (currentOffset > 0) {
      setOffsets(prev => ({ ...prev, [type]: currentOffset - 1 }));
    }
  };

  // Toggle the flipped state for a specific card (only one card can be flipped at a time)
  const handleCardClick = (index) => {
    setFlippedCardIndex(prevState => (prevState === index ? null : index));
  };

  return (
    <div>
      <div className="sticky-header">
        <Header />
      </div>
      <div className="homepage-container">
        <h1>Welcome to Chic Station</h1>
        <p>Explore our range of services to treat yourself.</p>

        {/* Recommended Services Section */}
        <h2 className='h2-homepage'>Recommended Services</h2>
        <div className="services-container" 
             onMouseEnter={() => setHovered(true)} 
             onMouseLeave={() => setHovered(false)}>
          {enrichedRecommendedServices.slice(offsets['recommended'] || 0, (offsets['recommended'] || 0) + 5).map((service, index) => (
            <div key={index} className="flip-container" onClick={() => handleCardClick(index)}>
              <div className={`flip-card ${flippedCardIndex === index ? 'flipped' : ''}`}>
                {/* Front of the card */}
                <div className="flip-card-front">
                  <Link 
                    to={`/userpage`}  // Redirect to the booking page
                    className="image-link"
                  >
                    <img src={service.image} alt={service.service_name} className="service-image" />
                  </Link>
                  <h3>{service.service_name} - ₱{service.price}</h3>
                </div>
                
                {/* Back of the card */}
                <div className="flip-card-back">
                  <h3>More Info</h3>
                  <p>{service.description}</p>
                </div>
              </div>
            </div>
          ))}

          {enrichedRecommendedServices.length > 5 && hovered && (
            <>
              <button className="slider-button left" onClick={handlePrev}>
                <FontAwesomeIcon icon={faChevronLeft} /> {/* Font Awesome left arrow */}
              </button>
              <button className="slider-button right" onClick={handleNext}>
                <FontAwesomeIcon icon={faChevronRight} /> {/* Font Awesome right arrow */}
              </button>
            </>
          )}
        </div>

        {/* Render dynamic services by type */}
        {Object.keys(allServices).map((type) => (
          <div key={type} className="services-section">
            <h2 className='h2-homepage'>{type} Services</h2>
            <div 
              className="services-container" 
              onMouseEnter={() => setHovered(true)} 
              onMouseLeave={() => setHovered(false)}
            >
              {allServices[type].slice(offsets[type] || 0, (offsets[type] || 0) + 5).map((service, index) => (
                <div key={index} className="flip-container" onClick={() => handleCardClick(`${type}-${index}`)}>
                  <div className={`flip-card ${flippedCardIndex === `${type}-${index}` ? 'flipped' : ''}`}>
                    {/* Front of the card */}
                    <div className="flip-card-front">
                      <Link 
                        to={`/userpage`}  // Redirect to the booking page
                        className="image-link"
                      >
                        <img src={service.image} alt={service.name} className="service-image" />
                      </Link>
                      <h3>{service.name} - ₱{service.price}</h3>
                    </div>
                    
                    {/* Back of the card */}
                    <div className="flip-card-back">
                      <h3>More Info</h3>
                      <p>{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {allServices[type].length > 5 && hovered && (
                <>
                  <button className="slider-button left" onClick={() => handlePrevType(type)}>
                    <FontAwesomeIcon icon={faChevronLeft} size="2x" /> {/* Font Awesome left arrow */}
                  </button>
                  <button className="slider-button right" onClick={() => handleNextType(type)}>
                    <FontAwesomeIcon icon={faChevronRight} size="2x"/> {/* Font Awesome right arrow */}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
