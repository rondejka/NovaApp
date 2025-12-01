import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function LiveAvatar({ mood = 'neutral', isListening = false, isSpeaking = false }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [gazePos, setGazePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef(null);

  // Random gaze movement for lifelike behavior
  useEffect(() => {
    const moveGaze = () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 5; // Subtle movement
      setGazePos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    };

    const interval = setInterval(moveGaze, 3000 + Math.random() * 4000);
    moveGaze(); // Initial movement

    return () => clearInterval(interval);
  }, []);

  // Handle mouse movement for eye tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 20;
      const y = (e.clientY - rect.top - rect.height / 2) / 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Mood configurations
  const moodConfig = {
    neutral: {
      color: "#fb7185", // rose-400
      eyeShape: 1, // normal open
      mouthD: "M 35,65 Q 50,70 65,65", // slight smile
      bounce: { y: [0, -5, 0], transition: { duration: 4, repeat: Infinity } }
    },
    energetic: {
      color: "#f59e0b", // amber-500
      eyeShape: 1.2, // wide open
      mouthD: "M 35,60 Q 50,80 65,60", // big open smile
      bounce: { y: [0, -15, 0], transition: { duration: 0.5, repeat: Infinity } }
    },
    happy: {
      color: "#ec4899", // pink-500
      eyeShape: 1.1,
      mouthD: "M 35,65 Q 50,75 65,65", // happy smile
      bounce: { y: [0, -10, 0], transition: { duration: 2, repeat: Infinity } }
    },
    tired: {
      color: "#6366f1", // indigo-500
      eyeShape: 0.6, // sleepy eyes
      mouthD: "M 40,70 Q 50,70 60,70", // straight/small
      bounce: { y: [0, 2, 0], transition: { duration: 6, repeat: Infinity } }
    },
    concerned: {
      color: "#0d9488", // teal-600
      eyeShape: 1,
      mouthD: "M 35,70 Q 50,60 65,70", // frown
      bounce: { y: [0, 0, 0], rotate: [0, -2, 2, 0], transition: { duration: 4, repeat: Infinity } }
    }
  };

  const currentMood = moodConfig[mood] || moodConfig.neutral;

  // Calculate "O" shaped mouth for speaking
  const getSpeakingMouth = (d) => {
    try {
      const parts = d.split(' '); // ["M", "35,65", "Q", "50,70", "65,65"]
      if (parts.length >= 5) {
        const start = parts[1].split(',').map(Number);
        const control = parts[3].split(',').map(Number);
        const end = parts[4].split(',').map(Number);
        
        // Move corners inward to form an O shape (narrower)
        const newStartX = start[0] + 8; 
        const newEndX = end[0] - 8;
        
        // Open mouth deeper
        const newControlY = control[1] + 25;
        
        return `M ${newStartX},${start[1]} Q ${control[0]},${newControlY} ${newEndX},${end[1]}`;
      }
      return d;
    } catch (e) {
      return d;
    }
  };

  const speakingMouthD = getSpeakingMouth(currentMood.mouthD);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {/* Aura/Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-48 h-48 rounded-full blur-2xl"
        style={{ backgroundColor: currentMood.color }}
      />

      {/* Character Container */}
      <motion.div
        animate={currentMood.bounce}
        className="relative w-40 h-40"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          {/* Face Shape */}
          <defs>
            <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff0f5" />
              <stop offset="100%" stopColor="#ffe4e6" />
            </linearGradient>
          </defs>
          
          <motion.path
            d="M 10,50 Q 10,10 50,10 Q 90,10 90,50 Q 90,90 50,90 Q 10,90 10,50"
            fill="url(#faceGradient)"
            stroke={currentMood.color}
            strokeWidth="3"
            initial={false}
            animate={{ stroke: currentMood.color }}
          />

          {/* Eyes Container */}
          <g transform={`translate(${mousePos.x + gazePos.x}, ${mousePos.y + gazePos.y})`}>
            {/* Left Eye */}
            <motion.ellipse
              cx="35"
              cy="45"
              rx="8"
              ry={isBlinking ? 0.5 : 8 * currentMood.eyeShape}
              fill="#1e293b"
              animate={{ ry: isBlinking ? 0.5 : 8 * currentMood.eyeShape }}
            />
            <circle cx="37" cy="43" r="2" fill="white" opacity={isBlinking ? 0 : 0.6} />

            {/* Right Eye */}
            <motion.ellipse
              cx="65"
              cy="45"
              rx="8"
              ry={isBlinking ? 0.5 : 8 * currentMood.eyeShape}
              fill="#1e293b"
              animate={{ ry: isBlinking ? 0.5 : 8 * currentMood.eyeShape }}
            />
            <circle cx="67" cy="43" r="2" fill="white" opacity={isBlinking ? 0 : 0.6} />
          </g>

          {/* Cheeks */}
          <motion.circle cx="25" cy="60" r="5" fill="#fda4af" opacity="0.4" animate={{ scale: mood === 'happy' ? 1.2 : 1 }} />
          <motion.circle cx="75" cy="60" r="5" fill="#fda4af" opacity="0.4" animate={{ scale: mood === 'happy' ? 1.2 : 1 }} />

          {/* Mouth */}
          <motion.path
            d={currentMood.mouthD}
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
            strokeLinecap="round"
            initial={false}
            animate={isSpeaking ? {
              d: [currentMood.mouthD, speakingMouthD, currentMood.mouthD]
            } : { 
              d: currentMood.mouthD 
            }}
            transition={isSpeaking ? {
              duration: 0.3, // Slower movement
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            } : { 
              type: "spring", stiffness: 300, damping: 20 
            }}
          />
          
          {/* Listening Indicator */}
          {isListening && (
            <motion.path
              d="M 20,80 Q 50,95 80,80"
              stroke={currentMood.color}
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
              animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </svg>

        {/* Accessories based on mood */}
        {mood === 'tired' && (
          <motion.div 
            className="absolute -top-4 right-0 text-2xl font-bold text-indigo-400"
            animate={{ y: -20, opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            zZz
          </motion.div>
        )}
        {mood === 'energetic' && (
          <motion.div 
            className="absolute -top-2 -right-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            ⚡
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}