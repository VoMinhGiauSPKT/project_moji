import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "./chat";
import type { FriendRequest, User } from "./user"

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    loading: boolean;

    setAccessToken: (accessToken: string) => void;

    clearState: () => void;

    signUp: (
        username:string, 
        password:string, 
        email:string, 
        firstName:string, 
        lastName:string
    ) => Promise<void>;

    signIn: (username: string, password:string) => Promise<void>;

    signOut: () => Promise<void>;

    fetchMe: () => Promise<void>;

    refresh: () => Promise<void>;
}


export interface ThemeState {
    isDark: boolean
    toggleTheme: () => void
    setTheme: (dark: boolean) => void
}

export interface ChatState {
    conversations: Conversation[]
    // record tức là map từng cuộc hội thoại với tin nhắn thuộc về hội thoại đó
    // thay thì nhét tất cả các tin nhắn về 1 mảng thì chia ra key với value
    messages: Record<string, {
        items: Message[]
        hasMore: boolean // cờ để biết còn tin nhắn cũ hay không để lấy tiếp
        nextCursor?: string | null // con trỏ để biết lần fetch tiếp theo bắt đầu từ đâu
    }>
    activeConversationId: string | null
    convoLoading: boolean
    messageLoading: boolean
    reset: () => void
    setActiveConversation: (id: string | null) => void // để component khác cập nhật activeConversation 

    fetchConversations: () => Promise<void>


    fetchMessages: (conversationId?: string) => Promise<void>

    sendDirectMessage: (
        recipientId: string,
        content: string,
        imgUrl?: string
    ) => Promise<void>

    sendGroupMessage: (
        conversationId: string,
        content: string,
        imgUrl?: string
    ) => Promise<void>

    // add message
    addMessage: (message: Message) => Promise<void>

    // update convo
    updateConversation: (conversation: unknown) => void

    markAsSeen: () => Promise<void>
}

export interface SocketState {
    socket: Socket | null
    onlineUsers: string[]
    connectSocket: () => void
    disconnectSocket: () => void
}

export interface FriendState {
    loading: boolean
    receivedList: FriendRequest[]
    sentList: FriendRequest[]
    searchByUsername: (username: string) => Promise<User | null>
    addFriend: (to: string, message?: string) => Promise<string>
    getAllFriendRequests: () => Promise<void>
    acceptRequest: (requestId: string) => Promise<void>
    declineRequest: (requestId: string) => Promise<void>
}