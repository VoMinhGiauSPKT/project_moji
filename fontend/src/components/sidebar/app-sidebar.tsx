import * as React from "react"

import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Moon, Sun } from "lucide-react"
import { Switch } from "../ui/switch"
import CreateNewChat from "../chat/CreateNewChat"
import NewGroupChatModal from "../chat/NewGroupChatModal"
import GroupChatList from "../chat/GroupChatList"
import AddFriendModal from "../chat/AddFriendModal"
import DirectMessageList from "../chat/DirectMessageList"

import { useThemeStore } from "@/stores/useThemeStore"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {isDark, toggleTheme} = useThemeStore()
  return (
    <Sidebar variant="inset" {...props}>

      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="bg-blue-500 hover:bg-blue-500">
              <a href="#">
                <div className="flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold text-white">Moji</h1>
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-white/80"/>
                    <Switch
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      className=" data-[state=checked]:bg-background/60"
                    />
                    <Moon className="size-4 text-white/80"/>
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* content */}
      <SidebarContent>
        {/* New chat */}
        <SidebarGroup>
          <SidebarGroupContent>
            <CreateNewChat/>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group chat */}
        <SidebarGroup>
          <SidebarGroupLabel className=" uppercase">
            nhóm chat
          </SidebarGroupLabel>
          <SidebarGroupAction title="Tạo nhóm" className="cursor-pointer">
            <NewGroupChatModal/>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <GroupChatList/>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* direct message */}
        <SidebarGroup>
          <SidebarGroupLabel className=" uppercase">
            bạn bè
          </SidebarGroupLabel>
          <SidebarGroupAction title="Kết bạn" className="cursor-pointer">
            <AddFriendModal/>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <DirectMessageList/>
          </SidebarGroupContent>
        </SidebarGroup>




      </SidebarContent>

      {/* footer */}
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
    </Sidebar>
  )
}
