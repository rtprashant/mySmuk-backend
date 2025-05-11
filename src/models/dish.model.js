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
    dishes: [{
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: String,
            required: true,
            min: 1
        }

    }],
    category: {
        type: String,
        enum: ["veg", "non-veg"],
        required: true
    },
    beverages: [
        {
            name: {
                type: String,
            },
            quantity: {
                type: String,
                min: 1
            }
        }

    ],
});

export const Dish = mongoose.model("Dish", dishSchema);