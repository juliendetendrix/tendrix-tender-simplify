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
import { useCompanyData } from "@/hooks/useCompanyData"
import TenderDetailModal from "@/components/TenderDetailModal"
import { WelcomeModal } from '@/components/WelcomeModal'
import { LockedFeatureModal } from '@/components/LockedFeatureModal'
import { useEffect } from "react"

interface BoampTender {
  id: string
  title: string
  organisme: string
  montant: string
  datePublication: string
  famille: string
  procedure: string
  url: string
}

const Dashboard = () => {
  const [chatMessage, setChatMessage] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [selectedTender, setSelectedTender] = useState<BoampTender | null>(null)
  const [showTenderModal, setShowTenderModal] = useState(false)
  const [selectedStep, setSelectedStep] = useState("Demande émise")
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showLockedModal, setShowLockedModal] = useState(false)
  const { tenders, loading, error, lastUpdate, usingFallback, refetch } = useBoampTenders()
  const { companyName } = useCompanyData()

  // Show welcome modal after 3 seconds when user arrives from questionnaire
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeModal(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const isBetaMode = () => {
    return localStorage.getItem('tendrix_beta_mode') === 'true';
  };

  const handleTenderClick = (tender: BoampTender) => {
    setSelectedTender(tender)
    setShowTenderModal(true)
  }

  const referentManager = {
    name: "Sarah Dupont",
    role: "Chargée d'affaires",
    successRate: 92,
    phone: "01 42 35 67 89",
    email: "sarah.dupont@tendrix.fr"
  }

  const handleLockedAction = () => {
    if (isBetaMode()) {
      setShowLockedModal(true);
      return;
    }
  };

  const handleSendMessage = () => {
    if (isBetaMode()) {
      setShowLockedModal(true);
      return;
    }
    if (chatMessage.trim()) {
      // Simulate sending message
      console.log("Message envoyé à", referentManager.name, ":", chatMessage)
      setChatMessage("")
      setShowChat(false)
      // Here you would typically send the message to your backend
    }
  }

  const handleStepClick = (step: string) => {
    if (isBetaMode()) {
      setShowLockedModal(true);
      return;
    }
    setSelectedStep(step);
  };

  const recentWins = [
    { 
      title: "AO - Fourniture d'équipements informatiques", 
      amount: "760 k€",
      responseTime: "3h45",
      manager: "Sarah Dupont"
    },
    { 
      title: "AO - Maintenance des installations électriques", 
      amount: "950 k€",
      responseTime: "1h30",
      manager: "Jean Martin"
    },
    { 
      title: "AO - Travaux de rénovation énergétique", 
      amount: "1,2 M€",
      responseTime: "6h20",
      manager: "Emma Leblanc"
    }
  ]

  const ongoingTenders = [
    // Exemples pour "Demande émise"
    { title: "AO - Construction école primaire", amount: "2,3 M€", progress: 25, status: "Demande émise" },
    { title: "AO - Extension mairie", amount: "2,8 M€", progress: 15, status: "Demande émise" },
    { title: "AO - Aménagement parc urbain", amount: "1,4 M€", progress: 35, status: "Demande émise" },
    
    // Exemple pour "En cours"
    { title: "AO - Réhabilitation centre sportif", amount: "1,8 M€", progress: 65, status: "En cours" },
    
    // Exemples pour "Négociation"  
    { title: "AO - Rénovation piscine municipale", amount: "950 k€", progress: 85, status: "Négociation" },
    { title: "AO - Construction crèche", amount: "1,1 M€", progress: 90, status: "Négociation" },
    
    // Exemples pour "Remporté"
    { title: "AO - Travaux voirie centre-ville", amount: "680 k€", progress: 100, status: "Remporté" },
    { title: "AO - Fourniture mobilier urbain", amount: "340 k€", progress: 100, status: "Remporté" }
  ]

  const steps = ["Demande émise", "En cours", "Négociation", "Remporté"]
  
  const filteredTenders = ongoingTenders.filter(tender => tender.status === selectedStep)

  const getStepColor = (step: string) => {
    const currentIndex = steps.indexOf(selectedStep)
    const stepIndex = steps.indexOf(step)
    
    if (stepIndex < currentIndex) return "text-muted-foreground bg-muted/50"
    if (stepIndex === currentIndex) return "text-primary-foreground bg-primary"
    return "text-muted-foreground hover:text-foreground hover:bg-muted/50"
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/30 px-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                Bonjour <span className="gradient-text">{companyName || 'Entreprise'}</span>
              </h1>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-background">{/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Appels d'offres last minute */}
              <Card className="border-l-4 border-l-primary shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold gradient-text">
                    Appels d'offres last minute 
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Recommandé</span>
                  </CardTitle>
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
                        <div 
                          key={tender.id || index} 
                          className="p-3 bg-muted/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors group cursor-pointer"
                          onClick={() => handleTenderClick(tender)}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground mb-1">{tender.title}</div>
                              <div className="text-xs text-muted-foreground">{tender.organisme}</div>
                              {tender.montant && (
                                <div className="text-xs text-primary font-medium mt-1">{tender.montant}</div>
                              )}
                            </div>
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
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleLockedAction}>
                        <Phone className="w-3 h-3 mr-1" />
                        Appeler
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleLockedAction}>
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
                          onClick={handleLockedAction}
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
                  <CardTitle className="text-lg font-semibold text-foreground">Derniers AO remportés par nos chargés d'affaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentWins.map((win, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg border hover:bg-accent/10 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm font-medium text-foreground flex-1 pr-2">{win.title}</div>
                          <div className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">{win.amount}</div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <div className="text-muted-foreground">
                            <span className="font-medium">Réponse effectuée en:</span> {win.responseTime}
                          </div>
                          <div className="text-muted-foreground">
                            <span className="font-medium">Chargé d'affaire:</span> <span className="text-secondary">{win.manager}</span>
                          </div>
                        </div>
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
                  <CardTitle className="text-lg font-semibold gradient-text">Mes appels d'offres en cours (exemple version bêta)</CardTitle>
                  <div className="flex gap-2 text-sm mt-4">
                    {steps.map((step) => (
                      <button
                        key={step}
                        onClick={() => handleStepClick(step)}
                        className={`px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer font-medium ${getStepColor(step)}`}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredTenders.length > 0 ? (
                      filteredTenders.map((tender, index) => (
                        <div key={index} className="space-y-3 p-4 bg-muted/30 rounded-lg border hover:shadow-medium transition-shadow">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">{tender.title}</div>
                            <div className="text-sm font-semibold text-primary">{tender.amount}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={tender.progress} 
                              className="h-3 bg-muted flex-1"
                            />
                            <span className="text-xs text-muted-foreground font-medium">{tender.progress}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun appel d'offres à l'étape "{selectedStep}"
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="border-l-4 border-l-accent shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader className="pb-3 bg-accent/10">
                  <CardTitle className="text-lg font-bold text-accent drop-shadow-sm">Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-64 bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden border">
                    {/* Background map-like pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100">
                        {/* Grid pattern to simulate map */}
                        <div className="absolute inset-0" style={{
                          backgroundImage: `
                            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                          `,
                          backgroundSize: '20px 20px'
                        }}></div>
                        {/* Simulated roads */}
                        <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gray-400 opacity-60"></div>
                        <div className="absolute top-2/3 left-0 w-full h-0.5 bg-gray-400 opacity-60"></div>
                        <div className="absolute left-1/4 top-0 w-0.5 h-full bg-gray-400 opacity-60"></div>
                        <div className="absolute left-3/4 top-0 w-0.5 h-full bg-gray-400 opacity-60"></div>
                      </div>
                    </div>
                    
                    {/* Overlay content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
                      <div className="text-center space-y-3 px-4">
                        <h3 className="text-lg font-semibold text-foreground">Map verrouillé</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Pour accéder à la map, veuillez prendre le rendez-vous d'informations avec notre équipe
                        </p>
                        <Button 
                          onClick={handleLockedAction}
                          variant="secondary"
                          size="sm"
                          className="text-xs mt-2"
                        >
                          Prendre rendez-vous avec l'équipe
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
      
      {/* Modal des détails d'appel d'offres */}
      <TenderDetailModal 
        tender={selectedTender}
        isOpen={showTenderModal}
        onClose={() => setShowTenderModal(false)}
        onShowLockedModal={() => setShowLockedModal(true)}
      />
      
      {/* Modal de bienvenue */}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />
      
      {/* Modal fonctionnalité verrouillée */}
      <LockedFeatureModal 
        isOpen={showLockedModal} 
        onClose={() => setShowLockedModal(false)} 
      />
    </SidebarProvider>
  )
}

export default Dashboard