'use client'

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/types';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export const Header: React.FC = () => {
  const { data: session } = useSession();
  
  useEffect(() => {
    console.log('Current session user:', session?.user);
  }, [session]);

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
            {session?.user ? (
              <Link href="/profile">
                <Image
                  src={session.user.image || ''}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};