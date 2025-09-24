import { Home, User, FileText, Award, TrendingUp } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import tendrixLogo from '@/assets/tendrix-logo-blue.png'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Mon Profil", url: "/profile", icon: User },
  { title: "Mes Documents", url: "/documents", icon: FileText },
  { title: "Tendrix Winning Deck", url: "/winning-deck", icon: Award },
  { title: "Top Chargés d'affaires", url: "/top-managers", icon: TrendingUp },
]

export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <img src={tendrixLogo} alt="Tendrix" className="h-8 w-auto" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}