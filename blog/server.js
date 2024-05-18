const express=require('express')
const bodyParser=require('body-parser');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const app=express()
const article = require('./models/article')
const User=require('./models/user')
const path=require('path')
const articleRouter = require('./route/router')
const router = require('./route/router');
const mongoose=require('mongoose');
const fetch=require('node-fetch')

app.use(bodyParser.json());
app.use('/all', router);
mongoose.connect('mongodb://my-mongo/wyr')

app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('login', { title: '登录页面' });
});
app.get('/all',async(req,
res)=>{
    const all= await article.find();
    res.render('all',{articles:all})
})
// 设置视图目录，路径也需要修改以指向正确的目录
app.set('views', path.join(__dirname,'views'));
app.use(express.urlencoded({ extended: false }))
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.use('/', articleRouter)
app.listen(12337)