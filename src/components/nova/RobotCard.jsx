import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, CheckCircle2, Euro, Zap, CreditCard, X, Plus, Wrench } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '@/components/LanguageProvider';
import ApplePaySimulation from './ApplePaySimulation';
import BankProfileModal from './BankProfileModal';
import EarningsModal from './EarningsModal';
import JobMarketplaceModal from './JobMarketplaceModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

const jobSkills = {
  "Event Manager": ["Event Planning", "Coordination", "Budgeting", "Communication"],
  "Personal Assistant": ["Scheduling", "Email Management", "Research", "Organization"],
  "Chef": ["Cooking", "Menu Planning", "Food Safety", "Baking"],
  "Housekeeper": ["Cleaning", "Laundry", "Organization", "Inventory"],
  "Researcher": ["Data Analysis", "Report Writing", "Information Retrieval", "Critical Thinking"],
  "Tutor": ["Teaching", "Patience", "Subject Knowledge", "Communication"],
  "Driver": ["Navigation", "Safe Driving", "Time Management", "Vehicle Maintenance"],
  "Security Guard": ["Surveillance", "Risk Assessment", "First Aid", "Conflict Resolution"],
  "Gardener": ["Plant Care", "Landscaping", "Pruning", "Soil Management"],
  "Fitness Coach": ["Workout Planning", "Nutrition Advice", "Motivation", "Physiology"]
};

const jobTitles = Object.keys(jobSkills);

const availabilityColors = {
  available: 'bg-emerald-400',
  busy: 'bg-amber-400',
  offline: 'bg-slate-400',
};

