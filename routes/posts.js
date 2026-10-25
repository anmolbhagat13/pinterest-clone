const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
    postText: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    likes: {
        type: Array,
        default: [],
    },
    },
    {
    timestamps: true,
    }
);

module.exports = mongoose.model("Post", postSchema);
