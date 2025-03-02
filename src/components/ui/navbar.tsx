
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const getUserInitials = () => {
    if (!currentUser?.displayName) return "U";
    const names = currentUser.displayName.split(" ");
    if (names.length === 1) return names[0][0];
    return `${names[0][0]}${names[names.length - 1][0]}`;
  };

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
        
        {currentUser ? (
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
        ) : (
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
        )}

        {currentUser ? (
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" size="icon">
                  <Avatar>
                    <AvatarImage src={currentUser.photoURL || undefined} alt="Profile" />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-sm" asChild>
              <Link to="/#login">Log in</Link>
            </Button>
            <Button size="sm" className="text-sm" asChild>
              <Link to="/#register">Sign up</Link>
            </Button>
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md py-4 px-4 border-t border-border animate-fade-in">
          {currentUser ? (
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
              <div className="pt-2 border-t border-border">
                <Button 
                  variant="ghost" 
                  className="text-sm w-full justify-start"
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </div>
            </nav>
          ) : (
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
                  <Link to="/#login">Log in</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/#register">Sign up</Link>
                </Button>
              </div>
            </nav>
          )}
        </div>
      )}
    </header>
  );
}
