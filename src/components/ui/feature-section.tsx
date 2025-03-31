
import React from "react";
import { useInView, generateStaggerDelay } from "@/lib/animations";
import { 
  MapPin, 
  Camera, 
  Users, 
  Calendar, 
  CreditCard, 
  Star, 
  Compass, 
  Map,
  Globe,
  Plane
} from "lucide-react";

const features = [
  {
    title: "Smart Travel Planning",
    description: "Plan your journey with personalized recommendations based on your preferences and travel style. Our AI-powered suggestions help you create the perfect itinerary.",
    icon: Calendar,
  },
  {
    title: "Photo & Experience Sharing",
    description: "Capture and share your favorite travel moments and experiences with friends and other travelers. Create beautiful travel albums and stories.",
    icon: Camera,
  },
  {
    title: "Group Travel Coordination",
    description: "Easily coordinate travel plans with friends and family, ensuring everyone stays on the same page with shared itineraries and real-time updates.",
    icon: Users,
  },
  {
    title: "Location Discovery",
    description: "Discover hidden gems and popular attractions with our curated location database featuring reviews from travelers just like you.",
    icon: MapPin,
  },
  {
    title: "Budget Management",
    description: "Keep track of all your travel expenses and split costs with travel companions. Set budgets and receive spending insights to help you save.",
    icon: CreditCard,
  },
  {
    title: "Interactive Maps",
    description: "Visualize your trip with interactive maps showing your planned route, points of interest, and recommended detours along the way.",
    icon: Map,
  },
  {
    title: "Travel Guides",
    description: "Access detailed guides for destinations worldwide, with tips on local customs, transportation options, and must-see attractions.",
    icon: Compass,
  },
  {
    title: "Global Community",
    description: "Connect with fellow travelers around the world to exchange tips, stories, and recommendations for authentic travel experiences.",
    icon: Globe,
  },
];

export function FeatureSection() {
  const { ref, isInView } = useInView();
  
  return (
    <section 
      id="features"
      ref={ref}
      className="py-20 md:py-32 bg-gradient-to-b from-white to-secondary/30 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className={`transition-all duration-500 ${isInView ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-3 py-1 space-x-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Plane size={14} className="mr-1" />
              <span>TryPie Features</span>
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
              className="feature-card group"
              style={{
                transitionDelay: isInView ? generateStaggerDelay(index) : '0s',
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease'
              }}
            >
              <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        
        {/* New "Why Choose TryPie" section */}
        <div className="mt-24 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-border">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-3 py-1 space-x-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Star size={14} className="mr-1" />
              <span>Why Choose TryPie</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">The Ultimate Travel Companion</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "All-in-One Platform",
                description: "Plan, share, and coordinate your travels in a single app without jumping between different tools."
              },
              {
                title: "User-Friendly Design",
                description: "Intuitive interface that makes travel planning enjoyable rather than a chore."
              },
              {
                title: "Travel Community",
                description: "Connect with like-minded travelers and locals for authentic recommendations."
              },
              {
                title: "Offline Access",
                description: "Access your travel plans and maps even without an internet connection."
              }
            ].map((item, index) => (
              <div 
                key={item.title} 
                className="flex items-start p-4 rounded-xl hover:bg-primary/5 transition-colors"
                style={{
                  transitionDelay: isInView ? generateStaggerDelay(index + features.length) : '0s',
                  opacity: isInView ? 1 : 0,
                  transform: isInView ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease'
                }}
              >
                <div className="mr-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
