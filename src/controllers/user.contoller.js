import { totp } from "otplib";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import generateOtp from "../utils/otp.js";
import sendMail from "../utils/sendMail.js";
import oauth2Client from "../utils/googleConfig.js";
import axios from 'axios'
import { Package } from "../models/package.model.js";
import { Listings } from '../models/lisitng.model.js'
import { Orders } from "../models/order.model.js";

const genrateAccessAndRefreshToken = async function (userId) {
    const user = await User.findById(userId)
    try {
        if (!user) {
            throw new apiError(
                404,
                "Failed to genrate Access And Refresh Tokens"
            )
        }
        const accessToken = await user.genrateAccessToken()
        const refreshtoken = await user.genrateRefreshToken()

        user.refreshtoken = refreshtoken,
            await user.save(
                {
                    validateBeforeSave: false
                }

            )
        return {
            accessToken,
            refreshtoken,
        }
    } catch (error) {
        throw new apiError(
            400,
            "failed to genrate access and refresh token"
        )
    }


}
const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'None'

};
const userRegister = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, dob } = req.body
    try {
        if (!firstName || !lastName || !email) {
            throw new apiError(
                404,
                "Please fill all the required fields",
            )
        }
        const existingUser = await User.findOne(
            {
                email
            },
        )
        if (existingUser) {
            throw new apiError(

                "User already exists with this Email",
                400,

            )
        }
        const otp = await generateOtp(email);
        const subject = "please verify your mail "
        const message = `Your OTP is ${otp} . Only Valid For Next 5 min `
        console.log(`genrated ${otp} for ${email}`);
        const sendMailRes = await sendMail(
            subject,
            message,
            email
        )
        console.log(sendMailRes);

        if (!sendMailRes) {
            throw new apiError(
                "Failed to send mail",
                400,)
        }

        const user = await User.create(
            {
                firstName,
                lastName,
                email,
                isEmailSignup: true,
                dob,
                userType: 'user'
            }
        )
        console.log(user);

        const userRes = await User.findById(user._id).select("-refreshtoken ")
        return res
            .status(200)
            .json(
                new apiResponse(
                    201,
                    userRes,
                    `A OTP is sent at ${email} Fill OTP to complete sign up`
                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.
                status(error.statusCode)
                .json(
                    new apiResponse(
                        error.statusCode,
                        null,
                        error.message
                    )
                )
        } else {
            return res.status(500)
                .json(
                    new apiResponse(
                        500,
                        null,
                        error.message
                    )

                )
        }

    }

})

