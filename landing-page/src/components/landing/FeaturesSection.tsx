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
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Code,
      titleKey: "features.items.gatewayAgnostic.title",
      descriptionKey: "features.items.gatewayAgnostic.description",
    },
    {
      icon: Plug,
      titleKey: "features.items.gatewayAdapters.title",
      descriptionKey: "features.items.gatewayAdapters.description",
    },
    {
      icon: Settings,
      titleKey: "features.items.configurationGateway.title",
      descriptionKey: "features.items.configurationGateway.description",
    },
    {
      icon: FileEdit,
      titleKey: "features.items.editablePayloads.title",
      descriptionKey: "features.items.editablePayloads.description",
    },
    {
      icon: FileText,
      titleKey: "features.items.payloadTemplates.title",
      descriptionKey: "features.items.payloadTemplates.description",
    },
    {
      icon: Terminal,
      titleKey: "features.items.rawPayloadSupport.title",
      descriptionKey: "features.items.rawPayloadSupport.description",
    },
    {
      icon: Layout,
      titleKey: "features.items.simpleUI.title",
      descriptionKey: "features.items.simpleUI.description",
    },
    {
      icon: Database,
      titleKey: "features.items.inMemoryState.title",
      descriptionKey: "features.items.inMemoryState.description",
    },
  ];
  return (
    <section id="features" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">{t("features.sectionLabel")}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("features.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("features.subtitle")}
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
              <h3 className="text-lg font-semibold mb-2">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                {t(feature.descriptionKey)}
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
