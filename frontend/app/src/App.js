import Receipt from './pages/Receipt';
import Payment from './pages/Payment';
import Admin from './pages/Admin';
import Booking from './pages/Booking';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* other paige adding*/}
        <Route path="/book/:id" element={<Booking />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/receipt-download" element={<Receipt />} />
      </Routes>
    </Router>
  );
}

export default App;