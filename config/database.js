const mongoose = require("mongoose")

const connectDatabse = () => {
    mongoose.connect(process.env.MONGODB_CONNECTION,()=>{
        return {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true, 
            autoIndex: true,
        }
    }).then((res) => {
        console.log(`MongoDB is connected to the host: ${res.connection.host} `);
    }).catch((err) => {
        console.log(err);
    })
}

module.exports=connectDatabse