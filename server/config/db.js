const mongoose = require('mongoose');
const dns = require('dns');

// Use Cloudflare & Google public DNS servers to resolve MongoDB Atlas querySrv (ECONNREFUSED / ETIMEOUT)
try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (err) {
    console.warn('⚠️ Could not configure DNS servers:', err.message);
}

let memoryServer = null;

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI is not defined in .env file!');
        process.exit(1);
    }

    // First, try to connect to Atlas
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Fail fast if unreachable
        });
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        return;
    } catch (error) {
        console.warn(`⚠️  Atlas unreachable (${error.message})`);
        console.warn('🔄 Falling back to in-memory MongoDB for local development...');
    }

    // Fallback: spin up an in-memory MongoDB instance
    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const uri = memoryServer.getUri();
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected: In-Memory (local dev fallback)');
        console.log('⚠️  NOTE: Data will NOT persist between restarts in this mode.');
        console.log('   Fix your Atlas connection or run a local MongoDB for persistence.');
    } catch (fallbackError) {
        console.error(`❌ In-memory MongoDB also failed: ${fallbackError.message}`);
        console.error('   Please install mongodb-memory-server: npm install --save-dev mongodb-memory-server');
        process.exit(1);
    }
};

module.exports = connectDB;