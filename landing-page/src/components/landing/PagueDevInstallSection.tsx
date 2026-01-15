import { Terminal, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const PagueDevInstallSection = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const installCommand = "curl -fsSL https://paymentsimulator.com/install.sh | bash";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="paguedev-install" className="section-padding relative">
      <div className="section-container">
        <div className="text-center mb-12">
          <p className="text-primary font-mono text-sm mb-4">{t("paguedev.install.sectionLabel")}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("paguedev.install.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {t("paguedev.install.subtitle")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="code-block terminal-shadow">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">{t("paguedev.install.terminal")}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t("paguedev.install.copied")}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    {t("paguedev.install.copy")}
                  </>
                )}
              </Button>
            </div>
            {/* Terminal Content */}
            <div className="p-6 text-left">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-primary">$</span>
                <span className="text-foreground font-mono">{installCommand}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-success">✓</span> {t("paguedev.install.installing")}
                </p>
                <p className="text-muted-foreground">
                  <span className="text-success">✓</span> {t("paguedev.install.starting")}
                </p>
                <p className="text-foreground mt-4">
                  <span className="text-primary">→</span> {t("paguedev.install.dashboard")}{" "}
                  <span className="text-primary underline">http://localhost:4001</span>
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="mt-8 p-6 rounded-lg bg-secondary/50 border border-border">
            <h3 className="text-sm font-semibold mb-3">{t("paguedev.install.requirements.title")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t("paguedev.install.requirements.docker")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t("paguedev.install.requirements.curl")}</span>
              </li>
            </ul>
          </div>

          {/* Alternative method */}
          <div className="mt-6 p-6 rounded-lg bg-card border border-border">
            <h3 className="text-sm font-semibold mb-2">{t("paguedev.install.alternative.title")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("paguedev.install.alternative.description")}
            </p>
            <div className="code-block">
              <div className="p-4">
                <pre className="text-xs md:text-sm">
                  <code>{`npm install
npm run build
npm run dev`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PagueDevInstallSection;
