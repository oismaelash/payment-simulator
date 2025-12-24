import { Github, FileText, Scale } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="">
              <img
                src="/icon.png" 
                alt="Payment Simulator" 
                className="h-9 w-9"
                loading="lazy"
              />
            </div>
            <span className="font-semibold">Payment Simulator</span>
          </div>

          {/* Links */}
          {/* <div className="flex items-center gap-6">
            <a 
              href="https://github.com/oismaelash/payment-simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a 
              href="#" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="w-4 h-4" />
              Documentation
            </a>
            <a 
              href="#" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Scale className="w-4 h-4" />
              Apache 2.0
            </a>
          </div> */}

          {/* Tagline */}
          <p className="text-sm text-muted-foreground">
            Built by developers, for developers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
