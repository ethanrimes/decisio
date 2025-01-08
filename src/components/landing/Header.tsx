import React from 'react';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/types';


export const Header: React.FC = () => {
  const navItems: NavItem[] = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <nav className="h-16 flex items-center justify-between container mx-auto px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            {/* Logo icon here */}
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500">
            Decisio
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="text-gray-600 hover:text-indigo-600"
            >
              {item.label}
            </Button>
          ))}
          <div className="flex items-center gap-3">
            {/* <Button variant="outline" className="flex items-center gap-2">
              Dashboard
            </Button> */}
            <Button>Sign In</Button>
          </div>
        </div>
      </nav>
    </header>
  );
};