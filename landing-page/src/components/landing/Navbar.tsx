import { Github, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navLinks = [
  { label: "Gateways", href: "#gateways" },
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Developer Experience", href: "#dx" },
  // { label: "Open Source", href: "#open-source" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={() => window.open("https://github.com/oismaelash/payment-simulator", "_blank", "noopener,noreferrer")}
            >
              <Github className="w-4 h-4" />
              <span className="ml-2">Star</span>
            </Button>
            <Button size="sm" className="hidden sm:inline-flex" onClick={scrollToHero}>
              Get Started
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
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open("https://github.com/oismaelash/payment-simulator", "_blank", "noopener,noreferrer")}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Star
                </Button>
                <Button size="sm" className="flex-1" onClick={scrollToHero}>
                  Get Started
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
