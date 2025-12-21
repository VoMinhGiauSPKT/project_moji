import {create} from "zustand"

// giúp lưu state xuống localStorage để khi reload hay đóng tab thì theme vẫn giữ nguyên
import {persist} from "zustand/middleware"

import type { ThemeState } from "@/type/store"

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            isDark: false,
            toggleTheme: () => {
                const newValue = !get().isDark
                set({isDark: newValue})
                if(newValue){
                    document.documentElement.classList.add("dark")
                } else {
                    document.documentElement.classList.remove("dark")
                }
            },
            setTheme: (dark: boolean) => {
                set({isDark: dark})
                if(dark){
                    document.documentElement.classList.add("dark")
                } else {
                    document.documentElement.classList.remove("dark")
                }
            }
        }),
        {
            name: "theme-storage" // key lưu trong localStorage 
        }
    )
)