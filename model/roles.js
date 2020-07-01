import mongoose from 'mongoose';

const roleSchema = new  mongoose.Schema({
    title: String,
    id: Number,
    isAdmin: Boolean
});


export default mongoose.model('Role', roleSchema);