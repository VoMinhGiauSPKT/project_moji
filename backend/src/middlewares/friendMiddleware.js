import Conversation from "../models/Conversation.js"
import Friend from "../models/Friend.js"

const pair = (a, b) => (a < b ? [ a, b] : [b, a])

// kiểm tra hai người là bạn chưa
export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id.toString()
        const recipientId = req.body?.recipientId ?? null

        // chỉ cho tạo nhóm khi người tạo đã kết bạn với tất cả những người trong nhóm
        const memberIds = req.body?.memberIds ?? []

        if(!recipientId && memberIds === 0){
            return res.status(400).json({message: "cần cung cấp recipientId hoặc memberIds"})
        }

        if(recipientId){
            const [userA, userB] = pair(me, recipientId)

            const isFriend = await Friend.findOne({userA, userB})

            if(!isFriend){
                return res.status(403).json({message: "bạn chưa kết bạn với người này"})
            }

            return next()
        }

        // todo: chat nhóm
        const friendChecks = memberIds.map(async (memberId) => {
            const [userA, userB] = pair(me, memberId)

            const friend = await Friend.findOne({userA, userB})

            return friend ? null : memberId
        })
        
        const results = await Promise.all(friendChecks)
        const notFriends = results.filter(Boolean) // lọc ra các giá trị bằng true

        // nếu ít nhất 1 người ko phải là bạn bè
        if(notFriends.length > 0){
            return res.status(403).json({message: "bạn chỉ có thể thêm bạn bè vào nhóm", notFriends})
        }

        // thỏa mản hết thì cho đi tiếp
        next()

    } catch (error) {
        console.error("lỗi xảy ra khi check friendship", error)
        return res.status(500).json({message: "lỗi hệ thống"})
    }
}

export const checkGroupMembership = async (req, res, next) => {
    try {
        const {conversationId} = req.body
        const userId = req.user._id

        // kiểm tra coi có tồn tại cuộc hội thoại không
        const conversation = await Conversation.findById(conversationId)

        if(!conversation){
            return res.status(404).json({message: "Không tìm thấy cuộc trò chuyện"})
        }

        // người gửi phải thành viện của nhóm không
        const isMember = conversation.participants.some(
            (p) => p.userId.toString() === userId.toString()
        )

        if(!isMember){
            return res.status(403).json({message: "bạn không trong nhóm này"})
        }

        // nếu hợp lệ thì lưu conversation vào req để controller dùng tiếp khỏi query lại
        req.conversation = conversation

        next()
    } catch (error) {
        console.error("lỗi checkGroupMembership", error)
        return res.status(500).json({message: "lỗi hệ thống"})
    }
}