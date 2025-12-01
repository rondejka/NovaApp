import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import RobotCard from './RobotCard';

export default function RobotRecommendationModal({ open, onClose, task, robots, onConfirm }) {
  const { t } = useLanguage();
  const [recommendedRobots, setRecommendedRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState(null);

  useEffect(() => {
    if (open && task && robots.length > 0) {
      // Show all robots without filtering
      const finalRobots = robots;
      
      // Sort: Personal first, then by rating
      const sorted = [...finalRobots].sort((a, b) => {
        if (a.type === 'personal' && b.type !== 'personal') return -1;
        if (a.type !== 'personal' && b.type === 'personal') return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      setRecommendedRobots(sorted);
      // Select the first one by default if available
      if (sorted.length > 0 && !selectedRobot) {
        setSelectedRobot(sorted[0]);
      }
    }
  }, [open, task, robots]);

  const handleConfirm = () => {
    if (selectedRobot) {
      onConfirm(selectedRobot);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border-rose-100 text-rose-800 max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-rose-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {t('modal.robotRecommendation') || 'Odporúčaní roboti'}
          </DialogTitle>
          <p className="text-rose-400 text-sm">
            {t('modal.robotRecommendationDesc') || `Na základe úlohy "${task.title}" sme pre vás našli týchto pomocníkov.`}
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {recommendedRobots.map((robot) => (
            <div 
              key={robot.id} 
              onClick={() => setSelectedRobot(robot)}
              className={`cursor-pointer transition-all rounded-2xl border-2 ${
                selectedRobot?.id === robot.id 
                  ? 'border-purple-400 shadow-md scale-[1.02]' 
                  : 'border-transparent hover:border-purple-100'
              }`}
            >
              <RobotCard 
                robot={robot} 
                onSelect={() => setSelectedRobot(robot)} 
                isSelected={selectedRobot?.id === robot.id}
                compact={true} // Use compact mode if available or adjust styling
              />
            </div>
          ))}
          
          {recommendedRobots.length === 0 && (
            <div className="col-span-2 text-center py-8 text-rose-300">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenašli sa žiadni vhodní roboti.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-rose-50">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
          >
            {t('modal.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedRobot}
            className="bg-gradient-to-r from-purple-400 to-violet-500 hover:from-purple-500 hover:to-violet-600 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            {t('modal.confirmRobot') || 'Vybrať tohto robota'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}