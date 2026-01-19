import {create} from "zustand"
import { friendService } from "@/services/friendService"
import type { FriendState } from "@/type/store"

export const useFriendStore = create<FriendState>((set,get) => ({
    loading: false,
    receivedList: [],
    sentList: [],
    searchByUsername: async (username) => {
        try {
            set({loading: true})

            const user = await friendService.searchByUsername(username)

            return user

        } catch (error) {
            console.error("lỗi xảy ra khi tìm user bằng username", error)
            return null
        } finally {
            set({loading: false})
        }
    },
    addFriend: async (to, message) => {
        try {
            set({loading: true})
            const resultMessage = await friendService.sendFriendRequest(to, message)
            return resultMessage
        } catch (error) {
            console.error("lỗi xảy ra khi addfriend", error)
            return "lỗi xảy ra khi gửi kết bạn. hãy thử lại"
        } finally {
            set({loading: false})
        }
    },
    getAllFriendRequests: async () => {
        try {
            set({loading:true})
            const result = await friendService.getAllFriendRequest()

            if(!result) return
            
            const {received, sent} = result

            set({receivedList: received, sentList: sent})
        } catch (error) {
            console.error("lỗi xảy ra khi getAllFriendRequests", error)
        } finally {
            set({loading: false})
        }
    },
    acceptRequest: async (requestId) => {
        try {
            set({loading: true})

            await friendService.acceptRequest(requestId)

            // cập nhật lại store để xóa yều cầu đã chấp nhận
            set((state) => ({
                receivedList: state.receivedList.filter((r) => r._id !== requestId)
            }))
        } catch (error) {
            console.error("Lỗi xảy ra khi acceptRequest", error)
        } finally {
            set({loading: false})
        }
    },
    declineRequest: async (requestId) => {
        try {
            set({loading: true})
            await friendService.declineRequest(requestId)

            set((state) => ({
                receivedList: state.receivedList.filter((r) => r._id !== requestId)
            }))
        } catch (error) {
            console.error("Lỗi xảy ra khi declineRequest", error)
        } finally {
            set({loading: false})
        }
    }
}))