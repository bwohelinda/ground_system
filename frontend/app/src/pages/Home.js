import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, ArrowRight } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Home = () => {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const response = await fetch(`${API_URL}/grounds`);
        if (response.ok) {
          const data = await response.json();
          // Only show active grounds
          setGrounds(data.filter(g => g.status === 'Active'));
          setError(null);
        } else {
          setError('Failed to load stadiums');
        }
      } catch (err) {
        console.error('Error fetching grounds:', err);
        setError('Cannot connect to server. Please make sure the backend is running.');
      }
      setLoading(false);
    };
    fetchGrounds();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <Spinner animation="border" variant="success" style={{ width: '4rem', height: '4rem' }} />
          <p className="mt-3" style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Loading amazing stadiums...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 1rem 3rem',
        position: 'relative'
      }}>
        <div className="animate-fadeInUp">
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800',
            background: 'linear-gradient(90deg, #10b981, #34d399, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem'
          }}>
            Book Your Perfect Ground
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '1.2rem', 
            maxWidth: '600px', 
            margin: '0 auto 2rem'
          }}>
            Premium cricket grounds with world-class facilities. 
            Reserve your slot today and play like champions!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
              <Clock size={20} />
              <span>24/7 Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
              <Star size={20} />
              <span>Premium Quality</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4' }}>
              <MapPin size={20} />
              <span>Best Locations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stadiums Grid */}
      <Container>
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <h2>Select Your Stadium</h2>
        </div>
        
        {grounds.length === 0 ? (
          <Alert variant="info" className="text-center">
            <h5>No Stadiums Available</h5>
            <p className="mb-0">Please add stadiums from the Admin Panel to get started.</p>
          </Alert>
        ) : (
          <Row className="g-4 justify-content-center">
            {grounds.map((stadium, index) => (
              <Col lg={4} md={6} key={stadium.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fadeInUp">
                <Card className="stadium-card h-100">
                  <div className="card-img-container">
                    {stadium.photo ? (
                      <Card.Img variant="top" src={stadium.photo} />
                    ) : (
                      <div className="stadium-placeholder">
                        <span>{stadium.name}</span>
                      </div>
                    )}
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="mb-2">{stadium.name}</Card.Title>
                    <Card.Text className="flex-grow-1">
                      {stadium.description || 'Premium cricket ground with excellent facilities'}
                    </Card.Text>
                    <div className="price-tag mb-3">
                      Rs. {stadium.price?.toLocaleString() || '0'} / hour
                    </div>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="success" 
                        className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => navigate(`/book/${stadium.id}`)}
                      >
                        Book Now <ArrowRight size={18} />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Footer Info */}
      <Container className="mt-5 text-center">
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          borderRadius: '20px', 
          padding: '2rem',
          border: '1px solid rgba(16, 185, 129, 0.1)'
        }}>
          <Row className="g-4">
            <Col md={4}>
              <div className="stats-card">
                <h3>10+</h3>
                <p>Premium Grounds</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="stats-card">
                <h3>500+</h3>
                <p>Happy Customers</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="stats-card">
                <h3>24/7</h3>
                <p>Support Available</p>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Home;