import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Camera, Sparkles, X, Zap, RefreshCw, Plus, Check, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageProvider';
import LiveAvatar from './LiveAvatar';

export default function EnergyScanner({ onScanComplete, currentEnergyLevel = 7, tasks = [], onAddTask }) {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState('idle'); // idle, camera, processing, result, error
  const [stream, setStream] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [autoAnalyzePending, setAutoAnalyzePending] = useState(false);
  const [result, setResult] = useState(null);
  const [isTaskAdded, setIsTaskAdded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      const langMap = { 'sk': 'sk-SK', 'en': 'en-US', 'de': 'de-DE', 'cn': 'zh-CN' };
      const targetLang = langMap[language] || 'en-US';
      utterance.lang = targetLang;

      // Try to find a female/soft voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang.startsWith(targetLang.split('-')[0]) && 
        (v.name.includes('Zuzana') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.toLowerCase().includes('female'))
      );
      
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.9; // Slower for softness
      utterance.pitch = 1.1; // Slightly higher for feminine tone
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice Recognition setup
  useEffect(() => {
    let recognition = null;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'sk-SK';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Voice command:', transcript);
        if (transcript.includes('sken') || transcript.includes('scan') || transcript.includes('lumi face scan') || transcript.includes('lumi')) {
          setAutoAnalyzePending(true);
          startCamera();
        }
      };

      recognition.onend = () => setIsListening(false);
    }

    return () => {
      if (recognition) recognition.abort();
    };
  }, []);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'sk-SK';
      recognition.start();
      setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        if (mode === 'idle' && (transcript.includes('sken') || transcript.includes('scan') || transcript.includes('lumi face scan') || transcript.includes('lumi'))) {
          setAutoAnalyzePending(true);
          startCamera();
        } else if (mode === 'camera' && (transcript.includes('lumi') || transcript.includes('face scan') || transcript.includes('analyzovať') || transcript.includes('analyze'))) {
          captureAndAnalyze();
        } else if (mode === 'result' && !isTaskAdded && result?.recommended_task) {
          // Handle voice confirmation for adding task
          if (transcript.includes(t('energy.yes').toLowerCase()) || transcript.includes('áno') || transcript.includes('yes') || transcript.includes('ok')) {
             setIsTaskAdded(true);
             onAddTask(result.recommended_task, result.task_type, result.duration_minutes, result.category);
             speakMessage(t('energy.taskAdded'));
          }
        }
      };
      recognition.onend = () => setIsListening(false);
    } else {
      alert("Tvoj prehliadač nepodporuje hlasové ovládanie.");
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setMode('camera');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setMode('error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    setMode('processing');

    // Get history for alternation
    const lastScanData = JSON.parse(localStorage.getItem('lumi_last_scan') || '{}');
    const lastTask = lastScanData.task || '';
    const lastType = lastScanData.type || 'long'; // Default to long so we start with short
    const nextType = lastType === 'short' ? 'long' : 'short';

    // Capture image to canvas
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Stop camera after fade out animation
    setTimeout(() => stopCamera(), 800);

    // Convert to blob/file
    const dataUrl = canvas.toDataURL('image/jpeg');
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], "energy_scan.jpg", { type: "image/jpeg" });

    try {
      // 1. Upload file
      const uploadRes = await base44.integrations.Core.UploadFile({ file: file });
      
      if (!uploadRes?.file_url) throw new Error("Upload failed");

      // 2. Analyze with LLM
      const availableTasks = tasks
        .filter(t => t.status !== 'completed' && t.assigned_to !== 'robot')
        .map(t => t.title)
        .join(', ');

      const analysisRes = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this selfie for energy level and mood. 
        Look for signs of fatigue (eyes, posture) or energy (smile, brightness).
        Estimate 'energy_level' from 1 to 10 (integer).
        Determine the 'mood' as strictly one of: 'neutral', 'energetic', 'happy', 'tired', 'concerned'.

        IMPORTANT: Output the 'message' and 'recommended_task' in the language identified by the code: "${language}" (e.g. sk=Slovak, en=English, de=German, cn=Chinese).

        Provide a short, gentle, supportive message for a woman in 'message' in this language.

        Also, here is my current todo list: [${availableTasks}].
        If the list is empty or nothing fits, suggest a unique and varied self-care activity.
        
        CONTEXT FOR RECOMMENDATION:
        - Previous activity was: "${lastTask}" (${lastType})
        - You MUST suggest a **${nextType}** activity now to alternate.
        - If 'short': suggest a micro-habit (1-5 min) like "Drink water", "Stretch neck", "Look out window", "3 deep breaths".
        - If 'long': suggest a proper activity (20-60 min) like "30 min walk", "Yoga session", "Read a book", "Listen to album".
        - Ensure it is DIFFERENT from the previous one.

        CRITICAL RULE FOR LOW ENERGY:
        If your estimated 'energy_level' is less than 5, DO NOT suggest demanding activities (like intense sport, heavy work, complex learning). 
        Instead, suggest ONLY restorative, relaxing, or very easy activities (e.g. nap, meditation, gentle stretch, easy reading, listening to music).
        
        Also determine the appropriate 'category' for this task from: 
        ['health', 'work', 'relax', 'learning', 'relationships'].
        - 'health': Physical activities, drinking water, healthy food (Green)
        - 'work': Deep focus, quick emails, planning (Purple)
        - 'relax': Music, meditation, breathing, break (Blue)
        - 'learning': Reading, podcast, skill (Yellow)
        - 'relationships': Calling someone, texting, family time (Red)

        Return the recommendation in 'recommended_task', type in 'task_type', 'duration_minutes', and 'category'.
        IMPORTANT: Keep 'recommended_task' concise (max 3-6 words).

        IMPORTANT: 'duration_minutes' must be REALISTIC for the specific task.
        e.g., '3 deep breaths' -> 2 minutes. 'Drink water' -> 1 minute. 'Nap' -> 20 minutes. 'Read book' -> 30 minutes.
        Do NOT set 30 minutes for a 2 minute task.

        Return strictly JSON format.`,
        file_urls: [uploadRes.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            energy_level: { type: "integer" },
            mood: { type: "string", enum: ["neutral", "energetic", "happy", "tired", "concerned"] },
            message: { type: "string" },
            recommended_task: { type: "string" },
            task_type: { type: "string", enum: ["short", "long"] },
            duration_minutes: { type: "integer" },
            category: { type: "string", enum: ["health", "work", "relax", "learning", "relationships"] }
          }
        }
      });

      if (analysisRes && analysisRes.energy_level) {
        // Save history
        localStorage.setItem('lumi_last_scan', JSON.stringify({
            task: analysisRes.recommended_task,
            type: analysisRes.task_type || nextType
        }));

        onScanComplete(analysisRes.energy_level, analysisRes.message);
        setResult(analysisRes);
        setIsTaskAdded(false);
        setMode('result');
        
        // Speak the message
        let speechText = analysisRes.recommended_task 
          ? `${analysisRes.message}... ${t('energy.recommendedActivity')}... ${analysisRes.recommended_task}` 
          : analysisRes.message;

        if (analysisRes.recommended_task) {
          speechText += `... ${t('energy.addToPlanner')}`;
        }

        speakMessage(speechText);

        // Result stays visible until manually closed
      } else {
        throw new Error("Analysis failed");
      }

    } catch (error) {
      console.error(error);
      setMode('error');
    }
  };

  // Effect for auto-analysis
  useEffect(() => {
    if (mode === 'camera' && autoAnalyzePending) {
      const timer = setTimeout(() => {
        captureAndAnalyze();
        setAutoAnalyzePending(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mode, autoAnalyzePending]);

  // Auto-listen for confirmation after speaking result
  useEffect(() => {
    if (!isSpeaking && mode === 'result' && result?.recommended_task && !isTaskAdded) {
      // Start listening briefly for Yes/No
      startListening();
    }
  }, [isSpeaking, mode, result, isTaskAdded]);

  // Effect to attach stream to video element
  useEffect(() => {
    if (mode === 'camera' && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [mode, stream]);

  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      <canvas ref={canvasRef} className="hidden" />

      {/* Avatar Container */}
      <div className="relative w-64 h-64">
        {/* Camera Layer */}
        <AnimatePresence>
          {mode === 'camera' && (
            <motion.div 
              key="camera-preview"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                  opacity: 1, 
                  scale: 1,
                  borderRadius: ["50% 50% 50% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 50% 60% 30% 60%", "50% 50% 50% 50%"] 
              }}
              transition={{ 
                  borderRadius: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 overflow-hidden border-[6px] border-rose-400 z-0 bg-black shadow-[0_0_40px_rgba(244,63,94,0.4)]"
            >
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform scale-x-[-1]" 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar Layer - Always Visible */}
        <motion.div 
          className="absolute z-10"
          initial={{ 
            width: '16rem', 
            height: '16rem', 
            bottom: 0,
            right: 0,
            opacity: 1
          }}
          animate={mode === 'camera' ? { 
            width: '7rem', 
            height: '7rem', 
            bottom: '-1.5rem', 
            right: '-1.5rem',
            opacity: 1,
            rotate: -10
          } : { 
            width: '16rem', 
            height: '16rem', 
            bottom: 0,
            right: 0,
            opacity: 1,
            rotate: 0
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <motion.div
             className="w-full h-full drop-shadow-2xl"
          >
            <LiveAvatar 
              mood={
                (mode === 'camera' || mode === 'processing') ? 'happy' :
                (result?.mood || 
                ((result ? result.energy_level : currentEnergyLevel) <= 3 ? 'tired' : 
                (result ? result.energy_level : currentEnergyLevel) <= 7 ? 'neutral' : 'energetic'))
              } 
              isListening={isListening} 
              isSpeaking={isSpeaking}
            />
          </motion.div>

          {/* Result Score Overlay on Avatar */}
          {mode === 'result' && result && (
             <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 bg-white rounded-full px-3 py-1 shadow-lg border border-rose-100 text-sm font-bold text-rose-600 z-20"
             >
                {result.energy_level}/10
             </motion.div>
          )}
        </motion.div>

        {/* Processing Overlay */}
        <AnimatePresence>
          {mode === 'processing' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            >
              <motion.div 
                  className="absolute inset-0 border-[6px] border-rose-400/60 rounded-full"
                  animate={{ scale: [1, 1.2], opacity: [1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div 
                  className="absolute inset-0 border-[6px] border-purple-400/60 rounded-full"
                  animate={{ scale: [1, 1.1], opacity: [1, 0] }}
                  transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
              />
              <div className="w-48 h-48 rounded-full border-4 border-white/50 border-t-white animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Overlay */}
        <AnimatePresence>
          {mode === 'error' && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-20"
            >
              <X className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-3">
        {(mode === 'idle' || mode === 'camera') && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={startListening}
            className={`rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 ${isListening ? 'bg-rose-100 animate-pulse' : ''}`}
          >
            <Mic className="w-4 h-4 mr-2" />
            {isListening ? t('energy.listen') : t('energy.command')}
          </Button>
        )}

        {mode === 'idle' && (
          <Button 
            size="sm"
            onClick={startCamera}
            className="rounded-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white shadow-md shadow-rose-200"
          >
            <Camera className="w-4 h-4 mr-2" />
            {t('energy.scan')}
          </Button>
        )}

        {mode === 'camera' && (
          <Button 
            size="sm"
            onClick={captureAndAnalyze}
            className="rounded-full bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
          >
            <Zap className="w-4 h-4 mr-2" />
            {t('energy.analyze')}
          </Button>
        )}

        {(mode === 'processing') && (
          <p className="text-sm text-rose-500 font-medium animate-pulse">
            {t('energy.analyzing')}
          </p>
        )}

        {mode === 'error' && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setMode('idle')}
            className="text-rose-500 hover:bg-rose-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('energy.retry')}
          </Button>
        )}

        {mode === 'result' && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
                setMode('idle');
                setResult(null);
            }}
            className="text-rose-500 hover:bg-rose-50"
          >
            <X className="w-4 h-4 mr-2" />
            {t('energy.done')}
            </Button>
            )}
      </div>

      {mode === 'idle' && !isListening && (
        <p className="text-xs text-rose-300 mt-2">
          {t('energy.hint')}
        </p>
      )}

      {mode === 'result' && result && (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center max-w-xs px-4"
        >
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-emerald-600 font-medium text-sm italic">"{result.message}"</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-full"
                onClick={() => {
                  const speechText = result.recommended_task 
                    ? `${result.message}... ${t('energy.recommendedActivity')}... ${result.recommended_task}` 
                    : result.message;
                  speakMessage(speechText);
                }}
                >
                <Volume2 className="w-3 h-3" />
              </Button>
            </div>
            {result.recommended_task && (
              <div className="bg-rose-50 rounded-lg p-2 border border-rose-100">
                <p className="text-xs text-rose-400 uppercase font-bold mb-1">{t('energy.recommendedActivity')}</p>
                <p className="text-rose-700 font-medium text-sm mb-2">{result.recommended_task}</p>
                {onAddTask && !isTaskAdded && (
                  <div className="mt-2 pt-2 border-t border-rose-100">
                    <p className="text-xs text-rose-500 mb-2 text-center font-medium">{t('energy.addToPlanner')}</p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                              setIsTaskAdded(true);
                              onAddTask(result.recommended_task, result.task_type, result.duration_minutes, result.category);
                          }}
                          className="h-7 px-4 text-xs border-rose-200 text-rose-600 hover:bg-rose-100"
                      >
                          <Check className="w-3 h-3 mr-1" />
                          {t('energy.yes')}
                      </Button>
                      <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setIsTaskAdded(true)}
                          className="h-7 px-4 text-xs text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                          <X className="w-3 h-3 mr-1" />
                          {t('energy.no')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </motion.div>
      )}
    </div>
  );
}