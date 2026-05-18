import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { LeadStatus, LeadSource } from '../types/lead';
import api from '../services/api';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string | null; // If present, we are in EDIT mode. If null, we are in CREATE mode.
  onSaveSuccess: (type: 'create' | 'update', name: string) => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  leadId,
  onSaveSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [source, setSource] = useState<LeadSource>('Website');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setStatus('New');
      setSource('Website');
      setValidationErrors({});
      setApiError(null);

      if (leadId) {
        const fetchLead = async () => {
          setIsLoadingDetails(true);
          try {
            const response = await api.get(`/leads/${leadId}`);
            if (response.data?.success) {
              const lead = response.data.data.lead;
              setName(lead.name);
              setEmail(lead.email);
              setStatus(lead.status);
              setSource(lead.source);
            }
          } catch (err: any) {
            setApiError(err.response?.data?.message || 'Failed to fetch lead details.');
          } finally {
            setIsLoadingDetails(false);
          }
        };
        fetchLead();
      }
    }
  }, [isOpen, leadId]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please provide a valid email';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    const payload = { name, email, status, source };

    try {
      if (leadId) {
        await api.put(`/leads/${leadId}`, payload);
      } else {
        await api.post('/leads', payload);
      }
      onSaveSuccess(leadId ? 'update' : 'create', name);
      onClose();
    } catch (err: any) {
      const serverErr = err.response?.data;
      if (serverErr?.errors && Array.isArray(serverErr.errors)) {
        const fieldErrors: Record<string, string> = {};
        serverErr.errors.forEach((e: any) => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        setValidationErrors(fieldErrors);
      } else {
        setApiError(serverErr?.message || 'An error occurred while saving the lead.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white dark:bg-[#0d0f17] border border-slate-200/60 dark:border-slate-900/60 shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4 mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            {leadId ? 'Edit Lead Record' : 'Register New Lead'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/50 bg-white dark:bg-[#121622] hover:bg-slate-50 dark:hover:bg-[#161a29] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {isLoadingDetails ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading lead details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
              <div className="flex items-start space-x-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-455">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{apiError}</span>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Lead Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter lead full name"
                className={`w-full px-3.5 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-[#07080c] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-500 ${
                  validationErrors.name ? 'border-rose-500 ring-rose-500/10' : 'border-slate-200/60 dark:border-slate-900/60'
                }`}
              />
              {validationErrors.name && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className={`w-full px-3.5 py-2.5 rounded-lg border bg-slate-50/50 dark:bg-[#07080c] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-500 ${
                  validationErrors.email ? 'border-rose-500 ring-rose-500/10' : 'border-slate-200/60 dark:border-slate-900/60'
                }`}
              />
              {validationErrors.email && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{validationErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  Lead Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/60 dark:border-slate-900/60 bg-slate-50/50 dark:bg-[#07080c] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all cursor-pointer"
                >
                  <option value="New" className="bg-white dark:bg-[#0d0f17] text-slate-900 dark:text-white">New</option>
                  <option value="Contacted" className="bg-white dark:bg-[#0d0f17] text-slate-900 dark:text-white">Contacted</option>
                  <option value="Qualified" className="bg-white dark:bg-[#0d0f17] text-slate-900 dark:text-white">Qualified</option>
                  <option value="Lost" className="bg-white dark:bg-[#0d0f17] text-slate-900 dark:text-white">Lost</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  Lead Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200/60 dark:border-slate-900/60 bg-slate-50/50 dark:bg-[#07080c] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all cursor-pointer"
                >
                  <option value="Website" className="bg-white dark:bg-[#0d0f17] text-slate-900 dark:text-white">Website</option>
                  <option value="Instagram" className="bg-white dark:bg-[#0d0f17] text-slate-900 dark:text-white">Instagram</option>
                  <option value="Referral" className="bg-white dark:bg-[#0d0f17] text-slate-900 dark:text-white">Referral</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800/40 pt-5 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-[#121622] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#161a29] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-750 text-white shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={12} />
                )}
                <span>{leadId ? 'Save Changes' : 'Create Record'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
