import express from "express"
// middleware
import {checkFriendship, checkGroupMembership} from "../middlewares/friendMiddleware.js"

import {
    sendDirectMessage,
    sendGroupMessage
} from "../controllers/messageController.js"

const router = express.Router()

// checkFriendship là hàm kiểm tra có kết bạn chưa (middleware)
router.post("/direct", checkFriendship, sendDirectMessage)
router.post("/group", checkGroupMembership, sendGroupMessage)

export default router