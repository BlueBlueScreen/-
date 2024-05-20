# -
这是个新生课程要求完成的简易博客系统
#新生项目课程：云计算环境下的博客系统开发
## 实验概述

1. 实验名称：简单博客系统的制作
  
2. 实验目的：学习并掌握HTML、CSS和JavaScript的基础知识，能够独立制作一个简单的博客系统。
  
3. 实验环境：操作系统：Linux
  

                     编程工具：文本编辑器/Visual Studio

                     浏览器：Edge浏览器

## 实验内容

1. 使用HTML构建博客系统的基本结构；
  
2. 使用CSS对博客系统进行样式设计；
  
3. 使用JavaScript实现博客系统的交互功能。
  

## 实验步骤

1.       通过JavaScript，实现博客系统最基本的功能，包括增，删，改，查。

2.       优化目录结构，将需要使用的HTML , CSS, 以及必要的图片文件分别储存在public静态文件目录下。编写一个路由(router.js)来实现服务器（server.js）中必要的路由函数，并将路由置于单独的一个目录下。创建（models）文件夹，储存在Mongoose中注册的模型代码。

3.       为博客系统的各个界面添加Css样式起到美化作用

4.       给博客系统的内容页添加更多的功能，包括落款，标记，显示日期等。

5.       为博客系统添加注册和登录功能。首先在Mongoose数据库中注册一个User模型并将相应代码置于models文件夹下。然后分别设计一个登录和注册页面，并添加对应的JavaScript代码，使得当用户点击注册按钮后跳转到注册页面，并将注册的用户名和密码储存在数据库中；当用户点击登录按钮后系统将用户信息与数据库中的信息对比，并根据对比结果执行相应的操作。最后为登录和注册页面添加Css样式。

##### 数据库结构
```mermaid
graph LR
  blog[blog]-->ar[articles]-..->id
  ar-..->title
  ar-..->description
  ar-..->markdown
  ar-..->author
  ar-..->createdAt
  blog-->user[users]-..->username
  user-..->password
  ```


##### 代码具体讲解
###### 基础功能
以增加为例
```js
<form action="/new" method="POST">
    <div>
    <label for="title">Title</label>
    <input class="class1" required type="text" name="title" id="title">
    </div>

    <div>
    <label for="description">Description</label>
    <textarea name="description" id="description"></textarea>
    </div>

    <div>
    <label for="markdown">Markdown</label>
    <textarea name="markdown" id="markdown"></textarea>
    </div>

    <div class="signature">
    落款
    </div>
    <div class="box">
    <input class="class2" required type="text" name="author" id="author">
    </div>
    
    <a href="/all">Cancel</a>
    <a href="/all">Back</a>
    <button type="submit">Save</button>
</form>
```
通过表单的形式，以POST方法来进行文章的新增，通过label来标识输入区域的性质，在标题区域用input实现单行输入，而在内容部分用textarea进行多文本输入，贴近一般博客系统的输入模式
```js
<body>
    <h1 class="mb-4">Articles</h1>
        <a href="/new">New Articles</a>
        <hr />
    <% articles.forEach(article=>{%>
    <h2>Title</h2>
    <p><%= article.title %></p>
    <div class="sign"><%= article.author %></div>
    <a href="/edit/<%=article._id %>">详情</a>
    <form action="/<%=article._id %>?_method=DELETE" method="POST">
        <button type="submit">删除</button>
    </form>
    <hr />
    <% })%>
```
在博客主页我们只显示博客标题和落款，可以点击详情按钮查看具体内容。
通过articles.forEach函数将每一篇博客展示出来。
###### 注册
```js
<form id="registerForm" class="sign-up">
    <h1 class="sign-up-title">Sign up in seconds</h1>
    <input id ="username" type="text" class="sign-up-input" placeholder="What's your username?" autofocus>
    <input id ="password" type="password" class="sign-up-input" placeholder="Choose a password">
    <input type="submit" value="Sign me up!" class="sign-up-button" >
  </form>
```
我们在注册页面中添加了一个表单，以便用户输入内容

```js
    document.getElementById('registerForm').onsubmit = async function(event) {
        event.preventDefault(); // 阻止表单的默认提交行为
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            console.log("开始发送请求");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            alert(result.message); // 弹出注册成功或失败的信息
            window.location.href="/"
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            // 这里应该处理错误，例如显示错误信息给用户
            alert('注册失败：' + error.message);
        }
    };
```
我们通过evert.preventDefault函数阻止表单的默认请求，再通过fetch函数发送一个异步请求到达/register,同时指定请求头和请求方式。通过alert来反馈注册情况，如果注册成功，将回到初始页面
```js
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
```
在register路径函数中，服务器完成检测用户是否存在-加密密码-储存用户注册信息的注册逻辑



###### 落款功能
```js
    <div class="signature">
    落款
    </div>
    <div class="box">
    <input class="class2" required type="text" name="author" id="author">
    </div>
    <div class="time">
            <%= article.createdAt.toLocaleDateString() %>
    </div>
```
通过以上代码我们定义了一个落款按钮，使得用户可以将自己的名字添加到博客内容中，同时在保存博客之后会自动显示博客的写作时间
###### 登录
```js
    <div class="shell">
        <div class="box-left">
            <h2>Login</h2>
            <span>enjoy your self in the Blog<br>Wish you good day</span>
        </div>
        <div class="box-right">
            <div class="form">
                <label for="email">Email</label>
                <input type="email" id="email" required>
                <label for="password">Password</label>
                <input type="password" id="password" required>
                <input type="button"  id="submit" value="Submit" onclick="submitForm()">
                <input type="button"  id="register" value="Register" onclick="redirectTo('/html/register.html')">

            </div>
        </div>
    </div>
  ```
