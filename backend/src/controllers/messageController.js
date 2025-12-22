import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import { emitNewMessage, updateConversationAfterCreateMessage } from "../utils/messageHelper.js"
import {io} from "../socket/index.js"

export const sendDirectMessage = async (req, res) => {
    try {
        // lấy thông tin người gửi
        const {recipientId, content, conversationId} = req.body
        const senderId = req.user._id

        // lưu lại thông tin cuộc trò chuyện
        let conversation;

        if(!content){
            return res.status(400).json({message: "thiếu nội dung"})
        }

        // tìm cuộc hội thoại bằng id rồi lưu vào biến
        if(conversationId){
            conversation = await Conversation.findById(conversationId)
        }

        if(!conversation){
            conversation = await Conversation.create({
                type: "direct",
                participants: [
                    {userId: senderId, joinedAt: new Date()},
                    {userId: recipientId, joinedAt: new Date()}
                ],
                lastMessageAt: new Date(),
                unreadCounts: new Map()
            })
        }

        // tạo tin nhắn
        const message = await Message.create({
            conversationId: conversation._id,
            senderId: senderId,
            content: content,
        })

        updateConversationAfterCreateMessage(conversation, message, senderId)

        await conversation.save() // lưu lại tất cả thay đổi

        emitNewMessage(io, conversation, message)

        return res.status(201).json({message: message})

    } catch (error) {
        console.error("lỗi xảy ra khi gửi tin nhắn trực tiếp",error)
        return res.status(500).json({message: "lỗi hệ thống"})
    }
}

export const sendGroupMessage = async (req, res) => {
    try {
        const {conversationId, content} = req.body
        const senderId = req.user._id 

        const conversation = req.conversation

        if (!content) {
            return res.status(400).json({message: "thiếu nội dung"})
        }

        const message = await Message.create({
            conversationId: conversationId,
            senderId: senderId,
            content: content
        })

        updateConversationAfterCreateMessage(conversation, message, senderId)

        await conversation.save()

        emitNewMessage(io, conversation, message)

        return res.status(201).json({message})

    } catch (error) {
        console.error("lỗi xảy ra khi gửi tin nhắn nhóm", error)
        return res.status(500).json({message: "lỗi hệ thống"})
    }
}