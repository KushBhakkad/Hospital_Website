const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const twilio = require('twilio');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();


const app = express();

const PORT = process.env.PORT;

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Twilio credentials
const client = new twilio(process.env.accountSid, process.env.authToken);

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set the static files location
app.use(express.static(path.join(__dirname, 'assets')));

// Handle appointment form submissions
app.post('/appointment', (req, res) => {
  const { name, email, phone, message } = req.body;

  // Format the WhatsApp message
  const whatsappMessage = `
    New Appointment Request:
    Name: ${name}
    Email: ${email}
    Phone: ${phone}
    Message: ${message || 'N/A'}
  `;

  // Send WhatsApp message
  client.messages
    .create({
      body: whatsappMessage,
      from: process.env.FROM, 
      to: process.env.TO
    })
    .then(() => res.redirect('/')) 
    .catch(error => res.status(500).json({ status: 'error', message: 'Error sending WhatsApp message' }));
});

app.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Format the WhatsApp message
  const whatsappMessage = `
    New Contact Request:
    Name: ${name}
    Email: ${email}
    Subject: ${subject}
    Message: ${message || 'N/A'}
  `;

  // Send WhatsApp message
  client.messages
    .create({
      body: whatsappMessage,
      from: 'whatsapp:+14155238886', 
      to: 'whatsapp:+919766782793'   
    })
    .then(() => res.redirect('/'))  
    .catch(error => res.status(500).json({ status: 'error', message: 'Error sending WhatsApp message' }));
});

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
