import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface FormData {
  company_name: string;
  employees_range: string;
  sector: string;
  sector_other: string;
  ao_experience: string;
  email: string;
  phone: string;
}

interface BetaQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
}

const BetaQuestionnaire = ({ isOpen, onClose }: BetaQuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    employees_range: '',
    sector: '',
    sector_other: '',
    ao_experience: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('beta_questionnaire_draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || formData);
        setCurrentStep(parsed.currentStep || 0);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = () => {
    localStorage.setItem('beta_questionnaire_draft', JSON.stringify({
      formData,
      currentStep,
      timestamp: Date.now()
    }));
    toast({
      title: "Brouillon sauvegardé",
      description: "Vos réponses ont été sauvegardées."
    });
  };

  // Auto-focus input when step changes
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [currentStep, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, formData]);

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    switch (step) {
      case 0:
        if (!formData.company_name.trim()) {
          newErrors.company_name = 'Le nom de l\'entreprise est requis';
        }
        break;
      case 1:
        if (!formData.employees_range) {
          newErrors.employees_range = 'Veuillez sélectionner une option';
        }
        break;
      case 2:
        if (!formData.sector) {
          newErrors.sector = 'Veuillez sélectionner un secteur';
        }
        if (formData.sector === 'Autre' && !formData.sector_other.trim()) {
          newErrors.sector_other = 'Veuillez préciser votre secteur';
        }
        break;
      case 3:
        if (!formData.ao_experience) {
          newErrors.ao_experience = 'Veuillez sélectionner une option';
        }
        break;
      case 4:
        const emailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        const phoneValid = formData.phone && /^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phone);
        
        if (!emailValid && !phoneValid) {
          if (formData.email && !emailValid) {
            newErrors.email = 'Format d\'email invalide';
          }
          if (formData.phone && !phoneValid) {
            newErrors.phone = 'Format de téléphone invalide';
          }
          if (!formData.email && !formData.phone) {
            newErrors.email = 'Email ou téléphone requis';
            newErrors.phone = 'Email ou téléphone requis';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('beta_questionnaire_responses')
        .insert({
          company_name: formData.company_name.trim(),
          employees_range: formData.employees_range,
          sector: formData.sector,
          sector_other: formData.sector === 'Autre' ? formData.sector_other.trim() : null,
          ao_experience: formData.ao_experience,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          source_page: window.location.pathname
        });

      if (error) throw error;

      // Clear saved draft
      localStorage.removeItem('beta_questionnaire_draft');
      
      // Redirect directly to beta offer page
      onClose();
      navigate('/beta-offer');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Quel est le nom de votre entreprise ?
              </h2>
              <p className="text-muted-foreground text-lg">
                Nous personnaliserons votre expérience en fonction de votre entreprise
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <Input
                ref={inputRef}
                value={formData.company_name}
                onChange={(e) => updateFormData('company_name', e.target.value)}
                placeholder="Nom de votre entreprise"
                className="text-lg h-14 text-center"
                maxLength={100}
              />
              {errors.company_name && (
                <p className="text-destructive text-sm mt-2 text-center">{errors.company_name}</p>
              )}
            </div>
          </div>
        );

      case 1:
        const employeeOptions = [
          '1 à 10',
          '11 à 50', 
          '51 à 200',
          'Plus de 200'
        ];
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Combien d'employés compte votre entreprise ?
              </h2>
              <p className="text-muted-foreground text-lg">
                Cela nous aide à adapter nos recommandations
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {employeeOptions.map((option) => (
                <Button
                  key={option}
                  variant={formData.employees_range === option ? "default" : "outline"}
                  className="h-16 text-lg"
                  onClick={() => updateFormData('employees_range', option)}
                >
                  {option}
                </Button>
              ))}
            </div>
            {errors.employees_range && (
              <p className="text-destructive text-sm text-center">{errors.employees_range}</p>
            )}
          </div>
        );

      case 2:
        const sectorOptions = [
          'BTP/Construction',
          'Services/Conseil',
          'Fournitures/Matériel',
          'Informatique/Digital',
          'Autre'
        ];
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Quel est votre secteur d'activité principal ?
              </h2>
              <p className="text-muted-foreground text-lg">
                Nous identifierons les marchés les plus pertinents pour vous
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {sectorOptions.map((option) => (
                <Button
                  key={option}
                  variant={formData.sector === option ? "default" : "outline"}
                  className="h-16 text-lg"
                  onClick={() => updateFormData('sector', option)}
                >
                  {option}
                </Button>
              ))}
            </div>
            {formData.sector === 'Autre' && (
              <div className="max-w-md mx-auto mt-4">
                <Input
                  ref={inputRef}
                  value={formData.sector_other}
                  onChange={(e) => updateFormData('sector_other', e.target.value)}
                  placeholder="Précisez votre secteur"
                  className="text-lg h-14 text-center"
                />
              </div>
            )}
            {errors.sector && (
              <p className="text-destructive text-sm text-center">{errors.sector}</p>
            )}
            {errors.sector_other && (
              <p className="text-destructive text-sm text-center">{errors.sector_other}</p>
            )}
          </div>
        );

      case 3:
        const experienceOptions = [
          'Oui, plusieurs fois',
          'Oui, mais rarement',
          'Non, jamais'
        ];
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Avez-vous déjà répondu à un appel d'offres ?
              </h2>
              <p className="text-muted-foreground text-lg">
                Nous adapterons notre accompagnement à votre niveau d'expérience
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
              {experienceOptions.map((option) => (
                <Button
                  key={option}
                  variant={formData.ao_experience === option ? "default" : "outline"}
                  className="h-16 text-lg"
                  onClick={() => updateFormData('ao_experience', option)}
                >
                  {option}
                </Button>
              ))}
            </div>
            {errors.ao_experience && (
              <p className="text-destructive text-sm text-center">{errors.ao_experience}</p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Comment pouvons-nous vous contacter ?
              </h2>
              <p className="text-muted-foreground text-lg">
                Pour vous envoyer votre accès bêta personnalisé
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Input
                  ref={inputRef}
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="votre@email.com"
                  className="text-lg h-14 text-center"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-2 text-center">{errors.email}</p>
                )}
              </div>
              <div className="text-center text-muted-foreground">ou</div>
              <div>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                  className="text-lg h-14 text-center"
                />
                {errors.phone && (
                  <p className="text-destructive text-sm mt-2 text-center">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-bold text-foreground">Merci !</h2>
          <p className="text-xl text-muted-foreground">
            Votre demande d'accès bêta a été envoyée avec succès. 
            Nous vous contacterons très bientôt avec votre accès personnalisé.
          </p>
          <Button onClick={onClose} className="text-lg px-8 py-4">
            Continuer sur le site
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-40 flex flex-col pt-16">
      {/* Progress bar */}
      <div className="px-4 md:px-6 py-4 border-b border-border">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question indicator */}
      <div className="flex justify-between items-center px-4 md:px-6 py-3">
        <span className="text-sm text-muted-foreground">
          Question {currentStep + 1} sur {totalSteps}
        </span>
        <Button variant="ghost" onClick={saveDraft} className="text-sm">
          Reprendre plus tard
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          {renderStep()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 md:p-6 border-t border-border">
        <div className="flex justify-center">
          <Button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="text-lg px-8 py-4 min-w-[200px]"
          >
            {currentStep === totalSteps - 1 ? (
              isSubmitting ? 'Envoi...' : 'Découvrir les appels d\'offres pour mon entreprise'
            ) : (
              <>
                Continuer <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Anti-spam honeypot */}
      <div style={{ display: 'none' }}>
        <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
      </div>
    </div>
  );
};

export default BetaQuestionnaire;