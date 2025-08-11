const axios = require('axios');

// Test the circular API endpoints
async function testCircularAPI() {
  const baseURL = 'http://localhost:8000';
  
  try {
    console.log('Testing Circular API...');
    
    // Test 1: Get circulars (should work for authenticated users)
    console.log('\n1. Testing GET /admin/getcirculars...');
    try {
      const response = await axios.get(`${baseURL}/admin/getcirculars`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ GET /admin/getcirculars response:', response.data);
    } catch (error) {
      console.log('❌ GET /admin/getcirculars error:', error.response?.data || error.message);
    }
    
    // Test 2: Get circulars for admin (should work for admin users)
    console.log('\n2. Testing GET /admin/circulars...');
    try {
      const response = await axios.get(`${baseURL}/admin/circulars`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ GET /admin/circulars response:', response.data);
    } catch (error) {
      console.log('❌ GET /admin/circulars error:', error.response?.data || error.message);
    }
    
    console.log('\n✅ Circular API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCircularAPI(); 