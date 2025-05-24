import mongoose, { Schema } from "mongoose"; 
const orderSchema = new Schema({
    timeSlot : {
        type : String ,
        required : true ,
     },
     date : {
        type : String ,
        required : true ,
     },
     phone : {
        type : String ,
        required : true ,
     },
     listingId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Listings",
        required : true 
     },
    customer : {
         type : mongoose.Schema.Types.ObjectId,
         ref : "Users" ,
         required : true
    },
    mealType : {
        type : String ,
        required : true
    }
     
}, {
    timestamps: true,
})

export const Orders = mongoose.model("Orders" , orderSchema)