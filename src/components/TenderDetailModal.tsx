import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Calendar, Building2, Euro, TrendingUp, Clock, FileText } from "lucide-react"

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

interface TenderDetailModalProps {
  tender: BoampTender | null
  isOpen: boolean
  onClose: () => void
  onShowLockedModal?: () => void
}

// Fonction pour générer un résumé basé sur le titre et l'organisme
const generateSummary = (tender: BoampTender): string => {
  const summaries = {
    'fourniture': 'Appel d\'offres pour la fourniture d\'équipements et matériels divers. Livraison et installation comprises selon cahier des charges.',
    'travaux': 'Marché de travaux incluant conception, réalisation et mise en œuvre. Respect des normes en vigueur et délais contractuels.',
    'service': 'Prestation de services avec engagement de résultats. Formation du personnel et maintenance incluses.',
    'nettoyage': 'Contrat de nettoyage et entretien des locaux. Produits écologiques privilégiés, planning flexible.',
    'voirie': 'Travaux de voirie et aménagement urbain. Coordination avec les services municipaux requise.',
    'bureau': 'Fourniture de mobilier et équipements de bureau. Installation et garantie constructeur incluses.'
  }
  
  const titleLower = tender.title.toLowerCase()
  for (const [key, summary] of Object.entries(summaries)) {
    if (titleLower.includes(key)) {
      return summary
    }
  }
  
  return 'Marché public selon procédure réglementaire. Consultation des entreprises qualifiées respectant les critères techniques et financiers.'
}

// Fonction pour calculer un taux de réussite basé sur différents critères
const calculateSuccessRate = (tender: BoampTender): number => {
  let baseRate = 65 // Taux de base
  
  // Ajustement selon la famille du marché
  const familyBonus = {
    'MAPA': 15, // Marchés à procédure adaptée plus accessibles
    'FNS': 10,  // Formalisé national simpllifié
    'JOUE': 5,  // Journal officiel UE plus complexe
    'DSP': 5,   // Délégation service public
    'DIVERS': 10
  }
  
  baseRate += familyBonus[tender.famille as keyof typeof familyBonus] || 0
  
  // Ajustement selon le montant (plus c'est petit, plus c'est accessible)
  const montantNum = parseInt(tender.montant.replace(/[^\d]/g, '')) || 0
  if (montantNum < 50) baseRate += 20
  else if (montantNum < 100) baseRate += 15
  else if (montantNum < 200) baseRate += 10
  else if (montantNum > 500) baseRate -= 10
  
  // Ajustement selon le type d'organisme
  if (tender.organisme.toLowerCase().includes('mairie') || tender.organisme.toLowerCase().includes('commune')) {
    baseRate += 10 // Plus accessible
  }
  
  return Math.min(Math.max(baseRate, 25), 95) // Entre 25% et 95%
}

const TenderDetailModal = ({ tender, isOpen, onClose, onShowLockedModal }: TenderDetailModalProps) => {
  if (!tender) return null

  const summary = generateSummary(tender)
  const successRate = calculateSuccessRate(tender)
  const dateFormatted = new Date(tender.datePublication).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const isBetaMode = () => {
    return localStorage.getItem('tendrix_beta_mode') === 'true';
  };

  const handleRequestResponse = () => {
    if (isBetaMode()) {
      onClose();
      onShowLockedModal?.();
      return;
    }
    // Simuler une demande de réponse
    console.log('Demande de réponse pour:', tender.title)
    // Ici vous pourriez ouvrir un formulaire ou rediriger vers une page spécifique
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl font-semibold gradient-text flex-1">
              {tender.title}
            </DialogTitle>
            <Badge variant="secondary" className="shrink-0">
              {tender.famille}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Organisme</div>
                <div className="text-sm text-muted-foreground">{tender.organisme}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Euro className="w-5 h-5 text-secondary" />
              <div>
                <div className="text-sm font-medium">Budget estimé</div>
                <div className="text-sm text-secondary font-semibold">{tender.montant}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-5 h-5 text-accent" />
              <div>
                <div className="text-sm font-medium">Date de publication</div>
                <div className="text-sm text-muted-foreground">{dateFormatted}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Procédure</div>
                <div className="text-sm text-muted-foreground">{tender.procedure}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Résumé */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Résumé de l'appel d'offres
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
              {summary}
            </p>
          </div>

          <Separator />

          {/* Taux de réussite */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Taux de réussite estimé pour votre profil
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Compatibilité avec votre entreprise</span>
                <span className="text-lg font-semibold text-primary">{successRate}%</span>
              </div>
              <Progress value={successRate} className="h-3" />
              <div className="text-xs text-muted-foreground">
                Basé sur votre secteur d'activité, taille d'entreprise et historique des marchés similaires
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleRequestResponse}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Clock className="w-4 h-4 mr-2" />
              Demander une réponse
            </Button>
            
            {tender.url && tender.url !== "#" && (
              <Button 
                variant="outline" 
                onClick={() => window.open(tender.url, '_blank')}
                className="flex-1 sm:flex-initial"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir l'annonce officielle
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TenderDetailModal