import { chatService } from "@/services/chatService"
import type { ChatState } from "@/type/store"
import {create} from "zustand"

// giúp lưu state xuống localStorage để khi reload hay đóng tab thì theme vẫn giữ nguyên
import {persist} from "zustand/middleware"

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            activeConversationId: null,
            loading: false,

            setActiveConversation: (id) => set({activeConversationId: id}),
            reset: () => {
                set({
                    conversations: [],
                    messages: {},
                    activeConversationId: null,
                    loading: false, 
                })
            },
            fetchConversations: async () => {
                try {
                    set({loading: true})
                    const {conversations} = await chatService.fetchConversations()

                    set({conversations: conversations, loading: false})
                } catch (error) {
                    console.error("lỗi xảy ra khi fetchConversations", error)
                    set({loading: false})
                }
            }
        }),
        {
            name: "chat-storage",
            partialize: (status) => ({conversations: status.conversations})
        }
    )
)