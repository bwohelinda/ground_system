import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Badge, Tabs, Tab, Image, Row, Col, Spinner } from 'react-bootstrap';
import { Plus, Trash2, Edit, Upload, Users, MapPin, DollarSign, Calendar, LogOut, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Admin = ({ onLogout }) => {
  const [grounds, setGrounds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGround, setEditingGround] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newGround, setNewGround] = useState({
    name: '',
    status: 'Active',
    price: '',
    description: '',
    photo: null,
    photoPreview: null
  });

  // Fetch grounds from server
  const fetchGrounds = async () => {
    try {
      const response = await fetch(`${API_URL}/grounds`);
      if (response.ok) {
        const data = await response.json();
        setGrounds(data);
      }
    } catch (err) {
      console.error('Error fetching grounds:', err);
    }
  };

  // Fetch bookings from server
  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/bookings`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  // Update booking status
  const updateBookingStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGrounds(), fetchBookings()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleShowModal = (ground = null) => {
    if (ground) {
      setEditingGround(ground);
      setNewGround({
        name: ground.name,
        status: ground.status,
        price: ground.price || '',
        description: ground.description || '',
        photo: ground.photo,
        photoPreview: ground.photo
      });
    } else {
      setEditingGround(null);
      setNewGround({
        name: '',
        status: 'Active',
        price: '',
        description: '',
        photo: null,
        photoPreview: null
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGround(null);
    setNewGround({
      name: '',
      status: 'Active',
      price: '',
      description: '',
      photo: null,
      photoPreview: null
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewGround(prev => ({
          ...prev,
          photo: reader.result,
          photoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGround = async () => {
    if (!newGround.name) {
      alert('Please enter stadium name');
      return;
    }
    setSaving(true);
    try {
      const groundData = {
        name: newGround.name,
        status: newGround.status,
        price: parseFloat(newGround.price) || 0,
        description: newGround.description,
        photo: newGround.photo
      };

      let response;
      if (editingGround) {
        response = await fetch(`${API_URL}/grounds/${editingGround.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(groundData)
        });
      } else {
        response = await fetch(`${API_URL}/grounds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(groundData)
        });
      }

      if (response.ok) {
        await fetchGrounds();
        handleCloseModal();
      } else {
        alert('Error saving stadium');
      }
    } catch (err) {
      console.error('Error saving ground:', err);
      alert('Error connecting to server');
    }
    setSaving(false);
  };

  const handleDeleteGround = async (id) => {
    if (window.confirm('Are you sure you want to delete this stadium?')) {
      try {
        const response = await fetch(`${API_URL}/grounds/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchGrounds();
        }
      } catch (err) {
        console.error('Error deleting ground:', err);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <Spinner animation="border" variant="success" style={{ width: '4rem', height: '4rem' }} />
          <p className="mt-3" style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <Container className="py-4">
        {/* Header Section */}
        <div className="admin-header" style={{ 
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '3px solid #10b981',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'linear-gradient(90deg, #f8fafc, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem'
            }}>
              Admin Dashboard
            </h2>
            <p style={{ color: '#94a3b8', margin: 0 }}>Manage your cricket grounds and bookings</p>
          </div>
          <Button 
            variant="outline-danger" 
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '25px',
              padding: '0.6rem 1.2rem',
              fontWeight: '600'
            }}
          >
            <LogOut size={18} /> Logout
          </Button>
          <div style={{
            position: 'absolute',
            bottom: '-3px',
            left: '0',
            width: '150px',
            height: '3px',
            background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
          }}></div>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <div className="stats-card" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
              borderRadius: '15px',
              padding: '1.5rem',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={24} color="#fff" />
                </div>
                <div>
                  <h3 style={{ color: '#10b981', margin: 0, fontWeight: '800', fontSize: '2rem' }}>{grounds.length}</h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Total Grounds</p>
                </div>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stats-card" style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
              borderRadius: '15px',
              padding: '1.5rem',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Calendar size={24} color="#fff" />
                </div>
                <div>
                  <h3 style={{ color: '#fbbf24', margin: 0, fontWeight: '800', fontSize: '2rem' }}>{bookings.length}</h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Bookings</p>
                </div>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stats-card" style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))',
              borderRadius: '15px',
              padding: '1.5rem',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={24} color="#fff" />
                </div>
                <div>
                  <h3 style={{ color: '#22d3ee', margin: 0, fontWeight: '800', fontSize: '2rem' }}>{new Set(bookings.map(b => b.customer_phone || b.phone)).size}</h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Customers</p>
                </div>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stats-card" style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
              borderRadius: '15px',
              padding: '1.5rem',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DollarSign size={24} color="#fff" />
                </div>
                <div>
                  <h3 style={{ color: '#a78bfa', margin: 0, fontWeight: '800', fontSize: '1.5rem' }}>Rs. {bookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || parseFloat(b.totalAmount) || 0), 0).toLocaleString()}</h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Revenue</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      
      <Tabs defaultActiveKey="grounds" className="mb-4">
        {/* Ground Management Section */}
        <Tab eventKey="grounds" title="Manage Grounds">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
            <h4 style={{ color: '#f8fafc', fontWeight: '700', margin: 0 }}>
              <MapPin size={24} style={{ marginRight: '0.5rem', color: '#10b981' }} />
              Ground List
            </h4>
            <Button variant="success" onClick={() => handleShowModal()} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Plus size={18} /> Add New Ground
            </Button>
          </div>
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '15px',
            overflow: 'hidden',
            border: '1px solid rgba(16, 185, 129, 0.1)'
          }}>
            <Table hover responsive style={{ marginBottom: 0 }}>
              <thead style={{ background: 'rgba(15, 23, 42, 0.9)' }}>
                <tr>
                  <th style={{ color: '#10b981', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>ID</th>
                  <th style={{ color: '#10b981', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>Image</th>
                  <th style={{ color: '#10b981', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>Stadium Name</th>
                  <th style={{ color: '#10b981', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>Price/Hour</th>
                  <th style={{ color: '#10b981', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>Status</th>
                  <th style={{ color: '#10b981', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grounds.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <td style={{ color: '#f8fafc', padding: '1rem', verticalAlign: 'middle' }}>#{g.id}</td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      {g.photo ? (
                        <Image src={g.photo} alt={g.name} style={{ 
                          width: '80px', 
                          height: '50px', 
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid rgba(16, 185, 129, 0.3)'
                        }} />
                      ) : (
                        <div style={{ 
                          width: '80px', 
                          height: '50px', 
                          background: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          borderRadius: '8px',
                          border: '2px dashed rgba(148, 163, 184, 0.3)'
                        }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>No Image</span>
                        </div>
                      )}
                    </td>
                    <td style={{ color: '#f8fafc', padding: '1rem', verticalAlign: 'middle', fontWeight: '600' }}>{g.name}</td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <span style={{ 
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#000',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                      }}>Rs. {g.price || 0}</span>
                    </td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}><Badge bg={g.status === 'Active' ? 'success' : 'secondary'}>{g.status}</Badge></td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal(g)} style={{
                        borderRadius: '20px',
                        padding: '0.4rem 0.8rem'
                      }}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteGround(g.id)} style={{
                        borderRadius: '20px',
                        padding: '0.4rem 0.8rem'
                      }}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        {/* Bookings & Receipts Section */}
        <Tab eventKey="bookings" title="Customer Bookings">
          <div className="d-flex align-items-center mb-4 mt-4">
            <Calendar size={24} style={{ marginRight: '0.5rem', color: '#fbbf24' }} />
            <h4 style={{ color: '#f8fafc', fontWeight: '700', margin: 0 }}>All Bookings</h4>
          </div>
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '15px',
            overflow: 'hidden',
            border: '1px solid rgba(245, 158, 11, 0.1)'
          }}>
            <Table hover responsive style={{ marginBottom: 0 }}>
              <thead style={{ background: 'rgba(15, 23, 42, 0.9)' }}>
                <tr>
                  <th style={{ color: '#fbbf24', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>Customer</th>
                  <th style={{ color: '#fbbf24', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>Phone</th>
                  <th style={{ color: '#fbbf24', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>Ground</th>
                  <th style={{ color: '#fbbf24', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>Date</th>
                  <th style={{ color: '#fbbf24', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>Time</th>
                  <th style={{ color: '#fbbf24', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>Amount</th>
                  <th style={{ color: '#fbbf24', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>Payment</th>
                  <th style={{ color: '#fbbf24', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>Status</th>
                  <th style={{ color: '#fbbf24', fontWeight: '600', padding: '1rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? bookings.map((b, index) => (
                  <tr key={b.id || index} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <td style={{ color: '#f8fafc', padding: '1rem', verticalAlign: 'middle', fontWeight: '600' }}>{b.customer_name || b.name || 'N/A'}</td>
                    <td style={{ color: '#94a3b8', padding: '1rem', verticalAlign: 'middle' }}>{b.customer_phone || b.phone || 'N/A'}</td>
                    <td style={{ color: '#f8fafc', padding: '1rem', verticalAlign: 'middle' }}>{b.ground_name || b.stadium_name || b.stadium || 'N/A'}</td>
                    <td style={{ color: '#94a3b8', padding: '1rem', verticalAlign: 'middle' }}>{b.booking_date ? new Date(b.booking_date).toLocaleDateString() : b.date}</td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <span style={{
                        background: 'rgba(6, 182, 212, 0.2)',
                        color: '#22d3ee',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem'
                      }}>
                        {b.start_time ? b.start_time.slice(0, 5) : b.startTime} - {b.end_time ? b.end_time.slice(0, 5) : b.endTime}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <span style={{ 
                        color: '#10b981',
                        fontWeight: '700'
                      }}>Rs. {b.total_amount || b.totalAmount}</span>
                    </td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}><Badge bg={b.payment_status === 'Paid' || b.paymentStatus === 'Paid' ? 'success' : 'warning'}>{b.payment_status || b.paymentStatus}</Badge></td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      <Badge bg={b.booking_status === 'Completed' ? 'success' : 'info'}>
                        {b.booking_status || 'Active'}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                      {(b.booking_status !== 'Completed') && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(b.id, 'Completed')}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <CheckCircle size={14} />
                          Complete
                        </Button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                      <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <p style={{ margin: 0 }}>No bookings yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Tab>
      </Tabs>
      </Container>

      {/* Add/Edit Stadium Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <Modal.Title style={{ color: '#10b981', fontWeight: '700' }}>
            {editingGround ? 'Edit Stadium' : 'Add New Stadium'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(30, 41, 59, 0.95)', padding: '2rem' }}>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>Stadium Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter stadium name"
                    value={newGround.name}
                    onChange={(e) => setNewGround({ ...newGround, name: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>Price per Hour (Rs.)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter price"
                    value={newGround.price}
                    onChange={(e) => setNewGround({ ...newGround, price: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>Status</Form.Label>
                  <Form.Select
                    value={newGround.status}
                    onChange={(e) => setNewGround({ ...newGround, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter description"
                    value={newGround.description}
                    onChange={(e) => setNewGround({ ...newGround, description: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>Stadium Image</Form.Label>
                  <div 
                    style={{ 
                      minHeight: '200px', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(30, 41, 59, 0.5))',
                      border: '2px dashed rgba(16, 185, 129, 0.4)',
                      borderRadius: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: '1rem'
                    }}
                    onClick={() => document.getElementById('imageInput').click()}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(30, 41, 59, 0.5))';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(30, 41, 59, 0.5))';
                    }}
                  >
                    {newGround.photoPreview ? (
                      <Image 
                        src={newGround.photoPreview} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '10px' }}
                      />
                    ) : (
                      <>
                        <Upload size={48} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                        <p style={{ color: '#f8fafc', marginBottom: '0.25rem' }}>Click to upload image</p>
                        <small style={{ color: '#94a3b8' }}>JPG, PNG (Max 5MB)</small>
                      </>
                    )}
                  </div>
                  <Form.Control
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  {newGround.photoPreview && (
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setNewGround({ ...newGround, photo: null, photoPreview: null })}
                      style={{ borderRadius: '20px' }}
                    >
                      Remove Image
                    </Button>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <Button variant="secondary" onClick={handleCloseModal} style={{ borderRadius: '25px' }}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSaveGround} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : (editingGround ? 'Update Stadium' : 'Add Stadium')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Admin;
