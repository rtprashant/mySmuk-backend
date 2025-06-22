import { log } from "console";
import { Restaurant } from "../models/restaurant.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryUpload } from "../utils/cloudinaryUpload.js";
const genrateAccessAndRefreshToken = async function (restId) {
    const restaurant = await Restaurant.findById(restId)
    try {
        if (!restaurant) {
            throw new apiError(
                404,
                "Failed to genrate Access And Refresh Tokens"
            )
        }
        const accessToken = await restaurant.genrateAccessToken()
        const refreshToken = await restaurant.genrateRefreshToken()

        restaurant.refreshToken = refreshToken,
            await restaurant.save(
                {
                    validateBeforeSave: false
                }

            )
        return {
            accessToken,
            refreshToken,
        }
    } catch (error) {
        throw new apiError(
            400,
            "failed to genrate access and refresh token"
        )
    }


}
const restaurantRegister = asyncHandler(async (req, res) => {
    const {
        restName,
        restEmail,
        restMobile,
        restAddress,
        restPanNumber,
        restGstNumber,
        restFssaiNumber,
        restFssaiExp,
        restOwnerName,
        restOwnerEmail,
        restOwnerMobile,
        bankAccNumber,
        bankAccName,
        bankAccIfsc,
        bankAccBranch,
        bankAccType,
        bankName,
        password
    } = req.body
    const missingFields = [];

    if (!restName) missingFields.push("restName");
    if (!restEmail) missingFields.push("restEmail");
    if (!restMobile) missingFields.push("restMobile");
    if (!restAddress) missingFields.push("restAddress");
    if (!restPanNumber) missingFields.push("restPanNumber");
    if (!restGstNumber) missingFields.push("restGstNumber");
    if (!restFssaiNumber) missingFields.push("restFssaiNumber");
    if (!restFssaiExp) missingFields.push("restFssaiExp");
    if (!restOwnerName) missingFields.push("restOwnerName");
    if (!restOwnerEmail) missingFields.push("restOwnerEmail");
    if (!restOwnerMobile) missingFields.push("restOwnerMobile");
    if (!bankAccNumber) missingFields.push("bankAccNumber");
    if (!bankAccName) missingFields.push("bankAccName");
    if (!bankAccIfsc) missingFields.push("bankAccIfsc");
    if (!bankAccBranch) missingFields.push("bankAccBranch");
    if (!bankAccType) missingFields.push("bankAccType");
    if (!bankName) missingFields.push("bankName");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
        console.log("Missing Fields:", missingFields);
        throw new apiError(`Please fill the following fields: ${missingFields.join(", ")}`, 400);
    }
    const existingRest = await Restaurant.findOne({
        $or: [
            { restEmail: restEmail },
            { restMobile: restMobile },
        ]
    })
    if (existingRest) {
        throw new apiError("Restaurant already exists with this restEmail, or mobile number", 400)
    }
    const restImage = req.files["restImage"]?.map((lpath)=>lpath.path)
    
    
    const restPanImage = req.files["restPanImage"]?.map((lpath)=>lpath.path)
   
    const restGstImage = req.files["restGstImage"]?.map((lpath)=>lpath.path)
   
    const restFssaiImage = req.files["restFssaiImage"]?.map((lpath)=>lpath.path)
 
    const foodImage = req.files["foodImage"]?.map((lpath)=>lpath.path)
 

    if (!restImage) {
        throw new apiError("Please upload restaurant image", 400)
    }
    if (!foodImage) {
        throw new apiError("Please upload food image", 400)
    }
    if (!restPanImage) {
        throw new apiError("Please upload restaurant pan image", 400)
    }
    if (!restGstImage) {
        throw new apiError("Please upload restaurant gst image", 400)
    }
    if (!restFssaiImage) {
        throw new apiError("Please upload restaurant fssai image", 400)
    }
    
    const restImageUpload = await cloudinaryUpload(restImage)
    const restPanImageUpload = await cloudinaryUpload(restPanImage)
    const restGstImageUpload = await cloudinaryUpload(restGstImage)
    const restFssaiImageUpload = await cloudinaryUpload(restFssaiImage)
    const foodImageUpload = await cloudinaryUpload(foodImage)
    
    if (!restImageUpload) {
        throw new apiError("Failed to upload restaurant image", 400)
    }
    if (!foodImageUpload) {
        throw new apiError("Failed to upload food image", 400)
    }
    if (!restPanImageUpload) {
        throw new apiError("Failed to upload Pan Card", 400)
    }
    if (!restGstImageUpload) {
        throw new apiError("Failed to upload GST Card", 400)
    }
    if (!restFssaiImageUpload) {
        throw new apiError("Failed to upload Fssai Card", 400)
    }
    
    const newRest = await Restaurant.create({
        restName,
        restEmail,
        restMobile,
        restAddress,
        restPanNumber,
        restGstNumber,
        restFssaiNumber,
        restFssaiExp,
        restOwnerName,
        restOwnerEmail,
        restOwnerMobile,
        bankAccNumber,
        bankAccName,
        bankAccIfsc,
        bankAccBranch,
        bankAccType,
        bankName,
        password,
        restImage: restImageUpload.map((img) => img.secure_url),
        foodImage: foodImageUpload.map((img) => img.secure_url),
        restPanImage: restPanImageUpload[0]?.secure_url,
        restGstImage: restGstImageUpload[0]?.secure_url,
        restFssaiImage: restFssaiImageUpload[0]?.secure_url,
    })
    const response = await Restaurant.findById(newRest._id).select("-password -refreshToken")
    return res
        .status(200)
        .json(
            new apiResponse(
                201,
                response,
                "Restaurant created successfully",
            )
        )
})

const restaurantLogin = asyncHandler(async (req, res) => {
    const { restEmail, password, restMobile } = req.body
    if ((!restEmail && !restMobile) || !password) {
        throw new apiError(
            400,
            "Email or mobile number and password is required"
        )
    }
    const restaurant = await Restaurant.findOne(
        {
            $or: [
                {
                    restMobile
                },
                {
                    restEmail
                }
            ]
        }
    )
    if (!restaurant) {
        throw new apiError(
            404,
            "Restaurant not found please Sign up"
        )
    }
    const isMatch = await restaurant.comparePassword(password)
    if (!isMatch) {
        throw new apiError(
            401,
            "Invalid Credantials"
        )
    }
    const { refreshToken, accessToken } = await genrateAccessAndRefreshToken(restaurant._id)
    const loggedInRest = await Restaurant.findById(
        restaurant._id
    ).select("-refreshToken -password")
    return res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(
            200
        )
        .json(
            new apiResponse(
                200,
                {
                    loggedInRest, accessToken, refreshToken
                },
                "logged in successfully",
            )
        )

})
const restaurantLogout = asyncHandler(async (req, res) => {
    const restaurant = req.restaurant
    await Restaurant.findByIdAndUpdate(
        restaurant._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true
        }
    )
    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new apiResponse(200, null, "logged out successfully"))

})

export {
    restaurantRegister,
    restaurantLogin,
    restaurantLogout
}