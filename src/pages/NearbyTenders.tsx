import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink } from "lucide-react"

const NearbyTenders = () => {
  const handleBookMeeting = () => {
    window.open('https://calendly.com/julien-malherbe-tendrix/30min', '_blank')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/30 px-6 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                Appel d'offres à proximité
              </h1>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-2xl mx-auto">
              <Card className="border-l-4 border-l-primary shadow-medium">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold gradient-text mb-4">
                    Fonctionnalité en cours de développement
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Appel d'offres à proximité est indisponible
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleBookMeeting}
                      className="w-full sm:w-auto px-8 py-6 text-lg"
                      size="lg"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Prendre rendez-vous avec l'équipe
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                    <p>
                      Nos équipes vous accompagneront dans la mise en place de cette fonctionnalité 
                      pour vous permettre de découvrir les appels d'offres près de chez vous.
                    </p>
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

export default NearbyTenders