
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HeroSection } from "@/components/ui/hero-section";
import { FeatureSection } from "@/components/ui/feature-section";
import { AuthForm } from "@/components/ui/auth-form";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Plane, Users, CreditCard, Heart, Map, Globe, CalendarCheck, Star } from "lucide-react";
import { useInView } from "@/lib/animations";
import { Scene3D } from "@/components/ui/scene3d";

// Testimonial component
const Testimonial = ({ quote, author, role, imageSrc }: { 
  quote: string; 
  author: string; 
  role: string; 
  imageSrc: string; 
}) => {
  const { ref, isInView } = useInView();
  
  return (
    <div 
      ref={ref} 
      className={`bg-white p-6 rounded-xl shadow-sm border border-border transition-all duration-500 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <Star className="h-5 w-5 text-yellow-500 inline-block" />
          <Star className="h-5 w-5 text-yellow-500 inline-block" />
          <Star className="h-5 w-5 text-yellow-500 inline-block" />
          <Star className="h-5 w-5 text-yellow-500 inline-block" />
          <Star className="h-5 w-5 text-yellow-500 inline-block" />
        </div>
        <p className="text-muted-foreground italic mb-4 flex-grow">"{quote}"</p>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/70 mr-3 flex items-center justify-center text-white font-bold">
            {author.charAt(0)}
          </div>
          <div>
            <h4 className="font-medium">{author}</h4>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Animated statistic component
const AnimatedStat = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => {
  const { ref, isInView } = useInView();
  
  return (
    <div 
      ref={ref} 
      className={`text-center transition-all duration-700 ${
        isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
};

// Feature with icon component
const IconFeature = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => {
  const { ref, isInView } = useInView();
  
  return (
    <div 
      ref={ref} 
      className={`flex transition-all duration-500 ${
        isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
      }`}
    >
      <div className="mt-1 mr-4 flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// Scrolling animation for 3D scene
const ScrollScene = () => {
  const { ref, isInView } = useInView();
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const element = ref.current;
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollFactor = Math.max(0, Math.min(1, 1 - (rect.top / window.innerHeight)));
        setScrollY(scrollFactor * 500);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);
  
  return (
    <div ref={ref} className="h-[50vh] md:h-[70vh] relative overflow-hidden rounded-2xl border border-primary/10 shadow-lg">
      <Scene3D className="w-full h-full" scrollY={scrollY} />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-70 pointer-events-none"></div>
    </div>
  );
};

const Index = () => {
  const { currentUser } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Stats section */}
      <section className="py-12 bg-gradient-to-b from-white to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat value="50K+" label="Happy Travelers" icon={<Users size={24} />} />
            <AnimatedStat value="100+" label="Countries" icon={<Globe size={24} />} />
            <AnimatedStat value="10K+" label="Trips Planned" icon={<Map size={24} />} />
            <AnimatedStat value="4.9" label="User Rating" icon={<Star size={24} />} />
          </div>
        </div>
      </section>
      
      <section id="features">
        <FeatureSection />
      </section>
      
      {/* How it works section with 3D animation */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 space-x-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <span>How TryPie Works</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Plan Your Next Adventure
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience travel planning like never before with our intuitive platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <IconFeature 
                icon={<CalendarCheck size={20} />}
                title="Create Your Trip Plan"
                description="Start by setting your destinations, dates, and preferences for a personalized travel experience."
              />
              <IconFeature 
                icon={<Users size={20} />}
                title="Invite Travel Companions"
                description="Share your trip with friends and family for collaborative planning and shared experiences."
              />
              <IconFeature 
                icon={<Map size={20} />}
                title="Discover Local Experiences"
                description="Browse curated recommendations for activities, restaurants, and hidden gems from locals and fellow travelers."
              />
              <IconFeature 
                icon={<CreditCard size={20} />}
                title="Manage Travel Expenses"
                description="Keep track of your budget and split expenses easily with your travel companions."
              />
            </div>
            
            <div>
              <ScrollScene />
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 space-x-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <span>Traveler Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover how TryPie has transformed travel experiences for adventurers around the world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Testimonial 
              quote="TryPie made planning our family vacation so easy! We could all collaborate on the itinerary and keep track of our expenses." 
              author="Sarah Johnson"
              role="Family Traveler"
              imageSrc="/avatar-1.jpg"
            />
            <Testimonial 
              quote="As a solo traveler, I love the community features. I've connected with other travelers and discovered amazing hidden spots." 
              author="Miguel Rodriguez"
              role="Solo Adventurer"
              imageSrc="/avatar-2.jpg"
            />
            <Testimonial 
              quote="The expense tracking feature saved our friendships! No more awkward money conversations during our group trips." 
              author="Emma Chen"
              role="Group Travel Organizer"
              imageSrc="/avatar-3.jpg"
            />
          </div>
        </div>
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
                
                {currentUser ? (
                  <Button size="lg" asChild>
                    <Link to="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" asChild>
                    <Link to="/signup">
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              
              <div>
                {!currentUser && <AuthForm type="register" />}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section id="about" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">About TryPie</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're passionate about making travel planning easier and more enjoyable for everyone.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-12">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Our Mission</h3>
                <p className="text-muted-foreground">
                  At TryPie, we believe that travel should be accessible, enjoyable, and stress-free. 
                  Our platform is designed to simplify every aspect of travel planning, from discovering 
                  new destinations to managing expenses with friends.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Our Story</h3>
                <p className="text-muted-foreground">
                  Founded by a group of travel enthusiasts who were frustrated with the complexity of 
                  planning trips, TryPie was born from a desire to create a single platform that addresses 
                  all aspects of travel planning and sharing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Get in Touch</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Have questions or suggestions? We'd love to hear from you!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Map size={20} />
                </div>
                <h3 className="font-bold mb-2">Our Location</h3>
                <p className="text-muted-foreground">123 Travel Street<br />Adventure City, AC 10001</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Globe size={20} />
                </div>
                <h3 className="font-bold mb-2">Email Us</h3>
                <p className="text-muted-foreground">hello@trypie.com<br />support@trypie.com</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Heart size={20} />
                </div>
                <h3 className="font-bold mb-2">Follow Us</h3>
                <p className="text-muted-foreground">@TryPie on all platforms<br />Join our community</p>
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
