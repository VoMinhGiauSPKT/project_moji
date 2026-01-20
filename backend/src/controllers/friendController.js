import Friend from "../models/Friend.js"
import User from "../models/User.js"
import FriendRequest from "../models/FriendRequest.js"


export const sendFriendRequest = async (req, res) => {
    try {
        const {to, message} = req.body

        const from = req.user._id // user._id có trong middleware rồi

        // kiểm tra coi người dùng có tự gửi lời mời cho chính mình không
        if( from === to) {
            return res
                .status(400)
                .json({message: "không thể gửi lời mời cho chính mình"})
        }
        
        // coi người nhận có trong hệ thống không
        const userExists = await User.exists({_id: to})
        if(!userExists){
            return res 
                .status(404)
                .json({message: "người dùng không tồn tại"})
        }

        // kiểm tra coi đã là bạn hay đã từng gửi lời mời chưa 
        let userA = from.toString();
        let userB = to.toString();

        if(userA > userB){
            [userA, userB] = [userB, userA] // đảo lại
        }

        const [alreadyFriends, existingRequest] = await Promise.all([
            Friend.findOne({userA, userB}),
            FriendRequest.findOne({
                $or: [
                    {from: from, to: to},
                    {from: to, to: from}
                ]
            })
        ])

        if(alreadyFriends){
            return res  
                .status(400)
                .json({message: "hai người đã là bạn bè"})
        }

        if(existingRequest){
            return res
                .status(400)
                .json({message: "đã có lời mời kết bạn đang chờ"})
        }

        // tạo lời mời kết bạn
        const request = await FriendRequest.create({from: from, to: to, message: message})

        return res.status(201).json({message: "gửi lời mời kết bạn thành công", request})
    } catch (error) {
        console.error("lỗi khi gửi yêu cầu kết bạn", error)
        return res
            .status(500)
            .json({message: "lỗi hệ thống"})
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const {requestId} = req.params
        const userId = req.user._id

        // kiểm tra coi có lời mời kết bạn thiệt không
        const request = await FriendRequest.findById(requestId)

        if(!request){
            return res.status(404).json({message: "không tìm thấy lời mời kết bạn"})
        }

        // chỉ người nhận mới đồng ý lời mời kết bạn được
        if(request.to.toString() !== userId.toString()) {
            return res.status(403).json({message: "bạn không có quyền chấp nhận lời mời này"})
        }

        // tạo bạn bè với nhau
        await Friend.create({
            userA: request.from,
            userB: request.to
        })

        // xóa yêu câu đi vì đã kết bạn rồi
        await FriendRequest.findByIdAndDelete(requestId)

        // lấy thông tin người gửi lời mời để trả về client hiển thị
        const from = await User.findById(request.from).select(
            "_id displayName avatarUrl"
        ).lean() // tối ưu hiện năn của query để nhanh và nhẹ hơn
        // .clean để dữ liệu trả về js object thay vì mongo document

        return res.status(200).json({
            message:"chấp nhận lời mời kết bạn thành công",
            newFriend: {
                _id: from?._id,
                displayName: from?.displayName,
                avatarUrl: from?.avatarUrl,
            }
        })

    } catch (error) {
        console.error("lỗi khi chấp nhận kết bạn", error)
        return res
            .status(500)
            .json({message: "lỗi hệ thống"})
    }
}

export const declineFriendRequest = async (req, res) => {
    try {
        const {requestId} = req.params
        const userId = req.user._id

        // kiểm tra coi có lời mời kết bạn thiệt không
        const request = await FriendRequest.findById(requestId)

        if(!request){
            return res.status(404).json({message: "không tìm thấy lời mời kết bạn"})
        }

        // chỉ người nhận lời mời mới từ chối lời mời kết bạn được 
        if(request.to.toString() !== userId.toString()) {
            return res.status(403).json({message: "bạn không có quyền từ chối lời mời này"})
        }

        // xóa lời mời đi
        await FriendRequest.findByIdAndDelete(requestId)

        return res.sendStatus(200)

    } catch (error) {
        console.error("lỗi khi từ chối kết bạn", error)
        return res
            .status(500)
            .json({message: "lỗi hệ thống"})
    }
}

export const getAllFriends = async (req, res) => {
    try {
        const userId = req.user._id
        // lấy danh sách bạn ở hai phía
        const friendShips = await Friend.find({
            $or:[
                {
                    userA: userId,
                },
                {
                    userB: userId,
                }
            ]
        })
        .populate("userA", "_id displayName avatarUrl username") // lấy thông tin chi tiết
        .populate("userB", "_id displayName avatarUrl username")
        .lean()

        if(!friendShips){
            return res.status(200).json({friendShips: []})
        }

        // lấy ra danh sách những người bạn nhưng mà chưa biết nằm ở userA hay userB nên dùng map
        const friends = friendShips.map((f) => 
            f.userA._id.toString() === userId.toString() ? f.userB : f.userA
        )

        return res.status(200).json({friends: friends})

    } catch (error) {
        console.error("lỗi khi lấy danh sách bạn bè", error)
        return res
            .status(500)
            .json({message: "lỗi hệ thống"})
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id

        const populateFields = "_id username displayName avatarUrl"

        const [sent, received] = await Promise.all([
            // lấy các lời mời mà user gửi đi
            FriendRequest.find({from: userId}).populate("to", populateFields),

            // lấy các lời mời user nhận được
            FriendRequest.find({to: userId}).populate("from", populateFields)
        ])

        return res.status(200).json({sent: sent, received: received})

    } catch (error) {
        console.error("lỗi khi lấy danh sách yêu cầu kết bạn", error)
        return res
            .status(500)
            .json({message: "lỗi hệ thống"})
    }
}