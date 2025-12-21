import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"

export const createConversation = async (req, res) => {
    try {
        const {type, name, memberIds} = req.body
        const userId = req.user._id
        
        if(
            !type ||
            (type === "group" && !name) ||
            !memberIds ||
            !Array.isArray(memberIds) ||
            memberIds.length == 0
        ) {
            return res.status(400).json({message: "tên nhóm và danh sách thành viên là bắt buộc"})
        }

        // lưu hội thoại trong biến
        let conversation 

        if(type === "direct"){
            const participantId = memberIds[0]

            conversation = await Conversation.findOne({
                type: "direct",
                "participants.userId": {$all: [userId, participantId]}
            })

            if(!conversation) {
                conversation = new Conversation({
                    type: "direct",
                    participants: [{userId: userId}, {userId: participantId}],
                    lastMessageAt: new Date()
                })

                await conversation.save()
            }
        }   

        if(type === "group"){
            conversation = new Conversation({
                type: "group",
                participants: [
                    {userId},
                    ...memberIds.map((id) => ({userId: id}))
                ],
                group: {
                    name: name,
                    createdBy: userId
                },
                lastMessageAt: new Date()
            })

            await conversation.save()
        }
        
        if(!conversation){
            return res.status(400).json({message: "conversation type không hợp lệ"})
        }

        await conversation.populate([
            {path: "participants.userId", select: "displayName avatarUrl"},
            {path: "seenBy", select: "displayName avatarUrl"},
            {path: "lastMessage.senderId", select: "displayName avatarUrl"}
        ])

        return res.status(201).json({conversation: conversation})

    } catch (error) {
        console.error("lỗi khi tạo conversation", error)
        return res.status(500).json({message: "lỗi hệ thống"})
    }
}

export const getConversation = async (req, res) => {
    try {
        const userId = req.user._id
        const conversation = await Conversation.find({
            "participants.userId": userId,
        })
        .sort({lastMessageAt: -1, updatedAt: -1}) // ưu tiên lastMessageAt mới nhất nếu bằng thì lấy updatedAt
        .populate({
            path: "participants.userId",
            select: "displayName avatarUrl"
        })
        .populate({
            path: "lastMessage.senderId",
            select: "displayName avatarUrl"
        })
        .populate({
            path: "seenBy",
            select: "displayName avatarUrl"
        })

        // formatted lại thông tin từ conversation góc
        const formatted = conversation.map((convo) => {
            const participants = (convo.participants || []).map((p) => ({
                _id: p.userId?._id,
                displayName: p.userId?.displayName,
                avatarUrl: p.userId?.avatarUrl ?? null,
                joinedAt: p.joinedAt
            }))

            return {
                ...convo.toObject(), // docs => object
                unreadCounts: convo.unreadCounts || {},
                participants: participants
            }
        })  
        
        return res.status(200).json({conversations: formatted})
    } catch (error) {
        console.error("lỗi khi lấy conversation", error)
        return res.status(500).json({message: "lỗi hệ thống"})
    }
}

export const getMessages = async (req, res) => {
    try {
        const {conversationId} = req.params
        const {limit = 50, cursor} = req.query;
        
        const query = {conversationId}

        if(cursor){
            query.createdAt = {$lt: new Date(cursor)} // chuyển cursor về date vì nó đang là string (lt tức là nhỏ hơn)
        }

        let messages = await Message.find(query)
        .sort({createdAt: -1}) // sắp tin mới nhất trước
        .limit(Number(limit) + 1 ) // lấy dưa ra 1 tin để kiểm tra còn trang kế tiếp không

        let nextCursor = null

        if(messages.length > Number(limit)){
            const nextMessage = messages[messages.length - 1]
            nextCursor = nextMessage.createdAt.toISOString()
            messages.pop() // để bỏ tin cuối cùng ra
        }

        // đảo ngược thứ tự
        messages = messages.reverse()

        return res.status(200).json({
            messages: messages,
            nextCursor :nextCursor, 
        })

    } catch (error) {
        console.error("lỗi khi lấy message", error)
        return res.status(500).json({message: "lỗi hệ thống"})
    }
}