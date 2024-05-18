const mongoose=require('mongoose');
mongoose.connect('mongodb://my-mongo/wyr')
const articleSchema= new mongoose.Schema({
    title:String,
    description:String,
    markdown:String,
    author:String,
    user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const article=mongoose.model('article',articleSchema)
module.exports = mongoose.model('article', articleSchema)