此处我们为设计了一个非表单式的登录界面，用户可以选择注册或在填写信息后登录

```js
    async function submitForm() {
    const username = document.getElementById('email').value;  
    const password = document.getElementById('password').value;  
    try {  
        const response = await fetch('/login', {  
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json'  
            },  
            body: JSON.stringify({ username, password })  
        });  
            if (!response.ok) {
                throw new Error('系统出错，请重试');
            }
            const result = await response.json();
            alert(result.message); 
            window.location.href="/all"
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            // 这里应该处理错误，例如显示错误信息给用户
            alert('登录失败：' + error.message);
        }
```
登录部分采取和注册相似的方法，在登录成功后会跳转到博客页面

```js
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
```
上为登录路由函数。当用户输入信息后服务器会先根据用户名查询用户信息，若用户存在则将与对应密码进行比对。登录成功后系统会返回Token和成功信息。

最后为了起到美化作用，我们分别为注册，登录，博客系统页面设计了丰富的Css样式，以下为登录页面的CSS示例
```js
    <style>
        * {
            padding: 0;
            margin: 0;
        }

        body {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #87CEEB;
        }
        .shell{
            width: 640px;
            height: 320px;
            display: flex;
        }
        .box-left{
            background-color: #fff;
            height: 280px;
            top: 20px;
            position: relative;
            width: 50%;
        }
        .box-left h2{
            font: 900 50px 'Times';
            margin: 50px 40px 40px;
        }
        .box-left span{
            display: block;
            color: #999;
            font-size: 14px;
            margin: 40px;
        }
        .box-right{
            background-color: #474a59;
            box-shadow: 0 0 40px 16px rgba(0,0,0,.2);
            color: #f1f1f2;
            width: 50%;
        }
        .form{
            margin: 40px;
            position: relative;
        }
        label{
            color: #c2c2c5;
            display: block;
            font-size: 14px;
            height: 16px;
            margin-top: 20px;
            margin-bottom: 5px;
            position: relative;
        }
        input{
            background: transparent;
            border: 0;
            color: #f2f2f2;
            font-style: 20px;
            height: 30px;
            line-height: 30px;
            width: 100%;
            outline: none !important;
        }
        label::before{
            content: '';
            display: block;
            position: absolute;
            top: 52px;
            width: 100%;
            height: 3px;
            background-image: linear-gradient(to right,#44ffff,#b888ff);
        }
        #submit{
            color: #fff;
            margin-top: 40px;
            width: 100px;
            height: 35px;
            background-color: rgba(255,255,255,.1);
            border-radius: 20px;
            float: right;
            transition: .3s;
        }
        #submit:hover{
            letter-spacing: 2px;
            color: #000;
            background-color: #fff;
        }
        #register{
            color: #fff;
            margin-top: 40px;
            width: 100px;
            height: 35px;
            background-color: rgba(255,255,255,.1);
            border-radius: 20px;
            float: left;
            transition: .3s;
        }
        #register:hover{
            letter-spacing: 2px;
            color: #000;
            background-color: #fff;
        }

    </style>
```
在这些CSS样式中，我们在给背景添加样式之余，主要设计了两个容器，分别展示登陆页面的标题与简介，以及博客的输入界面（box-left,box-right)，同时我们也为各个按钮和输入框设置了独特的样式，使得其看起来简洁而美观。


## 实验结果

通过以上步骤，我们制作出了一个简单而美观，基础功能齐全博客系统。

## 实验总结

1. 学会了基本的HTML，CSS，JavaScript语法
  
2. 学会了linux系统的一些基本指令
  
3. 学会了markdown语言的基本语法
  
4. 学会了如何通过HTML建构网页，如何使用CSS美化网页，如何通过JavaScript实现网页交互。
  
5. 学会了数据库的一些基本操作
  
6. 学会了如何在浏览器端调试自己的前端和后端代码，学会了如何通过网络状态和控制台信息来解决程序报错问题
  

## 实验心得

    在本次实验中，我通过由简到繁地设计，由易到难地编写我的代码，逐步掌握了HTML，CSS，JavaScript的基本语法。我的编程能力在不断地发现问题，又不断地解决问题中得到了可观地提高，迈出了知识层面上在网页设计方面从无到有的一步。我的编程热情也在博客系统功能逐渐完善，页面不断美化当中提高。

## 参考文献

1. 教程：[w3school 在线教程](https://www.w3school.com.cn/)
  
2. CSS样式参考：https://navnav.co
  

| 工作量统计表 | 基础功能 | 新增功能1 | 新增功能2 | 新增功能3 | 新增功能4 | 新增功能5 | 新增功能6 | 新增功能7 | 新增功能8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 描述  | 对博客系统中博文的增删改查操作 | 原博客系统CSS美化 | 目录结构优化 | 增加markdown输入框 | 增加落款功能 | 登录页面的制作 | 注册页面的制作 | 登录功能和注册功能的实现 | 用户信息加密 |
| 学时  | 8   | 3   | 3   | 2   | 3   | 3   | 3   | 8   | 2   |
