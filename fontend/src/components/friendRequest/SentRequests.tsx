import { useFriendStore } from "@/stores/useFriendStore"


const SentRequests = () => {

    const {sentList} = useFriendStore()

    if(!sentList || sentList.length ===0) {
        return (
            <p className="text-sm text-muted-foreground">
                Bạn chưa gửi lời mời kết bạn nà<output></output>
            </p>
        )
    }

    return (
        <div className="space-y-3 mt-4">
            <>{sentList.map((req) => console.log(req))}</>
        </div>
    )
}

export default SentRequests