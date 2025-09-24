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
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          
          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Appels d'offres last minute */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Appels d'offres last minute</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lastMinuteTenders.map((tender, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {tender}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mes chargés d'affaires */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Mes chargés d'affaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessManagers.map((manager, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">{manager.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{manager.name}</div>
                          <div className="text-xs text-muted-foreground">Taux de réussite {manager.successRate} %</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Derniers AO remportés */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Derniers AO remportés par nos chargés d'affaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentWins.map((win, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="text-sm text-muted-foreground flex-1 pr-2">{win.title}</div>
                        <div className="text-sm font-medium">{win.amount}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mes appels d'offres en cours */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Mes appels d'offres en cours (BTP)</CardTitle>
                  <div className="flex gap-4 text-sm">
                    <span className="border-b-2 border-yellow-500 pb-1">Demande émise</span>
                    <span className="text-muted-foreground">En cours</span>
                    <span className="text-muted-foreground">Négociation</span>
                    <span className="text-muted-foreground">Remporté</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ongoingTenders.map((tender, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">{tender.title}</div>
                          <div className="text-sm font-semibold">{tender.amount}</div>
                        </div>
                        <Progress 
                          value={tender.progress} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="space-y-4">
                        <MapPin className="h-8 w-8 text-primary mx-auto" />
                        <MapPin className="h-6 w-6 text-primary ml-8" />
                        <MapPin className="h-6 w-6 text-primary mr-8" />
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