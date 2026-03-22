const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8080';

// ANSI Escapes for console colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m"
};

const printPass = (msg) => console.log(`${colors.green}✔ PASS:${colors.reset} ${msg}`);
const printFail = (msg) => console.error(`${colors.red}✖ FAIL:${colors.reset} ${msg}`);
const printInfo = (msg) => console.log(`${colors.blue}ℹ INFO:${colors.reset} ${msg}`);

async function runTests() {
  console.log(`\n${colors.yellow}====================================================${colors.reset}`);
  console.log(`${colors.yellow}   Burnout Tracker - Full Stack Integration Tests   ${colors.reset}`);
  console.log(`${colors.yellow}====================================================${colors.reset}\n`);

  let allPassed = true;
  let jwtToken = null;

  // 1. Test Frontend Reachability
  printInfo(`Pinging Frontend at ${FRONTEND_URL} ...`);
  try {
    const res = await fetch(FRONTEND_URL);
    if (res.ok) {
      printPass(`Frontend is reachable (HTTP ${res.status})`);
    } else {
      printFail(`Frontend returned HTTP ${res.status}`);
      allPassed = false;
    }
  } catch (error) {
    printFail(`Cannot reach frontend: ${error.message}`);
    allPassed = false;
  }

  // 2. Test Backend Health & Spring Security Protection
  printInfo(`Pinging Backend Protected Endpoint at ${BACKEND_URL}/api/auth/me ...`);
  try {
    // Should return 401 Unauthorized since we have no token
    const res = await fetch(`${BACKEND_URL}/api/auth/me`);
    if (res.status === 401) {
      printPass(`Backend is alive and correctly protecting endpoints (HTTP 401)`);
    } else {
      printFail(`Backend returned unexpected status: ${res.status} (expected 401 Unauthorized)`);
      allPassed = false;
    }
  } catch (error) {
    printFail(`Cannot reach backend: ${error.message}`);
    allPassed = false;
  }

  // 3. Test Database Connection (Login)
  printInfo(`Testing Database Connection via Auth...`);
  try {
    const loginPayload = { email: "counselor@university.edu", password: "CounselorPass123!" };
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        jwtToken = data.token;
        printPass(`Database connection successful. Logged in as: ${data.name} (Role: ${data.role})`);
      } else {
        printFail("Login succeeded but no JWT returned.");
        allPassed = false;
      }
    } else {
      // Fallback
      const studentPayload = { email: "admin@university.edu", password: "AdminPass123!" };
      const studentRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentPayload)
      });
      if (studentRes.ok) {
        const studentData = await studentRes.json();
        jwtToken = studentData.token;
        printPass(`Database connection successful. Logged in as: ${studentData.name}`);
      } else {
        printFail(`Authentication failed. PostgreSQL database might be offline or empty. Server returned: ${studentRes.status}`);
        allPassed = false;
      }
    }
  } catch (error) {
    printFail(`Database query failed: ${error.message}`);
    allPassed = false;
  }

  // 4. Test Data Sync via Token
  if (jwtToken) {
    printInfo(`Testing Authenticated Data Sync...`);
    try {
      // Attempt to hit a protected counselor endpoint
      const res = await fetch(`${BACKEND_URL}/api/counselor/alerts`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        printPass(`Successfully fetched protected data. Found ${data.length} alerts.`);
      } else if (res.status === 403) {
      	// User might be a student, let's test a student endpoint
      	const studentRes = await fetch(`${BACKEND_URL}/api/burnout/history`, {
      		headers: { 'Authorization': `Bearer ${jwtToken}` }
      	});
      	if (studentRes.ok) {
      		const data = await studentRes.json();
      		printPass(`Successfully fetched protected student data. Found history length: ${data.length}`);
      	} else {
      		printFail(`Failed to fetch protected endpoint. HTTP ${studentRes.status}`);
      		allPassed = false;
      	}
      } else {
        printFail(`Failed to fetch protected endpoint. HTTP ${res.status}`);
        allPassed = false;
      }
    } catch (error) {
      printFail(`Data sync failed: ${error.message}`);
      allPassed = false;
    }
  } else {
    printInfo("Skipping authenticated data sync test because no token was retrieved.");
  }

  console.log(`\n${colors.yellow}====================================================${colors.reset}`);
  if (allPassed) {
    console.log(`  ${colors.green}★ ALL CORE INTEGRATION TESTS PASSED ★${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✖ SOME INTEGRATION TESTS FAILED ✖${colors.reset}`);
    process.exit(1);
  }
  console.log(`${colors.yellow}====================================================${colors.reset}\n`);
}

runTests();
