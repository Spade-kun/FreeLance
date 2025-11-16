const nodemailer = require('nodemailer');

// Create Gmail transporter
const createGmailTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  
  console.log('📧 Gmail Config:');
  console.log('   User:', user || '❌ NOT SET');
  console.log('   Pass:', pass ? `✓ SET (${pass.length} chars)` : '❌ NOT SET');
  
  if (!user || !pass) {
    console.error('❌ ERROR: Gmail credentials not found in environment variables!');
    console.error('   Make sure GMAIL_USER and GMAIL_APP_PASSWORD are set in .env file');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
};

module.exports = { createGmailTransporter };
