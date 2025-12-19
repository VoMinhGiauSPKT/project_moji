import { useAuthStore } from "@/stores/useAuthStore"
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () =>{

    const {accessToken, user, loading, refresh, fetchMe} = useAuthStore();
    const [starting, setStarting] = useState(true)

    const init = async () => {
        if(!accessToken){
            await refresh();
        }

        if(accessToken && !user){
            await fetchMe()
        }

        setStarting(false)
    }

    useEffect(() =>{
        init()
    },[])

    if(starting || loading){
        return <div className="flex h-screen items-center justify-center">Đang tải trang...</div>
    }

    if(!accessToken){
        return <Navigate to="/signin" replace/> 
        // replace để ngăn chặn người dùng bấm nút quay lại trang trước vì trang đó là trang bị chặn
    }

    return (
        <Outlet></Outlet> // bảo vệ các route bên trong 
    )
}

export default ProtectedRoute