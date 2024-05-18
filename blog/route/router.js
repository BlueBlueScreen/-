const express=require('express')
const router=express.Router();
const bcrypt=require('bcryptjs');
const jwt = require('jsonwebtoken');
const article = require('./../models/article');
const User=require('./../models/user')

router.get('/new',(req,res)=>{
    res.render('new')
})
router.get('/edit/:id', async (req, res) => {
    const one = await article.findOne({ _id: req.params.id });
    res.render('edit', { article: one })
})
router.post('/new', async (req,res) => {

    one = new article({ title: req.body.title, description: req.body.description,markdown:req.body.markdown,author:req.body.author });
    await one.save();
    res.render('display', { article: one })
})


router.delete('/:id', async (req, res) => {
  await article.deleteMany({ _id: req.params.id });
  res.redirect('/')
})

router.put('/:id', async (req, res) => {
    let data = {}
    data.title = req.body.title
    data.description = req.body.description
    data.markdown=req.body.markdown
    data.author=req.body.author

    var one = await article.findOne({ _id: req.params.id });
    if (one != null) {
        one.title = data.title;
        one.description = data.description;
        one.markdown=data.markdown;
        one.author=data.author;
        await one.save();       
    }  
    res.render('display', { article: data })
})
//注册路由
router.post('/register', async (req, res) => {
    const { username, password } = req.body; // 从请求体中解构出用户名和密码
    console.log('Register request received', req.body);
    try {
        let user = await User.findOne({ username }); // 查询数据库中是否已存在该用户名
        if (user) {
            return res.status(400).json({ message: '用户名已存在' }); // 如果用户名已存在，返回错误信息
        }
        console.log("开始注册")
        const salt = await bcrypt.genSalt(10); // 生成盐值，用于加密密码
        const hashedPassword = await bcrypt.hash(password, salt); // 使用盐值和密码生成加密后的密码
        user = new User({ username, password: hashedPassword }); // 创建新的用户实例
        await user.save(); // 将新用户保存到数据库
        res.status(201).json({ message: '注册成功' }); // 注册成功，返回成功信息
    } catch (error) {
        res.status(400).json({ error }); // 如果发生错误，返回错误信息
    }
});

// 登录路由
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // 从请求体中解构出用户名和密码
        console.log('Login request received', req.body);
    try {
        let user = await User.findOne({ username }); // 查询数据库中的用户
        if (!user) {
            return res.status(400).json({ message: '用户名不存在' }); // 如果用户不存在，返回错误信息
        }
        const isMatch = await bcrypt.compare(password, user.password); // 比较输入的密码和数据库中存储的加密密码
        if (!isMatch) {
            return res.status(400).json({ message: '密码不正确' }); // 如果密码不匹配，返回错误信息
        }
        const token = jwt.sign({ id: user._id }, 'yourSecretKey', { expiresIn: '1h' }); // 生成JSON Web Token
        res.json({ token, message: '登录成功' }); // 登录成功，返回Token和成功信息
    } catch (error) {
        res.status(400).json({ error }); // 如果发生错误，返回错误信息
    }
});

module.exports = router