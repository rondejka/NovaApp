import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Briefcase, Users, BookOpen, Coffee } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function LifeHarmonyWheel({ values = {}, size = 200, onSelect, selectedArea }) {
  const { t } = useLanguage();

  const areas = [
    { key: 'health', label: t('lifeHarmony.health'), color: '#10B981', angle: 0, Icon: Heart },
    { key: 'work', label: t('lifeHarmony.work'), color: '#8B5CF6', angle: 72, Icon: Briefcase },
    { key: 'relationships', label: t('lifeHarmony.relationships'), color: '#EC4899', angle: 144, Icon: Users },
    { key: 'learning', label: t('lifeHarmony.learning'), color: '#F59E0B', angle: 216, Icon: BookOpen },
    { key: 'relax', label: t('lifeHarmony.relax'), color: '#6366F1', angle: 288, Icon: Coffee },
  ];
  const center = size / 2;
  const maxRadius = (size / 2) - 30;

  const getPoint = (angle, value) => {
    const rad = (angle - 90) * (Math.PI / 180);
    const r = (value / 10) * maxRadius;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  const points = areas.map(area => getPoint(area.angle, values[area.key] || 5));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {/* Background circles */}
        {[2, 4, 6, 8, 10].map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 10) * maxRadius}
            fill="none"
            stroke="rgba(236,72,153,0.15)"
            strokeWidth="1"
          />
        ))}
        
        {/* Axis lines */}
        {areas.map(area => {
          const endPoint = getPoint(area.angle, 10);
          return (
            <line
              key={area.key}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="rgba(236,72,153,0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled area */}
        <motion.path
          d={pathD}
          fill="url(#harmonyGradientLight)"
          fillOpacity="0.5"
          stroke="url(#harmonyGradientLight)"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Icon Points */}
        {points.map((point, i) => {
          const Icon = areas[i].Icon;
          const isSelected = selectedArea === areas[i].key;
          const isDimmed = selectedArea && !isSelected;
          
          return (
            <motion.g
              key={areas[i].key}
              initial={{ scale: 0 }}
              animate={{ 
                scale: isSelected ? 1.2 : 1,
                opacity: isDimmed ? 0.4 : 1
              }}
              transition={{ delay: 0.3 + i * 0.1 }}
              onClick={() => onSelect && onSelect(isSelected ? null : areas[i].key)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={isSelected ? "16" : "12"}
                fill={areas[i].color}
                stroke="white"
                strokeWidth="2"
              />
              <foreignObject
                x={point.x - (isSelected ? 10 : 8)}
                y={point.y - (isSelected ? 10 : 8)}
                width={isSelected ? "20" : "16"}
                height={isSelected ? "20" : "16"}
              >
                <Icon className={`text-white ${isSelected ? 'w-5 h-5' : 'w-4 h-4'}`} />
              </foreignObject>
            </motion.g>
          );
        })}

        <defs>
          <linearGradient id="harmonyGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9A8D4" />
            <stop offset="50%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#A5B4FC" />
          </linearGradient>
        </defs>
      </svg>

      {/* Labels */}
      {areas.map(area => {
        const labelPoint = getPoint(area.angle, 12);
        return (
          <div
            key={area.key}
            className="absolute text-xs font-medium text-rose-600 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: labelPoint.x, top: labelPoint.y }}
          >
            {area.label}
          </div>
        );
      })}
    </div>
  );
}