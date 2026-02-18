import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Lock, User, Shield } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try database login first
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        onLogin();
      } else {
        // Fallback to default credentials
        if (username === 'admin' && password === 'admin123') {
          localStorage.setItem('adminLoggedIn', 'true');
          onLogin();
        } else {
          const data = await response.json();
          setError(data.error || 'Invalid username or password');
        }
      }
    } catch (err) {
      // If server is down, try default credentials
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        onLogin();
      } else {
        setError('Invalid username or password');
      }
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 50%, #1e3a5f 100%)',
      padding: '2rem'
    }}>
      <Container style={{ maxWidth: '420px' }}>
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
              <Shield size={40} color="#fff" />
            </div>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#f8fafc',
              marginBottom: '0.5rem'
            }}>Admin Login</h2>
            <p style={{ color: '#94a3b8', margin: 0 }}>Enter your credentials to access the dashboard</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: 'none',
              borderLeft: '4px solid #ef4444',
              borderRadius: '10px'
            }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>
                <User size={16} style={{ marginRight: '0.5rem' }} />
                Username
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '2px solid rgba(148, 163, 184, 0.2)',
                  color: '#f8fafc',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>
                <Lock size={16} style={{ marginRight: '0.5rem' }} />
                Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '2px solid rgba(148, 163, 184, 0.2)',
                  color: '#f8fafc',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem'
                }}
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
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Login'
              )}
            </Button>
          </Form>

          {/* Hint */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>
              <strong style={{ color: '#10b981' }}>Default Credentials:</strong><br />
              Username: <code style={{ color: '#fbbf24' }}>admin</code> | Password: <code style={{ color: '#fbbf24' }}>admin123</code>
            </p>
          </div>

        </div>
      </Container>
    </div>
  );
};

export default Login;
