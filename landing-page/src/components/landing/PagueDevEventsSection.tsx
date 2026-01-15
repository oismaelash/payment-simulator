import { CheckCircle, RefreshCw, TrendingUp, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const PagueDevEventsSection = () => {
  const { t } = useTranslation();

  const events = [
    {
      name: "payment_completed",
      titleKey: "paguedev.events.paymentCompleted.title",
      descriptionKey: "paguedev.events.paymentCompleted.description",
      icon: CheckCircle,
      color: "text-success",
    },
    {
      name: "refund_completed",
      titleKey: "paguedev.events.refundCompleted.title",
      descriptionKey: "paguedev.events.refundCompleted.description",
      icon: RefreshCw,
      color: "text-primary",
    },
    {
      name: "withdrawal_completed",
      titleKey: "paguedev.events.withdrawalCompleted.title",
      descriptionKey: "paguedev.events.withdrawalCompleted.description",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      name: "withdrawal_failed",
      titleKey: "paguedev.events.withdrawalFailed.title",
      descriptionKey: "paguedev.events.withdrawalFailed.description",
      icon: XCircle,
      color: "text-destructive",
    },
  ];

  return (
    <section id="paguedev-events" className="section-padding relative">
      <div className="section-container">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">{t("paguedev.events.sectionLabel")}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("paguedev.events.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("paguedev.events.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {events.map((event, index) => (
            <div
              key={index}
              className="feature-card group"
            >
              <div className="flex items-start gap-4">
                <div className={`inline-flex p-3 rounded-lg bg-secondary border border-border ${event.color} opacity-90 group-hover:opacity-100 transition-opacity flex-shrink-0`}>
                  <event.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs font-mono bg-secondary px-2 py-1 rounded text-primary">
                      {event.name}
                    </code>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(event.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(event.descriptionKey)}
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

export default PagueDevEventsSection;
