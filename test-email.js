#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * 
 * This script helps you test your email configuration
 * Run: node test-email.js your-email@example.com
 */

const axios = require('axios');

const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.log('❌ Please provide a recipient email address');
  console.log('Usage: node test-email.js your-email@example.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipientEmail)) {
  console.log('❌ Invalid email format');
  process.exit(1);
}

console.log('🧪 Testing email configuration...\n');

async function testEmail() {
  try {
    // Check email service status
    console.log('1️⃣  Checking email service status...');
    const statusResponse = await axios.get('http://localhost:3001/api/email-status');
    console.log(`   Status: ${statusResponse.data.configured ? '✅ Configured' : '⚠️  Not configured (using test account)'}`);
    console.log(`   Message: ${statusResponse.data.message}\n`);

    // Send test email
    console.log(`2️⃣  Sending test email to ${recipientEmail}...`);
    const emailResponse = await axios.post('http://localhost:3001/api/test-email', {
      to: recipientEmail,
      subject: '🎉 TalentVoice Email Test',
      body: `Hello!\n\nThis is a test email from TalentVoice.\n\nIf you're reading this, your email configuration is working correctly! 🎊\n\nTimestamp: ${new Date().toISOString()}\n\nBest regards,\nTalentVoice Team`
    });

    console.log('   ✅ Email sent successfully!');
    console.log(`   Message ID: ${emailResponse.data.messageId}`);
    
    if (emailResponse.data.previewUrl) {
      console.log(`\n   📧 Preview URL (test account): ${emailResponse.data.previewUrl}`);
      console.log('   Note: This is a test email. Configure real credentials in .env for production.');
    } else {
      console.log(`\n   📬 Check your inbox at ${recipientEmail}`);
      console.log('   Note: Email may take a few moments to arrive. Check spam folder if needed.');
    }

    console.log('\n✅ Email test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Email test failed!');
    
    if (error.response) {
      console.error(`   Error: ${error.response.data.error || error.response.statusText}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Error: Cannot connect to server. Make sure the server is running:');
      console.error('   Run: npm run server');
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    console.log('\n📚 For setup help, see: GMAIL_SETUP_GUIDE.md\n');
    process.exit(1);
  }
}

testEmail();
