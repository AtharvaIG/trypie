
import React, { useRef, useEffect, useState } from "react";
import { useInView } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MousePointer, ChevronDown } from "lucide-react";
import { Scene3D } from "./scene3d";

export function HeroSection() {
  const { ref, isInView } = useInView();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Add scroll indicator class when user scrolls down
      if (window.scrollY > 100 && heroRef.current) {
        heroRef.current.classList.add('scrolled');
      } else if (heroRef.current) {
        heroRef.current.classList.remove('scrolled');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Scroll down handler
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
    >
      {/* Background image with parallax effect */}
      <div 
        className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8dHJhdmVsfGVufDB8fHx8MTYyMzY3MDM4Mg&ixlib=rb-4.0.3&q=80&w=2000')] bg-cover bg-center"
        style={{ 
          transform: `translateY(${scrollY * 0.15}px)`,
          opacity: Math.max(0.2, 1 - scrollY * 0.001) 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white/90" />
      </div>
      
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div 
            className="space-y-6 transition-all duration-700 ease-out"
            style={{ 
              opacity: Math.max(0, 1 - scrollY * 0.002),
              transform: `translateY(${-scrollY * 0.2}px)` 
            }}
            ref={ref}
          >
            <div className={`inline-flex items-center px-3 py-1 space-x-2 rounded-full bg-primary/10 text-primary text-sm font-medium ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: '0.1s' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span>Discover the world with TryPie</span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: '0.3s' }}>
              Travel Simply. <br />
              <span className="text-primary">Experience Richly.</span>
            </h1>
            
            <p className={`text-lg text-muted-foreground max-w-md ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
               style={{ animationDelay: '0.5s' }}>
              Plan your perfect journey with our intuitive travel platform that helps you discover, plan, and share memorable experiences with friends and family.
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-4 pt-4 ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
                 style={{ animationDelay: '0.7s' }}>
              <Button size="lg" className="button-glow group" asChild>
                <Link to="/signup">
                  Get Started
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={scrollToFeatures}>
                Learn More
              </Button>
            </div>
            
            {/* Scroll down indicator */}
            <div className={`hidden md:flex items-center space-x-2 text-sm text-muted-foreground pt-8 animate-pulse cursor-pointer ${scrollY > 100 ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                  onClick={scrollToFeatures}>
              <MousePointer size={14} />
              <span>Scroll down to explore</span>
              <ChevronDown size={14} className="animate-bounce" />
            </div>
          </div>
          
          <div 
            className={`relative ${isInView ? 'animate-scale-in' : 'opacity-0'}`}
            style={{ 
              transform: `translateY(${scrollY * 0.05}px) rotate(${scrollY * 0.01}deg)`,
              animationDelay: '0.5s'
            }}
          >
            {/* Interactive 3D scene that reacts to scrolling */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 aspect-square md:aspect-auto md:h-[500px]">
              <Scene3D className="w-full h-full" scrollY={scrollY} />
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
            
            {/* Stats badge */}
            <div className="absolute -top-2 -right-2 p-3 glass-morphism rounded-xl shadow-lg animate-fade-up"
                 style={{ animationDelay: '0.7s' }}>
              <div className="text-center">
                <p className="text-foreground font-bold text-xl">4.9</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dynamic wave separator */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
          <path 
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" 
            className="fill-white"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`
            }}
          ></path>
        </svg>
      </div>
    </section>
  );
}
