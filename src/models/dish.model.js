import mongoose, { Schema } from "mongoose";

const dishSchema = new Schema({
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    packageId: {
        type: Schema.Types.ObjectId,
        ref: "Package",
        required: true
    },
    dishName: [{
        type: String,
        required: true
    }],
    category: {
        type: String,
        enum: ["veg", "non-veg"],
        required: true
    },
    beverages: [
        {
            type: String,
        }
    ],
});

export const Dish = mongoose.model("Dish", dishSchema);