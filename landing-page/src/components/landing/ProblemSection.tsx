import { AlertTriangle, RefreshCw, Clock, Shuffle } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Hard to test webhooks locally",
    description: "Ngrok tunnels, fake payloads, and prayer. The classic combo for testing payment integrations.",
  },
  {
    icon: Shuffle,
    title: "Different gateways, different payloads",
    description: "Stripe, Mercado Pago, Pagar.me — each with their own format, quirks, and edge cases.",
  },
  {
    icon: Clock,
    title: "No way to simulate failures",
    description: "How do you test a chargeback? A timeout? A delayed notification? You don't. Until now.",
  },
  {
    icon: RefreshCw,
    title: "Manual hacks and workarounds",
    description: "Copy-pasting payloads, faking signatures, hardcoding test data. It works until it doesn't.",
  },
];

const ProblemSection = () => {
  return (
    <section id="problem" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">// THE PROBLEM</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Testing payments locally is a nightmare
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every backend developer knows the pain. Here's what you're dealing with.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <div 
              key={index} 
              className="feature-card group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 group-hover:bg-destructive/20 transition-colors">
                  <problem.icon className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
