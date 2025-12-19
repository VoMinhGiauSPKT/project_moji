import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, // bắt buộc phải có
        unique: true,  // độc nhất không trùng
        trim: true, // tự bỏ khoảng trắng đầu cuối
        lowercase: true // tự động chuyển về chữ thường 
    },
    hashedPassword: {
        type: String,
        required: true, // bắt buộc phải có
    },
    email: {
        type: String,
        required: true, // bắt buộc phải có
        unique: true,  // độc nhất không trùng
        trim: true, // tự bỏ khoảng trắng đầu cuối
        lowercase: true // tự động chuyển về chữ thường 
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    avatarUrl: {
        type: String, // lưu CDN để hiển thị hình
    },
    avatarId: {
        tupe: String, // Cloudinary public_id để xóa ảnh
    },
    bio: {
        type: String,
        maxlength: 500,
    },
    phone: {
        type: String,
        sparse: true, // cho phép null, nhưng nếu nhập thì không được trùng
    }
},{
    timestamps: true,
})

const User = mongoose.model("User", userSchema);    
export default User;