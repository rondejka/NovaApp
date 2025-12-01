import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Bot, Star, Zap, SlidersHorizontal,
  Grid, List, ArrowUpDown
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import RobotCard from '../components/nova/RobotCard';
import CreateRobotModal from '../components/nova/CreateRobotModal';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const skillFilters = [
  'Všetky',
  'Domácnosť',
  'Administratíva',
  'Nákupy',
  'Výskum',
  'Komunikácia',
  'Organizácia',
  'Varenie',
];

export default function RoboMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('Všetky');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: robots = [], isLoading } = useQuery({
    queryKey: ['robots'],
    queryFn: () => base44.entities.Robot.list(),
  });

  const filteredRobots = robots
    .filter(r => r.type !== 'archived')
    .filter(robot => {
      const matchesSearch = robot.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        robot.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSkill = selectedSkill === 'Všetky' || 
        robot.skills?.some(s => s.toLowerCase().includes(selectedSkill.toLowerCase()));
      return matchesSearch && matchesSkill;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price_low') return (a.hourly_rate || 0) - (b.hourly_rate || 0);
      if (sortBy === 'price_high') return (b.hourly_rate || 0) - (a.hourly_rate || 0);
      if (sortBy === 'tasks') return (b.tasks_completed || 0) - (a.tasks_completed || 0);
      return 0;
    });

  const marketplaceRobots = filteredRobots.filter(r => r.type === 'marketplace');
  const personalRobots = filteredRobots.filter(r => r.type === 'personal');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
      </div>
      <CreateRobotModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <Link to={createPageUrl('Home')}>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 bg-clip-text text-transparent"
            >
              RoboCircle™ Marketplace
            </motion.h1>
          </Link>
          <p className="text-rose-400 mt-1">Nájdi ideálneho robota pre tvoje úlohy</p>
        </header>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-rose-100 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
              <Input
                placeholder="Hľadaj robotov..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-rose-50 border-rose-200 text-rose-800 placeholder:text-rose-300"
              />
            </div>

            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 bg-rose-50 border-rose-200 text-rose-800">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Zoradiť" />
                </SelectTrigger>
                <SelectContent className="bg-white border-rose-100">
                  <SelectItem value="rating" className="text-rose-800">Najlepšie hodnotené</SelectItem>
                  <SelectItem value="price_low" className="text-rose-800">Najlacnejšie</SelectItem>
                  <SelectItem value="price_high" className="text-rose-800">Najdrahšie</SelectItem>
                  <SelectItem value="tasks" className="text-rose-800">Najviac úloh</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-rose-200 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-rose-100 text-rose-600' : 'text-rose-400'}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-rose-100 text-rose-600' : 'text-rose-400'}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Skill filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {skillFilters.map(skill => (
              <Button
                key={skill}
                size="sm"
                variant="ghost"
                onClick={() => setSelectedSkill(skill)}
                className={`rounded-full ${
                  selectedSkill === skill
                    ? 'bg-purple-100 text-purple-600 border-purple-200'
                    : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50'
                } border border-transparent`}
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>

        {/* Personal Robots */}
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-violet-100">
                <Bot className="w-4 h-4 text-violet-500" />
              </div>
              <h2 className="text-rose-800 font-semibold">Tvoji osobní asistenti</h2>
              <Badge className="bg-violet-100 text-violet-600 border-0">
                {personalRobots.length}
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowCreateModal(true)}
                className="ml-auto border-violet-200 text-violet-600 hover:bg-violet-50"
              >
                + Nový asistent
              </Button>
            </div>
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {personalRobots.map((robot, i) => (
                <motion.div
                  key={robot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <RobotCard robot={robot} onSelect={() => {}} />
                </motion.div>
              ))}
            </div>
          </div>

        {/* Marketplace Robots */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-purple-100">
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <h2 className="text-rose-800 font-semibold">Marketplace</h2>
            <Badge className="bg-purple-100 text-purple-600 border-0">
              {marketplaceRobots.length} dostupných
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white/50 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : marketplaceRobots.length > 0 ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {marketplaceRobots.map((robot, i) => (
                <motion.div
                  key={robot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <RobotCard robot={robot} onSelect={() => {}} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-rose-300">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Žiadni roboti nenájdení</p>
              <p className="text-sm mt-1">Skús zmeniť filtre alebo vyhľadávanie</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}