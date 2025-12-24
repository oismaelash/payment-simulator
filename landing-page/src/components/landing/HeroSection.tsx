import { Terminal, Github, Zap, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const HeroSection = () => {
  const { t } = useTranslation();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      
      <div className="section-container relative z-10 text-center py-20">
        {/* Badge */}
        {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Open Source</span>
          <span className="text-sm text-foreground font-medium">Payment Testing Made Simple</span>
        </div> */}

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
          <span className="text-foreground">{t("hero.title")}</span>
          <br />
          <span className="text-gradient">{t("hero.titleHighlight")}</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
          {t("hero.subtitle")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-200">
          {/* <Button variant="hero" size="xl">
            <Terminal className="w-5 h-5" />
            Run locally in minutes
          </Button> */}
          <Button variant="hero" size="xl" onClick={() => setIsDemoOpen(true)}>
            <Play className="w-5 h-5" />
            {t("hero.demo")}
          </Button>
          <Button 
            variant="hero-outline" 
            size="xl"
            onClick={() => window.open("https://github.com/oismaelash/payment-simulator", "_blank", "noopener,noreferrer")}
          >
            <Github className="w-5 h-5" />
            {t("hero.viewOnGitHub")}
          </Button>
        </div>

        {/* Terminal Preview */}
        <div className="max-w-3xl mx-auto animate-slide-up delay-300">
          <div className="code-block terminal-shadow">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">{t("hero.terminal")}</span>
            </div>
            {/* Terminal Content */}
            <div className="p-6 text-left">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">$</span>
                <span className="text-foreground">curl -fsSL https://paymentsimulator.com/install.sh | bash</span>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-success">✓</span> {t("hero.starting")}
                </p>
                <p className="text-foreground mt-4">
                  <span className="text-primary">→</span> {t("hero.dashboard")} <span className="text-primary underline">http://localhost:4001</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
        </div>
      </div>

      {/* Demo Video Modal */}
      <Dialog open={isDemoOpen} onOpenChange={setIsDemoOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative w-full aspect-video">
            <iframe
              className="w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title={t("hero.demoTitle")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
