const fetch = require('node:http');

async function makeRequest(url, method, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = fetch.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
          });
        } catch {
          resolve({
            status: res.statusCode,
            rawBody: data,
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING EMAIL OTP INTEGRATION TESTS ---');
  const serviceId = 'c2d6c51c-bf68-439f-864b-116abeec2704'; // Screen Replacement
  const testEmail = `test-${Date.now()}@neuroit.co.uk`;

  const bookingBase = {
    serviceId: serviceId,
    issueDescription: 'Laptop screen is cracked after falling',
    address: {
      postcode: 'N1 5AB',
      houseNumber: '12',
      addressLine1: 'Kingsland Road',
      city: 'London',
      isUlez: false,
      isCongestion: false,
    },
    paymentOption: 'ON_ARRIVAL',
    guestDetails: {
      name: 'John Guest',
      email: testEmail,
      phone: '07700 900077',
    },
  };

  // Test 1: Send OTP
  console.log(`\nTest 1: Requesting OTP for ${testEmail}...`);
  const otpRes = await makeRequest('http://localhost:4000/api/auth/otp/send', 'POST', {
    email: testEmail,
  });
  console.log(`Response status: ${otpRes.status}`);
  console.log('Response body:', otpRes.body);

  if (otpRes.status !== 200 || !otpRes.body.success || !otpRes.body.otpCode) {
    console.error('❌ Test 1 failed! Could not get OTP code.');
    process.exit(1);
  }
  const validOtp = otpRes.body.otpCode;
  console.log(`✅ Test 1 passed! OTP code received: ${validOtp}`);

  // Test 2: Booking with missing OTP code
  console.log('\nTest 2: Booking with missing OTP code...');
  const missingOtpRes = await makeRequest('http://localhost:4000/api/tickets', 'POST', {
    ...bookingBase,
  });
  console.log(`Response status: ${missingOtpRes.status}`);
  console.log('Response body:', missingOtpRes.body);
  if (missingOtpRes.status === 400 && missingOtpRes.body.error && missingOtpRes.body.error.includes('Verification code is required')) {
    console.log('✅ Test 2 passed! Server rejected booking with missing OTP.');
  } else {
    console.error('❌ Test 2 failed! Server did not reject booking correctly.');
    process.exit(1);
  }

  // Test 3: Booking with invalid OTP code
  console.log('\nTest 3: Booking with invalid OTP code (e.g. 000000)...');
  const invalidOtpRes = await makeRequest('http://localhost:4000/api/tickets', 'POST', {
    ...bookingBase,
    otpCode: '000000',
  });
  console.log(`Response status: ${invalidOtpRes.status}`);
  console.log('Response body:', invalidOtpRes.body);
  if (invalidOtpRes.status === 400 && invalidOtpRes.body.error && invalidOtpRes.body.error.includes('Invalid verification code')) {
    console.log('✅ Test 3 passed! Server rejected booking with invalid OTP.');
  } else {
    console.error('❌ Test 3 failed! Server did not reject booking correctly.');
    process.exit(1);
  }

  // Test 4: Booking with valid OTP code
  console.log('\nTest 4: Booking with valid OTP code...');
  const validBookingRes = await makeRequest('http://localhost:4000/api/tickets', 'POST', {
    ...bookingBase,
    otpCode: validOtp,
  });
  console.log(`Response status: ${validBookingRes.status}`);
  console.log('Response body:', validBookingRes.body);
  if (validBookingRes.status === 200 && validBookingRes.body.ticket && validBookingRes.body.referenceCode) {
    console.log(`✅ Test 4 passed! Ticket created successfully! Reference Code: ${validBookingRes.body.referenceCode}`);
  } else {
    console.error('❌ Test 4 failed! Booking failed with valid OTP.');
    process.exit(1);
  }

  // Test 5: Re-using the same OTP (should fail since it is single-use)
  console.log('\nTest 5: Trying to re-use the same OTP...');
  const reuseRes = await makeRequest('http://localhost:4000/api/tickets', 'POST', {
    ...bookingBase,
    otpCode: validOtp,
  });
  console.log(`Response status: ${reuseRes.status}`);
  console.log('Response body:', reuseRes.body);
  if (reuseRes.status === 400 && reuseRes.body.error) {
    console.log('✅ Test 5 passed! Server rejected reuse of the same OTP.');
  } else {
    console.error('❌ Test 5 failed! Server allowed reuse of OTP.');
    process.exit(1);
  }

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
}

// Wait 2 seconds for Next.js to compile/be ready before running
setTimeout(() => {
  runTests().catch(err => {
    console.error('Test run error:', err);
    process.exit(1);
  });
}, 2000);
