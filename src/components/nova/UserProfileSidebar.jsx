import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Heart, Activity, Edit2, Mic, 
  CheckCircle2, Plus, MessageSquare, Settings, 
  Bell, Shield, CreditCard, Globe, Info, ChevronRight, Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '@/components/LanguageProvider';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function UserProfileSidebar({ open, onClose, onAddTask }) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "Anna Nováková",
    bio: "Milovníčka jógy, kávy a efektívneho plánovania. 🌸",
    avatar: ""
  });

  // Fetch Wellbeing Data
  const { data: wellbeing } = useQuery({
    queryKey: ['wellbeing', 'latest'],
    queryFn: async () => {
      const entries = await base44.entities.WellbeingEntry.list({ sort: { date: -1 }, limit: 1 });
      return entries[0] || null;
    }
  });

  // Fetch Robots
  const { data: robots = [] } = useQuery({
    queryKey: ['robots'],
    queryFn: async () => {
      const all = await base44.entities.Robot.list();
      return all.filter(r => r.type !== 'archived');
    },
  });

  const personalRobot = robots.find(r => r.type === 'personal') || {
    name: "Lumi",
    status: "ready",
    avatar_url: ""
  };

  const rentedRobots = robots.filter(r => r.type === 'marketplace');

  // Calculate Harmony Score (avg of life areas + energy * 10)
  const lifeAreas = wellbeing?.life_areas || { health: 7, work: 6, relationships: 8, learning: 5, relax: 4 };
  const energyLevel = wellbeing?.energy_level || 7;
  // Include energy level in the score (6 components now)
  const harmonyScore = Math.round((Object.values(lifeAreas).reduce((a, b) => a + b, 0) + energyLevel) / 6 * 10);

  const statusColors = {
    ready: "bg-emerald-400",
    available: "bg-emerald-400",
    busy: "bg-amber-400",
    offline: "bg-slate-300"
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto border-l border-rose-100"
          >
            <div className="p-6 space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-rose-900">{t('profile.title') || 'Môj Profil'}</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-rose-50 rounded-full">
                  <X className="w-6 h-6 text-rose-400" />
                </Button>
              </div>

              {/* 1. Profile Section */}
              <section className="flex flex-col items-center text-center">
                <div className="relative mb-4 group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white text-3xl shadow-lg shadow-rose-200 overflow-hidden border-4 border-white">
                    <img 
                      src={userProfile.avatar || "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Nova&backgroundColor=b6e3f4,c0aede,d1d4f9&eyes=cute&mouth=lilSmile"} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {isEditing ? (
                  <input 
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    className="text-xl font-bold text-center text-rose-900 border-b border-rose-200 focus:outline-none mb-2 bg-transparent"
                    onBlur={() => setIsEditing(false)}
                    autoFocus
                  />
                ) : (
                  <h3 onClick={() => setIsEditing(true)} className="text-xl font-bold text-rose-900 cursor-pointer hover:text-rose-700 flex items-center gap-2">
                    {userProfile.name}
                    <Edit2 className="w-3 h-3 text-rose-300 opacity-50" />
                  </h3>
                )}
                
                <p className="text-rose-500 text-sm max-w-[250px] mx-auto mt-1">{userProfile.bio}</p>
                
                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full text-rose-700 text-sm font-medium flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                    Skóre harmónie: {harmonyScore}/100
                  </div>
                  <div className="flex items-center gap-1 text-xs text-rose-400">
                    <Zap className="w-3 h-3" />
                    <span>Lumi Energy: {energyLevel}/10</span>
                  </div>
                </div>
              </section>







              {/* 5. Settings */}
              <section className="pt-4 border-t border-rose-100">
                <h4 className="font-semibold text-rose-800 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t('profile.settings') || 'Nastavenia'}
                </h4>
                <div className="space-y-1">
                    {[
                        { icon: Bell, label: "Notifikácie" },
                        { icon: Shield, label: "Súkromie a dáta" },
                        { icon: CreditCard, label: "Predplatné" },
                        { icon: Globe, label: "Jazyk" },
                        { icon: Info, label: "AI Info o transparentnosti" }
                    ].map((item, i) => (
                        <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-rose-50 transition-colors text-left group">
                            <div className="flex items-center gap-3 text-rose-600 group-hover:text-rose-800">
                                <item.icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-500" />
                        </button>
                    ))}
                </div>
              </section>

              <div className="text-center text-xs text-rose-300 pt-4 pb-8">
                NOVA v1.2.0 • Navrhnuté pre rovnováhu
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}