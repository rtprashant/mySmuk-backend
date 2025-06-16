import dotenv from 'dotenv'
dotenv.config(
    {
        path: ".env"
    }
)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import dbConnection from './database/dbConnection.js'
import app from './app.js'
const port = process.env.PORT
dbConnection()
.then(()=>{
    
    app.listen(port , ()=>{
        console.log(`Server is running on port ${port}`)
    })
})
.catch((err)=>{
    console.log(`error while connecting db :  ${err}`);
})
