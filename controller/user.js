const UserModal = require("../modelSchema/UserModel")
const sendEmail = require("../utils/email")
const ErrorHandler = require("../utils/errorHandle")
const sendToken = require("../utils/jwt")
const crypto = require("crypto");
const catchAsyncError = require("../middleware/catchAsyncError");

const createUser = catchAsyncError(async (req, res, next) => {
    const { username, email, phoneNumber, password } = req.body

    const userCreated = await UserModal.create({
        username,
        email,
        phoneNumber,
        password,
    })
    sendToken(userCreated, 201, res)
})


const loginUser = async (req, res, next) => {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            return new next(new ErrorHandler(`Invalid email or password`, 401))
        }
        const getUser = await UserModal.findOne({ email }).select('+password')
        if (!getUser) {
            return new next(new ErrorHandler(`User can't be found`, 401))
        }

        let isCrtPassword = await getUser.isValidPassword(password)
        if (!isCrtPassword) {
            return new next(new ErrorHandler(`Invalid password ${password}`, 401))
        }
        sendToken(getUser, 200, res)
    } catch (error) {
        console.log(error);
    }
}

const forgotPassword = catchAsyncError(async (req, res, next) => {
    let { email } = req.body
    let user = await UserModal.findOne({ email }).select('+password')
    if (!user) {
        return new next(new ErrorHandler(`User can't be found`, 401))
    }

    let resetToken = user.getResetToken()
    await user.save({ validateBeforeSave: false })

    let resetUrl = `${req.protocol}//${req.get('host')}/api/v1/password/reset/`

    const message = `<h4>Your password reset url is as follows</h4> </br>
    <a href="${`http://localhost:5173/accounts/password/change/${resetToken}`}">${resetUrl}</a> \n\n<span> If you have not requested this email, then ignore it.</span>`;
    try {
        sendEmail({
            email: user.email,
            subject: `Authentication password recovery`,
            text: message
        })
        res.status(200).json({
            sucess: true,
            message: `Email sucessFully sent to ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordTokenExpire = undefined
        user.save({ validateBeforeSave: false })
        return next(new ErrorHandler(error.message), 500)
    }
})

const resetUserPassword = async (req, res, next) => {
    let { token } = req.params
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await UserModal.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: {
            $gt: Date.now()
        }
    })

    if (!user) {
        return new next(new ErrorHandler(`Password token is invalid or expired `, 401))
    }

    if (req.body.password !== req.body.newConfirmPassword) {
        return new next(new ErrorHandler(`confirm Password does not match`, 401))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false })
    sendToken(user, 201, res)
}

const getUser = async (req, res, next) => {
    let { id } = req.params

    const findUser = await UserModal.findOne({ _id: id })
    res.status(200).json({
        success: true,
        user: findUser,

    })
}

module.exports = {
    createUser,
    loginUser,
    forgotPassword,
    resetUserPassword,
    getUser
}