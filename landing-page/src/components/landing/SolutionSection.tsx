import { Server, Webhook, Settings, MonitorPlay } from "lucide-react";
import { useTranslation } from "react-i18next";

const SolutionSection = () => {
  const { t } = useTranslation();
  
  const solutions = [
    {
      icon: Server,
      titleKey: "solution.items.localSimulator.title",
      descriptionKey: "solution.items.localSimulator.description",
    },
    {
      icon: Webhook,
      titleKey: "solution.items.realisticWebhooks.title",
      descriptionKey: "solution.items.realisticWebhooks.description",
    },
    {
      icon: MonitorPlay,
      titleKey: "solution.items.visualDashboard.title",
      descriptionKey: "solution.items.visualDashboard.description",
    },
  ];
  return (
    <section id="solution" className="section-padding">
      <div className="section-container">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">{t("solution.sectionLabel")}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("solution.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("solution.subtitle")}
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
              <h3 className="text-lg font-semibold mb-2">{t(solution.titleKey)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(solution.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
