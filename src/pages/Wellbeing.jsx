import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { sk } from 'date-fns/locale';
import { 
  Heart, Sparkles, TrendingUp, Calendar,
  ChevronLeft, ChevronRight, Save
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import LifeHarmonyWheel from '../components/nova/LifeHarmonyWheel';
import HeartSenseCard from '../components/nova/HeartSenseCard';
import EnergyScanner from '../components/nova/EnergyScanner';

const lifeAreaLabels = {
  health: { label: 'Zdravie', emoji: '❤️', color: 'from-emerald-300 to-teal-400' },
  work: { label: 'Práca', emoji: '💼', color: 'from-blue-300 to-indigo-400' },
  relationships: { label: 'Vzťahy', emoji: '💕', color: 'from-pink-300 to-rose-400' },
  learning: { label: 'Učenie', emoji: '📚', color: 'from-amber-300 to-orange-400' },
  relax: { label: 'Relax', emoji: '🧘‍♀️', color: 'from-violet-300 to-purple-400' },
};

export default function Wellbeing() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [aiMessage, setAiMessage] = useState("");
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    mood: 'good',
    energy_level: 7,
    life_areas: {
      health: 7,
      work: 6,
      relationships: 8,
      learning: 5,
      relax: 4,
    },
    notes: '',
  });

  const { data: entry, isLoading } = useQuery({
    queryKey: ['wellbeing', selectedDate],
    queryFn: async () => {
      const entries = await base44.entities.WellbeingEntry.filter({ date: selectedDate });
      if (entries[0]) {
        setFormData({
          mood: entries[0].mood || 'good',
          energy_level: entries[0].energy_level || 7,
          life_areas: entries[0].life_areas || formData.life_areas,
          notes: entries[0].notes || '',
        });
      }
      return entries[0] || null;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (entry) {
        return base44.entities.WellbeingEntry.update(entry.id, data);
      } else {
        return base44.entities.WellbeingEntry.create({ ...data, date: selectedDate });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wellbeing']);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleEnergyScan = (level, message) => {
    setFormData(prev => ({ ...prev, energy_level: level }));
    setAiMessage(message);
    setTimeout(() => setAiMessage(""), 8000);
  };

  const updateLifeArea = (key, value) => {
    setFormData({
      ...formData,
      life_areas: {
        ...formData.life_areas,
        [key]: value[0],
      },
    });
  };

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <Link to={createPageUrl('Home')}>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent"
            >
              Wellbeing
            </motion.h1>
          </Link>
          <p className="text-rose-400 mt-1">Sleduj svoju pohodu a životnú rovnováhu</p>
        </header>

        {/* Date Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeDate(-1)}
            className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 border border-rose-100 shadow-sm">
            <Calendar className="w-4 h-4 text-rose-400" />
            <span className="text-rose-700 font-medium">
              {format(new Date(selectedDate), 'EEEE, d. MMMM', { locale: sk })}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeDate(1)}
            className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <HeartSenseCard 
              currentMood={formData.mood} 
              onMoodChange={(mood) => setFormData({ ...formData, mood })} 
            />

            {/* Energy Level Slider (Moved from deleted Lumi Scan section) */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-100 shadow-sm">
                <div className="flex justify-between text-sm text-rose-500 mb-2">
                  <span>Vyčerpaná</span>
                  <span className="text-2xl font-bold text-rose-700">{formData.energy_level}</span>
                  <span>Plná energie</span>
                </div>
                <Slider
                  value={[formData.energy_level]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(v) => setFormData({ ...formData, energy_level: v[0] })}
                  className="mt-4"
                />
            </div>

            {/* Notes */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-100 shadow-sm">
              <h3 className="text-rose-800 font-semibold mb-4">Poznámky k dňu</h3>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Čo bolo dnes dôležité? Ako sa cítiš?"
                className="bg-rose-50 border-rose-200 text-rose-800 placeholder:text-rose-300 min-h-32"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Life Harmony Wheel */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-rose-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-rose-300 to-pink-400">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-rose-800 font-semibold">LifeHarmony Wheel™</h3>
                  <p className="text-rose-400 text-xs">Ohodnoť každú oblasť života</p>
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <LifeHarmonyWheel values={formData.life_areas} size={220} />
              </div>

              <div className="space-y-4">
                {Object.entries(lifeAreaLabels).map(([key, config]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-rose-700">
                        <span>{config.emoji}</span>
                        {config.label}
                      </span>
                      <span className="text-rose-800 font-semibold">
                        {formData.life_areas[key]}
                      </span>
                    </div>
                    <Slider
                      value={[formData.life_areas[key]]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(v) => updateLifeArea(key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white h-12 text-lg shadow-md shadow-rose-200"
            >
              <Save className="w-5 h-5 mr-2" />
              {saveMutation.isPending ? 'Ukladám...' : 'Uložiť záznam'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}