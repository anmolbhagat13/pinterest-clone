const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
    imageText: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
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
