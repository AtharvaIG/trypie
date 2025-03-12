
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MobileMenu } from "./mobile-menu";
import { DesktopNav } from "./desktop-nav";
import { UserMenu } from "./user-menu";
import { Logo } from "./logo";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();
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

  // Check if we're on the landing page
  const isLandingPage = location.pathname === "/";
  // Check if we're on login or signup pages
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-3 bg-white/80 backdrop-blur-md shadow-sm" : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Logo />
        
        {currentUser ? (
          <DesktopNav />
        ) : isLandingPage ? (
          <div className="hidden md:flex items-center space-x-8">
            {["Features", "About", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        ) : null}

        {currentUser ? (
          <UserMenu />
        ) : isLandingPage ? (
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Sign up
            </Link>
          </div>
        ) : isAuthPage ? (
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Home
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/login" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Log in
            </Link>
          </div>
        )}
        
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
        <MobileMenu />
      )}
    </header>
  );
}
