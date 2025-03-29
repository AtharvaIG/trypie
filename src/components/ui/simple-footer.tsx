
import React from "react";
import { Link } from "react-router-dom";

export function SimpleFooter() {
  return (
    <footer className="bg-background border-t border-border py-3">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-sm font-medium text-muted-foreground">
            TryPie
          </Link>
          
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TryPie
          </p>
        </div>
      </div>
    </footer>
  );
}
