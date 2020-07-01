import mongoose from 'mongoose';

const itemTypeSchema = new mongoose.Schema({
    title: String,
    id: Number
});

export default mongoose.model('ItemType', itemTypeSchema)