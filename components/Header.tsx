import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { ChevronDownIcon } from './ui/Icons';

interface HeaderProps {
  user: User;
  logout: () => void;
  currentView: 'deliveries' | 'staff';
  setCurrentView: (view: 'deliveries' | 'staff') => void;
}

const Logo = () => (
    <div className="flex items-center">
        <div className="flex-shrink-0">
            <img src="https://www.sardartvpvtltd.com/wp-content/uploads/2025/02/SARDAR-TV-LOGO-1980x929.png" className="w-20 h-15 text-brand-blue mt-1" />
        </div>
    </div>
);


export default function Header({ user, logout, currentView, setCurrentView }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const navButtonClasses = (view: 'deliveries' | 'staff') => 
    `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      currentView === view
        ? 'bg-brand-primary-light text-brand-primary'
        : 'text-brand-text-light hover:text-brand-primary hover:bg-brand-primary-light/50'
    }`;

  return (
    <header className="bg-brand-surface shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Logo />
            <nav className="hidden md:flex items-baseline space-x-8">
              <button onClick={() => setCurrentView('deliveries')} className={navButtonClasses('deliveries')}>
                Deliveries
              </button>
              <button onClick={() => setCurrentView('staff')} className={navButtonClasses('staff')}>
                Staffs
              </button>
            </nav>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-100 focus:outline-none">
              <span className="sr-only">Open user menu</span>
              <div className="h-9 w-9 rounded-full bg-brand-primary flex items-center justify-center text-sm font-semibold text-white">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <ChevronDownIcon className="h-4 w-4 text-brand-text-light" />
            </button>
            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <p className="font-semibold">Signed in as</p>
                        <p className="truncate">{user.email}</p>
                    </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Logout
                    </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
       {/* Mobile Navigation */}
      <div className="md:hidden bg-brand-surface border-t border-brand-border">
        <div className="px-2 pt-2 pb-3 space-x-1 flex justify-around">
          <button onClick={() => setCurrentView('deliveries')} className={`${navButtonClasses('deliveries')} w-full`}>
            Deliveries
          </button>
          <button onClick={() => setCurrentView('staff')} className={`${navButtonClasses('staff')} w-full`}>
            Staffs
          </button>
        </div>
      </div>
    </header>
  );
}