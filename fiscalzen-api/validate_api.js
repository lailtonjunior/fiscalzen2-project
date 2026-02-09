const axios = require('axios');

const API_URL = 'http://localhost:3000';
const TEST_USER = {
    email: `valid_${Date.now()}@test.com`,
    password: 'password123',
    name: 'Validation User',
    companyName: 'Test Corp',
    cnpj: '12345678000199'
};

async function validate() {
    console.log('🚀 Starting API Verification...\n');

    try {
        // 1. Health Check
        console.log('1️⃣ Checking Health (GET /)...');
        const health = await axios.get(API_URL);
        console.log('✅ Health OK:', health.data);

        // 2. Register
        console.log('\n2️⃣ Registering User (POST /auth/register)...');
        const register = await axios.post(`${API_URL}/auth/register`, TEST_USER);
        console.log('✅ Register OK. User ID:', register.data.user.id);
        const token = register.data.access_token;

        // 3. Login (Validation)
        console.log('\n3️⃣ Testing Login (POST /auth/login)...');
        const login = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        console.log('✅ Login OK. Token received.');

        // 4. Protected Route (Profile)
        console.log('\n4️⃣ Checking Profile (GET /auth/profile)...');
        const profile = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Profile OK:', profile.data.email);

        // 5. Dashboard Timeline (New Module)
        console.log('\n5️⃣ Checking Dashboard Timeline (GET /dashboard/timeline)...');
        const timeline = await axios.get(`${API_URL}/dashboard/timeline`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Timeline OK. ${timeline.data.length} items received.`);

        // 6. Dashboard Integrity (New Module)
        console.log('\n6️⃣ Checking Dashboard Integrity (GET /dashboard/integrity)...');
        const integrity = await axios.get(`${API_URL}/dashboard/integrity`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Integrity OK. Status:', integrity.data.status);

        // 7. Sefaz Status (Mock Mode)
        console.log('\n7️⃣ Checking Sefaz Status (GET /sefaz/status?uf=RS)...');
        const sefaz = await axios.get(`${API_URL}/sefaz/status?uf=RS`); // Public route
        console.log('✅ Sefaz OK:', sefaz.data);

        console.log('\n✨ ALL CHECKS PASSED SUCCESSFULLY! ✨');

    } catch (error) {
        console.error('\n❌ VALIDATION FAILED');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

validate();
