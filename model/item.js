import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    title: String,
    image_url: String,
    price: Number,
    is_consumable: Boolean,
    user_role: Number
});

export default mongoose.model('Item', itemSchema);