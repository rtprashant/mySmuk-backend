import mongoose, { Schema } from "mongoose";


const listingSchema = new Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Package",
            required: true
        },
        price: {
            type: String,
            required: true,
        },
        meal: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dish"
        }],
        info: {
            type: [String]
        }

    },
    {
        timestamps: true,
    }
)

export const Listings = mongoose.model("Listings", listingSchema)