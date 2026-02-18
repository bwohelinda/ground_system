import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Badge, Table, Modal, InputGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Calendar, CheckCircle, XCircle, CreditCard, User, Phone, Lock, Shield, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = 'http://localhost:5000/api';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  const [bookingType, setBookingType] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(0);
  const [pricePerHour, setPricePerHour] = useState(1500);
  const [stadium, setStadium] = useState(null);
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Payment details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Fetch stadium data to get correct price
  useEffect(() => {
    const fetchStadium = async () => {
      try {
        const response = await fetch(`${API_URL}/grounds`);
        if (response.ok) {
          const grounds = await response.json();
          const currentStadium = grounds.find(g => g.id === parseInt(id));
          if (currentStadium) {
            setStadium(currentStadium);
            setPricePerHour(parseFloat(currentStadium.price) || 1500);
          }
        }
      } catch (err) {
        console.error('Error fetching stadium:', err);
      }
    };
    fetchStadium();
  }, [id]);

  // Booked slots state - fetch from backend
  const [bookedSlots, setBookedSlots] = useState([]);

  // Fetch booked slots from backend
  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const response = await fetch(`${API_URL}/bookings`);
        if (response.ok) {
          const bookings = await response.json();
          // Filter bookings for this stadium and format them
          const slots = bookings
            .filter(b => b.stadium_id === parseInt(id) || b.groundId === parseInt(id))
            .map(b => {
              // Handle timezone - convert UTC date to local date string
              let bookingDate = b.date;
              if (b.booking_date) {
                const dateObj = new Date(b.booking_date);
                // Format as YYYY-MM-DD in local timezone
                bookingDate = dateObj.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
              }
              return {
                date: bookingDate,
                start: b.start_time ? b.start_time.slice(0, 5) : b.startTime,
                end: b.end_time ? b.end_time.slice(0, 5) : b.endTime,
                customer: b.customer_name || b.name
              };
            });
          setBookedSlots(slots);
          console.log('Booked slots loaded:', slots);
        }
      } catch (err) {
        console.error('Error fetching booked slots:', err);
      }
    };
    fetchBookedSlots();
  }, [id]);

  // Available time slots (6 AM to 11 PM for start, up to 12 AM for end)
  const timeSlots = [];
  for (let hour = 6; hour <= 23; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    timeSlots.push(time);
  }
  
  // End time slots include midnight (24:00)
  const endTimeSlots = [...timeSlots, '24:00'];

  // Calculate duration based on start and end time
  useEffect(() => {
    if (startTime && endTime) {
      const start = parseInt(startTime.split(':')[0]);
      const end = parseInt(endTime.split(':')[0]);
      const hours = end - start;
      if (hours > 0) {
        setDuration(hours);
      } else {
        setDuration(0);
      }
    } else {
      setDuration(0);
    }
  }, [startTime, endTime]);

  // Reset end time when start time changes
  useEffect(() => {
    if (startTime) {
      const start = parseInt(startTime.split(':')[0]);
      // Set default end time to 2 hours after start (minimum booking)
      if (start <= 22) {
        setEndTime(`${(start + 2).toString().padStart(2, '0')}:00`);
      } else {
        setEndTime('');
      }
    } else {
      setEndTime('');
    }
  }, [startTime]);

  // Check if a time slot is booked
  const isSlotBooked = (time) => {
    if (!selectedDate || bookedSlots.length === 0) return false;
    const hour = parseInt(time.split(':')[0]);
    return bookedSlots.some(slot => {
      // Normalize dates for comparison
      const slotDate = slot.date;
      const selected = selectedDate;
      if (slotDate !== selected) return false;
      const slotStart = parseInt(slot.start.split(':')[0]);
      const slotEnd = parseInt(slot.end.split(':')[0]);
      return hour >= slotStart && hour < slotEnd;
    });
  };

  // Get booked slots for selected date
  const getBookedSlotsForDate = () => {
    if (!selectedDate) return [];
    return bookedSlots.filter(slot => slot.date === selectedDate);
  };

  // Validate booking
  const isValidBooking = () => {
    if (!selectedDate || !startTime || !endTime) return false;
    if (duration <= 0) return false;
    if (bookingType.length === 0) return false;
    if (!customerName || !customerPhone) return false;
    
    // Check if selected range overlaps with booked slots
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    for (let hour = startHour; hour < endHour; hour++) {
      if (isSlotBooked(`${hour.toString().padStart(2, '0')}:00`)) {
        return false;
      }
    }
    return true;
  };

  // Handle booking submission
  const handleBooking = async () => {
    // Calculate online payment amount (1 hour price) if online payment selected
    const onlinePaymentAmount = bookingType.includes('online_paid') ? duration * pricePerHour : 0;
    const unpaidAmount = 0;
    
    const bookingData = {
        groundId: parseInt(id),
        stadium: stadium ? stadium.name : `Stadium ${id}`,
        name: customerName,
        phone: customerPhone,
        date: selectedDate,
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        pricePerHour: pricePerHour,
        totalAmount: duration * pricePerHour,
        onlinePaymentAmount: onlinePaymentAmount,
        unpaidAmount: unpaidAmount,
        bookingType: bookingType,
        paymentStatus: bookingType.includes('online_paid') ? 'Paid' : 'Pending'
    };

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        
        if (response.ok) {
            const result = await response.json();
            setBookingId(result.id);
            setShowConfirmModal(false);
            
            // If online payment is selected, show payment modal
            if (bookingType.includes('online_paid')) {
              setShowPaymentModal(true);
            } else {
              setShowSuccessModal(true);
            }
        } else {
            alert("Error saving booking. Please try again.");
        }
    } catch (error) {
        console.error("Error saving booking:", error);
        alert("Cannot connect to server. Please make sure the backend is running on port 5000.");
    }
  };

  // Handle booking form submit
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  // Confirm booking - now calls the API
  const confirmBooking = () => {
    handleBooking();
  };

  // Process payment
  const processPayment = async () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert('Please fill in all card details');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Generate transaction ID
      const transactionId = 'TXN' + Date.now().toString();
      
      // Save payment to database
      const paymentData = {
        bookingId: bookingId,
        transactionId: transactionId,
        amount: pricePerHour, // Online payment is for 1 hour
        paymentStatus: 'Paid'
      };
      
      const response = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      
      if (response.ok) {
        setIsProcessing(false);
        setShowPaymentModal(false);
        
        // Generate booking reference ID
        const newBookingId = 'BK' + Date.now().toString().slice(-6);
        setBookingId(newBookingId);
        setShowSuccessModal(true);
        
        // Clear card details
        setCardNumber('');
        setCardName('');
        setExpiryDate('');
        setCvv('');
      } else {
        setIsProcessing(false);
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      alert('Payment failed. Please check your connection.');
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Download receipt as PDF
  const downloadReceipt = async () => {
    setIsDownloading(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header
      pdf.setFillColor(40, 167, 69);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CRICKET BOOKING', pageWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('Booking Receipt', pageWidth / 2, 32, { align: 'center' });
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // Booking ID
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Booking ID: ${bookingId}`, 20, 55);
      
      // Date of receipt
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 55, { align: 'right' });
      
      // Line separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 60, pageWidth - 20, 60);
      
      // Customer Details Section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer Details', 20, 72);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Name: ${customerName}`, 20, 82);
      pdf.text(`Phone: ${customerPhone}`, 20, 90);
      
      // Booking Details Section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Booking Details', 20, 105);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Stadium: Stadium ${id}`, 20, 115);
      pdf.text(`Date: ${selectedDate}`, 20, 123);
      pdf.text(`Time: ${startTime} - ${endTime}`, 20, 131);
      pdf.text(`Duration: ${duration} hour(s)`, 20, 139);
      
      // Booking Type
      let bookingTypeText = 'Online Payment';
      pdf.text(`Booking Type: ${bookingTypeText}`, 20, 147);
      
      // Payment Details Section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Payment Details', 20, 162);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Price per Hour: Rs. ${pricePerHour}`, 20, 172);
      pdf.text(`Total Amount: Rs. ${duration * pricePerHour}`, 20, 180);
      
      // Payment status
      if (bookingType.includes('online_paid')) {
        pdf.setTextColor(40, 167, 69);
        pdf.text(`Online Payment: Rs. ${duration * pricePerHour} - PAID`, 20, 188);
        pdf.setTextColor(0, 0, 0);
      }
      
      // Footer
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, 260, pageWidth, 40, 'F');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Thank you for booking with us!', pageWidth / 2, 272, { align: 'center' });
      pdf.text('Please arrive 10 minutes before your booking time.', pageWidth / 2, 280, { align: 'center' });
      
      // Save the PDF
      pdf.save(`Booking_Receipt_${bookingId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating receipt. Please try again.');
    }
    
    setIsDownloading(false);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <Container className="py-4">
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800',
            background: 'linear-gradient(90deg, #10b981, #34d399, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem'
          }}>
            Book {stadium ? stadium.name : `Stadium ${id}`}
          </h1>
          <p style={{ color: '#94a3b8' }}>Fill in your details and select your preferred time slot</p>
        </div>

        <Row className="g-4">
          {/* Booking Form */}
          <Col lg={7}>
            <Card style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '20px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <Card.Body style={{ padding: '2rem' }}>
                <h3 style={{ 
                  color: '#10b981', 
                  marginBottom: '1.5rem', 
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Calendar size={24} /> Booking Details
                </h3>
            
            <Form onSubmit={handleBookingSubmit}>
              {/* Customer Details */}
              <Row className="mb-4">
                <Form.Group as={Col}>
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} style={{ color: '#10b981' }} /> Your Name
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter your name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={18} style={{ color: '#10b981' }} /> Phone Number
                  </Form.Label>
                  <Form.Control 
                    type="tel" 
                    placeholder="Enter phone number"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </Form.Group>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label style={{ color: '#f8fafc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} style={{ color: '#fbbf24' }} /> Select Date
                </Form.Label>
                <Form.Control 
                  type="date" 
                  required 
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ color: '#f8fafc', fontWeight: '600', marginBottom: '1rem' }}>Booking Type</Form.Label>
                <div className="d-flex flex-wrap gap-3">
                  <div 
                    onClick={() => {
                      if (bookingType.includes('online_paid')) {
                        setBookingType(bookingType.filter(t => t !== 'online_paid'));
                      } else {
                        setBookingType(['online_paid']);
                      }
                    }}
                    style={{
                      flex: '1',
                      minWidth: '200px',
                      padding: '1rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: bookingType.includes('online_paid') ? '2px solid #10b981' : '2px solid rgba(148, 163, 184, 0.3)',
                      background: bookingType.includes('online_paid') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: bookingType.includes('online_paid') ? '2px solid #10b981' : '2px solid #94a3b8',
                        background: bookingType.includes('online_paid') ? '#10b981' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {bookingType.includes('online_paid') && <CheckCircle size={16} color="#fff" />}
                      </div>
                      <div>
                        <div style={{ color: '#f8fafc', fontWeight: '600' }}>Online Payment</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Pay online now</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Form.Group>

              <Row className="mb-4">
                <Form.Group as={Col}>
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} style={{ color: '#06b6d4' }} /> Start Time
                  </Form.Label>
                  <Form.Select 
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={!selectedDate}
                  >
                    <option value="">Select start time</option>
                    {timeSlots.map(time => {
                      const hour = parseInt(time.split(':')[0]);
                      // Allow times up to 22:00 (need at least 2 hour duration minimum)
                      const maxStartHour = 22;
                      return (
                        <option 
                          key={time} 
                          value={time}
                          disabled={isSlotBooked(time) || hour > maxStartHour}
                        >
                          {time} {isSlotBooked(time) ? '(Booked)' : ''}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group as={Col}>
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} style={{ color: '#06b6d4' }} /> End Time
                  </Form.Label>
                  <Form.Select 
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={!startTime}
                  >
                    <option value="">Select end time</option>
                    {endTimeSlots.map(time => {
                      const hour = parseInt(time.split(':')[0]);
                      const startHour = startTime ? parseInt(startTime.split(':')[0]) : 0;
                      // End time must be at least 2 hours after start time (minimum booking) and max 24:00
                      const isValidEndTime = hour >= startHour + 2 && hour <= 24;
                      // Check if any slot between start and this end time is booked
                      let hasBookedSlot = false;
                      if (startTime && isValidEndTime) {
                        for (let h = startHour; h < hour; h++) {
                          if (isSlotBooked(`${h.toString().padStart(2, '0')}:00`)) {
                            hasBookedSlot = true;
                            break;
                          }
                        }
                      }
                      return (
                        <option 
                          key={time} 
                          value={time}
                          disabled={!isValidEndTime || hasBookedSlot}
                        >
                          {time} {hasBookedSlot ? '(Blocked)' : ''}
                        </option>
                      );
                    })}
                  </Form.Select>
                  <Form.Text style={{ color: '#94a3b8' }}>
                    {duration > 0 ? `Duration: ${duration} hour(s)` : 'Minimum 2 hours booking'}
                  </Form.Text>
                </Form.Group>
              </Row>

              {/* Duration and Price Display */}
              {duration > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15))',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: '#22d3ee', fontWeight: '600' }}>Duration: {duration} hour(s)</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{startTime} - {endTime}</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '25px',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '1.2rem'
                  }}>
                    Rs. {(duration * pricePerHour).toLocaleString()}
                  </div>
                </div>
              )}

              {bookingType.includes('online_paid') && duration > 0 && (
                <Alert variant="info">
                  <strong>Online Payment Required:</strong> You must complete online payment for this booking.
                </Alert>
              )}

              {bookingType.length === 0 && duration > 0 && (
                <Alert variant="secondary">
                  Please select at least one booking type to continue.
                </Alert>
              )}

              <Button 
                type="submit"
                variant="success" 
                size="lg" 
                className="w-100 mt-3"
                disabled={!isValidBooking()}
                style={{
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {bookingType.includes('online_paid') ? (
                  <><CreditCard size={22} /> Proceed to Pay</>
                ) : (
                  <><CheckCircle size={22} /> Confirm Booking</>
                )}
              </Button>
            </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Available Time Slots */}
          <Col lg={5}>
            <Card style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '20px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <Card.Body style={{ padding: '2rem' }}>
                <h5 style={{ 
                  fontWeight: '700', 
                  marginBottom: '1.5rem',
                  color: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
              <Clock size={20} style={{ color: '#06b6d4' }} /> Time Availability
              {selectedDate && <Badge style={{ background: '#1e3a5f', marginLeft: '0.5rem', fontWeight: '500' }}>{selectedDate}</Badge>}
            </h5>

            {!selectedDate ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#94a3b8'
              }}>
                <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Please select a date to view availability</p>
              </div>
            ) : (
              <>
                {/* Time Slots Grid */}
                <div className="mb-4">
                  <Row className="g-2">
                    {timeSlots.slice(0, -1).map(time => {
                      const booked = isSlotBooked(time);
                      return (
                        <Col xs={4} key={time}>
                          <div 
                            style={{
                              padding: '0.5rem',
                              textAlign: 'center',
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: '700',
                              background: booked 
                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: booked 
                                ? '2px solid #fca5a5' 
                                : '2px solid #6ee7b7',
                              color: '#fff',
                              transition: 'all 0.3s ease',
                              boxShadow: booked 
                                ? '0 4px 15px rgba(239, 68, 68, 0.4)' 
                                : '0 4px 15px rgba(16, 185, 129, 0.4)',
                              cursor: booked ? 'not-allowed' : 'pointer',
                              opacity: booked ? 0.9 : 1
                            }}
                          >
                            <div style={{ fontSize: '1rem', marginBottom: '2px' }}>{time}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.7rem' }}>
                              {booked ? <XCircle size={12} /> : <CheckCircle size={12} />}
                              {booked ? 'BOOKED' : 'FREE'}
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>

                {/* Legend */}
                <div style={{
                  display: 'flex',
                  gap: '1.5rem',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '25px',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                  }}>
                    <CheckCircle size={16} /> Available
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    borderRadius: '25px',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)'
                  }}>
                    <XCircle size={16} /> Booked
                  </div>
                </div>

                {/* Booked Slots Table */}
                {getBookedSlotsForDate().length > 0 && (
                  <>
                    <h6 style={{ fontWeight: '700', marginTop: '1rem', marginBottom: '0.75rem', color: '#ef4444' }}>
                      <XCircle size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      Booked Slots for {selectedDate}
                    </h6>
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '2px solid rgba(239, 68, 68, 0.4)',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
                    }}>
                    <Table size="sm" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr style={{ background: 'rgba(239, 68, 68, 0.3)' }}>
                          <th style={{ color: '#fecaca', padding: '0.85rem', borderBottom: '2px solid rgba(239, 68, 68, 0.4)', fontWeight: '700' }}>Time Slot</th>
                          <th style={{ color: '#fecaca', padding: '0.85rem', borderBottom: '2px solid rgba(239, 68, 68, 0.4)', fontWeight: '700' }}>Booked By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getBookedSlotsForDate().map((slot, idx) => (
                          <tr key={idx} style={{ background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <td style={{ color: '#fca5a5', padding: '0.85rem', fontWeight: '600' }}>
                              <span style={{ 
                                background: 'rgba(239, 68, 68, 0.3)', 
                                padding: '0.35rem 0.75rem', 
                                borderRadius: '20px',
                                display: 'inline-block'
                              }}>
                                {slot.start} - {slot.end}
                              </span>
                            </td>
                            <td style={{ color: '#fecaca', padding: '0.85rem' }}>{slot.customer}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    </div>
                  </>
                )}
              </>
            )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <Modal.Title style={{ color: '#10b981', fontWeight: '700' }}>Confirm Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(30, 41, 59, 0.95)', padding: '2rem' }}>
          <h5 style={{ color: '#f8fafc', marginBottom: '1.5rem' }}>Booking Details</h5>
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
          <Table size="sm" style={{ marginBottom: 0 }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Name:</strong></td>
                <td style={{ color: '#f8fafc', padding: '0.75rem' }}>{customerName}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Phone:</strong></td>
                <td style={{ color: '#f8fafc', padding: '0.75rem' }}>{customerPhone}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Stadium:</strong></td>
                <td style={{ color: '#f8fafc', padding: '0.75rem' }}>{stadium ? stadium.name : `Stadium ${id}`}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Date:</strong></td>
                <td style={{ color: '#f8fafc', padding: '0.75rem' }}>{selectedDate}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Time:</strong></td>
                <td style={{ color: '#22d3ee', padding: '0.75rem' }}>{startTime} - {endTime}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Duration:</strong></td>
                <td style={{ color: '#f8fafc', padding: '0.75rem' }}>{duration} hour(s)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Type:</strong></td>
                <td style={{ padding: '0.75rem' }}>
                  {bookingType.includes('online_paid') && <Badge bg="success">Online Payment</Badge>}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Total Amount:</strong></td>
                <td style={{ color: '#10b981', padding: '0.75rem', fontWeight: '700', fontSize: '1.2rem' }}>Rs. {duration * pricePerHour}</td>
              </tr>
              {bookingType.includes('online_paid') && (
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Online Payment:</strong></td>
                  <td style={{ color: '#22d3ee', padding: '0.75rem', fontWeight: '700' }}>Rs. {duration * pricePerHour}</td>
                </tr>
              )}
            </tbody>
          </Table>
          </div>
          {bookingType.includes('online_paid') && (
            <Alert variant="info" className="mt-3 mb-0">
              <CreditCard size={18} /> You will be redirected to payment page after confirmation.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)} style={{ borderRadius: '25px' }}>
            Cancel
          </Button>
          <Button variant="success" onClick={confirmBooking}>
            {bookingType.includes('online_paid') ? 'Proceed to Payment' : 'Confirm Booking'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => !isProcessing && setShowPaymentModal(false)} centered size="md">
        <Modal.Header closeButton style={{
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
          borderBottom: 'none'
        }}>
          <Modal.Title style={{ color: '#fff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={24} /> Secure Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(30, 41, 59, 0.95)', padding: '2rem' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
            borderRadius: '15px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Online Payment (1 Hour)</div>
            <h2 style={{ color: '#10b981', fontWeight: '800', margin: 0 }}>Rs. {pricePerHour?.toLocaleString()}</h2>
            <small style={{ color: '#94a3b8' }}>For 1 hour advance booking</small>
          </div>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#f8fafc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={16} style={{ color: '#3b82f6' }} /> Card Number
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#f8fafc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} style={{ color: '#3b82f6' }} /> Cardholder Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Name on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600' }}>Expiry Date</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#f8fafc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={16} style={{ color: '#3b82f6' }} /> CVV
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="***"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    maxLength={3}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Shield size={24} style={{ color: '#10b981' }} />
              <small style={{ color: '#94a3b8' }}>Your payment is secure and encrypted with SSL</small>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)} disabled={isProcessing} style={{ borderRadius: '25px' }}>
            Cancel
          </Button>
          <Button 
            onClick={processPayment}
            disabled={isProcessing || !cardNumber || !cardName || !expiryDate || !cvv}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '25px',
              padding: '0.6rem 1.5rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              <>
                <Lock size={16} /> Pay Rs. {pricePerHour?.toLocaleString()}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderBottom: 'none'
        }}>
          <Modal.Title style={{ color: '#fff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={24} /> Booking Successful!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'rgba(30, 41, 59, 0.95)', padding: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '3px solid #10b981'
          }}>
            <CheckCircle size={40} style={{ color: '#10b981' }} />
          </div>
          <h4 style={{ color: '#f8fafc', fontWeight: '700' }}>Thank you, {customerName}!</h4>
          <p style={{ color: '#94a3b8' }}>Your booking has been confirmed.</p>
          {bookingType.includes('online_paid') && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              color: '#10b981',
              fontWeight: '600'
            }}>
              <CheckCircle size={16} /> Payment Successful!
            </div>
          )}
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Booking ID</div>
            <div style={{ color: '#3b82f6', fontWeight: '700', fontSize: '1.25rem' }}>{bookingId}</div>
          </div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            textAlign: 'left'
          }}>
          <Table size="sm" style={{ marginBottom: 0 }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Stadium:</strong></td>
                <td style={{ color: '#f8fafc', padding: '0.75rem' }}>{stadium ? stadium.name : `Stadium ${id}`}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Date:</strong></td>
                <td style={{ color: '#f8fafc', padding: '0.75rem' }}>{selectedDate}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Time:</strong></td>
                <td style={{ color: '#22d3ee', padding: '0.75rem' }}>{startTime} - {endTime}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Amount:</strong></td>
                <td style={{ color: '#10b981', padding: '0.75rem', fontWeight: '700' }}>Rs. {duration * pricePerHour}</td>
              </tr>
              <tr>
                <td style={{ color: '#94a3b8', padding: '0.75rem' }}><strong>Payment:</strong></td>
                <td style={{ padding: '0.75rem' }}>
                  {bookingType.includes('online_paid') && <Badge bg="success">Paid Online</Badge>}
                </td>
              </tr>
            </tbody>
          </Table>
          </div>
          {/* Download Receipt Button */}
          <Button 
            className="w-100 mt-3"
            onClick={downloadReceipt}
            disabled={isDownloading}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: 'none',
              borderRadius: '25px',
              padding: '0.75rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isDownloading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Generating...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Receipt (PDF)
              </>
            )}
          </Button>
        </Modal.Body>
        <Modal.Footer style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(16, 185, 129, 0.2)',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <Button variant="outline-secondary" onClick={() => navigate('/')} style={{ borderRadius: '25px' }}>
            Back to Home
          </Button>
          <Button variant="success" onClick={() => {
            setShowSuccessModal(false);
            // Reset form
            setCustomerName('');
            setCustomerPhone('');
            setSelectedDate('');
            setStartTime('');
            setEndTime('');
            setBookingType([]);
            setDuration(0);
          }}>
            Book Another
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
    </div>
  );
};

export default Booking;