import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // lưu Id của người dùng đang đăng nhập
        ref: "User", // liên kết đến model User
        required: true,
        index: true // tạo chỉ mục cho nó để chi vấn nhanh hơn vì chỉ mục nào cũng chỉ thuộc về 1 user
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: { // lưu thời điển hết hạn của refresh tokon
        type: Date,
        requied: true
    }
},{
    timestamps: true,
})

// tự động xóa khi hết hạn
sessionSchema.index({expiresAt: 1}, {expireAfterSeconds: 0}); // tự xóa sau 1 ngày hết hạn

export default mongoose.model("Session", sessionSchema);