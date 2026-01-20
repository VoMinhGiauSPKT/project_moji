import { useFriendStore } from "@/stores/useFriendStore"
import { Card } from "../ui/card"
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog"
import { MessageCircle } from "lucide-react"
import FriendListModal from "../createNewChat/FriendListModal"



const CreateNewChat = () => {
    const {getFriends} = useFriendStore()

    const handleGetFriends = async () => {
        await getFriends()
    }

    return (
        <div className="flex gap-2">
            <Card className="flex-1 p-3 cursor-pointer group/card"
                onClick={handleGetFriends}
            >
                <Dialog>
                    <DialogTrigger>
                        <div className="flex items-center gap-4">
                            <div className="size-8 bg-blue-600 rounded-full flex items-center justify-center group-hover/card:scale-110 transition-all">
                                <MessageCircle className="size-4 text-white"/>
                            </div>
                            <span className="text-sm font-medium capitalize">gửi tin nhắn mới</span>
                        </div>
                    </DialogTrigger>
                    
                    <FriendListModal/>
                </Dialog>
            </Card>

        </div>
    )
}

export default CreateNewChat