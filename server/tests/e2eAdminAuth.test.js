const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const adminRoutes = require('../routes/adminRoutes');

test('End-to-End API Integration: Login & Admin Access', async (t) => {
    await mongoose.connect(process.env.MONGO_URI);

    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    const normalEmail = 'normal_e2e_test@example.com';
    const adminEmail = 'superadmin_e2e_test@example.com';
    const testPassword = 'Password123!';

    await User.deleteMany({ email: { $in: [normalEmail, adminEmail] } });

    await User.create({
        name: 'Normal User',
        email: normalEmail,
        password: testPassword,
        role: 'user',
        securityQuestion: 'Question?',
        securityAnswer: 'ans'
    });

    await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: testPassword,
        role: 'superadmin',
        securityQuestion: 'Question?',
        securityAnswer: 'ans'
    });

    let normalToken = '';
    let adminToken = '';

    await t.test('Test 1: Normal User login returns role="user"', async () => {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalEmail, password: testPassword })
        });
        const data = await res.json();
        assert.equal(res.status, 200);
        assert.equal(data.success, true);
        assert.equal(data.user.role, 'user');
        assert.ok(data.token);
        normalToken = data.token;
    });

    await t.test('Test 2: Super Admin login returns role="superadmin"', async () => {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: testPassword })
        });
        const data = await res.json();
        assert.equal(res.status, 200);
        assert.equal(data.success, true);
        assert.equal(data.user.role, 'superadmin');
        assert.ok(data.token);
        adminToken = data.token;
    });

    await t.test('Test 3: Calling /api/admin/* without token returns 401 Unauthorized', async () => {
        const res = await fetch(`${baseUrl}/api/admin/stats`);
        const data = await res.json();
        assert.equal(res.status, 401);
        assert.equal(data.success, false);
    });

    await t.test('Test 4: Normal user calling /api/admin/* returns 403 Forbidden', async () => {
        const res = await fetch(`${baseUrl}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${normalToken}` }
        });
        const data = await res.json();
        assert.equal(res.status, 403);
        assert.equal(data.success, false);
        assert.match(data.message, /Super Admin privileges required/i);
    });

    await t.test('Test 5: Super Admin calling /api/admin/* succeeds with 200 and stats data', async () => {
        const res = await fetch(`${baseUrl}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const data = await res.json();
        assert.equal(res.status, 200);
        assert.equal(data.success, true);
        assert.ok(data.data.totalUsers !== undefined);
        assert.ok(data.data.totalQuizzes !== undefined);
    });

    // Cleanup
    await User.deleteMany({ email: { $in: [normalEmail, adminEmail] } });
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
});
