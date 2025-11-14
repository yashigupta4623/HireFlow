#!/usr/bin/env node

require('dotenv').config();

console.log('🔍 Checking Email Configuration...\n');

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

console.log('EMAIL_USER:', user ? '✅ Set' : '❌ Not set');
if (user) {
  console.log('  Value:', user);
  console.log('  Format:', user.includes('@') ? '✅ Valid email format' : '⚠️  Invalid email format');
}

console.log('\nEMAIL_PASS:', pass ? '✅ Set' : '❌ Not set');
if (pass) {
  console.log('  Length:', pass.length, 'characters');
  console.log('  Has spaces:', pass.includes(' ') ? '⚠️  YES (remove spaces!)' : '✅ No');
  console.log('  Format:', pass.length === 16 ? '✅ Correct length for App Password' : '⚠️  Should be 16 characters for Gmail App Password');
  console.log('  First 4 chars:', pass.substring(0, 4) + '...');
}

console.log('\n📝 Notes:');
console.log('- Gmail App Password should be 16 characters (no spaces)');
console.log('- Get it from: https://myaccount.google.com/apppasswords');
console.log('- Make sure 2FA is enabled on your Google account');
console.log('- Do NOT use your regular Gmail password\n');
