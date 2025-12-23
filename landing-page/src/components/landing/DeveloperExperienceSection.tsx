import { Zap, WifiOff, KeyRound, Clock } from "lucide-react";

const dxFeatures = [
  {
    icon: Zap,
    title: "Fast setup",
    description: "One command to start. No complex configuration needed.",
  },
  {
    icon: KeyRound,
    title: "No signup required",
    description: "No accounts, no API keys, no tracking. Just download and run.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    description: "Test payment flows without internet. Perfect for airplanes and cafes.",
  },
  {
    icon: Clock,
    title: "Instant feedback",
    description: "See webhooks as they're sent. Debug in real-time.",
  },
];

const DeveloperExperienceSection = () => {
  return (
    <section id="dx" className="section-padding">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary font-mono text-sm mb-4">// DEVELOPER EXPERIENCE</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Built for developers who value their time
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We've been there. Hours wasted setting up payment testing. 
              That's why we made this stupid simple.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {dxFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary border border-border">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-muted-foreground text-xs mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="code-block terminal-shadow">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">zsh</span>
            </div>
            <div className="p-6 text-sm space-y-4">
              <div>
                <p className="text-muted-foreground"># Install globally</p>
                <p><span className="text-primary">$</span> npm install -g payment-simulator</p>
              </div>
              <div>
                <p className="text-muted-foreground"># Or run with npx</p>
                <p><span className="text-primary">$</span> npx payment-simulator start</p>
              </div>
              <div>
                <p className="text-muted-foreground"># That's it. You're done.</p>
                <p><span className="text-primary">$</span> open http://localhost:4000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeveloperExperienceSection;
