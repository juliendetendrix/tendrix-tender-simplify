import { useState } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface WaitlistFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const questions = [
  {
    id: 'company',
    title: 'Quel est le nom de votre entreprise ?',
    placeholder: 'Nom de votre entreprise',
    type: 'text' as const
  },
  {
    id: 'sector',
    title: 'Dans quel secteur d\'activité évoluez-vous ?',
    placeholder: 'Ex: BTP, IT, Consulting...',
    type: 'text' as const
  },
  {
    id: 'size',
    title: 'Quelle est la taille de votre entreprise ?',
    options: [
      '1-10 employés',
      '11-50 employés', 
      '51-200 employés',
      '200+ employés'
    ],
    type: 'select' as const
  },
  {
    id: 'email',
    title: 'Quelle est votre adresse email professionnelle ?',
    placeholder: 'votre@email.com',
    type: 'email' as const
  },
  {
    id: 'phone',
    title: 'Votre numéro de téléphone (optionnel)',
    placeholder: '+33 6 12 34 56 78',
    type: 'tel' as const
  }
];

const WaitlistForm = ({ isOpen, onClose }: WaitlistFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = formData[currentQuestion.id]?.trim() || currentQuestion.type === 'tel';

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleInputChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Merci !",
      description: "Vous avez été ajouté à notre liste d'attente. Nous vous contacterons bientôt.",
    });
    
    setIsSubmitting(false);
    onClose();
    setCurrentStep(0);
    setFormData({});
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Form content */}
      <div className="w-full max-w-2xl px-8 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {currentQuestion.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            Étape {currentStep + 1} sur {questions.length}
          </p>
        </div>

        <div className="space-y-8">
          {currentQuestion.type === 'select' ? (
            <div className="grid gap-3">
              {currentQuestion.options?.map((option) => (
                <Button
                  key={option}
                  variant={formData[currentQuestion.id] === option ? "default" : "outline"}
                  className="h-14 text-left justify-start text-lg"
                  onClick={() => handleInputChange(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                type={currentQuestion.type}
                placeholder={currentQuestion.placeholder}
                value={formData[currentQuestion.id] || ''}
                onChange={(e) => handleInputChange(e.target.value)}
                className="h-14 text-lg"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canProceed) {
                    handleNext();
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="flex items-center gap-2 px-8"
          >
            {isSubmitting ? (
              "Envoi en cours..."
            ) : isLastStep ? (
              "Rejoindre la liste"
            ) : (
              <>
                Suivant
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistForm;