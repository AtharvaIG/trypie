
import React from "react";
import { useInView } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Scene3D } from "./scene3d";

export function HeroSection() {
  const { ref, isInView } = useInView();
  
  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      <div 
        className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8dHJhdmVsfGVufDB8fHx8MTYyMzY3MDM4Mg&ixlib=rb-4.0.3&q=80&w=2000')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white/90" />
      </div>
      
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className={`space-y-6 transition-all duration-700 ease-out ${isInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-3 py-1 space-x-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Discover the world with us</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
              Travel Simply. <br />
              <span className="text-primary">Experience Richly.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md">
              Plan your perfect journey with our intuitive travel platform that helps you discover, plan, and share memorable experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="button-glow group">
                Get Started
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          
          <div className={`relative transition-all duration-700 delay-200 ease-out ${isInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
            {/* Replace the static image with the 3D scene */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 aspect-square md:aspect-auto md:h-[450px]">
              <Scene3D className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-70 mix-blend-overlay pointer-events-none"></div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 p-4 glass-morphism rounded-xl shadow-lg animate-fade-up">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">✓</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Trusted by</p>
                  <p className="text-foreground font-bold">10,000+ travelers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
