export const updateConversationAfterCreateMessage = (
    conversation, 
    message, 
    senderId
) => {
    // cập nhật thông tin khi có tin nhắn gửi đi
    conversation.set({
        seenBy: [],
        lastMessageAt: message.createdAt,
        lastMessage: {
            _id: message._id,
            content: message.content,
            senderId: senderId,
            createdAt: message.createdAt
        }
    })


    // khi có tin nhắn mới thì reset số tin nhắn chưa đọc
    // của người gửi về lại bằng 0 
    // còn người nhận tăng thêm 1
    conversation.participants.forEach((p) => {
        const memberId = p.userId.toString()
        const isSender = memberId === senderId.toString()
        const prevCount = conversation.unreadCounts.get(memberId) || 0
        conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1)
    })
}

export const emitNewMessage = (io, conversation, message) => {
    io.to(conversation._id.toString()).emit("new-message", {
        message,
        conversation: {
            _id: conversation._id,
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt,
        },
        unreadCounts: conversation.unreadCounts
    })
}