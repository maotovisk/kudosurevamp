import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    osu_id: Number,
    token: String,
    kudosu:{
        total: Number,
        available: Number
    },
    items: [{item_id: String}],
    access: {
        role_id: Number,
        admin: Boolean
    }
});


export default mongoose.model('User', userSchema);