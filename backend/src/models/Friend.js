import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
    userA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    userB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
},{
    timestamps: true,
})

// middleware trong mongoDB gọi là "pre"
friendSchema.pre("save", async function () {
    const a= this.userA.toString();
    const b= this.userB.toString();

    // vì [a,b] = [b,a] nên chuyển thành [a,b] thôi để khỏi làm 2 lần

    if( a > b) {
        this.userA = new mongoose.Types.ObjectId(b);
        this.userB = new mongoose.Types.ObjectId(a);
    }

})

friendSchema.index({userA: 1, userB: 1}, {unique: true})

const Friend = mongoose.model("Friend", friendSchema)
export default Friend

