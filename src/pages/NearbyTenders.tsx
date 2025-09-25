import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, ExternalLink } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const NearbyTenders = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapboxToken, setMapboxToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(true)

  const handleBookMeeting = () => {
    window.open('https://calendly.com/julien-malherbe-tendrix/30min', '_blank')
  }

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return

    mapboxgl.accessToken = token
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Style satellite
        center: [2.3522, 48.8566], // Paris coordinates
        zoom: 11,
        interactive: false // Disable interactions since it's a background
      })

      // Add some markers to simulate tender locations around Paris
      const locations = [
        { lng: 2.3522, lat: 48.8566, title: 'AO - Rénovation Hôtel de Ville' },
        { lng: 2.2945, lat: 48.8584, title: 'AO - Aménagement urbain 16ème' },
        { lng: 2.3488, lat: 48.8534, title: 'AO - Travaux Notre-Dame' },
        { lng: 2.2770, lat: 48.8906, title: 'AO - Infrastructure La Défense' },
        { lng: 2.3200, lat: 48.8000, title: 'AO - Équipements Montparnasse' },
        { lng: 2.4023, lat: 48.8648, title: 'AO - Services informatiques 11ème' },
        { lng: 2.3200, lat: 48.8900, title: 'AO - Fournitures 18ème' },
        { lng: 2.2500, lat: 48.8300, title: 'AO - Mobilier urbain 15ème' }
      ]

      map.current.on('load', () => {
        locations.forEach((location, index) => {
          // Add markers with different colors to simulate different types of tenders
          const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
          const color = colors[index % colors.length]
          
          new mapboxgl.Marker({ color: color, scale: 0.8 })
            .setLngLat([location.lng, location.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>${location.title}</strong>`))
            .addTo(map.current!)
        })
      })

      setShowTokenInput(false)
    } catch (error) {
      console.error('Error initializing map:', error)
      alert('Erreur lors de l\'initialisation de la carte. Vérifiez votre token Mapbox.')
    }
  }

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      initializeMap(mapboxToken.trim())
    } else {
      alert('Veuillez entrer un token Mapbox valide')
    }
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
          
          <main className="flex-1 p-6 bg-background relative">
            {/* Background Satellite Map */}
            <div className="absolute inset-0 z-0">
              <div ref={mapContainer} className="w-full h-full opacity-30" />
            </div>
            
            {/* Token Input Overlay */}
            {showTokenInput && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-center">Configuration Mapbox</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Pour afficher la carte satellite, veuillez entrer votre token Mapbox public.
                      <br />
                      <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Obtenez votre token sur mapbox.com
                      </a>
                    </p>
                    <Input
                      placeholder="pk.eyJ1IjoiY..."
                      value={mapboxToken}
                      onChange={(e) => setMapboxToken(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTokenSubmit()}
                    />
                    <Button onClick={handleTokenSubmit} className="w-full">
                      Initialiser la carte satellite
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Content */}
            <div className="relative z-20 max-w-2xl mx-auto">
              <Card className="border-l-4 border-l-primary shadow-medium bg-background/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold gradient-text mb-4">
                    Fonctionnalité verrouillée
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
                  
                  <div className="text-sm text-muted-foreground bg-background/80 p-4 rounded-lg">
                    <p>
                      Cette fonctionnalité vous permettra de visualiser sur une carte satellite interactive 
                      tous les appels d'offres situés près de votre entreprise, avec géolocalisation précise 
                      et filtrage par secteur d'activité.
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