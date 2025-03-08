import { Restaurant } from "../models/restaurant.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

export const verifyJwt = asyncHandler(async(req, res , next)=>{
    try {
        const token = await (req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer " , ""))
        if(!token){
            return res.status(401).json({message: "Unauthorized Request"})
        }
        const decoded = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET_KEY);
        const user = await User.findById(decoded._id).select("-refreshtoken -password");
        if(!user){
            throw new apiError("User Not Found" , 404)
        }
        req.user = user;
        next();
    } catch (error) {
        throw new apiError(
            error.message || "Invalid Token" ,
            401
        )
        
    }

})
export const verifyRest = asyncHandler(async(req, res , next)=>{
    try {
        const token = await (req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer " , ""))
        if(!token){
            return res.status(401).json({message: "Unauthorized Request"})
        }
        const decoded = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET_KEY);
        const rest = await Restaurant.findById(decoded._id).select("-refreshToken -password");
        if(!rest){
            throw new apiError("Restaurant Not Found" , 404)
        }
        req.restaurant = rest;
        next();
    } catch (error) {
        throw new apiError(
            error.message || "Invalid Token" ,
            401
        )
        
    }

})

