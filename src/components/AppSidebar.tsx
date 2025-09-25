import { Home, User, MapPin, Award, TrendingUp } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import logoMain from '@/assets/tendrix-logo-main.png'

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
  { title: "Appel d'offres à proximité", url: "/nearby-tenders", icon: MapPin },
  { title: "Tendrix Winning Deck", url: "/winning-deck", icon: Award },
  { title: "Top Chargés d'affaires", url: "/top-managers", icon: TrendingUp },
]

export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  return (
    <Sidebar className="border-r border-border/50 bg-card">
      <SidebarHeader className="p-6 border-b border-border/30">
        <div className="flex items-center justify-center">
          <img src={logoMain} alt="Tendrix" className="h-10 w-auto" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-4">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink 
                  to={item.url} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    isActive(item.url) 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
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