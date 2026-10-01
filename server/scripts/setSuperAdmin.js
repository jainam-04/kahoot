const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const setSuperAdmin = async () => {
    const targetEmail = process.argv[2] || 'admin@fourisequizhub.com';

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const normalizedEmail = targetEmail.trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log(`ℹ️ User with email "${normalizedEmail}" not found. Creating a default superadmin user...`);
            user = await User.create({
                name: 'Super Admin',
                email: normalizedEmail,
                password: 'AdminPassword123!',
                role: 'superadmin',
                securityQuestion: 'What is your favorite color?',
                securityAnswer: 'blue'
            });
            console.log(`🎉 Super Admin created successfully!`);
            console.log(`   Email: ${normalizedEmail}`);
            console.log(`   Password: AdminPassword123!`);
            console.log(`   Role: ${user.role}`);
        } else {
            user.role = 'superadmin';
            await user.save();
            console.log(`🎉 User "${normalizedEmail}" has been updated to role: "superadmin"!`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error setting superadmin:', err.message);
        process.exit(1);
    }
};

setSuperAdmin();
