const mongoose=require('mongoose');
mongoose.connect('mongodb://my-mongo/wyr')
const UserSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});
const User = mongoose.model('user', UserSchema);
module.exports = User;