import { cn } from "@/lib/utils"

const StatusBadge = ({status} : {status: "online" | "offline"}) => {
    return (
        <div className={cn(
            "absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-card",
            status === "online" && "bg-green-400",
            status === "offline" && "bg-gray-400",

        )}></div>
    )
}

export default StatusBadge