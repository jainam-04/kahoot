const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const { updateProfile } = require('../controllers/authController');

test('Host Profile Update Controller Tests', async (t) => {
    try {
        if (process.env.MONGO_URI) {
            await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
        }
    } catch {
        // MongoDB connection failed/unavailable
    }

    if (mongoose.connection.readyState !== 1) {
        t.skip('MongoDB connection is not available in current test environment');
        return;
    }

    const testUser1Email = 'host_profile_test_1@test.com';
    const testUser2Email = 'host_profile_test_2@test.com';

    await User.deleteMany({ email: { $in: [testUser1Email, testUser2Email, 'new_unique_email@test.com'] } });

    const user1 = await User.create({
        name: 'Initial Host',
        email: testUser1Email,
        password: 'password123',
        role: 'user',
        securityQuestion: 'Pet?',
        securityAnswer: 'dog'
    });

    const user2 = await User.create({
        name: 'Second Host',
        email: testUser2Email,
        password: 'password123',
        role: 'user',
        securityQuestion: 'Pet?',
        securityAnswer: 'cat'
    });

    await t.test('Successfully updates name and email', async () => {
        const req = {
            user: { id: user1._id.toString() },
            body: {
                name: 'Updated Host Name',
                email: 'new_unique_email@test.com'
            }
        };

        const res = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; }
        };

        await updateProfile(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.user.name, 'Updated Host Name');
        assert.equal(res.body.user.email, 'new_unique_email@test.com');

        const dbUser = await User.findById(user1._id);
        assert.equal(dbUser.name, 'Updated Host Name');
        assert.equal(dbUser.email, 'new_unique_email@test.com');
    });

    await t.test('Rejects duplicate email already taken by another user', async () => {
        const req = {
            user: { id: user1._id.toString() },
            body: {
                name: 'Updated Host Name',
                email: testUser2Email // Taken by user2
            }
        };

        const res = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; }
        };

        await updateProfile(req, res);

        assert.equal(res.statusCode, 400);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /already in use/i);
    });

    await t.test('Rejects invalid email format', async () => {
        const req = {
            user: { id: user1._id.toString() },
            body: {
                name: 'Valid Name',
                email: 'invalid-email-string'
            }
        };

        const res = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; }
        };

        await updateProfile(req, res);

        assert.equal(res.statusCode, 400);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /valid email/i);
    });

    await t.test('Rejects too short name', async () => {
        const req = {
            user: { id: user1._id.toString() },
            body: {
                name: 'A',
                email: 'new_unique_email@test.com'
            }
        };

        const res = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; }
        };

        await updateProfile(req, res);

        assert.equal(res.statusCode, 400);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /at least 2 characters/i);
    });

    // Cleanup
    if (mongoose.connection.readyState === 1) {
        await User.deleteMany({ email: { $in: [testUser1Email, testUser2Email, 'new_unique_email@test.com'] } });
        await mongoose.disconnect();
    }
});
