import {BrowserRouter, Route, Routes} from "react-router"
import SignInPage from "./pages/SignInPage"
import SignUpPage from "./pages/SignUpPage"
import ChatAppPage from "./pages/ChatAppPage"
import ProtectedRoute from "./components/auth/ProtectedRoute"

// thư viện giúp hiển thị thông báo dạng popup nên đặt ở cấp cao nhất
import {Toaster} from "sonner"

import { useThemeStore } from "./stores/useThemeStore"
import { useEffect } from "react"
import { useAuthStore } from "./stores/useAuthStore"
import { useSocketStore } from "./stores/useSocketStore"

function App() {
  const {isDark, setTheme} = useThemeStore() 
  const {accessToken} = useAuthStore()
  const {connectSocket, disconnectSocket} = useSocketStore()

  useEffect(() => {
    setTheme(isDark)
  },[isDark])

  useEffect(() => {
    if(accessToken) {
      connectSocket()
    }
    return () => disconnectSocket()
  },[accessToken])

  return (
    <>
      <Toaster/>
      <BrowserRouter>
        <Routes>

          {/* public routes */}
          <Route path="/signin" element={<SignInPage/>}/>
          <Route path="/signup" element={<SignUpPage/>}/>

          {/* protected routes */}
          {/* todo: tạo protected route */}
          <Route element={<ProtectedRoute/>}>
            <Route path="/" element={<ChatAppPage/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
