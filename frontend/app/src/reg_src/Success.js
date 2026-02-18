import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { CheckCircle, ArrowRight, Shield } from 'lucide-react';

const Success = ({ userData }) => {
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
          padding: '3rem',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 60px rgba(16, 185, 129, 0.15)',
          textAlign: 'center'
        }}>
          {/* Success Icon */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)'
          }}>
            <CheckCircle size={50} color="#fff" />
          </div>

          {/* Success Message */}
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#f8fafc',
            marginBottom: '0.5rem'
          }}>Registration Successful!</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Your admin account has been created
          </p>

          {/* User Details */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'grid', gap: '0.75rem', color: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Name:</span>
                <span style={{ fontWeight: '600' }}>{userData?.firstName} {userData?.lastName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Username:</span>
                <span style={{ fontWeight: '600', color: '#10b981' }}>{userData?.username}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Email:</span>
                <span style={{ fontWeight: '600' }}>{userData?.email}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            href="http://localhost:3001"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontWeight: '700',
              fontSize: '1.1rem',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              textDecoration: 'none'
            }}
          >
            <Shield size={20} />
            Go to Admin Panel
            <ArrowRight size={20} />
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Success;
