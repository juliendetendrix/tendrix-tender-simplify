import { Linkedin, Mail, Phone, Instagram, Facebook, Smartphone } from 'lucide-react';
import logo from '@/assets/tendrix-logo.png';

const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-background py-16 relative">
      {/* Decorative top line with gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary"></div>
      <div className="container-max">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and Slogan */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <img 
                src={logo} 
                alt="Tendrix" 
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-lg mb-6 text-background/80">
              Simplicité et Expertise
            </p>
            <p className="text-background/60 leading-relaxed max-w-md">
              Aider les PME à découvrir les bons appels d'offres et remporter plus de contrats grâce à l'automatisation intelligente et au support d'experts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Liens rapides</h4>
            <ul className="space-y-3">
              <li>
                <a href="#how-it-works" className="text-background/80 hover:text-background transition-colors">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-background/80 hover:text-background transition-colors">
                  Tarification
                </a>
              </li>
              <li>
                <a href="/questionnaire-pme" className="text-background/80 hover:text-background transition-colors">
                  Questionnaire PME
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-background/80 hover:text-background transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/mentions-legales" className="text-background/80 hover:text-background transition-colors">
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contactez-nous</h4>
            <div className="space-y-3">
              <a
                href="mailto:contact@tendrix.com"
                className="flex items-center text-background/80 hover:text-background transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                contact@tendrix.com
              </a>
              
              <a
                href="tel:+33771819729"
                className="flex items-center text-background/80 hover:text-background transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                +33 7 71 81 97 29
              </a>
              
              <div className="flex space-x-4 pt-2">
                <a
                  href="https://www.linkedin.com/company/tendrix/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/tendrix.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61581168287416"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex justify-center items-center">
            <p className="text-background/60 text-sm">
              © 2025 Tendrix. Tous droits réservés. · <a href="/mentions-legales" className="hover:text-background transition-colors underline">Mentions légales</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;