const mongoose = require('mongoose');
const { isEmail } = require('validator');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email.'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email.']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minlength: [6, 'Minimum password length is 6 characters.']
    },
    adminCode: {
        type: String,
        required: [true, 'Please enter an admin validation code.'],
        validate: {
            validator: function(v) {
                console.log("Input value: ", v);
                console.log("Expected value: ", 'admintest');
                return v === 'admintest'; // Change the value to your desired admin code
            },
            message: 'Invalid admin validation code.'
        }
    }
});

const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;
