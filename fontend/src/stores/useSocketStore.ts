import {create} from "zustand"

import {io, type Socket} from "socket.io-client"

import { useAuthStore } from "./useAuthStore"
import type { SocketState } from "@/type/store"
import { useChatStore } from "./useChatStore"

const baseURL = import.meta.env.VITE_SOCKET_URL

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    onlineUsers: [],
    connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken
        const existingSocket = get().socket

        if(existingSocket) return // nếu có rồi thì thôi tránh tạo nhiều socket

        const socket: Socket = io(baseURL, {
            auth: {token: accessToken},
            transports:["websocket"]
        })

        set({socket: socket})

        socket.on("connect", () => {
            console.log("đã kết nối với socket")
        })

        // online users
        socket.on("online-user", (userIds) => {
            set({onlineUsers: userIds})
        })

        // new message
        socket.on("new-message",({message, conversation, unreadCounts}) => {
            useChatStore.getState().addMessage(message)

            const lastMessage = {
                _id: conversation.lastMessage._id,
                content: conversation.lastMessage.content,
                createdAt: conversation.lastMessage.createdAt,
                sender: {
                    _id: conversation.lastMessage.senderId,
                    displayName: "",
                    avatarUrl: null
                }
            }

            const updateConversation = {
                ...conversation,
                lastMessage,
                unreadCounts
            }

            if(useChatStore.getState().activeConversationId === message.conversationId){
                // đánh dấu đã đọc
            }

            useChatStore.getState().updateConversation(updateConversation)

        })
    },

    disconnectSocket: () => {
        const socket = get().socket

        if(socket){
            socket.disconnect()
            set({socket: null})
        }
    }
}))