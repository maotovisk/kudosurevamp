import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    osu_id: Number,
    token: String,
    session_id: String,
    kudosu:{
        total: Number,
        available: Number
    },
    qah_checks: String,
    currency: {
        spent: Number,
        bonus: Number
    },
    items: [{item_id: String}],
    access: {
        role_id: Number,
        admin: Boolean
    }
});


export default mongoose.model('User', userSchema);