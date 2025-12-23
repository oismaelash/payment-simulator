const gateways = [
  { name: "Abacatepay", logoSrc: "/gateways/abacatepay.svg", alt: "Abacatepay logo" },
  { name: "Stripe", logoSrc: "/gateways/stripe.svg", alt: "Stripe logo" },
  { name: "Mercado Pago", logoSrc: "/gateways/mercadopago.svg", alt: "Mercado Pago logo" },
  { name: "Asaas", logoSrc: "/gateways/asaas.svg", alt: "Asaas logo" },
  { name: "Pagar.me", logoSrc: "/gateways/pagarme.svg", alt: "Pagar.me logo" },
];

const SupportedGatewaysSection = () => {
  return (
    <section id="gateways" className="section-padding relative">
      <div className="section-container relative z-10">
        <div className="text-center mb-12">
          <p className="text-primary font-mono text-sm mb-4">// SUPPORTED PLATFORMS</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Payment gateways you can simulate
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Test webhooks and integrations for these platforms locally, without API keys or external services.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {gateways.map((gateway) => (
            <div
              key={gateway.name}
              className="feature-card flex flex-col items-center justify-center p-6 hover:border-primary/50 transition-all duration-300"
            >
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportedGatewaysSection;

