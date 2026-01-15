import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const gateways = [
  { name: "AbacatePay", logoSrc: "/gateways/abacatepay.svg", alt: "Abacatepay logo", link: null },
  { name: "Stripe", logoSrc: "/gateways/stripe.svg", alt: "Stripe logo", link: null },
  { name: "Mercado Pago", logoSrc: "/gateways/mercadopago.png", alt: "Mercado Pago logo", link: null },
  { name: "Asaas", logoSrc: "/gateways/asaas.svg", alt: "Asaas logo", link: null },
  { name: "Pagar.me", logoSrc: "/gateways/pagarme.png", alt: "Pagar.me logo", link: null },
  { name: "Pague.dev", logoSrc: "/gateways/paguedev.svg", alt: "Pague.dev logo", link: "/pague-dev" },
];

const SupportedGatewaysSection = () => {
  const { t } = useTranslation();
  return (
    <section id="gateways" className="section-padding relative">
      <div className="section-container relative z-10">
        <div className="text-center mb-12">
          <p className="text-primary font-mono text-sm mb-4">{t("gateways.sectionLabel")}</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            {t("gateways.title")}
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            {t("gateways.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {gateways.map((gateway) => {
            const CardContent = (
              <>
                <div className="mb-4 flex items-center justify-center h-12 w-full">
                  <img
                    src={gateway.logoSrc}
                    alt={gateway.alt}
                    className="h-8 w-auto max-w-full object-contain opacity-90 hover:opacity-100 transition-opacity"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback: show text if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".fallback-text")) {
                        const fallback = document.createElement("div");
                        fallback.className = "fallback-text text-sm text-muted-foreground font-medium";
                        fallback.textContent = gateway.name;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground font-medium text-center">
                  {gateway.name}
                </p>
              </>
            );

            if (gateway.link) {
              return (
                <Link
                  key={gateway.name}
                  to={gateway.link}
                  className="feature-card flex flex-col items-center justify-center p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                >
                  {CardContent}
                </Link>
              );
            }

            return (
              <div
                key={gateway.name}
                className="feature-card flex flex-col items-center justify-center p-6 hover:border-primary/50 transition-all duration-300"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SupportedGatewaysSection;

