import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin } from "lucide-react"

const Dashboard = () => {
  const lastMinuteTenders = [
    "AO - Fournitures de bureau",
    "AO - Travaux de voirie",
    "AO - Services de nettoyage"
  ]

  const businessManagers = [
    { name: "Sarah Dupont", successRate: 90, avatar: "/placeholder.svg" },
    { name: "Jean Martin", successRate: 85, avatar: "/placeholder.svg" },
    { name: "Emma Leblanc", successRate: 80, avatar: "/placeholder.svg" }
  ]

  const recentWins = [
    { title: "AO - Fourniture d'équipements", amount: "760 k€" },
    { title: "AO - Maintenance des installations", amount: "950 k€" }
  ]

  const ongoingTenders = [
    { title: "AO - Construction école primaire", amount: "2,3 M€", progress: 75, status: "En cours" },
    { title: "AO - Rehabilitation centre sportif", amount: "1,8 M€", progress: 85, status: "En cours" },
    { title: "AO - Construction immeuble de bureaux", amount: "3,5 M€", progress: 60, status: "Demande émise" }
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 bg-card">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold gradient-text">Dashboard Tendrix</h1>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted/30">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Appels d'offres last minute */}
              <Card className="border-l-4 border-l-primary shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold gradient-text">Appels d'offres last minute</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lastMinuteTenders.map((tender, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
                        <div className="text-sm font-medium text-foreground">{tender}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mes chargés d'affaires */}
              <Card className="border-l-4 border-l-secondary shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-secondary">Mes chargés d'affaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessManagers.map((manager, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border hover:bg-secondary/10 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                          <span className="text-sm font-medium text-white">{manager.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{manager.name}</div>
                          <div className="text-xs text-muted-foreground">Taux de réussite <span className="text-secondary font-medium">{manager.successRate} %</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Derniers AO remportés */}
              <Card className="border-l-4 border-l-accent shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-accent">Derniers AO remportés par nos chargés d'affaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentWins.map((win, index) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg border hover:bg-accent/10 transition-colors">
                        <div className="text-sm text-muted-foreground flex-1 pr-2">{win.title}</div>
                        <div className="text-sm font-medium text-accent">{win.amount}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mes appels d'offres en cours */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold gradient-text">Mes appels d'offres en cours (BTP)</CardTitle>
                  <div className="flex gap-4 text-sm mt-4">
                    <Badge variant="default" className="bg-primary text-primary-foreground">Demande émise</Badge>
                    <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">En cours</span>
                    <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Négociation</span>
                    <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Remporté</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ongoingTenders.map((tender, index) => (
                      <div key={index} className="space-y-3 p-4 bg-muted/30 rounded-lg border hover:shadow-medium transition-shadow">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">{tender.title}</div>
                          <div className="text-sm font-semibold text-primary">{tender.amount}</div>
                        </div>
                        <Progress 
                          value={tender.progress} 
                          className="h-3 bg-muted"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="border-l-4 border-l-accent shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-accent">Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-64 bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden border">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="space-y-4">
                        <MapPin className="h-8 w-8 text-primary mx-auto animate-pulse" />
                        <MapPin className="h-6 w-6 text-secondary ml-8 animate-pulse" style={{animationDelay: '0.5s'}} />
                        <MapPin className="h-6 w-6 text-accent mr-8 animate-pulse" style={{animationDelay: '1s'}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default Dashboard