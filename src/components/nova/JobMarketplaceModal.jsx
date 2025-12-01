import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Building2, CheckCircle2, ArrowRight, ArrowLeft, Calendar, Calculator, Clock, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const jobs = [
  {
    id: 1,
    title: "Asistent Dátovej Analýzy",
    company: "TechFlow Corp",
    companyDescription: "Inovatívna technologická firma špecializujúca sa na AI a spracovanie veľkých dát pre finančný sektor.",
    type: "Krátkodobé",
    rate: "15€/h",
    rateValue: 15,
    description: "Spracovanie týždenných obchodných dát a generovanie reportov pre manažment.",
    requirements: ["Data Analysis", "Reporting"],
    startDate: "10.12.2025",
    endDate: "20.12.2025",
    hoursTotal: 20
  },
  {
    id: 2,
    title: "Virtuálny Plánovač",
    company: "Creative Studio",
    companyDescription: "Ocenené dizajnérske štúdio pracujúce s medzinárodnými klientmi v oblasti digitálneho marketingu.",
    type: "Dlhodobé",
    rate: "12€/h",
    rateValue: 12,
    description: "Správa kalendára, koordinácia stretnutí a komunikácia s klientmi pre kreatívny tím.",
    requirements: ["Scheduling", "Communication"],
    startDate: "01.01.2026",
    endDate: "31.03.2026",
    hoursTotal: 120
  },
  {
    id: 3,
    title: "Rešeršný Asistent",
    company: "UniLab Research",
    companyDescription: "Akademické výskumné centrum zamerané na udržateľné technológie a environmentálne vedy.",
    type: "Jednorazové",
    rate: "20€/h",
    rateValue: 20,
    description: "Zhromažďovanie a analýza aktuálnych štúdií o trendoch v obnoviteľnej energii.",
    requirements: ["Research", "Critical Thinking"],
    startDate: "15.12.2025",
    endDate: "18.12.2025",
    hoursTotal: 15
  }
];

export default function JobMarketplaceModal({ open, onClose, robotName }) {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsSuccess(false);
  };

  const handleFinalOrder = () => {
    setAppliedJobs([...appliedJobs, selectedJob.id]);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedJob(null);
    }, 2000);
  };

  const handleBack = () => {
    setSelectedJob(null);
    setIsSuccess(false);
  };

  const handleCancelReservation = (jobId) => {
    setAppliedJobs(prev => prev.filter(id => id !== jobId));
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (!val) setSelectedJob(null);
        onClose(val);
    }}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-rose-100">
        <DialogHeader>
          <DialogTitle className="text-rose-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            {selectedJob ? 'Detail pracovnej ponuky' : `Pracovné príležitosti pre ${robotName}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
            <AnimatePresence mode="wait">
                {selectedJob ? (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                    >
                        {isSuccess ? (
                             <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                                <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"
                                >
                                    <CheckCircle2 className="w-8 h-8" />
                                </motion.div>
                                <h3 className="text-lg font-bold text-emerald-700">Úspešne prihlásené!</h3>
                                <p className="text-slate-500 text-sm">Váš robot {robotName} bol zaregistrovaný na projekt.</p>
                             </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">{selectedJob.title}</h3>
                                        <div className="flex items-center gap-1.5 text-sm text-rose-500 font-medium">
                                            <Building2 className="w-4 h-4" />
                                            {selectedJob.company}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 italic">
                                            {selectedJob.companyDescription}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Popis pozície</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                {selectedJob.description}
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50">
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Trvanie
                                                </h4>
                                                <p className="text-sm text-slate-800">{selectedJob.startDate} - {selectedJob.endDate}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Rozsah
                                                </h4>
                                                <p className="text-sm text-slate-800">{selectedJob.hoursTotal} hodín</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                                                <Calculator className="w-3 h-3" />
                                                Predpokladaný zárobok
                                            </span>
                                            <div className="text-2xl font-bold text-emerald-800 mt-0.5">
                                                {selectedJob.hoursTotal * selectedJob.rateValue} €
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-emerald-600 mb-0.5">Sadzba</div>
                                            <div className="font-semibold text-emerald-700">{selectedJob.rate}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={handleBack}
                                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Späť
                                    </Button>
                                    <Button 
                                        onClick={handleFinalOrder}
                                        className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-200"
                                    >
                                        Finálna objednávka
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        <p className="text-sm text-slate-500">
                            Prihláste svojho robota na externé projekty a zarábajte.
                        </p>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                            {jobs.map((job) => {
                            const isApplied = appliedJobs.includes(job.id);
                            
                            return (
                                <motion.div
                                key={job.id}
                                layoutId={`job-${job.id}`}
                                className={`p-4 rounded-xl border transition-all ${
                                    isApplied 
                                    ? 'bg-emerald-50 border-emerald-200' 
                                    : 'bg-white border-slate-100 hover:border-rose-200 hover:shadow-sm'
                                }`}
                                >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                    <h4 className="font-semibold text-slate-800 text-sm">{job.title}</h4>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                        <Building2 className="w-3 h-3" />
                                        {job.company}
                                    </div>
                                    </div>
                                    <div className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-lg">
                                    {job.rate}
                                    </div>
                                </div>
                                
                                <p className="text-xs text-slate-500 mb-3 leading-relaxed line-clamp-2">
                                    {job.description}
                                </p>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                                    <div className="flex gap-2">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                                            {job.type}
                                        </span>
                                    </div>
                                    {isApplied ? (
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="h-7 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                                        onClick={() => handleCancelReservation(job.id)}
                                    >
                                        <X className="w-3 h-3 mr-1.5" />
                                        Zrušiť rezerváciu
                                    </Button>
                                    ) : (
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="h-7 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                                        onClick={() => handleApplyClick(job)}
                                    >
                                        Prihlásiť sa
                                        <ArrowRight className="w-3 h-3 ml-1.5" />
                                    </Button>
                                    )}
                                </div>
                                </motion.div>
                            );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}