const verifyOtp = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const OTP = otp.trim("")
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            throw new apiError(
                "User not found",
                404,

            )
        }

        const verify = totp.verify(
            {
                token: OTP,
                secret: process.env.OTP_SECRET + user.email
            }
        )
        console.log(verify);

        if (!verify) {
            throw new apiError(
                "Invalid OTP",
                401,

            )
        }

        const { refreshtoken, accessToken } = await genrateAccessAndRefreshToken(userId)
        user.isEmailVerified = true;
        user.refreshtoken = refreshtoken;

        const accessTokenExpiryTime = new Date().getTime() + (Number(process.env.ACCESS_TOKEN_SECRET_KEY_EXPIRY) || 1) * 24 * 60 * 60 * 1000;
        console.log(accessTokenExpiryTime);
        const refreshTokenExpiryTime = new Date().getTime() + (Number(process.env.REFRESH_TOKEN_SECRET_KEY_EXPIRY) || 10) * 24 * 60 * 60 * 1000;
        console.log(refreshTokenExpiryTime);
        await user.save();
        const loggedInUser = await User.findById(
            userId
        ).select("-refreshtoken ")
        return res
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshtoken, options)
            .status(
                200
            )
            .json(
                new apiResponse(
                    200,
                    {
                        loggedInUser, accessToken, refreshtoken, accessTokenExpiryTime, refreshTokenExpiryTime
                    },
                    "logged in successfully",
                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.
                status(error.statusCode)
                .json(
                    new apiResponse(
                        error.statusCode,
                        null,
                        error.message
                    )
                )
        } else {
            return res.status(500)
                .json(
                    new apiResponse(
                        500,
                        null,
                        error.message
                    )

                )
        }

    }

})
const userLogin = asyncHandler(async (req, res) => {
    const { email } = req.body
    try {
        if (!email) {
            throw new apiError(
                400,
                "Email is required"
            )
        }
        const user = await User.findOne(
            {
                email
            }
        )
        if (!user) {
            throw new apiError(

                "User not found please Sign up",
                404,
            )
        }
        const otp = await generateOtp(email);
        const subject = "please verify your mail "
        const message = `Thanks for your intrest .Kindly fill the below otp to get start \n
        Your OTP is ${otp} . Only Valid For Next 5 min `
        console.log(`genrated ${otp} for ${email}`);
        const sendMailRes = await sendMail(
            subject,
            message,
            email
        )
        console.log(sendMailRes);

        if (!sendMail) {
            throw new apiError(
                "Failed to send mail",
                400,)
        }


        const loggedInUser = await User.findById(
            user._id
        ).select("-refreshtoken")
        return res

            .status(
                200
            )
            .json(
                new apiResponse(
                    200,
                    {
                        loggedInUser
                    },
                    `A OTP is sent at ${email} Fill OTP to complete sign in`,
                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.
                status(error.statusCode)
                .json(
                    new apiResponse(
                        error.statusCode,
                        null,
                        error.message
                    )
                )
        } else {
            return res.status(500)
                .json(
                    new apiResponse(
                        500,
                        null,
                        error.message
                    )

                )
        }

    }

})

const resendOtp = asyncHandler(async (req, res) => {
    const { userId } = req.params
    try {
        const user = await User.findById(userId)
        const email = user.email
        const otp = await generateOtp(email);
        const subject = "please verify your mail "
        const message = `Thanks for your intrest .Kindly fill the below otp to get start \n
        Your OTP is ${otp} . Only Valid For Next 5 min `
        console.log(`genrated ${otp} for ${email}`);
        const sendMailRes = await sendMail(
            subject,
            message,
            email
        )
        console.log(sendMailRes);

        if (!sendMail) {
            throw new apiError(
                "Failed to send mail",
                400,)
        }
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    otp,
                    `An Otp sent to ${email}`

                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.
                status(error.statusCode)
                .json(
                    new apiResponse(
                        error.statusCode,
                        null,
                        error.message
                    )
                )
        } else {
            return res.status(500)
                .json(
                    new apiResponse(
                        500,
                        null,
                        error.message
                    )

                )
        }

    }
})
const googleLogin = asyncHandler(async (req, res) => {
    const { code } = req.query
    try {
        const googleres = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleres.tokens)
        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleres.tokens.access_token}`)
        const { email, name } = userRes.data;
        const user = await User.findOne({ email })
        if (!user) {
            const loggedInUser = await User.create(
                {
                    email,
                    firstName: name,
                    isEmailVerified: true,
                    userType: "user"

                }
            )
            const { accessToken, refreshtoken } = await genrateAccessAndRefreshToken(loggedInUser._id)
            const accessTokenExpiryTime = new Date().getTime() + (Number(process.env.ACCESS_TOKEN_SECRET_KEY_EXPIRY) || 1) * 24 * 60 * 60 * 1000;

            const refreshTokenExpiryTime = new Date().getTime() + (Number(process.env.REFRESH_TOKEN_SECRET_KEY_EXPIRY) || 10) * 24 * 60 * 60 * 1000;

            return res
                .status(201)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshtoken, options)
                .json(new apiResponse
                    (200,
                        {
                            loggedInUser, accessToken, refreshtoken, accessTokenExpiryTime, refreshTokenExpiryTime
                        }
                        ,
                        "User LoggedIn successfully"))
        }


        const { accessToken, refreshtoken } = await genrateAccessAndRefreshToken(user._id)
        const accessTokenExpiryTime = new Date().getTime() + (Number(process.env.ACCESS_TOKEN_SECRET_KEY_EXPIRY) || 1) * 24 * 60 * 60 * 1000;
        console.log(accessTokenExpiryTime);
        const refreshTokenExpiryTime = new Date().getTime() + (Number(process.env.REFRESH_TOKEN_SECRET_KEY_EXPIRY) || 10) * 24 * 60 * 60 * 1000;
        console.log(refreshTokenExpiryTime);
        const loggedInUser = await User.findById(user._id).select("-refreshtoken")
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshtoken, options)
            .json(new apiResponse
                (200,
                    {
                        loggedInUser, accessToken, refreshtoken, accessTokenExpiryTime, refreshTokenExpiryTime

                    }
                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.
                status(error.statusCode)
                .json(
                    new apiResponse(
                        error.statusCode,
                        null,
                        error.message
                    )
                )
        } else {
            return res.status(500)
                .json(
                    new apiResponse(
                        500,
                        null,
                        error.message
                    )

                )
        }

    }

})

const userLogout = asyncHandler(async (req, res) => {
    const user = req.user
    try {
        await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    refreshtoken: null
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
    } catch (error) {
        if (error instanceof apiError) {
            return res.
                status(error.statusCode)
                .json(
                    new apiResponse(
                        error.statusCode,
                        null,
                        error.message
                    )
                )
        } else {
            return res.status(500)
                .json(
                    new apiResponse(
                        500,
                        null,
                        error.message
                    )

                )
        }

    }

})

const filterPackages = asyncHandler(async (
    req, res) => {
    const { sortBy } = req.body
    const { id } = req.params
    try {
        let query = { packageId: id }
        let sortOptions = {}
        if (sortBy === "priceHigh") {
            sortOptions["price"] = -1;
        } else if (sortBy === "priceLow") {
            sortOptions["price"] = 1;
        } else if (sortBy === "rating") {
            sortOptions["restaurantId.rating"] = 1;
        }
        const listings = await Listings.find(query).populate("restaurantId packageId").sort(sortOptions)
        if (!listings) {
            throw new apiError(
                "No listings Found to Filter",
                404
            )
        }
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    listings,
                    "Sorting SuccessFull"
                )
            )

    } catch (error) {
        if (error instanceof apiError) {
            return res.
                status(error.statusCode)
                .json(
                    new apiResponse(
                        error.statusCode,
                        null,
                        error.message
                    )
                )
        } else {
            return res.status(500)
                .json(
                    new apiResponse(
                        500,
                        null,
                        error.message
                    )

                )
        }
    }

})

const placeOrder = asyncHandler(async (req, res) => {
    const { timeSlot, mealType, date , phone } = req.body
    const { listingId } = req.params
    const user = req.user
    console.log(user);

    try {
        if (!timeSlot || !mealType || !listingId) {
            throw new apiError(
                "All fields are required", 400
            )
        }

        const alreadyPlacedOrderInTimeSlot = await Orders.findOne({ listingId, timeSlot, date })
        if (alreadyPlacedOrderInTimeSlot) {
            throw new apiError(
                "Please select diffrent time slot", 400
            )
        }
        const order = await Orders.create({
            customer: user,
            timeSlot,
            listingId,
            mealType,
            date,
            phone
        })
        if (!order) {
            throw new apiError(
                "Something went wrong while placing order", 400
            )
        }
        const listing = await Listings.findById(listingId).populate("restaurantId");

        if (!listing) {
            throw new apiError(404, "Listing not found");
        }

        const restaurantDetails = listing.restaurantId;
        console.log("restaurant details" , restaurantDetails);
        const admins = await User.find({ userType: "admin" });
        console.log("admins" , admins);
        
        const subject = "Order Placed Successfully"
        const message = `Order Details \n order id : ${order._id} \n Date : ${order.date} \n Restuarant name : ${restaurantDetails.restName}
        \n Restuarant email : ${restaurantDetails.restEmail} \n Restuarant Mobile : ${restaurantDetails.restMobile}  \n Restuarant address : ${restaurantDetails.restAddress}`
        const sendMailRes = await sendMail(
            subject,
            message,
            [user.email , restaurantDetails.restEmail  ]

        )
        console.log(sendMailRes);

        if (!sendMailRes) {
            throw new apiError(
                "Failed to send mail",
                400,)
        }
        return res.
            status(201)
            .json(
                new apiResponse(
                    201,
                    order,
                    "Order placed successfully"
                )
            )
    } catch (error) {
        if (error instanceof apiError) {
            return res.
                status(error.statusCode)
                .json(
                    new apiResponse(
                        error.statusCode,
                        null,
                        error.message
                    )
                )
        } else {
            return res.status(500)
                .json(
                    new apiResponse(
                        500,
                        null,
                        error.message
                    )

                )
        }
    }
})
export {
    userRegister,
    userLogin,
    userLogout,
    verifyOtp,
    googleLogin,
    resendOtp,
    filterPackages,
    placeOrder
}