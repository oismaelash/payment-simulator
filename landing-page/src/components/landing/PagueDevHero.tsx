import { useTranslation } from "react-i18next";

const PagueDevHero = () => {
  const { t } = useTranslation();
  
  return (
    <section id="paguedev-hero" className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      
      <div className="section-container relative z-10 text-center py-20">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center justify-center p-4 rounded-xl bg-card border border-border">
            <img
              src="/gateways/paguedev.svg"
              alt="Pague.dev"
              className="h-16 w-auto max-w-full object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
          {/* <span className="text-foreground">{t("paguedev.hero.title")}</span>
          <br /> */}
          <span className="text-gradient">{t("paguedev.hero.titleHighlight")}</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-slide-up delay-100">
          {t("paguedev.hero.subtitle")}
        </p>

        {/* Features badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-up delay-200">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
            <span className="text-sm text-muted-foreground">🇧🇷</span>
            <span className="text-sm font-medium">{t("paguedev.hero.featureBRL")}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
            <span className="text-sm text-muted-foreground">💳</span>
            <span className="text-sm font-medium">{t("paguedev.hero.featurePIX")}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
            <span className="text-sm text-muted-foreground">💰</span>
            <span className="text-sm font-medium">{t("paguedev.hero.featureWithdrawals")}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
            <span className="text-sm text-muted-foreground">↩️</span>
            <span className="text-sm font-medium">{t("paguedev.hero.featureRefunds")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PagueDevHero;
