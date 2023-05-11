const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

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
            message: () => 'The admin code is incorrect.'
        }
        
    }
});

//fire a function before doc saved to db
adminSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//static method to log user in
adminSchema.statics.login = async function(email, password, adminCode) {
    const admin = await this.findOne({ email });
    if (admin) {
        const auth = await bcrypt.compare(password, admin.password);
        if (auth) {
            if (adminCode === admin.adminCode) {
                return admin;
            }
            throw Error('The admin code is incorrect.');
        }
        throw Error('This password is incorrect.');
    }
    throw Error('This email is incorrect.');
};


const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;
