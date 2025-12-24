import { Github, Menu, X, Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GITHUB_URL } from "@/config/env";

const Navbar = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18nInstance.language || 'en');

  // Update current language when i18n language changes
  useEffect(() => {
    const updateLanguage = () => {
      const lang = i18nInstance.language || 'en';
      const normalizedLang = lang.startsWith('pt') ? 'pt' : lang;
      setCurrentLanguage(normalizedLang);
    };
    
    i18nInstance.on('languageChanged', updateLanguage);
    updateLanguage();
    
    return () => {
      i18nInstance.off('languageChanged', updateLanguage);
    };
  }, [i18nInstance]);

  const navLinks = [
    { labelKey: "nav.gateways", href: "#gateways" },
    { labelKey: "nav.problem", href: "#problem" },
    { labelKey: "nav.solution", href: "#solution" },
    { labelKey: "nav.howItWorks", href: "#how-it-works" },
    { labelKey: "nav.features", href: "#features" },
    { labelKey: "nav.developerExperience", href: "#dx" },
  ];

  const changeLanguage = (lng: string) => {
    i18nInstance.changeLanguage(lng);
  };

  const scrollToHero = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="">
              <img 
                src="/icon.png" 
                alt="Payment Simulator" 
                className="h-9 w-9"
                loading="lazy"
              />
            </div>
            <span className="font-semibold hidden sm:block">Payment Simulator</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden sm:inline-flex"
                >
                  <Languages className="w-4 h-4" />
                  <span className="ml-2 uppercase">{currentLanguage}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage("en")}>
                  <span className="flex-1">English</span>
                  {currentLanguage === "en" && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("pt")}>
                  <span className="flex-1">Português</span>
                  {currentLanguage === "pt" && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={() => window.open("https://github.com/oismaelash/payment-simulator", "_blank", "noopener,noreferrer")}
            >
              <Github className="w-4 h-4" />
              <span className="ml-2">{t("nav.star")}</span>
            </Button> */}
            <Button size="sm" className="hidden sm:inline-flex" onClick={scrollToHero}>
              {t("nav.getStarted")}
            </Button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t(link.labelKey)}
                </a>
              ))}
              {/* Mobile Language Toggle */}
              <div className="flex items-center gap-2 py-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-2">
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`text-sm px-3 py-1 rounded-md transition-colors ${
                      currentLanguage === "en"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => changeLanguage("pt")}
                    className={`text-sm px-3 py-1 rounded-md transition-colors ${
                      currentLanguage === "pt"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    PT
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open(GITHUB_URL, "_blank", "noopener,noreferrer")}
                >
                  <Github className="w-4 h-4 mr-2" />
                  {t("nav.star")}
                </Button>
                <Button size="sm" className="flex-1" onClick={scrollToHero}>
                  {t("nav.getStarted")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
