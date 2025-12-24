import { CreditCard, Webhook, Settings2, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: CreditCard,
    title: "Choose a gateway",
    description: "Select from Stripe, Mercado Pago, Pagar.me, or add your own custom gateway configuration.",
  },
  // {
  //   number: "02",
  //   icon: Settings2,
  //   title: "Create a payment",
  //   description: "Use the dashboard or API to create a simulated Pix or credit card payment with any amount.",
  // },
  {
    number: "02",
    icon: Webhook,
    title: "Configure webhook behavior",
    description: "Set delays, retries, failure rates, or simulate specific scenarios like chargebacks.",
  },
  {
    number: "03",
    icon: ArrowRight,
    title: "Receive real payloads",
    description: "Your local endpoint receives production-identical webhooks. Test your handlers like it's real.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding relative">
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">// HOW IT WORKS</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Four steps to payment testing nirvana
          </h2>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-280px)] max-w-[800px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          <div className="flex flex-wrap justify-center gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-[280px]">
                <div className="feature-card h-full relative z-10">
                  {/* Step number */}
                  <span className="text-5xl font-bold text-primary/20 font-mono absolute top-4 right-4">
                    {step.number}
                  </span>
                  
                  <div className="p-3 rounded-lg bg-secondary border border-border inline-flex mb-4">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="mt-16 code-block p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-sm">
            {/* Simulator */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-primary font-mono text-xs">Sim</span>
              </div>
              <span className="text-muted-foreground text-xs">Simulator</span>
            </div>

            <div className="flex-1 mx-4 flex items-center">
              <div className="flex-1 h-px bg-border" />
              <ArrowRight className="w-4 h-4 text-primary mx-2" />
              <div className="flex-1 h-px bg-border" />
            </div>
            
            {/* Your Code */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center mx-auto mb-2">
                <span className="text-primary font-mono text-xs">App</span>
              </div>
              <span className="text-muted-foreground text-xs">Your Code</span>
            </div>

            <div className="flex-1 mx-4 flex items-center">
              <div className="flex-1 h-px bg-border" />
              <Webhook className="w-4 h-4 text-success mx-2" />
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Webhook */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-success font-mono text-xs">:3000</span>
              </div>
              <span className="text-muted-foreground text-xs">Webhook</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
