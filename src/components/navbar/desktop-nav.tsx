
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Plane, Camera, Users } from "lucide-react";

export function DesktopNav() {
  const location = useLocation();
  
  // Navigation items
  const navItems = [
    { title: "Home", icon: <Home className="w-4 h-4 mr-2" />, path: "/" },
    { title: "Plan Trip", icon: <Plane className="w-4 h-4 mr-2" />, path: "/create-trip" },
    { title: "Community", icon: <Camera className="w-4 h-4 mr-2" />, path: "/community" },
    { title: "Groups", icon: <Users className="w-4 h-4 mr-2" />, path: "/groups" },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.title}
          to={item.path}
          className={`text-sm font-medium flex items-center ${
            location.pathname === item.path 
              ? "text-primary" 
              : "text-foreground/80 hover:text-primary"
          } transition-colors`}
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}
