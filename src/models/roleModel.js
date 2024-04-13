const mongoose = require('mongoose')
const RoleSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true 
    },
    description: {
        type: String
    }
}, {timestamps: true}
)

module.exports = mongoose.model('role', RoleSchema)