import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const dbConnection = async()=>{
    try {
        const dbInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    } catch (error) {
        console.log(error);
    }

}
export default dbConnection