const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcrypt');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const secret = "secret";

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
app.use(express.json());
app.use(cookieParser());

console.log(__dirname);
app.use('/uploads', express.static(__dirname + '/uploads'));

// Database Connection
const url = "mongodb+srv://anirban:1234@cluster0.dgoenmb.mongodb.net/blog?retryWrites=true&w=majority";
mongoose.connect(url).then(() => {
    console.log("Connected to the database!");
}).catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
});

app.get('/', (req, res) => {
    res.json('success');
});

app.post('/register', async (req, res) => {

    const { username, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    try {
        const userDoc = await User.create({
            username,
            password: hashPassword
        });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {

    const { username, password } = req.body;

    const userDoc = await User.findOne({ username: username });

    if (!userDoc) {
        return res.status(400).json("Wrong credentials");
    }

    const match = await bcrypt.compare(password, userDoc.password);

    if (match) {
        const token = await jwt.sign({ username, id: userDoc._id }, secret);
        res.cookie('token', token).json({
            id: userDoc._id,
            username,
        });
    } else {
        return res.status(400).json("Wrong credentials");
    }

});

app.get('/profile', (req, res) => {

    const { token } = req.cookies;

    if (!token) {
        res.json({ status: false });
    }

    jwt.verify(token, secret, function (err, info) {
        if (err) throw err;
        return res.json(info);
    });

    res.json(req.cookies);
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {

    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const extension = parts[parts.length - 1];
    const newPath = path + '.' + extension;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;

    jwt.verify(token, secret, async function (err, info) {
        if (err) throw err;

        const { title, summary, content } = req.body;

        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id
        });

        res.json({ postDoc });
    });

});

app.get('/post', async (req, res) => {

    const posts = await Post.find().populate('author', ['username']).sort({
        createdAt: -1
    }).limit(5);
    res.json(posts);
});

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
});

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {

    let newPath = null;

    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const extension = parts[parts.length - 1];
        newPath = path + '.' + extension;
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;

    jwt.verify(token, secret, async function (err, info) {
        if (err) throw err;

        const { id, title, summary, content } = req.body;

        const postDoc = await Post.findById(id);

        await Post.findByIdAndUpdate(id, {
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
        }).exec();

        res.json(postDoc);
    });

});

app.listen(4000, () => {
    console.log(`Server listening on port 4000`);
});