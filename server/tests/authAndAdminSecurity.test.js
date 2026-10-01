const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

test('Backend Auth & Admin Role Security Tests', async (t) => {
    await mongoose.connect(process.env.MONGO_URI);

    // Setup: Create/Find a test normal user and a test superadmin
    const normalEmail = 'test_normal_role_check@test.com';
    const adminEmail = 'test_superadmin_role_check@test.com';

    await User.deleteMany({ email: { $in: [normalEmail, adminEmail] } });

    const normalUser = await User.create({
        name: 'Normal User',
        email: normalEmail,
        password: 'password123',
        role: 'user',
        securityQuestion: 'Color?',
        securityAnswer: 'green'
    });

    const superAdminUser = await User.create({
        name: 'Super Admin User',
        email: adminEmail,
        password: 'password123',
        role: 'superadmin',
        securityQuestion: 'Color?',
        securityAnswer: 'purple'
    });

    await t.test('User Model defaults role to "user"', () => {
        assert.equal(normalUser.role, 'user');
        assert.equal(superAdminUser.role, 'superadmin');
    });

    await t.test('JWT verification and protect middleware loads user role', async () => {
        const token = jwt.sign({ id: normalUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = {
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; }
        };

        let nextCalled = false;
        await protect(req, res, () => { nextCalled = true; });

        assert.equal(nextCalled, true);
        assert.equal(req.user.email, normalEmail);
        assert.equal(req.user.role, 'user');
    });

    await t.test('superAdminOnly middleware rejects normal user with 403', () => {
        const req = { user: { role: 'user' } };
        let statusCode = null;
        let responseBody = null;

        const res = {
            status(code) { statusCode = code; return this; },
            json(data) { responseBody = data; return this; }
        };

        let nextCalled = false;
        superAdminOnly(req, res, () => { nextCalled = true; });

        assert.equal(nextCalled, false);
        assert.equal(statusCode, 403);
        assert.equal(responseBody.success, false);
        assert.match(responseBody.message, /Super Admin privileges required/i);
    });

    await t.test('superAdminOnly middleware allows superadmin user', () => {
        const req = { user: { role: 'superadmin' } };
        let nextCalled = false;
        const res = {
            status() { return this; },
            json() { return this; }
        };

        superAdminOnly(req, res, () => { nextCalled = true; });
        assert.equal(nextCalled, true);
    });

    await t.test('superAdminOnly middleware rejects unauthenticated/empty user with 403', () => {
        const req = {};
        let statusCode = null;
        const res = {
            status(code) { statusCode = code; return this; },
            json() { return this; }
        };

        let nextCalled = false;
        superAdminOnly(req, res, () => { nextCalled = true; });

        assert.equal(nextCalled, false);
        assert.equal(statusCode, 403);
    });

    // Cleanup
    await User.deleteMany({ email: { $in: [normalEmail, adminEmail] } });
    await mongoose.disconnect();
});