export default function RobotCard({ robot, onSelect, isSelected = false, compact = false }) {
  const { t } = useLanguage();
  const [isSelectingSkill, setIsSelectingSkill] = React.useState(false);
  const [selectedSkills, setSelectedSkills] = React.useState([]);
  const [showApplePay, setShowApplePay] = React.useState(false);
  const [showBankProfile, setShowBankProfile] = React.useState(false);
  const [showMaintenance, setShowMaintenance] = React.useState(false);
  const [showEarnings, setShowEarnings] = React.useState(false);
  const [showJobMarketplace, setShowJobMarketplace] = React.useState(false);
  const [maintenanceStatus, setMaintenanceStatus] = React.useState({});
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: ['robot-earnings', robot.id],
    queryFn: () => base44.entities.Task.filter({ robot_id: robot.id }),
    enabled: !!robot.id
  });

  const simulatedTasks = robot.name === 'ARIA' ? [
      { id: 'sim1', title: 'Ranný koučing', estimated_cost: 15, status: 'completed', scheduled_date: new Date().toISOString() },
      { id: 'sim2', title: 'Príprava obeda', estimated_cost: 25, status: 'completed', scheduled_date: new Date().toISOString() },
      { id: 'sim3', title: 'Večerné upratovanie', estimated_cost: 20, status: 'completed', scheduled_date: new Date().toISOString() }
  ] : [];

  const realEarnings = tasks?.filter(t => t.status === 'completed' || t.status === 'delegated').reduce((sum, t) => sum + (t.estimated_cost || 0), 0) || 0;
  const simulatedEarnings = simulatedTasks.reduce((sum, t) => sum + t.estimated_cost, 0);
  const totalEarnings = realEarnings + simulatedEarnings;

  const maintenanceDates = [
    { month: 'December', date: '15. 12. 2025', id: 'dec25' },
    { month: 'Január', date: '15. 01. 2026', id: 'jan26' },
    { month: 'Február', date: '15. 02. 2026', id: 'feb26' }
  ];

  const updateRobotMutation = useMutation({
    mutationFn: ({ title, skills }) => base44.entities.Robot.update(robot.id, { job_title: title, skills: skills }),
    onSuccess: () => {
      queryClient.invalidateQueries(['robots']);
    }
  });

  // Reset selected skills if robot is deselected
  React.useEffect(() => {
    if (!isSelected) {
      setSelectedSkills([]);
      setIsSelectingSkill(false);
    }
  }, [isSelected]);

  const handleMainButtonClick = () => {
    if (robot.name === 'ARIA' || robot.type === 'personal') {
      setShowJobMarketplace(true);
    } else {
      setIsSelectingSkill(true);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleConfirmSelection = () => {
    onSelect(robot, selectedSkills);
    setIsSelectingSkill(false);
  };

  const availabilityLabels = {
    available: t('robot.available'),
    busy: t('robot.busy'),
    offline: t('robot.offline'),
  };
  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(robot)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
          isSelected 
            ? 'bg-purple-100 border border-purple-300' 
            : 'bg-white/80 hover:bg-white border border-rose-100'
        }`}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-300 to-violet-400 flex items-center justify-center text-xl">
            🤖
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${availabilityColors[robot.availability]} border-2 border-white`} />
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-rose-800 font-medium text-sm">{robot.name}</h4>
          {robot.skills && robot.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 my-1">
              {robot.skills.map((skill, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-500 rounded-md">
                  {skill}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-rose-400">
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {robot.rating?.toFixed(1) || '5.0'}
            </span>
            <span>•</span>
            <span>{Math.round(robot.hourly_rate || 0)}€/h</span>
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-xl rounded-2xl p-5 transition-all shadow-sm ${
        (robot.name === 'ARIA' || robot.type === 'personal')
          ? 'bg-gradient-to-br from-violet-50 via-fuchsia-50 to-white border-2 border-violet-400 shadow-violet-200 shadow-lg transform hover:-translate-y-1'
          : 'bg-white/80 border border-rose-100 hover:border-rose-200'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-300 to-violet-400 flex items-center justify-center text-2xl shadow-sm">
              🤖
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${availabilityColors[robot.availability]} border-2 border-white`} />
          </div>
          <div>
            <h3 className="text-rose-800 font-semibold">{robot.name}</h3>
            <span className={`text-xs font-medium ${
              (robot.name === 'ARIA' || robot.type === 'personal')
                ? 'text-violet-600'
                : (robot.availability === 'available' ? 'text-emerald-500' : 'text-rose-400')
            }`}>
              {availabilityLabels[robot.availability]}
            </span>
          </div>
        </div>
        {(robot.type === 'personal' || robot.name === 'ARIA') && (
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold shadow-md shadow-violet-200 flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" />
            {t('robot.personal')}
          </span>
        )}
      </div>

      {robot.description && (
        <p className="text-rose-500 text-sm mb-4">{robot.description}</p>
      )}

      {robot.job_title && (
        <div className="text-xs font-medium text-rose-400 mb-2 flex items-center gap-2">
          <span>Pracovné zaradenie: <span className="text-rose-700">{robot.job_title}</span></span>
          
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button className="p-0.5 rounded-full hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-colors outline-none">
                      <Plus className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ZMEN ZARADENIE</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent>
              {jobTitles.map(title => (
                <DropdownMenuItem 
                  key={title} 
                  onClick={() => updateRobotMutation.mutate({ title, skills: jobSkills[title] })}
                  className="cursor-pointer"
                >
                  {title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {robot.skills?.slice(0, 4).map((skill, i) => (
          <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-xs">
            {skill}
          </span>
        ))}
        {robot.skills?.length > 4 && (
          <span className="px-2 py-0.5 rounded-md bg-rose-50/50 text-rose-400 text-xs">
            +{robot.skills.length - 4}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-xl bg-amber-50">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            <Star className="w-4 h-4 fill-amber-400" />
            <span className="font-semibold">{robot.rating?.toFixed(1) || '5.0'}</span>
          </div>
          <span className="text-rose-400 text-xs">{robot.reviews_count || 0} {t('robot.reviews')}</span>
        </div>
        <div className="text-center p-2 rounded-xl bg-emerald-50">
          <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">{robot.uptime_percent || 99}%</span>
          </div>
          <span className="text-rose-400 text-xs">Uptime</span>
        </div>
        <div className="text-center p-2 rounded-xl bg-blue-50">
          <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">{(robot.tasks_completed || 0) + simulatedTasks.length}</span>
          </div>
          <span className="text-rose-400 text-xs">{t('robot.tasks')}</span>
        </div>
      </div>

      {robot.type === 'personal' && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center gap-2"
            onClick={() => setShowMaintenance(!showMaintenance)}
          >
            <Wrench className="w-4 h-4" />
            Technická údržba
          </Button>
          
          <AnimatePresence>
            {showMaintenance && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 rounded-xl p-3 mt-2 text-sm space-y-2 border border-slate-100">
                  <p className="font-medium text-slate-700 text-xs uppercase tracking-wider mb-2">Plánované termíny (1x mesačne)</p>
                  <div className="space-y-2">
                    {maintenanceDates.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-slate-600 bg-white p-2 rounded-lg shadow-sm">
                        <div>
                          <div className="text-xs font-medium">{item.month}</div>
                          <div className="font-mono text-xs text-slate-800">{item.date}</div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id={`done-${item.id}`}
                              checked={maintenanceStatus[item.id] === 'done'}
                              onCheckedChange={() => setMaintenanceStatus(prev => ({ ...prev, [item.id]: 'done' }))}
                              className="h-3 w-3 rounded-sm data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                            <label htmlFor={`done-${item.id}`} className="text-[10px] cursor-pointer select-none text-emerald-700">Vykonaná</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id={`not-${item.id}`}
                              checked={maintenanceStatus[item.id] === 'not_done'}
                              onCheckedChange={() => setMaintenanceStatus(prev => ({ ...prev, [item.id]: 'not_done' }))}
                              className="h-3 w-3 rounded-sm data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                            />
                            <label htmlFor={`not-${item.id}`} className="text-[10px] cursor-pointer select-none text-rose-700">Nevykonaná</label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-end justify-end mt-2">
        <div className="flex flex-col gap-2 items-end w-full">
          {['SHOP-IT', 'CLEAN-O', 'Cook-chef', 'COOK-CHEF', 'ADMIN-PRO', 'LEARN-BOT'].includes(robot.name) ? (
            <div className="h-9 px-3 mb-1 rounded-md bg-emerald-50 text-emerald-600 text-sm font-medium border border-emerald-200 flex items-center justify-center select-none">
              {robot.hourly_rate || 0} €/hodina
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowEarnings(true);
              }}
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 mb-1"
            >
              Zárobok {totalEarnings > 0 && `(${totalEarnings} €)`}
            </Button>
          )}
          {isSelectingSkill ? (
            <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                  <span className="text-xs text-rose-500 font-medium ml-1">Vyber zručnosti ({selectedSkills.length}):</span>
                  <Button 
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsSelectingSkill(false)}
                      className="h-6 w-6 text-rose-400 hover:bg-rose-50 rounded-full"
                  >
                      <X className="w-3 h-3" /> 
                  </Button>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                  {robot.skills?.map(skill => {
                    const isSkillSelected = selectedSkills.includes(skill);
                    return (
                      <Button
                          key={skill}
                          size="sm"
                          onClick={() => toggleSkill(skill)}
                          className={`text-xs flex-grow transition-all ${
                            isSkillSelected
                              ? 'bg-purple-500 text-white hover:bg-purple-600 border border-purple-600'
                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                          }`}
                      >
                          {skill}
                          {isSkillSelected && <CheckCircle2 className="w-3 h-3 ml-1.5" />}
                      </Button>
                    );
                  })}
              </div>
              <Button 
                size="sm" 
                onClick={handleConfirmSelection}
                className="w-full mt-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={selectedSkills.length === 0}
              >
                Potvrdiť výber
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={handleMainButtonClick}
                className={`${
                  isSelected 
                    ? 'bg-emerald-400 hover:bg-emerald-500' 
                    : 'bg-gradient-to-r from-purple-400 to-violet-500 hover:from-purple-500 hover:to-violet-600'
                } text-white shadow-sm w-full transition-all capitalize`}
              >
                {(selectedSkills.length > 0 || isSelected) ? (selectedSkills.length > 0 ? `${selectedSkills.length} vybrané` : t('robot.selected')) : ((robot.name === 'ARIA' || robot.type === 'personal') ? 'Otvorené pracovné pozície' : t('robot.select'))}
              </Button>

              {['SHOP-IT', 'CLEAN-O', 'Cook-chef', 'COOK-CHEF', 'ADMIN-PRO', 'LEARN-BOT'].includes(robot.name) ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowApplePay(true);
                    setSelectedSkills([]);
                  }}
                  className="text-xs border-rose-200 text-rose-600 hover:bg-rose-50 w-full"
                >
                  <CreditCard className="w-3 h-3 mr-1.5" />
                  Zaplatiť ihneď
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBankProfile(true);
                  }}
                  className="text-xs border-rose-200 text-rose-600 hover:bg-rose-50 w-full"
                >
                  <CreditCard className="w-3 h-3 mr-1.5" />
                  Môj bankový profil
                </Button>
              )}
            </>
          )}
        </div>
        </div>
        <ApplePaySimulation 
          isOpen={showApplePay} 
          onClose={() => setShowApplePay(false)} 
          amount={robot.hourly_rate}
          merchantName={robot.name}
        />
        <BankProfileModal 
          isOpen={showBankProfile}
          onClose={() => setShowBankProfile(false)}
          robotName={robot.name}
          />
          <EarningsModal 
          open={showEarnings}
          onClose={() => setShowEarnings(false)}
          robot={robot}
          simulatedTasks={simulatedTasks}
          />
          <JobMarketplaceModal 
            open={showJobMarketplace}
            onClose={() => setShowJobMarketplace(false)}
            robotName={robot.name}
          />
          </motion.div>
          );
          }