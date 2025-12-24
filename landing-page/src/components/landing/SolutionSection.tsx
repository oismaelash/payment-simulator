import { Server, Webhook, Settings, MonitorPlay } from "lucide-react";

const solutions = [
  {
    icon: Server,
    title: "Local simulator",
    description: "Run a complete payment gateway simulator on your machine. No external dependencies.",
  },
  {
    icon: Webhook,
    title: "Realistic webhooks",
    description: "Receive actual payloads from Stripe, Mercado Pago, Pagar.me formats. Exactly like production.",
  },
  // {
  //   icon: Settings,
  //   title: "Configurable scenarios",
  //   description: "Simulate delays, retries, failures, and edge cases. Control every aspect of the flow.",
  // },
  {
    icon: MonitorPlay,
    title: "Visual dashboard",
    description: "Firebase Emulator-inspired UI. See payments, webhooks, and logs in real-time.",
  },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="section-padding">
      <div className="section-container">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">// THE SOLUTION</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            One tool. All gateways. Zero setup.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Payment Simulator brings the entire payment testing workflow to your local machine.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mx-auto w-full" style={{maxWidth: "900px"}}>
          {solutions.map((solution, index) => (
            <div 
              key={index} 
              className="feature-card text-center group w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-[250px]"
            >
              <div className="inline-flex p-4 rounded-xl bg-primary/10 border border-primary/20 mb-4 group-hover:bg-primary/20 transition-colors">
                <solution.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{solution.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
