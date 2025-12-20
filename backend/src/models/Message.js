import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: { // ID cuộc trò chuyện
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation", // tham chiếu đến bảng conversation
        required: true,
        index: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // tham chiếu đến bảng User
        required: true,
    },
    content: {
        type: String,
        trim: true,
    },
    imgUrl: {
        type: String,
    }
},{
    timestamps: true,
});

// index là bảng dùng để tra cứu nhanh
// index kết hợp là index nhiều trường trong mongoDB 1 là tăng dần -1 là giảm dần
// tạo ra bảng tra cứu conversationId tăng dần với createdAt giảm dần để tin nhắn mới nhất nằm trên cùng 
messageSchema.index({conversationId: 1, createdAt: -1});

const Message = mongoose.model("Message", messageSchema)
export default Message
