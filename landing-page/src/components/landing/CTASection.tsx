import { Terminal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section id="cta" className="section-padding relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="section-container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to stop fighting your payment tests?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join thousands of developers who test payments the sane way. 
            Start locally, ship with confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl">
              <Terminal className="w-5 h-5" />
              Get started locally
            </Button>
            <Button variant="hero-outline" size="xl">
              <Sparkles className="w-5 h-5" />
              Explore Pro features
            </Button>
          </div>

          <p className="text-muted-foreground text-sm mt-8">
            No credit card required • Open source • Works offline
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
