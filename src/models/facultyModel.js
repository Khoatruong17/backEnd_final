const mongoose = require('mongoose')
const FacultySchema = new mongoose.Schema({
    faculty_name: {
        type: String,
        minLength: 1,
        maxLength: 50,
        required: true,
        unique: true 
    }
    
}, {timestamps: true}
)

module.exports = mongoose.model('Faculty', FacultySchema)