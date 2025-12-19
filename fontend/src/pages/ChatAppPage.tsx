import Logout from "@/components/auth/Logout";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";

const ChatAppPage = () => {
    // chỉ theo dõi riêng user thôi 
    // component chỉ render lại khi user thay đổi
    const user = useAuthStore((state) => state.user);

    const handleOnClick = async () => {
        try {
            await api.get("/users/test", {withCredentials: true})
            toast.success("ok");
        } catch (error) {
            console.error(error)
            toast.error("thất bại")
        }
    }

    return (
        <div>
            {user?.username}
            <Logout/>
            <Button onClick={handleOnClick}>test</Button>
        </div>
    )
};

export default ChatAppPage;