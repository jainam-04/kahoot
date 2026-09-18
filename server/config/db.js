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
        console.log('⏳ Starting in-memory MongoDB (downloading binary if first run, please wait)...');
        memoryServer = await MongoMemoryServer.create({
            instance: {
                dbName: 'quizdb'
            },
            spawn: {
                timeout: 300000 // 5 minutes to allow binary download on initial launch
            }
        });
        const uri = memoryServer.getUri();
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected: In-Memory (local dev fallback)');
        console.log('⚠️  NOTE: Data will NOT persist between restarts in this mode.');
        console.log('   To persist data, update server/.env with your real MongoDB Atlas URI:');
        console.log('   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority');
    } catch (fallbackError) {
        console.error(`❌ In-memory MongoDB initialization error: ${fallbackError.message}`);
        console.error('👉 Please configure your real MongoDB Atlas URI in server/.env:');
        console.error('   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority');
    }
};

module.exports = connectDB;