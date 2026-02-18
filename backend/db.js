const mysql = require('mysql2');

// Database connection configuration for XAMPP MySQL
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // XAMPP default has no password
  database: 'cricket_booking_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.error('Make sure XAMPP MySQL is running and database "cricket_db" exists');
  } else {
    console.log('Database connected successfully! (Via db.js)');
    connection.release();
  }
});

// Export for use in other files
module.exports = pool.promise();