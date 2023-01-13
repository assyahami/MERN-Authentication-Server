const express = require('express')
const { createUser, loginUser, forgotPassword, resetUserPassword, getUser, uniqueEmail } = require('../controller/user')
const userRouter = express.Router()

userRouter.route('/user/:id').get(getUser)
userRouter.route('/user/register').post(createUser)
userRouter.route('/user/password/forgot').post(forgotPassword)
userRouter.route('/user/password/reset/:token').post(resetUserPassword)
userRouter.route('/user/login').post(loginUser)
userRouter.route('/user/:email').get(uniqueEmail)

module.exports = userRouter
