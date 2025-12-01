import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Wind, Zap, TrendingUp, Leaf, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function WorldWhispers() {
  const { t } = useLanguage();

  const alerts = [
    { 
      type: 'weather', 
      icon: Cloud, 
      title: t('worldWhispers.weather.title'),
      value: t('worldWhispers.weather.value'),
      detail: t('worldWhispers.weather.detail'),
      color: 'from-sky-300 to-blue-400',
      bg: 'bg-sky-50'
    },
    { 
      type: 'air', 
      icon: Wind, 
      title: t('worldWhispers.air.title'),
      value: t('worldWhispers.air.value'),
      detail: t('worldWhispers.air.detail'),
      color: 'from-emerald-300 to-teal-400',
      bg: 'bg-emerald-50'
    },
    { 
      type: 'energy', 
      icon: Zap, 
      title: t('worldWhispers.energy.title'),
      value: t('worldWhispers.energy.value'),
      detail: t('worldWhispers.energy.detail'),
      color: 'from-amber-300 to-orange-400',
      bg: 'bg-amber-50'
    },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-rose-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-300 to-teal-400">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-rose-800 font-semibold">{t('worldWhispers.title')}</h3>
      </div>

      <div className="space-y-2">
        {alerts.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <motion.div
              key={alert.type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${alert.bg} border border-white/50`}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${alert.color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-rose-500 text-sm">{alert.title}</span>
                  <span className="text-rose-700 font-medium">{alert.value}</span>
                </div>
                <span className="text-rose-400 text-xs">{alert.detail}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}