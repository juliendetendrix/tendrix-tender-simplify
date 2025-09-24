import { Home, User, FileText, Award, TrendingUp } from "lucide-react"
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
  { title: "Mes Documents", url: "/documents", icon: FileText },
  { title: "Tendrix Winning Deck", url: "/winning-deck", icon: Award },
  { title: "Top Chargés d'affaires", url: "/top-managers", icon: TrendingUp },
]

export function AppSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-card via-card/95 to-muted/30 shadow-xl backdrop-blur-md">
      <SidebarHeader className="p-8 border-b-0">
        <div className="flex items-center justify-center">
          <div className="p-3 bg-gradient-to-br from-background/80 to-background/60 rounded-3xl shadow-lg border border-border/50 backdrop-blur-sm">
            <img src={logoMain} alt="Tendrix" className="h-12 w-auto" />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-6 py-6">
        <SidebarMenu className="space-y-3">
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink 
                  to={item.url} 
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-medium group animate-fade-in ${
                    isActive(item.url) 
                      ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-xl shadow-primary/30 scale-105 border border-primary/20' 
                      : 'hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:scale-102 text-muted-foreground hover:text-foreground hover:shadow-lg backdrop-blur-sm border border-transparent hover:border-border/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    isActive(item.url) 
                      ? 'bg-white/20' 
                      : 'group-hover:bg-background/30'
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}