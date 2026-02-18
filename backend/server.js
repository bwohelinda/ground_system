const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db'); // Import the db.js file we created

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cricket Booking API Server is running!',
    endpoints: ['/api/grounds', '/api/bookings', '/api/register', '/api/login'],
    frontend: 'http://localhost:3000'
  });
});

// Admin Register API
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM admin_users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO admin_users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, firstName || '', lastName || '']
    );
    
    res.status(201).json({ message: 'Registration successful!', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [users] = await db.query('SELECT * FROM admin_users WHERE username = ? OR email = ?', [username, username]);
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      res.json({ 
        message: 'Login successful', 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        } 
      });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all grounds/stadiums
app.get('/api/grounds', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, stadium_name as name, is_active, price, description, photo, CASE WHEN is_active = 1 THEN "Active" ELSE "Inactive" END as status FROM stadiums');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new ground
app.post('/api/grounds', async (req, res) => {
  try {
    const { name, status, price, description, photo } = req.body;
    const is_active = status === 'Active' ? 1 : 0;
    const [result] = await db.query(
      'INSERT INTO stadiums (stadium_name, is_active, price, description, photo) VALUES (?, ?, ?, ?, ?)',
      [name, is_active, price || 1500, description || '', photo || null]
    );
    res.status(201).json({ id: result.insertId, name, status, price, description, photo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update ground
app.put('/api/grounds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, price, description, photo } = req.body;
    const is_active = status === 'Active' ? 1 : 0;
    await db.query(
      'UPDATE stadiums SET stadium_name = ?, is_active = ?, price = ?, description = ?, photo = ? WHERE id = ?',
      [name, is_active, price, description, photo, id]
    );
    res.json({ id: parseInt(id), name, status, price, description, photo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete ground
app.delete('/api/grounds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM stadiums WHERE id = ?', [id]);
    res.json({ message: 'Ground deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, s.stadium_name as ground_name 
      FROM bookings b 
      LEFT JOIN stadiums s ON b.stadium_id = s.id 
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { groundId, stadium, name, phone, date, startTime, endTime, duration, pricePerHour, totalAmount, onlinePaymentAmount, unpaidAmount, bookingType, paymentStatus } = req.body;
    const [result] = await db.query(
      'INSERT INTO bookings (stadium_id, stadium_name, customer_name, customer_phone, booking_date, start_time, end_time, duration, price_per_hour, total_amount, online_payment, unpaid_amount, booking_type, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [groundId, stadium, name, phone, date, startTime, endTime, duration, pricePerHour, totalAmount, onlinePaymentAmount, unpaidAmount, JSON.stringify(bookingType), paymentStatus]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status (Active/Completed)
app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.query('UPDATE bookings SET booking_status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Booking status updated', id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all payments
app.get('/api/payments', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payments ORDER BY payment_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new payment
app.post('/api/payments', async (req, res) => {
  try {
    const { bookingId, transactionId, amount, paymentStatus } = req.body;
    const [result] = await db.query(
      'INSERT INTO payments (booking_id, transaction_id, amount, payment_status) VALUES (?, ?, ?, ?)',
      [bookingId, transactionId, amount, paymentStatus]
    );
    
    // Update booking payment status
    await db.query('UPDATE bookings SET payment_status = ? WHERE id = ?', [paymentStatus, bookingId]);
    
    res.status(201).json({ id: result.insertId, bookingId, transactionId, amount, paymentStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server is running on Port 5000"));