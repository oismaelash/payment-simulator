import { Terminal, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { GITHUB_URL } from "@/config/env";

const CTASection = () => {
  const { t } = useTranslation();
  const scrollToHero = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="cta" className="section-padding relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="section-container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            {t("cta.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={scrollToHero}>
              <Terminal className="w-5 h-5" />
              {t("cta.getStarted")}
            </Button>
            <Button 
              variant="hero-outline" 
              size="xl"
              onClick={() => window.open(GITHUB_URL, "_blank", "noopener,noreferrer")}
            >
              <Github className="w-5 h-5" />
              {t("cta.viewOnGitHub")}
            </Button>
          </div>

          <p className="text-muted-foreground text-sm mt-8">
            {t("cta.tagline")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
