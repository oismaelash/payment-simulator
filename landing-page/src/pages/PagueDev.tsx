import { useTranslation } from "react-i18next";
import Navbar from "@/components/landing/Navbar";
import PagueDevHero from "@/components/landing/PagueDevHero";
import PagueDevInstallSection from "@/components/landing/PagueDevInstallSection";
import PagueDevEventsSection from "@/components/landing/PagueDevEventsSection";
import PagueDevPayloadsSection from "@/components/landing/PagueDevPayloadsSection";
import Footer from "@/components/landing/Footer";
import CTASection from "@/components/landing/CTASection";
import { 
  CreditCard, 
  Webhook, 
  Settings2, 
  Globe,
  CheckCircle2,
  TrendingUp,
  RefreshCw
} from "lucide-react";

const PagueDev = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Globe,
      titleKey: "paguedev.about.features.brazilian.title",
      descriptionKey: "paguedev.about.features.brazilian.description",
    },
    {
      icon: CreditCard,
      titleKey: "paguedev.about.features.pix.title",
      descriptionKey: "paguedev.about.features.pix.description",
    },
    {
      icon: TrendingUp,
      titleKey: "paguedev.about.features.withdrawals.title",
      descriptionKey: "paguedev.about.features.withdrawals.description",
    },
    {
      icon: RefreshCw,
      titleKey: "paguedev.about.features.refunds.title",
      descriptionKey: "paguedev.about.features.refunds.description",
    },
  ];

  const steps = [
    {
      numberKey: "paguedev.howToUse.steps.selectGateway.number",
      titleKey: "paguedev.howToUse.steps.selectGateway.title",
      descriptionKey: "paguedev.howToUse.steps.selectGateway.description",
      icon: CreditCard,
    },
    {
      numberKey: "paguedev.howToUse.steps.configureWebhook.number",
      titleKey: "paguedev.howToUse.steps.configureWebhook.title",
      descriptionKey: "paguedev.howToUse.steps.configureWebhook.description",
      icon: Settings2,
    },
    {
      numberKey: "paguedev.howToUse.steps.selectEvent.number",
      titleKey: "paguedev.howToUse.steps.selectEvent.title",
      descriptionKey: "paguedev.howToUse.steps.selectEvent.description",
      icon: Webhook,
    },
    {
      numberKey: "paguedev.howToUse.steps.test.number",
      titleKey: "paguedev.howToUse.steps.test.title",
      descriptionKey: "paguedev.howToUse.steps.test.description",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <PagueDevHero />
        
        <PagueDevInstallSection />
        
        {/* About Section */}
        <section id="paguedev-about" className="section-padding relative">
          <div className="section-container">
            <div className="text-center mb-16">
              <p className="text-primary font-mono text-sm mb-4">{t("paguedev.about.sectionLabel")}</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {t("paguedev.about.title")}
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-8">
                {t("paguedev.about.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="feature-card text-center group"
                >
                  <div className="inline-flex p-4 rounded-xl bg-primary/10 border border-primary/20 mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PagueDevEventsSection />
        <PagueDevPayloadsSection />

        {/* How to Use Section */}
        <section id="paguedev-how-to-use" className="section-padding relative">
          <div className="absolute inset-0 bg-dot-pattern opacity-20" />
          
          <div className="section-container relative z-10">
            <div className="text-center mb-16">
              <p className="text-primary font-mono text-sm mb-4">{t("paguedev.howToUse.sectionLabel")}</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {t("paguedev.howToUse.title")}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t("paguedev.howToUse.subtitle")}
              </p>
            </div>

            <div className="relative">
              <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-280px)] max-w-[1000px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              
              <div className="flex flex-wrap justify-center gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative w-full md:w-[calc(50%-16px)] lg:w-[calc(25%-24px)] max-w-[280px]">
                    <div className="feature-card h-full relative z-10">
                      <span className="text-5xl font-bold text-primary/20 font-mono absolute top-4 right-4">
                        {t(step.numberKey)}
                      </span>
                      
                      <div className="p-3 rounded-lg bg-secondary border border-border inline-flex mb-4">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{t(step.titleKey)}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {t(step.descriptionKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default PagueDev;
