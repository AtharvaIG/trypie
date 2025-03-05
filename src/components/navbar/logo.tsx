
import React from "react";
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link 
      to="/" 
      className="flex items-center space-x-2"
    >
      <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
        Wanderly
      </span>
    </Link>
  );
}
