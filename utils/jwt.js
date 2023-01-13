const sendToken = (user, statusCode, res) => {
    const userToken = user.getJWTToken()
    res.status(statusCode).json({
        sucess: true,
        user,
        userToken,
        userID: user.id
    })
}

module.exports = sendToken