import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  // Section 1: Profil entreprise
  company_name: string;
  sector: string;
  company_size: string;
  
  // Section 2: Expérience appels d'offres
  ao_experience: string;
  ao_frequency: string;
  main_barriers: string[];
  other_barrier: string;
  externalized_ao: string;
  
  // Section 3: Besoin & perception
  platform_interest: string;
  important_criteria: string[];
  other_criteria: string;
  monthly_budget: string;
  
  // Section 4: Invitation bêta
  beta_interest: string;
  contact_name: string;
  contact_email: string;
  city_department: string;
  contact_sector: string;
  
  // Consentement RGPD
  consent: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

export const PMEQuestionnaire: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    sector: '',
    company_size: '',
    ao_experience: '',
    ao_frequency: '',
    main_barriers: [],
    other_barrier: '',
    externalized_ao: '',
    platform_interest: '',
    important_criteria: [],
    other_criteria: '',
    monthly_budget: '',
    beta_interest: '',
    contact_name: '',
    contact_email: '',
    city_department: '',
    contact_sector: '',
    consent: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const totalSteps = 4;

  // Auto-save draft to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('pme-questionnaire-draft');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to parse saved data:', error);
      }
    }

    // Track questionnaire started
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'questionnaire_started', {
        event_category: 'engagement',
        event_label: 'pme_questionnaire'
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pme-questionnaire-draft', JSON.stringify(formData));
  }, [formData]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Handle escape if needed
      } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        if (currentStep < totalSteps) {
          handleNext();
        } else {
          handleSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1:
        if (!formData.company_name.trim()) newErrors.company_name = 'Le nom de l\'entreprise est requis';
        if (!formData.sector.trim()) newErrors.sector = 'Le secteur d\'activité est requis';
        if (!formData.company_size) newErrors.company_size = 'La taille de l\'entreprise est requise';
        break;
      
      case 2:
        if (!formData.ao_experience) newErrors.ao_experience = 'Cette question est requise';
        if (formData.ao_experience !== 'Non, jamais' && !formData.ao_frequency) {
          newErrors.ao_frequency = 'Cette question est requise';
        }
        if (formData.main_barriers.length === 0) newErrors.main_barriers = 'Sélectionnez au moins un frein';
        if (!formData.externalized_ao) newErrors.externalized_ao = 'Cette question est requise';
        break;
      
      case 3:
        if (!formData.platform_interest) newErrors.platform_interest = 'Cette question est requise';
        if (formData.important_criteria.length === 0) newErrors.important_criteria = 'Sélectionnez au moins un critère';
        if (formData.important_criteria.length > 2) newErrors.important_criteria = 'Sélectionnez maximum 2 critères';
        if (!formData.monthly_budget) newErrors.monthly_budget = 'Cette question est requise';
        break;
      
      case 4:
        if (!formData.beta_interest) newErrors.beta_interest = 'Cette question est requise';
        if (formData.beta_interest === 'Oui, je veux profiter du mois gratuit') {
          if (!formData.contact_name.trim()) newErrors.contact_name = 'Le nom et prénom sont requis';
          if (!formData.contact_email.trim()) newErrors.contact_email = 'L\'email professionnel est requis';
          if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
            newErrors.contact_email = 'Format d\'email invalide';
          }
          if (!formData.city_department.trim()) newErrors.city_department = 'La ville/département est requise';
        }
        if (!formData.consent) newErrors.consent = 'Le consentement RGPD est requis';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        company_name: formData.company_name,
        sector: formData.sector,
        company_size: formData.company_size,
        ao_experience: formData.ao_experience,
        ao_frequency: formData.ao_experience === 'Non, jamais' ? null : formData.ao_frequency,
        main_barriers: formData.main_barriers,
        other_barrier: formData.other_barrier || null,
        externalized_ao: formData.externalized_ao === 'Oui',
        platform_interest: formData.platform_interest,
        important_criteria: formData.important_criteria,
        other_criteria: formData.other_criteria || null,
        monthly_budget: formData.monthly_budget,
        beta_interest: formData.beta_interest === 'Oui, je veux profiter du mois gratuit',
        contact_name: formData.beta_interest === 'Oui, je veux profiter du mois gratuit' ? formData.contact_name : null,
        contact_email: formData.beta_interest === 'Oui, je veux profiter du mois gratuit' ? formData.contact_email : null,
        city_department: formData.beta_interest === 'Oui, je veux profiter du mois gratuit' ? formData.city_department : null,
        contact_sector: formData.beta_interest === 'Oui, je veux profiter du mois gratuit' ? formData.contact_sector : null,
        consent: formData.consent,
        source_page: '/questionnaire-pme'
      };

      const { error } = await supabase
        .from('pme_questionnaire_responses')
        .insert([submitData]);

      if (error) throw error;

      // Track analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'questionnaire_submitted', {
          event_category: 'engagement',
          event_label: 'pme_questionnaire'
        });

        if (formData.beta_interest === 'Oui, je veux profiter du mois gratuit') {
          (window as any).gtag('event', 'beta_optin', {
            event_category: 'conversion',
            event_label: 'pme_questionnaire'
          });
        }
      }

      localStorage.removeItem('pme-questionnaire-draft');
      setIsCompleted(true);
      
      toast({
        title: "Questionnaire envoyé !",
        description: "Merci pour vos réponses.",
      });
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBarrierChange = (barrier: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      main_barriers: checked 
        ? [...prev.main_barriers, barrier]
        : prev.main_barriers.filter(b => b !== barrier)
    }));
    setErrors(prev => ({ ...prev, main_barriers: '' }));
  };

  const handleCriteriaChange = (criteria: string, checked: boolean) => {
    setFormData(prev => {
      const newCriteria = checked 
        ? [...prev.important_criteria, criteria]
        : prev.important_criteria.filter(c => c !== criteria);
      
      return {
        ...prev,
        important_criteria: newCriteria
      };
    });
    setErrors(prev => ({ ...prev, important_criteria: '' }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Section 1 — Profil entreprise</h2>
            
            <div className="space-y-2">
              <Label htmlFor="company_name">Nom de l'entreprise *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => updateFormData('company_name', e.target.value)}
                placeholder="Nom de votre entreprise"
                className={errors.company_name ? 'border-destructive' : ''}
              />
              {errors.company_name && <p className="text-sm text-destructive">{errors.company_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Secteur d'activité *</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => updateFormData('sector', e.target.value)}
                placeholder="Ex: BTP, IT, Commerce, etc."
                className={errors.sector ? 'border-destructive' : ''}
              />
              {errors.sector && <p className="text-sm text-destructive">{errors.sector}</p>}
            </div>

            <div className="space-y-4">
              <Label>Taille de l'entreprise *</Label>
              <RadioGroup 
                value={formData.company_size} 
                onValueChange={(value) => updateFormData('company_size', value)}
                className={errors.company_size ? 'border border-destructive rounded-md p-2' : ''}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1–10 salariés" id="size1" />
                  <Label htmlFor="size1">1–10 salariés</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="11–50 salariés" id="size2" />
                  <Label htmlFor="size2">11–50 salariés</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="51–250 salariés" id="size3" />
                  <Label htmlFor="size3">51–250 salariés</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="250+" id="size4" />
                  <Label htmlFor="size4">250+</Label>
                </div>
              </RadioGroup>
              {errors.company_size && <p className="text-sm text-destructive">{errors.company_size}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Section 2 — Expérience appels d'offres</h2>
            
            <div className="space-y-4">
              <Label>Avez-vous déjà répondu à des appels d'offres ? *</Label>
              <RadioGroup 
                value={formData.ao_experience} 
                onValueChange={(value) => updateFormData('ao_experience', value)}
                className={errors.ao_experience ? 'border border-destructive rounded-md p-2' : ''}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Oui, régulièrement" id="exp1" />
                  <Label htmlFor="exp1">Oui, régulièrement</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Oui, occasionnellement" id="exp2" />
                  <Label htmlFor="exp2">Oui, occasionnellement</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Non, jamais" id="exp3" />
                  <Label htmlFor="exp3">Non, jamais</Label>
                </div>
              </RadioGroup>
              {errors.ao_experience && <p className="text-sm text-destructive">{errors.ao_experience}</p>}
            </div>

            {formData.ao_experience && formData.ao_experience !== 'Non, jamais' && (
              <div className="space-y-4">
                <Label>Si oui, combien de fois par an environ ?</Label>
                <RadioGroup 
                  value={formData.ao_frequency} 
                  onValueChange={(value) => updateFormData('ao_frequency', value)}
                  className={errors.ao_frequency ? 'border border-destructive rounded-md p-2' : ''}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1–5" id="freq1" />
                    <Label htmlFor="freq1">1–5</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6–10" id="freq2" />
                    <Label htmlFor="freq2">6–10</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="11–20" id="freq3" />
                    <Label htmlFor="freq3">11–20</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="20+" id="freq4" />
                    <Label htmlFor="freq4">20+</Label>
                  </div>
                </RadioGroup>
                {errors.ao_frequency && <p className="text-sm text-destructive">{errors.ao_frequency}</p>}
              </div>
            )}

            <div className="space-y-4">
              <Label>Quels sont les principaux freins rencontrés ? * (plusieurs choix possibles)</Label>
              <div className={`space-y-3 ${errors.main_barriers ? 'border border-destructive rounded-md p-2' : ''}`}>
                {[
                  'Manque de temps',
                  'Manque de compétences internes (administratif, juridique, rédactionnel)',
                  'Dossier trop complexe',
                  'Coût d\'un prestataire externe',
                  'Autre'
                ].map((barrier) => (
                  <div key={barrier} className="flex items-center space-x-2">
                    <Checkbox
                      id={barrier}
                      checked={formData.main_barriers.includes(barrier)}
                      onCheckedChange={(checked) => handleBarrierChange(barrier, checked as boolean)}
                    />
                    <Label htmlFor={barrier}>{barrier}</Label>
                  </div>
                ))}
              </div>
              {errors.main_barriers && <p className="text-sm text-destructive">{errors.main_barriers}</p>}
            </div>

            {formData.main_barriers.includes('Autre') && (
              <div className="space-y-2">
                <Label htmlFor="other_barrier">Précisez "Autre"</Label>
                <Textarea
                  id="other_barrier"
                  value={formData.other_barrier}
                  onChange={(e) => updateFormData('other_barrier', e.target.value)}
                  placeholder="Décrivez brièvement..."
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-4">
              <Label>Avez-vous déjà externalisé la réponse à un appel d'offres ? *</Label>
              <RadioGroup 
                value={formData.externalized_ao} 
                onValueChange={(value) => updateFormData('externalized_ao', value)}
                className={errors.externalized_ao ? 'border border-destructive rounded-md p-2' : ''}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Oui" id="ext1" />
                  <Label htmlFor="ext1">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Non" id="ext2" />
                  <Label htmlFor="ext2">Non</Label>
                </div>
              </RadioGroup>
              {errors.externalized_ao && <p className="text-sm text-destructive">{errors.externalized_ao}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Section 3 — Besoin & perception</h2>
            
            <div className="space-y-4">
              <Label>Si une plateforme centralisait vos appels d'offres et permettait une réponse en moins de 4 h, seriez-vous intéressé(e) ? *</Label>
              <RadioGroup 
                value={formData.platform_interest} 
                onValueChange={(value) => updateFormData('platform_interest', value)}
                className={errors.platform_interest ? 'border border-destructive rounded-md p-2' : ''}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Oui, très" id="int1" />
                  <Label htmlFor="int1">Oui, très</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Oui, un peu" id="int2" />
                  <Label htmlFor="int2">Oui, un peu</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pas vraiment" id="int3" />
                  <Label htmlFor="int3">Pas vraiment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pas du tout" id="int4" />
                  <Label htmlFor="int4">Pas du tout</Label>
                </div>
              </RadioGroup>
              {errors.platform_interest && <p className="text-sm text-destructive">{errors.platform_interest}</p>}
            </div>

            <div className="space-y-4">
              <Label>Quels critères seraient les plus importants pour vous ? * (maximum 2 choix)</Label>
              <div className={`space-y-3 ${errors.important_criteria ? 'border border-destructive rounded-md p-2' : ''}`}>
                {[
                  'Rapidité',
                  'Fiabilité / expertise du chargé d\'affaires',
                  'Coût',
                  'Simplicité d\'utilisation',
                  'Autre'
                ].map((criteria) => (
                  <div key={criteria} className="flex items-center space-x-2">
                    <Checkbox
                      id={criteria}
                      checked={formData.important_criteria.includes(criteria)}
                      onCheckedChange={(checked) => handleCriteriaChange(criteria, checked as boolean)}
                      disabled={formData.important_criteria.length >= 2 && !formData.important_criteria.includes(criteria)}
                    />
                    <Label htmlFor={criteria}>{criteria}</Label>
                  </div>
                ))}
              </div>
              {errors.important_criteria && <p className="text-sm text-destructive">{errors.important_criteria}</p>}
              <p className="text-sm text-muted-foreground">
                Critères sélectionnés: {formData.important_criteria.length}/2
              </p>
            </div>

            {formData.important_criteria.includes('Autre') && (
              <div className="space-y-2">
                <Label htmlFor="other_criteria">Précisez "Autre"</Label>
                <Textarea
                  id="other_criteria"
                  value={formData.other_criteria}
                  onChange={(e) => updateFormData('other_criteria', e.target.value)}
                  placeholder="Décrivez brièvement..."
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-4">
              <Label>Combien seriez-vous prêt(e) à investir par mois pour ce service ? *</Label>
              <RadioGroup 
                value={formData.monthly_budget} 
                onValueChange={(value) => updateFormData('monthly_budget', value)}
                className={errors.monthly_budget ? 'border border-destructive rounded-md p-2' : ''}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="< 50 €" id="budget1" />
                  <Label htmlFor="budget1">&lt; 50 €</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50–99 €" id="budget2" />
                  <Label htmlFor="budget2">50–99 €</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="100–199 €" id="budget3" />
                  <Label htmlFor="budget3">100–199 €</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="200–499 €" id="budget4" />
                  <Label htmlFor="budget4">200–499 €</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="500+ €" id="budget5" />
                  <Label htmlFor="budget5">500+ €</Label>
                </div>
              </RadioGroup>
              {errors.monthly_budget && <p className="text-sm text-destructive">{errors.monthly_budget}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Section 4 — Invitation bêta</h2>
            
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Merci pour vos réponses 🙏</h3>
              <p className="text-muted-foreground mb-4">
                Nous lançons la version bêta privée de Tendrix :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>1 réponse offerte</li>
                <li>Canal Slack dédié</li>
                <li>Accompagnement par un chargé d'affaires certifié</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Label>Souhaitez-vous tester la bêta gratuitement ? *</Label>
              <RadioGroup 
                value={formData.beta_interest} 
                onValueChange={(value) => updateFormData('beta_interest', value)}
                className={errors.beta_interest ? 'border border-destructive rounded-md p-2' : ''}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Oui, je veux profiter du mois gratuit" id="beta1" />
                  <Label htmlFor="beta1">Oui, je veux profiter du mois gratuit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Non, pas pour l'instant" id="beta2" />
                  <Label htmlFor="beta2">Non, pas pour l'instant</Label>
                </div>
              </RadioGroup>
              {errors.beta_interest && <p className="text-sm text-destructive">{errors.beta_interest}</p>}
            </div>

            {formData.beta_interest === 'Oui, je veux profiter du mois gratuit' && (
              <div className="space-y-6 border-t pt-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Nom & prénom *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => updateFormData('contact_name', e.target.value)}
                    placeholder="Votre nom et prénom"
                    className={errors.contact_name ? 'border-destructive' : ''}
                  />
                  {errors.contact_name && <p className="text-sm text-destructive">{errors.contact_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email professionnel *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => updateFormData('contact_email', e.target.value)}
                    placeholder="votre.email@entreprise.com"
                    className={errors.contact_email ? 'border-destructive' : ''}
                  />
                  {errors.contact_email && <p className="text-sm text-destructive">{errors.contact_email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city_department">Ville / département *</Label>
                  <Input
                    id="city_department"
                    value={formData.city_department}
                    onChange={(e) => updateFormData('city_department', e.target.value)}
                    placeholder="Ex: Paris, 75, Lyon, etc."
                    className={errors.city_department ? 'border-destructive' : ''}
                  />
                  {errors.city_department && <p className="text-sm text-destructive">{errors.city_department}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_sector">Secteur d'activité (si différent du Q2)</Label>
                  <Input
                    id="contact_sector"
                    value={formData.contact_sector}
                    onChange={(e) => updateFormData('contact_sector', e.target.value)}
                    placeholder="Optionnel"
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => updateFormData('consent', checked)}
                  className={errors.consent ? 'border-destructive' : ''}
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed">
                  J'accepte que Tendrix me contacte au sujet de la bêta et du suivi du questionnaire.
                </Label>
              </div>
              {errors.consent && <p className="text-sm text-destructive mt-1">{errors.consent}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isCompleted) {
    const isBetaUser = formData.beta_interest === 'Oui, je veux profiter du mois gratuit';
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8">
          <div className="text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            
            {isBetaUser ? (
              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">
                  🎉 Bienvenue dans la bêta Tendrix
                </h2>
                <p className="text-muted-foreground">
                  Vous allez recevoir un email avec la suite (activation de votre canal Slack).
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Merci pour vos réponses !
                </h2>
                <p className="text-muted-foreground">
                  Vos retours nous aident à améliorer notre solution.
                </p>
              </div>
            )}

            <div className="pt-6 border-t text-sm text-muted-foreground">
              <p>Sources : BOAMP (DILA) — Licence Ouverte 2.0.</p>
              <div className="flex justify-center space-x-4 mt-2">
                <a href="/mentions-legales" className="hover:text-primary">Mentions légales</a>
                <span>•</span>
                <a href="/politique-confidentialite" className="hover:text-primary">Politique de confidentialité</a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Étape {currentStep} sur {totalSteps}
          </div>
          <div className="w-48 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};