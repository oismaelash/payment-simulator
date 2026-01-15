import { Zap, WifiOff, KeyRound, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

const DeveloperExperienceSection = () => {
  const { t } = useTranslation();
  
  const dxFeatures = [
    {
      icon: Zap,
      titleKey: "developerExperience.items.fastSetup.title",
      descriptionKey: "developerExperience.items.fastSetup.description",
    },
    {
      icon: KeyRound,
      titleKey: "developerExperience.items.noSignup.title",
      descriptionKey: "developerExperience.items.noSignup.description",
    },
    {
      icon: WifiOff,
      titleKey: "developerExperience.items.worksOffline.title",
      descriptionKey: "developerExperience.items.worksOffline.description",
    },
    {
      icon: Clock,
      titleKey: "developerExperience.items.instantFeedback.title",
      descriptionKey: "developerExperience.items.instantFeedback.description",
    },
  ];
  return (
    <section id="dx" className="section-padding">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary font-mono text-sm mb-4">{t("developerExperience.sectionLabel")}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("developerExperience.title")}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {t("developerExperience.subtitle")}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {dxFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary border border-border">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{t(feature.titleKey)}</h4>
                    <p className="text-muted-foreground text-xs mt-1">{t(feature.descriptionKey)}</p>
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
              <span className="text-xs text-muted-foreground ml-2">{t("developerExperience.terminal")}</span>
            </div>
            <div className="p-6 text-left">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">$</span>
                <span className="text-foreground">curl -fsSL https://paymentsimulator.com/install.sh | bash</span>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-success">✓</span> Starting Payment Simulator v1.0.1
                </p>
                <p className="text-foreground mt-4">
                  <span className="text-primary">→</span> Dashboard: <span className="text-primary underline">http://localhost:4001</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeveloperExperienceSection;
