import {create} from "zustand"

// giúp lưu state xuống localStorage để khi reload hay đóng tab thì theme vẫn giữ nguyên
import {persist} from "zustand/middleware"

import { toast } from "sonner"

import { authService } from "@/services/authService";

import type { AuthState } from "@/type/store";
import { useChatStore } from "./useChatStore";

export const useAuthStore = create<AuthState>()(
    persist((set, get) => ({
        accessToken: null,
        user: null,
        loading: false,

        setAccessToken: (accessToken) => {
            set({accessToken: accessToken})
        },

        setUser: (user) => {
            set({user})
        },

        clearState: () => {
            set({accessToken: null, user: null, loading: false})
            
            // xóa localStorage để người sau không lấy được dữ liệu nếu 2 người dùng 1 máy
            // để tránh lỗi bất ngờ như bị văn khỏi trình duyệt mà chưa logout
            useChatStore.getState().reset()
            localStorage.clear()
            sessionStorage.clear()
        },

        signUp: async (username, password, email, firstName, lastName) => {
            try {
                set({loading: true});

                // gọi api
                await authService.signUp(username, password, email, firstName, lastName)
                toast.success("Đăng ký thành công! Bạn được chuyển sang trang đăng nhập")
            } catch (error) {
                console.error(error);
                toast.error("Đăng ký không thành công");
            } finally {
                set({loading: false})
            }
        },

        signIn: async (username, password) => {
            try {
                get().clearState()
                set({loading: true});
                // xóa localStorage để người sau không lấy được dữ liệu nếu 2 người dùng 1 máy
                // để tránh lỗi bất ngờ như bị văn khỏi trình duyệt mà chưa logout
                localStorage.clear()
                useChatStore.getState().reset()

                const {accessToken} = await authService.signIn(username, password);
                get().setAccessToken(accessToken)

                await get().fetchMe()
                // lấy danh sách hội thoại khi user đăng nhập thành công
                useChatStore.getState().fetchConversations()

                toast.success("Chào mừng bạn quay lại Moji")
            } catch (error) {   
                console.error(error);
                toast.error("Đăng nhập không thành công")
            } finally {
                set({loading: false});
            }
        },

        signOut: async () => {
            try {
                get().clearState();
                await authService.signOut();
                toast.success("Đăng xuất thành công")
            } catch (error) {
                console.error(error);
                toast.error("lỗi xảy ra khi đăng xuất. Hãy thử lại")
            }
        },

        fetchMe: async () => {
            try {
                set({loading:true});
                const user = await authService.fetchMe();

                set({user:user});
            } catch (error) {
                console.error(error);
                set({user:null, accessToken:null})
                toast.error("lỗi xảy ra khi lấy dữ liệu người dùng. Hãy thử lại")
            } finally {
                set({loading: false});
            }
        },

        refresh: async () => {
            try {
                set({loading: true})
                const {user, fetchMe, setAccessToken} =get();
                const accessToken = await authService.refresh();
                
                setAccessToken(accessToken);

                if(!user){
                    await fetchMe()
                }

            } catch (error) {
                console.error(error);
                toast.error("phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại")
                get().clearState()
            } finally {
                set({loading: false})
            }
        }
    }),{
        name: "auth-storage",
        partialize: (state) => ({user: state.user})
        // partialize cho phép còn phần nào trong state sẽ được lưu
        // chỉ lưu user không lưu accesstoken hoặc loading
    })
)