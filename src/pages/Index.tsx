
import React from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { FeatureSection } from "@/components/ui/feature-section";
import { AuthForm } from "@/components/ui/auth-form";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <header className="py-4 px-4 md:px-8 border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              TryPie
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Contact
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Log in
            </Link>
            <Button size="sm" asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <HeroSection />
      <section id="features">
        <FeatureSection />
      </section>
      
      <section id="sign-up" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center px-3 py-1 space-x-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <span>Join Us Today</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold">
                  Start Your Travel Journey
                </h2>
                <p className="text-lg text-muted-foreground max-w-md">
                  Create your account to unlock all features and start planning your next adventure with TryPie.
                </p>
                <ul className="space-y-3">
                  {[
                    "Personalized travel recommendations",
                    "Connect with fellow travelers",
                    "Share photos and experiences",
                    "Plan group trips effortlessly"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <AuthForm type="register" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
