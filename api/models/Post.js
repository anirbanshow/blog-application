const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    title: { type: String, require: true },
    summary: { type: String, require: true },
    content: { type: String, require: true },
    cover: { type: String, require: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;