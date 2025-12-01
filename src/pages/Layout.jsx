
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, Bot, Heart, Calendar, User, 
  Sparkles, Menu, X, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider, useLanguage } from '@/components/LanguageProvider';
import NotificationCenter from '@/components/nova/NotificationCenter';
import { Button } from "@/components/ui/button";

const NavContent = ({ children, currentPageName }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const { t } = useLanguage();

  const navItems = [
    { name: 'Home', label: t('nav.home'), icon: Home },
    { name: 'Wellbeing', label: t('nav.wellbeing'), icon: Heart },
    { name: 'RoboMarketplace', label: t('nav.robots'), icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-rose-100">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-rose-800 font-bold text-lg">NOVA</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="p-2 text-rose-400 hover:text-rose-600 relative"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-rose-400 hover:text-rose-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-rose-100 bg-white/95 backdrop-blur-xl"
            >
              <nav className="p-4 space-y-2">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.name;
                  return (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.name)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700'
                          : 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-20 bg-white/60 backdrop-blur-xl border-r border-rose-100 z-50">
        <div className="flex flex-col items-center py-6 h-full">
          <Link to={createPageUrl('Home')} className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>

          <nav className="flex-1 flex flex-col items-center gap-3">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPageName === item.name;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200'
                      : 'text-rose-300 hover:text-rose-500 hover:bg-rose-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-white shadow-lg border border-rose-100 text-rose-700 text-sm font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4 mb-4">
            <button 
              onClick={() => setNotificationsOpen(true)}
              className="w-10 h-10 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white" />
            </button>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-20 pt-16 lg:pt-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-rose-100 z-50">
        <nav className="flex items-center justify-around py-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-rose-500'
                    : 'text-rose-300 hover:text-rose-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <NotificationCenter 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
};

export default function Layout(props) {
  return (
    <LanguageProvider>
      <NavContent {...props} />
    </LanguageProvider>
  );
}
