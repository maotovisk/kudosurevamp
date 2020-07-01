import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    title: String,
    image_url: String,
    price: Number,
    userRole: Number
});

export default mongoose.model('Item', itemSchema);