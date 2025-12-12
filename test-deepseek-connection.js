const fs = require('fs');
const path = require('path');

console.log('=== Testing DeepSeek Setup ===\n');

// Check .env.local file
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env.local file not found');
  console.log('Create a .env.local file with:');
  console.log('DEEPSEEK_API_KEY=your_key_here');
  process.exit(1);
}

// Read the .env.local file
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/DEEPSEEK_API_KEY\s*=\s*(.*)/);

if (!apiKeyMatch) {
  console.error('❌ ERROR: DEEPSEEK_API_KEY not found in .env.local');
  console.log('Your .env.local should contain:');
  console.log('DEEPSEEK_API_KEY=your_actual_key_here');
  process.exit(1);
}

const apiKey = apiKeyMatch[1].trim();
console.log(`✅ API Key found: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);

// Test the API key with a simple HTTP request
async function testApiKey() {
  console.log('\n🔍 Testing API key validity...');
  
  try {
    // Use fetch API (available in Node.js 18+)
    const response = await fetch('https://api.deepseek.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      console.error('❌ ERROR: Invalid API key (401 Unauthorized)');
      console.log('Get a valid key from: https://platform.deepseek.com/api_keys');
      return false;
    }
    
    if (response.status === 429) {
      console.warn('⚠️  Rate limit exceeded (429 Too Many Requests)');
      console.log('Wait a few minutes and try again.');
      return false;
    }
    
    if (!response.ok) {
      console.error(`❌ API error: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API Key is valid!');
    console.log(`📋 Available models: ${data.data.length} models found`);
    
    // Show available models
    data.data.forEach(model => {
      console.log(`   - ${model.id}`);
    });
    
    // Check if deepseek-chat is available
    const hasChatModel = data.data.some(model => model.id.includes('deepseek-chat'));
    if (hasChatModel) {
      console.log('\n✅ deepseek-chat model is available for use');
    } else {
      console.warn('\n⚠️  deepseek-chat model not found in available models');
      console.log('Using these models instead:');
      data.data.filter(m => m.id.includes('deepseek')).forEach(m => console.log(`   - ${m.id}`));
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('Check your internet connection and try again.');
    return false;
  }
}

// Run the test
testApiKey().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✅ Setup looks good!');
    console.log('\nNext steps:');
    console.log('1. Make sure all dependencies are installed:');
    console.log('   npm install openai sharp');
    console.log('2. Clear cache and restart:');
    console.log('   rm -rf .next && npm run dev');
    console.log('3. Open http://localhost:3001');
    console.log('4. Upload a JPEG image (under 1MB for best results)');
  } else {
    console.log('❌ Setup check failed.');
    console.log('\nTroubleshooting:');
    console.log('1. Verify your API key at https://platform.deepseek.com/api_keys');
    console.log('2. Check your .env.local file is in the project root');
    console.log('3. Ensure you have internet connectivity');
  }
  console.log('='.repeat(50));
});