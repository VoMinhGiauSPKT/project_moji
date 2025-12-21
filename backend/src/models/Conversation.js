import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    joinedAt: { // thời gian tham gia
        type: Date,
        default: Date.now,
    }
},{
    _id: false, // mongoose sẽ không tạo ra id cho từng phần tử vì đây chỉ là Schema phụ trong conversationSchema
})

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
},{
    _id: false,
})

const lastMessageSchema = new mongoose.Schema({
    _id: { // không phải id tự tạo của mongoose mà là id tin nhắn gốc
        type: String, 
    },
    content: {
        type: String,
        default: null,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: null,
    }
},{
    _id: false,
})

const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["direct","group"], // giới hạn giá trị hợp lệ chỉ là direct hoặc là group
        required: true,
    },
    participants: {
        type: [participantSchema], // những người tham gia hội thoại
        required: true,
    },
    group: {
        type: groupSchema,
    },
    lastMessageAt: { // lưu tg tin nhắn cuối
        type: Date,
    },
    seenBy: [ // mảng để kiếm tra những người đã đọc tin nhắn
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    lastMessage: { // lưu tin nhắn cuối
        type: lastMessageSchema,
        default: null,
    },
    unreadCounts: { // số tin nhắn chưa đọc trong ui
        type: Map, // dùng Map để lưu số tin nhắn chưa đọc của user
        of: Number,
        default: {},
    },
},{
    timestamps: true,
})

conversationSchema.index({
    "participants.userId": 1,
    lastMessageAt: -1
})

const Conversation = mongoose.model("Conversation", conversationSchema)
export default Conversation