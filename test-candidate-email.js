// Test script to verify candidate email data flow
const fs = require('fs');

console.log('=== Testing Candidate Email Data Flow ===\n');

// 1. Check resumes.json
console.log('1. Checking resumes.json...');
try {
  const resumes = JSON.parse(fs.readFileSync('resumes.json', 'utf8'));
  console.log(`   Found ${resumes.length} resumes`);
  
  resumes.forEach((resume, idx) => {
    console.log(`\n   Resume ${idx + 1}:`);
    console.log(`   - Name: ${resume.name}`);
    console.log(`   - Email: ${resume.email || 'NOT FOUND ❌'}`);
    console.log(`   - Phone: ${resume.phone || 'Not found'}`);
    console.log(`   - Skills: ${resume.skills?.length || 0} skills`);
  });
} catch (error) {
  console.error('   Error reading resumes.json:', error.message);
}

console.log('\n=== Test Complete ===\n');
console.log('Next steps:');
console.log('1. Start the server: npm run dev');
console.log('2. Open browser console (F12)');
console.log('3. Upload a JD and click on a candidate');
console.log('4. Check console logs for candidate data');
console.log('5. Click "Contact Candidate" and verify email shows');
