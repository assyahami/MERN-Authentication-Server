const express = require('express')
const errorMiddleware = require('./middleware/error')
const userRouter = require('./router/userRouter')
const app = express()


app.use(express.json())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.BASE_URL);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api/v1', userRouter)

app.use(errorMiddleware)

module.exports = app