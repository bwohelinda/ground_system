import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Trophy, Home } from 'lucide-react';

const Navigation = () => {
  return (
    <Navbar expand="lg" sticky="top" style={{
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
      padding: '1rem 0',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
    }}>
      <Container>
        <Navbar.Brand href="/" style={{
          fontSize: '1.6rem',
          fontWeight: '800',
          background: 'linear-gradient(90deg, #10b981, #34d399, #fbbf24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Trophy size={28} style={{ color: '#10b981' }} />
          ARENA CRICKET
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{
          border: '1px solid rgba(16, 185, 129, 0.5)',
          padding: '0.5rem'
        }}>
          <span style={{ 
            display: 'block', 
            width: '22px', 
            height: '2px', 
            background: '#10b981',
            marginBottom: '5px'
          }}></span>
          <span style={{ 
            display: 'block', 
            width: '22px', 
            height: '2px', 
            background: '#10b981',
            marginBottom: '5px'
          }}></span>
          <span style={{ 
            display: 'block', 
            width: '22px', 
            height: '2px', 
            background: '#10b981'
          }}></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto" style={{ gap: '0.5rem' }}>
            <Nav.Link href="/" style={{
              color: '#f8fafc',
              fontWeight: '500',
              padding: '0.6rem 1.25rem',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(16, 185, 129, 0.2)';
              e.target.style.color = '#10b981';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#f8fafc';
            }}
            >
              <Home size={18} /> Home
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;