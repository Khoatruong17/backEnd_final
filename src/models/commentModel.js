const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    contribution_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contributions'
    },
    comment:{
        type: String,
        required: true
    }
}, {timestamps: true}
)

module.exports = mongoose.model('Comment', commentSchema)