import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FormData {
  companyName: string;
  employeeCount: string;
  sector: string;
  sectorOther: string;
  tenderExperience: string;
  contact: string;
}

const SalesFunnel = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    employeeCount: '',
    sector: '',
    sectorOther: '',
    tenderExperience: '',
    contact: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 5;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('Questionnaire')
        .insert([{
          company: formData.companyName,
          size: formData.employeeCount,
          sector: formData.sector === 'Autre' ? formData.sectorOther : formData.sector,
          email: formData.contact.includes('@') ? formData.contact : null,
          phone: !formData.contact.includes('@') ? formData.contact : null
        }]);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Merci !",
        description: "Vos réponses ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.companyName.trim() !== '';
      case 2: return formData.employeeCount !== '';
      case 3: return formData.sector !== '' && (formData.sector !== 'Autre' || formData.sectorOther.trim() !== '');
      case 4: return formData.tenderExperience !== '';
      case 5: return formData.contact.trim() !== '';
      default: return false;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Merci pour vos réponses !
              </h1>
            </div>
            
            <div className="space-y-4 text-muted-foreground mb-8">
              <p className="text-lg">
                D'après votre profil, <span className="font-semibold text-primary">Tendrix</span> peut vous aider à simplifier vos appels d'offres dès maintenant.
              </p>
              
              <p>
                Nous lançons une version bêta privée, réservée à un nombre limité de PME. 
                L'accès est à seulement <span className="font-bold text-primary">5 €</span>, 
                pour tester un service qui aura une valeur bien plus grande par la suite.
              </p>
              
              <p>
                Votre engagement aujourd'hui compte : nous porterons une attention particulière à nos premières entreprises.
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                // Replace with your Stripe Checkout URL
                window.location.href = "https://checkout.stripe.com/YOUR_CHECKOUT_URL_HERE";
              }}
            >
              Rejoindre la Bêta pour 5 € →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Quel est le nom de votre entreprise ?
              </h2>
              <p className="text-muted-foreground">
                Commençons par nous présenter
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateFormData('companyName', e.target.value)}
                placeholder="Ex: Ma Super Entreprise"
                className="text-lg p-4"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Combien d'employés compte votre entreprise ?
              </h2>
              <p className="text-muted-foreground">
                Cela nous aide à mieux comprendre votre contexte
              </p>
            </div>
            
            <RadioGroup 
              value={formData.employeeCount} 
              onValueChange={(value) => updateFormData('employeeCount', value)}
              className="space-y-3"
            >
              {['1 à 10', '11 à 50', '51 à 200', 'Plus de 200'].map((option) => (
                <div key={option} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer text-lg">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Quel est votre secteur d'activité principal ?
              </h2>
              <p className="text-muted-foreground">
                Pour personnaliser notre approche
              </p>
            </div>
            
            <RadioGroup 
              value={formData.sector} 
              onValueChange={(value) => updateFormData('sector', value)}
              className="space-y-3"
            >
              {['BTP/Construction', 'Services/Conseil', 'Fournitures/Matériel', 'Informatique/Digital', 'Autre'].map((option) => (
                <div key={option} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer text-lg">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {formData.sector === 'Autre' && (
              <div className="space-y-2">
                <Label htmlFor="sectorOther">Précisez votre secteur</Label>
                <Input
                  id="sectorOther"
                  value={formData.sectorOther}
                  onChange={(e) => updateFormData('sectorOther', e.target.value)}
                  placeholder="Votre secteur d'activité"
                  className="text-lg p-4"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Avez-vous déjà répondu à un appel d'offres ?
              </h2>
              <p className="text-muted-foreground">
                Votre expérience nous intéresse
              </p>
            </div>
            
            <RadioGroup 
              value={formData.tenderExperience} 
              onValueChange={(value) => updateFormData('tenderExperience', value)}
              className="space-y-3"
            >
              {['Oui plusieurs fois', 'Oui mais rarement', 'Non jamais'].map((option) => (
                <div key={option} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer text-lg">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Comment vous contacter ?
              </h2>
              <p className="text-muted-foreground">
                Pour vous envoyer votre accès bêta personnalisé
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Adresse e-mail ou numéro de téléphone</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => updateFormData('contact', e.target.value)}
                placeholder="contact@entreprise.com ou 06 12 34 56 78"
                className="text-lg p-4"
                autoFocus
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentStep} sur {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Current step content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                Terminer
                <CheckCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesFunnel;