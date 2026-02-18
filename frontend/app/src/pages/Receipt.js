import React, { useRef } from 'react';
import { Container, Card, Button, Row, Col, Table } from 'react-bootstrap';
import { Download, CheckCircle, MapPin, Calendar, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Receipt = () => {
  const receiptRef = useRef();

  const downloadPDF = () => {
    const input = receiptRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save("ArenaCricket_Receipt.pdf");
    });
  };

  return (
    <Container className="my-5">
      <div className="text-center mb-4 d-print-none">
        <CheckCircle size={60} className="text-success mb-2" />
        <h2 className="fw-bold">Booking Confirmed!</h2>
        <p className="text-muted">Thank you for booking with Arena Cricket.</p>
        <Button variant="outline-success" onClick={downloadPDF} className="fw-bold px-4">
          <Download size={18} className="me-2" /> Download PDF Receipt
        </Button>
      </div>

      {/* Receipt Layout - This section will be converted to PDF */}
      <div ref={receiptRef} className="p-4 bg-white mx-auto shadow-sm" style={{ maxWidth: '700px', border: '1px solid #eee' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-4 mb-4">
          <div>
            <h3 className="fw-bold text-success mb-0">ARENA CRICKET</h3>
            <small className="text-muted">Indoor Softball Cricket Stadium</small>
          </div>
          <div className="text-end">
            <h5 className="mb-0">RECEIPT</h5>
            <small className="text-muted">Invoice #INV-9901</small>
          </div>
        </div>

        <Row className="mb-4">
          <Col xs={6}>
            <p className="mb-1 fw-bold">Customer Details:</p>
            <p className="mb-0">Kamal Perera</p>
            <p className="mb-0">+94 77 123 4567</p>
          </Col>
          <Col xs={6} className="text-end">
            <p className="mb-1 fw-bold">Booking Info:</p>
            <p className="mb-0"><MapPin size={14} /> Stadium 01 (Main Turf)</p>
            <p className="mb-0"><Calendar size={14} /> Feb 15, 2024</p>
            <p className="mb-0"><Clock size={14} /> 06:00 PM - 07:00 PM</p>
          </Col>
        </Row>

        <Table striped bordered className="mb-4">
          <thead className="table-success text-white">
            <tr>
              <th>Description</th>
              <th className="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Stadium Booking Fee (1 Hour)</td>
              <td className="text-end">Rs. 1,500.00</td>
            </tr>
            <tr className="fw-bold">
              <td className="text-end">Total Paid</td>
              <td className="text-end text-success">Rs. 1,500.00</td>
            </tr>
          </tbody>
        </Table>

        <div className="text-center mt-5 border-top pt-3">
          <p className="small text-muted mb-1">This is a computer-generated receipt.</p>
          <p className="fw-bold text-success">See you on the pitch!</p>
        </div>
      </div>
    </Container>
  );
};

export default Receipt;