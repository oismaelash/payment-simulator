import { CheckCircle2, XCircle, ArrowRight, Zap, Globe, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ComparisonSection = () => {
  const { t } = useTranslation();

  const scrollToHero = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const comparisonCards = [
    {
      titleKey: "comparison.cards.paymentSimulator.title",
      taglineKey: "comparison.cards.paymentSimulator.tagline",
      features: [
        { textKey: "comparison.cards.paymentSimulator.features.events", positive: true },
        { textKey: "comparison.cards.paymentSimulator.features.payloads", positive: true },
        { textKey: "comparison.cards.paymentSimulator.features.scenarios", positive: true },
        { textKey: "comparison.cards.paymentSimulator.features.businessLogic", positive: true },
      ],
      footerKey: "comparison.cards.paymentSimulator.footer",
      icon: Zap,
      highlighted: true,
    },
    {
      titleKey: "comparison.cards.ngrok.title",
      taglineKey: "comparison.cards.ngrok.tagline",
      features: [
        { textKey: "comparison.cards.ngrok.features.publicUrl", positive: true },
        { textKey: "comparison.cards.ngrok.features.receiveWebhooks", positive: true },
        { textKey: "comparison.cards.ngrok.features.noSimulation", positive: false },
        { textKey: "comparison.cards.ngrok.features.noPayloads", positive: false },
      ],
      footerKey: "comparison.cards.ngrok.footer",
      icon: Globe,
      highlighted: false,
    },
    {
      titleKey: "comparison.cards.webhookSite.title",
      taglineKey: "comparison.cards.webhookSite.tagline",
      features: [
        { textKey: "comparison.cards.webhookSite.features.receiveHttp", positive: true },
        { textKey: "comparison.cards.webhookSite.features.inspect", positive: true },
        { textKey: "comparison.cards.webhookSite.features.noEvents", positive: false },
        { textKey: "comparison.cards.webhookSite.features.noDomain", positive: false },
      ],
      footerKey: "comparison.cards.webhookSite.footer",
      icon: Mail,
      highlighted: false,
    },
  ];

  const checklistItems = [
    "comparison.checklist.testScenarios",
    "comparison.checklist.developWithoutSandbox",
    "comparison.checklist.simulateNationalGateways",
    "comparison.checklist.createPredictableTests",
  ];

  return (
    <section id="comparison" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/10 to-transparent" />
      
      <div className="section-container relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">{t("comparison.eyebrow")}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("comparison.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("comparison.subtitle")}
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {comparisonCards.map((card, index) => (
            <Card
              key={index}
              className={`h-full flex flex-col transition-all duration-300 ${
                card.highlighted
                  ? "border-primary/50 bg-primary/5 hover:border-primary/70 hover:glow-sm"
                  : "hover:border-primary/30"
              }`}
            >
              <CardHeader className="relative">
                {card.highlighted && (
                  <Badge className="absolute top-4 right-4" variant="default">
                    {t("comparison.recommended")}
                  </Badge>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    card.highlighted 
                      ? "bg-primary/20 border border-primary/30" 
                      : "bg-secondary border border-border"
                  }`}>
                    <card.icon className={`w-5 h-5 ${
                      card.highlighted ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <CardTitle className="text-xl">{t(card.titleKey)}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t(card.taglineKey)}
                </p>
              </CardHeader>
              
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {card.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      {feature.positive ? (
                        <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        feature.positive ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {t(feature.textKey)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  {t(card.footerKey)}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Full-width one-liner */}
        <div className="w-full bg-secondary/30 border-y border-border py-8 mb-16">
          <div className="section-container">
            <p className="text-center text-lg md:text-xl font-semibold">
              {t("comparison.oneLiner")}
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {t("comparison.checklist.title")}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {checklistItems.map((itemKey, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{t(itemKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="hero" size="xl" onClick={scrollToHero}>
            {t("comparison.cta.text")}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;

