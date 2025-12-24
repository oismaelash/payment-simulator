import { AlertTriangle, RefreshCw, Clock, Shuffle } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProblemSection = () => {
  const { t } = useTranslation();
  
  const problems = [
    {
      icon: AlertTriangle,
      titleKey: "problem.items.webhooks.title",
      descriptionKey: "problem.items.webhooks.description",
    },
    {
      icon: Shuffle,
      titleKey: "problem.items.differentGateways.title",
      descriptionKey: "problem.items.differentGateways.description",
    },
    {
      icon: Clock,
      titleKey: "problem.items.failures.title",
      descriptionKey: "problem.items.failures.description",
    },
    {
      icon: RefreshCw,
      titleKey: "problem.items.manualHacks.title",
      descriptionKey: "problem.items.manualHacks.description",
    },
  ];
  return (
    <section id="problem" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">{t("problem.sectionLabel")}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("problem.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("problem.subtitle")}
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
                  <h3 className="text-lg font-semibold mb-2">{t(problem.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(problem.descriptionKey)}
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
