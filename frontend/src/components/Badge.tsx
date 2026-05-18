import React from 'react';
import { LeadStatus, LeadSource } from '../types/lead';

interface BadgeProps {
  type: 'status' | 'source';
  value: LeadStatus | LeadSource;
}

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  if (type === 'status') {
    switch (value) {
      case 'New':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
            <span>New</span>
          </span>
        );
      case 'Contacted':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span>Contacted</span>
          </span>
        );
      case 'Qualified':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-900 dark:text-white">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </span>
            <span>Qualified</span>
          </span>
        );
      case 'Lost':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span>Lost</span>
          </span>
        );
      default:
        return null;
    }
  } else {
    switch (value) {
      case 'Website':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span>Website</span>
          </span>
        );
      case 'Instagram':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-pink-300">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]" />
            <span>Instagram</span>
          </span>
        );
      case 'Referral':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
            <span>Referral</span>
          </span>
        );
      default:
        return null;
    }
  }
};
