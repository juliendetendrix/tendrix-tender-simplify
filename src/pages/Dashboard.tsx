import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, MessageCircle, Phone, Mail, Star, RefreshCw, ExternalLink, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useBoampTenders } from "@/hooks/useBoampTenders"

const Dashboard = () => {
  const [chatMessage, setChatMessage] = useState("")
  const [showChat, setShowChat] = useState(false)
  const { tenders, loading, error, lastUpdate, usingFallback, refetch } = useBoampTenders()

  const referentManager = {
    name: "Sarah Dupont",
    role: "Chargée d'affaires BTP",
    successRate: 92,
    phone: "01 42 35 67 89",
    email: "sarah.dupont@tendrix.fr"
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Simulate sending message
      console.log("Message envoyé à", referentManager.name, ":", chatMessage)
      setChatMessage("")
      setShowChat(false)
      // Here you would typically send the message to your backend
    }
  }

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
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold gradient-text">Appels d'offres last minute</CardTitle>
                  <div className="flex items-center gap-2">
                    {usingFallback && (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refetch}
                      disabled={loading}
                      className="p-1 h-auto"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg border animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tenders.slice(0, 3).map((tender, index) => (
                        <div key={tender.id || index} className="p-3 bg-muted/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors group">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground mb-1">{tender.title}</div>
                              <div className="text-xs text-muted-foreground">{tender.organisme}</div>
                              {tender.montant && (
                                <div className="text-xs text-primary font-medium mt-1">{tender.montant}</div>
                              )}
                            </div>
                            {tender.url && tender.url !== "#" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                                onClick={() => window.open(tender.url, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {lastUpdate && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Dernière mise à jour: {new Date(lastUpdate).toLocaleString('fr-FR')}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mon chargé d'affaires référent */}
              <Card className="border-l-4 border-l-secondary shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-secondary">Mon chargé d'affaires référent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Profil du chargé d'affaires */}
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                        <span className="text-lg font-medium text-white">SD</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base">{referentManager.name}</div>
                        <div className="text-sm text-muted-foreground">{referentManager.role}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-secondary font-medium">{referentManager.successRate}% de réussite</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <Phone className="w-3 h-3 mr-1" />
                        Appeler
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    </div>

                    {/* Zone de chat */}
                    <div className="border rounded-lg p-3 bg-background/50">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium">Poser une question</span>
                      </div>
                      
                      {!showChat ? (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => setShowChat(true)}
                          className="w-full text-xs"
                        >
                          Écrire un message à {referentManager.name.split(' ')[0]}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Tapez votre question ici..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            className="text-sm min-h-[60px] resize-none"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={handleSendMessage}
                              className="text-xs"
                            >
                              Envoyer
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setShowChat(false)}
                              className="text-xs"
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
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