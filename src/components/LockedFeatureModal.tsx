import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface LockedFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LockedFeatureModal: React.FC<LockedFeatureModalProps> = ({ isOpen, onClose }) => {
  const handleScheduleCall = () => {
    window.open('https://calendly.com/julien-malherbe-tendrix/30min', '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary flex items-center justify-center gap-2">
            <Lock className="w-6 h-6" />
            Fonctionnalité verrouillée
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-6">
          <p className="text-lg text-center text-muted-foreground">
            Cette fonctionnalité n'est pas disponible dans la version bêta.
          </p>
          <p className="text-center text-muted-foreground">
            Pour débloquer toutes les fonctionnalités et commencer à répondre à des appels d'offres, 
            prenez rendez-vous avec notre équipe.
          </p>
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleScheduleCall}
              className="w-full py-6 text-lg"
              size="lg"
            >
              Prendre un rendez-vous d'informations
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Continuer l'exploration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};