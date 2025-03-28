
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, User, LayoutDashboard, Plane, Camera, Users } from "lucide-react";

export function MobileMenu() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  // Navigation items - Updated to match desktop nav
  const navItems = [
    { title: "Dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" />, path: "/dashboard" },
    { title: "Plan Trip", icon: <Plane className="w-4 h-4 mr-2" />, path: "/create-trip" },
    { title: "Community", icon: <Camera className="w-4 h-4 mr-2" />, path: "/community" },
    { title: "Groups", icon: <Users className="w-4 h-4 mr-2" />, path: "/groups" },
  ];

  // Check if we're on the landing page
  const isLandingPage = location.pathname === "/";
  // Check if we're on login or signup pages
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md py-4 px-4 border-t border-border animate-fade-in">
      {currentUser ? (
        <nav className="flex flex-col space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className={`text-sm font-medium flex items-center px-4 py-2 rounded-md ${
                location.pathname === item.path 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted"
              } transition-colors`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
          <Link
            to="/notifications"
            className="text-sm font-medium flex items-center px-4 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Link>
          <Link
            to="/profile"
            className="text-sm font-medium flex items-center px-4 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <User className="w-4 h-4 mr-2" />
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
      ) : isLandingPage ? (
        <nav className="flex flex-col space-y-3">
          {[
            { name: "Features", href: "#features" },
            { name: "About", href: "#about" },
            { name: "Contact", href: "#contact" }
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
            >
              {item.name}
            </a>
          ))}
          <div className="flex flex-col space-y-2 pt-2 border-t border-border">
            <Button variant="ghost" className="justify-start" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button className="w-full" asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </nav>
      ) : isAuthPage ? (
        <nav className="flex flex-col space-y-3">
          <Link 
            to="/"
            className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
          >
            Home
          </Link>
          {location.pathname === "/login" ? (
            <Button className="w-full" asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          ) : (
            <Button className="w-full" asChild>
              <Link to="/login">Log in</Link>
            </Button>
          )}
        </nav>
      ) : (
        <nav className="flex flex-col space-y-3">
          <Link 
            to="/"
            className="text-sm font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
          >
            Home
          </Link>
          <div className="flex flex-col space-y-2 pt-2 border-t border-border">
            <Button variant="ghost" className="justify-start" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button className="w-full" asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
