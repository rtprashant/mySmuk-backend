
import { Dish } from "../models/dish.model.js";
import { Listings } from "../models/lisitng.model.js";
import { Package } from "../models/package.model.js";
import { Restaurant } from "../models/restaurant.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryUpload, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

const addPackage = asyncHandler(async (req, res) => {
    const { packageName,
        startingFrom,
    } = req.body
    try {
        if (!packageName || !startingFrom) {
            throw new apiError(

                "File All required Fields",
                401,
            )
        }
        const existingListing = await Package.findOne({
            packageName
        })
        if (existingListing) {
            throw new apiError(

                "A listing with this name already registered",
                401,
            )
        }
        const img = req.file?.path;
        if (!img) {
            throw new apiError(

                "Image Not Found",
                404,
            )
        }
        const imageUpload = await cloudinaryUpload(img)
        const imageUrl = imageUpload[0]?.secure_url;

        if (!imageUrl) {
            throw new apiError(

                "Error while Uploading Image",
                404,

            )
        }

        const response = await Package.create(
            {
                packageName,
                startingFrom,
                image: imageUrl
            }
        )
        res.
            status(201)
            .json(
                new apiResponse(
                    201,
                    response,
                    "Package Registered Successfully"
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

const getAllPackage = asyncHandler(async (req, res) => {
    const allListings = await Package.find().sort({ startingFrom: 1 })

    try {
        if (!allListings) {
            throw new apiError(
                "No Package Found",
                404
            )
        }
        return res.
            status(200)
            .json(
                new apiResponse(
                    200,
                    allListings,
                    "All Listings Fetched Successfully"
                )
            )
    } catch (error) {
        console.log(error);

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

const deletePackage = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        if (!id) {
            throw new apiError(
                "Package id Not Found",
                404
            )
        }
        const listing = await Package.findByIdAndDelete(id)
        if (!listing) {
            throw new apiError(
                "No listing found",
                404
            )
        }
        await deleteFromCloudinary(listing.image)
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    listing,
                    `${listing.packageName} Deleted Successfully`

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
const addDish = asyncHandler(async (req, res) => {
    const {
        packageName,
        dishName,
        category,
        beverages } = req.body
    const { restaurantId } = req.params
    console.log(restaurantId);

    try {
        if (!packageName || !dishName || !category) {
            throw new apiError(
                "Required Fileds Not Found",
                404
            )
        }
        const selectedPackage = await Package.findOne({ packageName });
        if (!selectedPackage) {
            throw new apiError("No Valid Package Found", 404);
        }

        const findExistingDishInPackage = await Dish.find({
            packageId: selectedPackage._id,
            category,
            restaurantId
        })
        if (findExistingDishInPackage.length >= 1) {
            throw new apiError(
                "A Dish Already Registered In This Package",
                400
            )
        }
        const listedDish = await Dish.create({
            packageId: selectedPackage._id,
            category,
            restaurantId,
            dishName,
            beverages
        })
        return res
            .status(201)
            .json(
                new apiResponse(
                    201,
                    listedDish,
                    "Dish Listed Successfully"
                )
            )
    } catch (error) {
        console.log(error)
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
const addListing = asyncHandler(async (req, res) => {
    const { packageName,
        price,
        info } = req.body
    const { restaurantId } = req.params
    console.log(packageName);

    try {

        const findRes = await Restaurant.findById(restaurantId);
        if (!findRes) {
            throw new apiError(
                "No Restaurant Found",
                404
            )
        }
        const selectedPackage = await Package.findOne(
            {
                packageName
            }
        );
        if (!selectedPackage) {
            throw new apiError(
                "No Valid Package Found",
                404
            )

        }
        const existingLisitng = await Listings.findOne({
            packageId: selectedPackage._id,
            restaurantId
        })
        console.log(existingLisitng);

        if (existingLisitng) {
            throw new apiError(
                "A listing already exist in this package",
                400
            )
        }
        const meal = await Dish.find({
            restaurantId,
            packageId: selectedPackage._id,
        })
        if (!meal.length > 0) {
            throw new apiError(
                "No Meal Found Kindly Add Meal First",
                404
            )
        }
        const listing = await Listings.create(
            {
                restaurantId,
                packageId: selectedPackage._id,
                price,
                meal,
                info
            }
        )
        return res
            .status(200)
            .json(
                new apiResponse(
                    201,
                    listing,
                    "Listing Created Successfully"

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

const getAllListing = asyncHandler(async (req, res) => {
    const { packageId } = req.params
    console.log(packageId);
    
    try {
        const allListing = await Listings.find({ packageId }).populate("restaurantId meal packageId");
        console.log(allListing);

        if (!allListing.length > 0) {
            throw new apiError(
                "No Listing Found In This Package",
                404
            )
        }
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    allListing,
                    "All listing fetched Successfully"
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
const getAllRes = asyncHandler(async (_, res) => {
    try {
        const allRestaurants = await Restaurant.find().select("restName _id");
        return res.
            status(200)
            .json(
                new apiResponse(
                    200,
                    allRestaurants,
                    "All Restaurant Fetched"
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
    addPackage,
    getAllPackage,
    deletePackage,
    addDish,
    addListing,
    getAllListing,
    getAllRes
}