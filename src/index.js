import dotenv from 'dotenv'
dotenv.config(
    {
        path: ".env"
    }
)
import dbConnection from './database/dbConnection.js'
import app from './app.js'
const port = process.env.PORT
dbConnection()
.then(()=>{
    console.log("Database connected")
    app.listen(port , ()=>{
        console.log(`Server is running on port ${port}`)
    })
})
.catch((err)=>{
    console.log(`error while connecting db :  ${err}`);
})
