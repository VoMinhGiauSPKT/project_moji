import { useChatStore } from "@/stores/useChatStore"
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component"


const ChatWindowBody = () => {

    const {activeConversationId, conversations, messages: allMessages, fetchMessages} = useChatStore()

    const [lastMessageStatus, setLastMessageState] = useState<"delivered" | "seen">("delivered")


    const messages = allMessages[activeConversationId!]?.items ?? [];
    const reversedMessages = [...messages].reverse()
    const hasMore = allMessages[activeConversationId!]?.hasMore ?? false
    const selectedConvo = conversations.find((c) => c._id === activeConversationId)
    const key = `chat-scroll-${activeConversationId}`    
    
    // ref
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const lastMessage = selectedConvo?.lastMessage
        if(!lastMessage){
            return
        }

        const seenBy = selectedConvo?.seenBy ?? []

        setLastMessageState(seenBy.length > 0 ? "seen" : "delivered")
    },[selectedConvo])


    // load xuống dưới khi load convo
    // useLayoutEffect giống useEffect
    // dùng để cuộn khi mở hội thoại chạy ngay sau khi react cập nhật dom trước khi trình duyệt vẽ lại layout
    // những thao tác như là cuộn, tính toán vị trí thì useLayoutEffect chính xác hơn useEffect
    useLayoutEffect(() => { 
        // nếu ref chưa trỏ tới bất kì phần tử dom nào thì return để tránh lỗi
        if(!messagesEndRef.current){
            return
        }

        messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end"
        })
    },[activeConversationId])


    const fetchMoreMessages = async () => {
        if(!activeConversationId){
            return
        }

        try {
            await fetchMessages(activeConversationId)
        } catch (error) {
            console.error("lỗi xảy ra khi fetchMoreMessages", error)
        }
    }

    const handleScrollSave = () => {
        const container = containerRef.current
        if(!container || !activeConversationId) {
            return
        }

        sessionStorage.setItem(key,JSON.stringify({
            scrollTop: container.scrollTop, // vị trí cuộn hiện tại
            scrollHeight: container.scrollHeight // chiều cao có thẻ cuộn được (cho dễ debug)

        }))
    }

    useLayoutEffect(() => {
        const container = containerRef.current
        if(!container) return

        const item = sessionStorage.getItem(key)

        if(item){
            const {scrollTop} = JSON.parse(item)
            requestAnimationFrame(() => {
                container.scrollTop = scrollTop
            })
            // trình duyệt tính toán xong layout thì nó mới chạy hàm callback ở phía bên trong
        }
    },[messages.length])

    if(!selectedConvo) {
        return <ChatWelcomeScreen/>
    }

    if(!messages?.length){
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">Chưa có tin nhắn nào trong cuộc trò chuyện này</div>
        )
    }

    return (
        <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
            <div id="scrollableDiv" ref= {containerRef} onScroll={handleScrollSave} className="flex flex-col-reverse overflow-y-auto overflow-x-hidden">
                {/* cột mốc để khung chat biết cần cuộn đến đâu*/}
                <div ref={messagesEndRef}></div>

                <InfiniteScroll 
                    dataLength={messages.length}
                    next={fetchMoreMessages}
                    hasMore={hasMore}
                    scrollableTarget="scrollableDiv"
                    loader={<p>Đang tải ...</p>}
                    inverse={true}
                    style={{
                        display: "flex",
                        flexDirection: "column-reverse",
                        overflow: "visible"
                    }}
                >
                    {reversedMessages.map((message, index) =>(
                        <MessageItem
                            key={message._id ?? index}
                            message={message}
                            index={index}
                            messages={reversedMessages}
                            selectedConvo={selectedConvo}
                            lastMessageStatus={lastMessageStatus}
                        />
                    ))}
                </InfiniteScroll>
            </div>
        </div>
    )
}

export default ChatWindowBody