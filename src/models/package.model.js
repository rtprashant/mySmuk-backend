import mongoose , { Schema } from "mongoose";

const packageSchema = new Schema(
    {
        packageName : {
            type : String ,
            required : true ,
        },
        startingFrom : {
            type : String ,
            required : true ,
        },
        image : {
            type : String , 
            required : true,
        }

    },
    {
        timestamps: true 
    }
)

export const Package = mongoose.model("Package" , packageSchema)