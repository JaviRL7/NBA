#!/usr/bin/env node
// test-system.js - Script para probar el sistema mejorado

// Using native fetch available in Node.js 18+

async function testEndpoint(url, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📡 URL: ${url}`);
    
    const start = Date.now();
    const response = await fetch(url);
    const end = Date.now();
    
    const data = await response.text();
    
    console.log(`⏱️  Response time: ${end - start}ms`);
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const json = JSON.parse(data);
      console.log(`📊 Results: ${Array.isArray(json) ? json.length : 'object'} items`);
      if (Array.isArray(json) && json.length > 0) {
        console.log(`📝 First item: ${json[0].full_name || json[0].first_name + ' ' + json[0].last_name || 'Unknown'}`);
      }
    } else {
      console.log(`❌ Error response: ${data.substring(0, 100)}...`);
    }
    
    return { success: response.ok, time: end - start };
  } catch (error) {
    console.log(`💥 Request failed: ${error.message}`);
    return { success: false, time: 0 };
  }
}

async function runTests() {
  console.log('🏀 NBA Grid API - Sistema Mejorado - Test Suite\n');
  console.log('=' * 60);
  
  const tests = [
    // Test endpoints principales
    ['http://localhost:4000/teams', 'Teams endpoint (Cache + Fallback)'],
    ['http://localhost:4000/players/search?name=curry', 'Player search: curry'],
    ['http://localhost:4000/players/search?name=lebron', 'Player search: lebron'],
    ['http://localhost:4000/players/search?name=jordan', 'Player search: jordan (may hit rate limit)'],
    
    // Test cache (repeat same query)
    ['http://localhost:4000/players/search?name=curry', 'Player search: curry (cache test)'],
    ['http://localhost:4000/teams', 'Teams endpoint (cache test)'],
    
    // Test NBA-API fallback endpoints
    ['http://localhost:4000/nba-api/teams', 'NBA-API Teams fallback'],
    ['http://localhost:4000/nba-api/players/search?name=james', 'NBA-API Player search fallback'],
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [url, description] of tests) {
    const result = await testEndpoint(url, description);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' * 60);
  console.log('📊 TEST RESULTS:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success rate: ${Math.round(passed / (passed + failed) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed, but this may be expected due to:');
    console.log('   - Rate limiting from balldontlie API');
    console.log('   - NBA-API service not running (fallback to static data)');
    console.log('   - Network issues');
  }
  
  console.log('\n🎯 Expected behavior:');
  console.log('   ✅ Cache should work for repeated queries');
  console.log('   ✅ Static data should be returned when API fails');
  console.log('   ✅ Rate limiting should protect from excessive API calls');
}

// Run the tests
runTests().catch(console.error);