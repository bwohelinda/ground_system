import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { CreditCard, Calendar, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      alert("Payment Successful!");
      navigate('/receipt-download');
    }, 2000);
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-success text-white text-center py-3">
              <h4 className="mb-0 fw-bold">Secure Checkout</h4>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <p className="text-muted mb-1">Total Amount</p>
                <h2 className="fw-bold text-dark">Rs. 1,500.00</h2>
              </div>

              <Form onSubmit={handlePayment}>
                <Form.Group className="mb-3">
                  <Form.Label>Card Holder Name</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><User size={18} /></InputGroup.Text>
                    <Form.Control type="text" placeholder="John Doe" required />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Card Number</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><CreditCard size={18} /></InputGroup.Text>
                    <Form.Control type="text" placeholder="xxxx xxxx xxxx xxxx" required />
                  </InputGroup>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expiry Date</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><Calendar size={18} /></InputGroup.Text>
                        <Form.Control type="text" placeholder="MM/YY" required />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVC</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><Lock size={18} /></InputGroup.Text>
                        <Form.Control type="password" placeholder="***" required />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Button 
                  type="submit" 
                  variant="success" 
                  className="w-100 py-2 mt-3 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Pay Now'}
                </Button>
                
                <div className="text-center mt-3">
                  <small className="text-muted">
                    <Lock size={12} className="me-1" /> 
                    Your payment information is encrypted and secure.
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Payment;