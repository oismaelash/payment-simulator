import { 
  Code, 
  Plug, 
  Settings, 
  FileEdit, 
  FileText, 
  Terminal, 
  Layout, 
  Database 
} from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Gateway-agnostic core",
    description: "Payloads are sent exactly as defined",
  },
  {
    icon: Plug,
    title: "Gateway adapters",
    description: "Stripe, AbacatePay, Asaas, and Pagar.me e more",
  },
  {
    icon: Settings,
    title: "Configuration gateway",
    description: "URL base, query parameters, and custom headers",
    subItems: [
      "URL base",
      "Query parameters",
      "Custom headers",
    ],
  },
  {
    icon: FileEdit,
    title: "Editable payloads",
    description: "View and edit payload JSON before sending",
    subItems: [
      "View and edit payload JSON before sending",
      "Save edited payloads as reusable templates",
    ],
  },
  {
    icon: FileText,
    title: "Payload templates",
    description: "Create custom payload variants per event",
    subItems: [
      "Create custom payload variants per event",
      "Quickly re-send modified payloads without editing JSON again",
    ],
  },
  {
    icon: Terminal,
    title: "Raw payload support",
    description: "Payloads are sent exactly as defined",
  },
  {
    icon: Layout,
    title: "Simple UI",
    description: "Minimal interface for configuring and triggering webhooks",
  },
  {
    icon: Database,
    title: "In-memory state",
    description: "Persistence layer, perfect for local development",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">// FEATURES</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Free forever.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to test payment webhooks locally, without any restrictions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card text-center group"
            >
              <div className="inline-flex p-4 rounded-xl bg-primary/10 border border-primary/20 mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                {feature.description}
              </p>
              {/* {feature.subItems && feature.subItems.length > 0 && (
                <ul className="text-left mt-3 space-y-1.5">
                  {feature.subItems.map((subItem, subIndex) => (
                    <li key={subIndex} className="text-muted-foreground text-xs flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{subItem}</span>
                    </li>
                  ))}
                </ul>
              )} */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
