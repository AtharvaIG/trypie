
import React from "react";
import { useInView, generateStaggerDelay } from "@/lib/animations";
import { Users, Camera, MessageSquare, Calendar } from "lucide-react";

const features = [
  {
    title: "Smart Travel Planning",
    description: "Plan your journey with personalized recommendations based on your preferences and travel style.",
    icon: Calendar,
  },
  {
    title: "Photo & Experience Sharing",
    description: "Capture and share your favorite travel moments and experiences with friends and other travelers.",
    icon: Camera,
  },
  {
    title: "Group Travel Coordination",
    description: "Easily coordinate travel plans with friends and family, ensuring everyone stays on the same page.",
    icon: Users,
  },
  {
    title: "Community Connection",
    description: "Connect with fellow travelers, exchange tips, and discover hidden gems through our community.",
    icon: MessageSquare,
  },
];

export function FeatureSection() {
  const { ref, isInView } = useInView();
  
  return (
    <section 
      id="features"
      ref={ref}
      className="py-20 md:py-32 bg-secondary/50"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className={`transition-all duration-500 ${isInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-3 py-1 space-x-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <span>Key Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Transform Your Travel Experience
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how TryPie can enhance your journey with these powerful features designed for the modern traveler.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="feature-card"
              style={{
                transitionDelay: isInView ? generateStaggerDelay(index) : '0s',
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease'
              }}
            >
              <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
