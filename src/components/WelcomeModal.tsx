import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCompanyData } from '@/hooks/useCompanyData';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { companyName } = useCompanyData();

  const handleScheduleCall = () => {
    window.open('https://calendly.com/julien-malherbe-tendrix/30min', '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary">
            Bonjour{companyName ? `, ${companyName}` : ''} !
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-6">
          <p className="text-lg text-center text-muted-foreground">
            Vous avez accès à la version bêta de Tendrix. Nous vous invitons à y faire un tour, 
            mais vos fonctionnalités sont limitées.
          </p>
          <p className="text-center text-muted-foreground">
            Pour débloquer toutes les fonctionnalités et commencer à répondre à des appels d'offres, 
            cliquez sur le bouton suivant :
          </p>
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleScheduleCall}
              className="w-full py-6 text-lg"
              size="lg"
            >
              Prendre un rendez-vous rapide
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Explorer la bêta d'abord
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};