import mongoose , { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const restaurantSchema = new Schema({
    restName : {
        type : String,
        required : true
    },
    restEmail : {
        type : String,
        required : true
    },
    restMobile : {
        type : String,
        required : true
    },
    restImage : {
        type : [String],
        required : true
    },
    restAddress : {
        type : String,
        required : true
    },
    foodImage : {
        type : [String],
        required : true
    },
    restPanNumber :{
        type : String,
        required : true
    },
    restPanImage :{
        type : String,
        required : true
    },
    restGstNumber :{
        type : String,
        required : true
    },
    restGstImage :{
        type : String,
        required : true
    },
    restFssaiNumber :{
        type : String,
        required : true
    },
    restFssaiExp :{
        type : String,
        required : true
    },
    restFssaiImage :{
        type : String,
        required : true
    },
    restOwnerName : {
        type : String,
        required : true
    },
    restOwnerEmail : {
        type : String,
        required : true
    },
    restOwnerMobile : {
        type : String,
        required : true
    },
    bankAccNumber : {
        type : String,
        required : true
    },
    bankAccName : {
        type : String,
        required : true
    },
    bankAccIfsc : {
        type : String,
        required : true
    },
    bankAccBranch : {
        type : String,
        required : true
    },
    bankAccType : {
        type : String,
        required : true
    },
    bankName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String,

    }
},{
    timestamps: true
})
restaurantSchema.methods.genrateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            restName:this.restName

        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
           expiresIn: '1d' || process.env.ACCESS_TOKEN_SECRET_KEY_EXPIRY 
        }
    )
}
restaurantSchema.methods.genrateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            restName:this.restName

        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
           expiresIn: '10d'|| process.env.REFRESH_TOKEN_SECRET_KEY_EXPIRY 
        }
    )
}

restaurantSchema.pre("save",function(next){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password,10);
    next()
})
restaurantSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

export const Restaurant = mongoose.model("Restaurant" , restaurantSchema)