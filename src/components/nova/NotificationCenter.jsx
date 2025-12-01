import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Bell, Calendar, Heart, Bot, Sun, Leaf, Star, Users, Sparkles, 
  Check, Trash2, MoreHorizontal, Clock, Activity, AlertTriangle, Shield, Smartphone, Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const NOTIFICATION_TYPES = {
  reminder: { icon: Clock, color: "text-blue-500", bg: "bg-blue-50", label: "Reminder" },
  summary: { icon: Sun, color: "text-orange-500", bg: "bg-orange-50", label: "Summary" },
  task: { icon: Check, color: "text-purple-500", bg: "bg-purple-50", label: "Task" },
  wellbeing: { icon: Heart, color: "text-pink-500", bg: "bg-pink-50", label: "Wellbeing" },
  activity: { icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50", label: "Activity" },
  motivation: { icon: Star, color: "text-indigo-500", bg: "bg-indigo-50", label: "Motivation" },
  security: { icon: Shield, color: "text-red-500", bg: "bg-red-50", label: "Security" },
  social: { icon: Users, color: "text-teal-500", bg: "bg-teal-50", label: "Social" },
  system: { icon: Smartphone, color: "text-slate-500", bg: "bg-slate-50", label: "System" },
};

const INITIAL_NOTIFICATIONS = [
  // 1. Reminders
  { id: 1, type: 'reminder', message: "Meeting starts in 10 minutes", time: "10m ago", read: false },
  { id: 2, type: 'reminder', message: "Don’t forget your water bottle 💧", time: "1h ago", read: true },
  
  // 2. Daily Summary
  { id: 3, type: 'summary', message: "Here’s your plan for today 📅", time: "8:00 AM", read: true },
  { id: 4, type: 'summary', message: "You’ve completed 3/5 tasks", time: "2h ago", read: false },

  // 3. Tasks
  { id: 5, type: 'task', message: "Task due in 1 hour: Prepare presentation", time: "50m ago", read: false },
  { id: 6, type: 'task', message: "New task assigned to you: Review quarterly report", time: "3h ago", read: true },

  // 4. Wellbeing
  { id: 7, type: 'wellbeing', message: "How are you feeling today? 🌿", time: "9:30 AM", read: false },
  { id: 8, type: 'wellbeing', message: "Time to take a break and stretch 🧘‍♀️", time: "15m ago", read: false },

  // 5. Activity
  { id: 9, type: 'activity', message: "You reached your step goal! 🏃‍♀️", time: "1h ago", read: true },
  { id: 10, type: 'activity', message: "Focus session completed (45m) ✅", time: "4h ago", read: true },

  // 6. Motivation
  { id: 11, type: 'motivation', message: "You’re on a streak! 🔥", time: "Yesterday", read: true },
  { id: 12, type: 'motivation', message: "You’re doing great — keep going! 💪", time: "5h ago", read: true },

  // 7. Security/Error
  { id: 13, type: 'security', message: "Suspicious login detected near Bratislava", time: "Yesterday", read: true },
  { id: 14, type: 'security', message: "Connection lost - trying to reconnect...", time: "Just now", read: false },

  // 8. Social
  { id: 15, type: 'social', message: "Emma mentioned you in a comment", time: "20m ago", read: false },
  { id: 16, type: 'social', message: "Your friend Sarah joined the app 👋", time: "2d ago", read: true },

  // 9. System
  { id: 17, type: 'system', message: "App update available (v2.1) 📲", time: "1d ago", read: true },
  { id: 18, type: 'system', message: "Dark Mode is now active 🌙", time: "8:00 PM", read: true },
];

export default function NotificationCenter({ open, onClose }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

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
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 border-l border-rose-100 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-rose-100 flex items-center justify-between bg-white/80 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500" />
                <h2 className="font-bold text-rose-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handleMarkAllRead} title="Mark all as read" className="h-8 w-8 text-rose-400 hover:text-rose-600">
                  <Check className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleClearAll} title="Clear all" className="h-8 w-8 text-rose-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-rose-400 hover:text-rose-600">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-2 border-b border-rose-50 overflow-x-auto flex gap-1 scrollbar-hide">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-rose-100 text-rose-700' : 'text-rose-400 hover:bg-rose-50'}`}
              >
                All
              </button>
              {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
                <button 
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === key ? `${config.bg} ${config.color}` : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  {config.label}
                </button>
              ))}
            </div>

            {/* List */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const typeConfig = NOTIFICATION_TYPES[notification.type];
                    const Icon = typeConfig.icon;

                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative p-4 rounded-2xl border transition-all ${
                          notification.read 
                            ? 'bg-white border-gray-100 opacity-80' 
                            : 'bg-white border-rose-100 shadow-sm'
                        }`}
                      >
                        {!notification.read && (
                          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500" />
                        )}
                        
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${typeConfig.color}`}>
                                {typeConfig.label}
                              </span>
                              <span className="text-[10px] text-gray-400">{notification.time}</span>
                            </div>
                            <p className={`text-sm leading-snug ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}