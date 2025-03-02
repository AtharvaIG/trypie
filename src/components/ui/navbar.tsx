
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-3 bg-white/80 backdrop-blur-md shadow-sm" : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2"
        >
          <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Wanderly
          </span>
        </Link>
        
        <SignedIn>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/explore"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Explore
            </Link>
            <Link
              to="/create-trip"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Plan Trip
            </Link>
            <Link
              to="/groups"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Groups
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
        
        <SignedOut>
          <nav className="hidden md:flex items-center space-x-8">
            {["Features", "About", "Contact"].map((item) => (
              <Link
                key={item}
                to={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-sm" asChild>
              <Link to="#sign-up">Log in</Link>
            </Button>
            <Button size="sm" className="text-sm" asChild>
              <Link to="#sign-up">Sign up</Link>
            </Button>
          </div>
        </SignedOut>
        
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md py-4 px-4 border-t border-border animate-fade-in">
          <SignedIn>
            <nav className="flex flex-col space-y-3">
              <Link
                to="/dashboard"
                className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/explore"
                className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
              >
                Explore
              </Link>
              <Link
                to="/create-trip"
                className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
              >
                Plan Trip
              </Link>
              <Link
                to="/groups"
                className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
              >
                Groups
              </Link>
              <Link
                to="/profile"
                className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
              >
                Profile
              </Link>
              <div className="pt-2 border-t border-border flex items-center px-4 py-2">
                <UserButton afterSignOutUrl="/" />
                <span className="ml-3 text-sm font-medium">{user?.firstName || "Account"}</span>
              </div>
            </nav>
          </SignedIn>
          
          <SignedOut>
            <nav className="flex flex-col space-y-3">
              {["Features", "About", "Contact"].map((item) => (
                <Link
                  key={item}
                  to={`#${item.toLowerCase()}`}
                  className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  {item}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2 border-t border-border">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="#sign-up">Log in</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="#sign-up">Sign up</Link>
                </Button>
              </div>
            </nav>
          </SignedOut>
        </div>
      )}
    </header>
  );
}
