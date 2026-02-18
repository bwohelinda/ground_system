import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { User, Mail, Lock, UserPlus, Shield } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Register = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName || !formData.email || !formData.username || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess({ ...formData, userId: data.userId });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    }

    setLoading(false);
  };

  const inputStyle = {
    background: 'rgba(15, 23, 42, 0.8)',
    border: '2px solid rgba(148, 163, 184, 0.2)',
    color: '#f8fafc',
    borderRadius: '12px',
    padding: '0.75rem 1rem'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <Container style={{ maxWidth: '500px' }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.95)',
          borderRadius: '20px',
          padding: '2.5rem',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.1)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
            }}>
              <UserPlus size={40} color="#fff" />
            </div>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#f8fafc',
              marginBottom: '0.5rem'
            }}>Admin Registration</h2>
            <p style={{ color: '#94a3b8', margin: 0 }}>Create your admin account for Arena Cricket</p>
          </div>

          {/* Error Alert */}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>
                    <User size={16} style={{ marginRight: '0.5rem' }} />
                    First Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>
                    Last Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>
                <Mail size={16} style={{ marginRight: '0.5rem' }} />
                Email Address *
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>
                <User size={16} style={{ marginRight: '0.5rem' }} />
                Username *
              </Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>
                <Lock size={16} style={{ marginRight: '0.5rem' }} />
                Password *
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Create password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>
                <Lock size={16} style={{ marginRight: '0.5rem' }} />
                Confirm Password *
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem',
                fontWeight: '600',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <Shield size={20} />
                  Create Admin Account
                </>
              )}
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default Register;
