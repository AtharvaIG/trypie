
import React from "react";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { FeatureSection } from "@/components/ui/feature-section";
import { AuthForm } from "@/components/ui/auth-form";
import { Footer } from "@/components/ui/footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      
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
