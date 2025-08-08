import React from 'react';
import { TechStack } from '@/constants/techStacks';

interface TechItemProps {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  url: string;
}

export const TechItem: React.FC<TechItemProps> = ({ name, icon: Icon, color, url }) => (
  <div
    className="flex items-center space-x-3 text-slate-600 hover:text-slate-800 tech-item group cursor-pointer min-w-max"
    onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }}
  >
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 border border-slate-200">
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <span className="text-sm font-medium whitespace-nowrap">{name}</span>
  </div>
);
