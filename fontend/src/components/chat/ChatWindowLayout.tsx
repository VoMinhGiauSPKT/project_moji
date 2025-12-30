import { useChatStore } from "@/stores/useChatStore"
import ChatWelcomeScreen from "./ChatWelcomeScreen"
import ChatWindowSkeleton from "./ChatWindowSkeleton"
import { SidebarInset } from "../ui/sidebar"
import ChatWindowHeader from "./ChatWindowHeader"
import ChatWindowBody from "./ChatWindowBody"
import MessageInput from "./MessageInput"
import { useEffect } from "react"

const ChatWindowLayout = () => {

    const {
        activeConversationId,
        conversations,
        messageLoading: loading,
        messages,
        markAsSeen
    } = useChatStore()


    const selecetedConvo = conversations.find((c) => c._id == activeConversationId) ?? null

    useEffect(() => {
        if(!selecetedConvo) {
            return
        }

        const markSeen = async () => {
            try {
                await markAsSeen()
            } catch (error) {
                console.error("lỗi khi mark seen", error)
            }
        }

        markSeen()
    },[markAsSeen, selecetedConvo])

    if(!selecetedConvo) {
        return <ChatWelcomeScreen/>
    }

    if(loading){
        return <ChatWindowSkeleton/>
    }

    return (
        <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">

            {/* header */}
            <ChatWindowHeader chat={selecetedConvo}/>

            {/* body */}
            <div className="flex-1 overflow-y-auto bg-primary-foreground">
                <ChatWindowBody/>
            </div>

            {/* footer */}
            <MessageInput selectedConvo={selecetedConvo}/>


        </SidebarInset>
    )
}

export default ChatWindowLayout