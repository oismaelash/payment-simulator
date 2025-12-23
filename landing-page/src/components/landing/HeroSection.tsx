import { Terminal, Github, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      
      <div className="section-container relative z-10 text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Open Source</span>
          <span className="text-sm text-foreground font-medium">Payment Testing Made Simple</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
          <span className="text-foreground">Simulate payment gateways</span>
          <br />
          <span className="text-gradient">locally.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
          Test webhooks, edge cases, and failures before production. 
          No signup. No API keys. Just run it locally.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-200">
          <Button variant="hero" size="xl">
            <Terminal className="w-5 h-5" />
            Run locally in minutes
          </Button>
          <Button variant="hero-outline" size="xl">
            <Github className="w-5 h-5" />
            View on GitHub
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
              <span className="text-xs text-muted-foreground ml-2">terminal</span>
            </div>
            {/* Terminal Content */}
            <div className="p-6 text-left">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">$</span>
                <span className="text-foreground">npx payment-simulator start</span>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-success">✓</span> Starting Payment Simulator v1.2.0
                </p>
                <p className="text-muted-foreground">
                  <span className="text-success">✓</span> Pix gateway initialized
                </p>
                <p className="text-muted-foreground">
                  <span className="text-success">✓</span> Credit card gateway initialized
                </p>
                <p className="text-muted-foreground">
                  <span className="text-success">✓</span> Webhook sender ready
                </p>
                <p className="text-foreground mt-4">
                  <span className="text-primary">→</span> Dashboard: <span className="text-primary underline">http://localhost:4000</span>
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
    </section>
  );
};

export default HeroSection;
