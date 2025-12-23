import { Github, Star, GitFork, Users, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const OpenSourceSection = () => {
  return (
    <section id="open-source" className="section-padding relative">
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      
      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-secondary border border-border mb-8">
            <Github className="w-6 h-6 text-primary" />
          </div>
          
          <p className="text-primary font-mono text-sm mb-4">// OPEN SOURCE</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Built in the open. Powered by the community.
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Licensed under Apache 2.0. Fork it, extend it, contribute back. 
            We believe developer tools should be transparent.
          </p>

          {/* GitHub Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="w-4 h-4 text-warning" />
                <span className="text-2xl font-bold">2.4k</span>
              </div>
              <span className="text-muted-foreground text-sm">Stars</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <GitFork className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold">340</span>
              </div>
              <span className="text-muted-foreground text-sm">Forks</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-success" />
                <span className="text-2xl font-bold">58</span>
              </div>
              <span className="text-muted-foreground text-sm">Contributors</span>
            </div>
          </div>

          {/* License badge */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <Scale className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Apache License 2.0</span>
            </div>
          </div>

          <Button variant="hero-outline" size="lg">
            <Github className="w-5 h-5" />
            Star on GitHub
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OpenSourceSection;
