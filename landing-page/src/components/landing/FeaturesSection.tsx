import { Check, Sparkles } from "lucide-react";

const openSourceFeatures = [
  "Local payment simulator",
  "Pix & Credit Card support",
  "Stripe, Mercado Pago, Pagar.me",
  "Webhook sender with retries",
  "Firebase Emulator-inspired UI",
  "CLI for automation",
  "Docker support",
  "Self-hostable",
];

const proFeatures = [
  "Advanced failure scenarios",
  "Event reordering simulation",
  "Network failure simulation",
  "Chargeback timelines",
  "Multi-project support",
  "Export logs & reports",
  "Team collaboration",
  "Priority support",
];

const FeaturesSection = () => {
  return (
    <section id="features" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">// FEATURES</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Free forever. Pro when you need it.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The core is open source and always will be. Pro unlocks advanced testing scenarios.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Open Source */}
          <div className="feature-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-success/10 border border-success/20">
                <Check className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Open Source</h3>
                <p className="text-muted-foreground text-sm">Free forever • Apache 2.0</p>
              </div>
            </div>
            
            <ul className="space-y-3">
              {openSourceFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="feature-card border-primary/30 bg-gradient-to-br from-card to-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Pro</h3>
                <p className="text-muted-foreground text-sm">For teams & advanced testing</p>
              </div>
            </div>
            
            <ul className="space-y-3">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
