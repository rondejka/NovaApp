import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { toast } from "sonner";

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

export default function CreateRobotModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const queryClient = useQueryClient();

  const selectedSkills = jobSkills[jobTitle] || [];

  const createRobotMutation = useMutation({
    mutationFn: (data) => base44.entities.Robot.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['robots']);
      toast.success("Nový asistent bol vytvorený");
      handleClose();
    },
    onError: () => {
      toast.error("Nepodarilo sa vytvoriť asistenta");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    createRobotMutation.mutate({
      name,
      job_title: jobTitle,
      description: `Personal ${jobTitle} assistant`,
      type: 'personal',
      availability: 'available',
      rating: 5.0,
      hourly_rate: 0,
      skills: selectedSkills,
      categories: ['personal']
    });
  };

  const handleClose = () => {
    setName('');
    setJobTitle('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-rose-100">
        <DialogHeader>
          <DialogTitle className="text-rose-800 flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Vytvoriť nového asistenta
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-rose-700">Meno asistenta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="napr. RoboHelper"
              className="border-rose-200 focus:border-rose-400"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-rose-700">Pracovné zaradenie</Label>
            <Select value={jobTitle} onValueChange={setJobTitle}>
              <SelectTrigger className="border-rose-200 text-rose-800 focus:ring-rose-200">
                <SelectValue placeholder="Vyber zaradenie" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(jobSkills).map((title) => (
                  <SelectItem key={title} value={title} className="text-rose-800 focus:bg-rose-50 focus:text-rose-900">
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {jobTitle && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-rose-700 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-purple-500" />
                Automaticky priradené zručnosti
              </Label>
              <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100 flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-white text-purple-600 border border-purple-100 shadow-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={handleClose} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50">
              Zrušiť
            </Button>
            <Button 
              type="submit" 
              disabled={createRobotMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            >
              {createRobotMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vytváram...
                </>
              ) : (
                'Vytvoriť asistenta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}