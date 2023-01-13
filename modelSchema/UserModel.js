const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken")
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        dropDups:true
    },
    phoneNumber: {
        type: Number
    },
    password: {
        type: String,
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date
})

UserSchema.pre('save', async function (next) {
    let isModifyPass = this.isModified('password')
    if (!isModifyPass) {
        next()
    } else {
        this.password = await bcrypt.hash(this.password, 10)
    }
})

UserSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPERIN
    })
}

UserSchema.methods.isValidPassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password)
}

UserSchema.methods.getResetToken = function () {
    let token = crypto.randomBytes(20).toString('hex')

    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')

    this.resetPasswordTokenExpire = Date.now() + 10 * (60 * 1000);
    return token
}

const UserModal = mongoose.model('UserGroup', UserSchema)

module.exports = UserModal