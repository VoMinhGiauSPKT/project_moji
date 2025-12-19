import axios from "axios"
import { useAuthStore } from "@/stores/useAuthStore"

const api = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? "http://localhost:5000/api" : "/api",
    withCredentials: true, // gửi cookie lên server
})

// gắn access token vào req header
api.interceptors.request.use((config) => {
    const {accessToken} = useAuthStore.getState(); 
    // lấy là lưu accesstoken tại vòng lệnh này thôi không thay đổi biến accesstoken trong hàm này nữa

    if(accessToken){
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config

})

// tự động gọi API refresh khi access token hết hạn
api.interceptors.response.use((res) => res, async (error) => {
    const originalResquest = error.config; // cấu hình resquest vừa bị lỗi để có thể gửi lại

    // những api không cần check
    if(originalResquest.url.includes("/auth/signin") || 
        originalResquest.url.includes("/auth/signup") || 
        originalResquest.url.includes("/auth/refresh")
    ){
        return Promise.reject(error)
    }

    // để cho gọi lại 4 lần thôi nếu 4 lần điều thất bại thì refresh token hết hạn
    originalResquest._retryCount = originalResquest._retryCount || 0;

    if(error.response?.status === 403 && originalResquest._retryCount < 4) {
        originalResquest._retryCount+=1;

        try {
            const res = await api.post("/auth/refresh", {withCredentials: true});
            const newAccessToken = res.data.accessToken

            useAuthStore.getState().setAccessToken(newAccessToken);

            originalResquest.headers.Authorization = `Bearer ${newAccessToken}`

            return api(originalResquest)

        } catch (refreshError) {
            useAuthStore.getState().clearState();
            return Promise.reject(refreshError)
        }
    }

    return Promise.reject(error);
})


export default api