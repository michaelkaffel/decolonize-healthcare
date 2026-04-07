import mongoose from 'mongoose';

let connectionPromise = null;

const connectDB = async () => {
    if (connectionPromise) return connectionPromise;

    try {
        connectionPromise = mongoose.connect(process.env.MONGODB_URI);
        await connectionPromise;
    } catch (err) {
        connectionPromise = null;
        throw err;
    }
    
}

export default connectDB;