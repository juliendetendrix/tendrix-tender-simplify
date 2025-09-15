import { Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-background py-16">
      <div className="container-max">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and Slogan */}
          <div className="lg:col-span-2">
            <div className="text-3xl font-bold mb-4">
              <span className="text-secondary">Tendrix</span>
            </div>
            <p className="text-lg mb-6 text-background/80">
              Simplicity and Expertise
            </p>
            <p className="text-background/60 leading-relaxed max-w-md">
              Helping SMEs discover the right tenders and win more contracts through intelligent automation and expert support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#how-it-works" className="text-background/80 hover:text-background transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-background/80 hover:text-background transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#contact" className="text-background/80 hover:text-background transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Get in Touch</h4>
            <div className="space-y-3">
              <a
                href="mailto:contact@tendrix.com"
                className="flex items-center text-background/80 hover:text-background transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                contact@tendrix.com
              </a>
              
              <div className="flex space-x-4 pt-2">
                <a
                  href="#"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <p className="text-background/60 text-sm">
              Sources: BOAMP (DILA) – Licence Ouverte 2.0
            </p>
            <p className="text-background/60 text-sm">
              © 2024 Tendrix. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;