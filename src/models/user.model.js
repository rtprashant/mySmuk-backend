import mongoose , { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const userSchema = new Schema({
    firstName :{
        type:String,
    },
    lastName:{
        type:String,
    },
    email:{
        type:String,
        
    },
    mobileNo :{
        type:String,  
    },
    dob : {
        type:Date,
    },
    isEmailSignup :{
        type:Boolean,  
        default: false
    },
    refreshtoken :{
        type:String,
    },
    isEmailVerified : {
        type:Boolean,
        default: false
    },
    userType : {
        type:String,
        enum : ["admin" , "user"]
    }

},{
    timestamps: true
})
userSchema.methods.genrateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            userName:this.userName

        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
           expiresIn: '1d' || process.env.ACCESS_TOKEN_SECRET_KEY_EXPIRY 
        }
    )
}
userSchema.methods.genrateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            userName:this.userName

        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
           expiresIn: '10d'|| process.env.REFRESH_TOKEN_SECRET_KEY_EXPIRY 
        }
    )
}
userSchema.methods.comparePass = async function(password){
    return await bcrypt.compare(password , this.password)
}

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


export const User = mongoose.model("User" , userSchema)