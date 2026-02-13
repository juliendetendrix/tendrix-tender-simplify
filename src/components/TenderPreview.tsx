import { Calendar, Building, Euro, MapPin, Zap, RefreshCw } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useBetaQuestionnaire } from '@/hooks/useBetaQuestionnaire';
import { useBoampTenders } from '@/hooks/useBoampTenders';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const TenderPreview = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const { openQuestionnaire } = useBetaQuestionnaire();
  const { tenders, loading, refetch } = useBoampTenders();

  const displayTenders = tenders.slice(0, 3);

  return (
    <section ref={sectionRef} className="section-padding bg-gradient-hero">
      <div className="container-max">
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Récentes opportunités
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Données BOAMP en temps réel — Des appels d'offres près de chez vous
          </p>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-soft border border-border space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {displayTenders.map((tender, index) => (
              <div
                key={tender.id}
                className={`bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium hover:scale-105 transition-all duration-300 border border-border group ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: `${0.2 + index * 0.2}s` }}
              >
                {/* Title + badge */}
                <div className="flex items-start gap-2 mb-4">
                  <h3 className="text-xl font-semibold text-foreground flex-1 line-clamp-3">
                    {tender.title}
                  </h3>
                  {tender.hoursAgo < 48 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary shrink-0">
                      <Zap className="w-3 h-3" />
                      il y a {tender.hoursAgo}h
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-muted-foreground">
                    <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{tender.organisme || 'Organisme non spécifié'}</span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{tender.location || 'Non spécifié'}</span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <Euro className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium">{tender.budget || 'Montant non spécifié'}</span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">
                      {tender.deadline ? `Date limite : ${tender.deadline}` : 'Date limite : Non spécifiée'}
                    </span>
                  </div>
                </div>

                {/* Compatibility */}
                <div className="mb-6 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Compatibilité</span>
                    <span className="font-semibold text-muted-foreground">N/A</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
                  <p className="text-xs text-muted-foreground italic">Nous pourrons estimer la compatibilité de votre entreprise une fois inscrite et onboarding réalisé</p>
                </div>

                <button
                  onClick={openQuestionnaire}
                  className="btn-secondary w-full group-hover:bg-secondary-hover"
                >
                  Demander une réponse
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TenderPreview;
