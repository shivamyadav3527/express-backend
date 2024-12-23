import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //One who is subscribing the channel
        ref: "User"
    },
    channel: {
         type: Schema.Types.ObjectId, //One to whom subscriber , subscribes(channel)
        ref: "User"
    }
}, {timestamps: true})

export const subsciption = mongoose.model("subsciption", subscriptionSchema)