
import React from "react";
import { Link } from "react-router-dom";

export function SimpleFooter() {
  return (
    <footer className="bg-secondary/20 border-t border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link to="/" className="mb-2 md:mb-0">
            <span className="text-lg font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              TryPie
            </span>
          </Link>
          
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TryPie. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
