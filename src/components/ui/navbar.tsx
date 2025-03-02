
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        
        <nav className="hidden md:flex items-center space-x-8">
          {["Discover", "Features", "About", "Contact"].map((item) => (
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
          <Button variant="ghost" className="text-sm">
            Log in
          </Button>
          <Button size="sm" className="text-sm">
            Sign up
          </Button>
        </div>
        
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md py-4 px-4 border-t border-border animate-fade-down">
          <nav className="flex flex-col space-y-3">
            {["Discover", "Features", "About", "Contact"].map((item) => (
              <Link
                key={item}
                to={`#${item.toLowerCase()}`}
                className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-2 border-t border-border">
              <Button variant="ghost" className="justify-start">
                Log in
              </Button>
              <Button>
                Sign up
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
