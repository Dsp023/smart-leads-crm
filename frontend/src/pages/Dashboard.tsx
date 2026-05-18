import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  RotateCcw,
  LogOut,
  Moon,
  Sun,
  Edit2,
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Inbox,
  AlertCircle,
  LayoutDashboard,
  BarChart2,
  Activity,
  ChevronDown,
  Briefcase,
  ArrowUpRight,
  UserCheck,
  Layers,
  TrendingUp,
  Globe,
  Instagram,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDebounce } from '../hooks/useDebounce';
import { Badge } from '../components/Badge';
import { LeadModal } from '../components/LeadModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { TableSkeleton, MetricSkeleton } from '../components/Skeletons';
import { CustomDropdown } from '../components/CustomDropdown';
import api from '../services/api';

interface ActivityLog {
  id: string;
  type: 'create' | 'update' | 'delete';
  message: string;
  timestamp: string;
  user: string;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Lost', label: 'Lost' },
];

const sourceOptions = [
  { value: '', label: 'All Sources' },
  { value: 'Website', label: 'Website' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Referral', label: 'Referral' },
];

const sortOptions = [
  { value: 'latest', label: 'Sort: Latest' },
  { value: 'oldest', label: 'Sort: Oldest' },
];

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Navigation state (SaaS Sidebar routing)
  const [activeTab, setActiveTab] = useState<'pipeline' | 'analytics' | 'activity'>('pipeline');

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);

  // Debounced search (300ms)
  const debouncedSearch = useDebounce(search, 300);

  // Core API responses
  const [leads, setLeads] = useState<any[]>([]);
  const [allLeadsForAnalytics, setAllLeadsForAnalytics] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    totalLeads: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [metrics, setMetrics] = useState({
    total: 0,
    newCount: 0,
    contactedCount: 0,
    qualifiedCount: 0,
    lostCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // CRM Activity logs
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Modal Control States
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch leads and update dashboard metrics
  const fetchLeads = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const queryParams = new URLSearchParams();
      if (debouncedSearch) queryParams.append('search', debouncedSearch);
      if (status) queryParams.append('status', status);
      if (source) queryParams.append('source', source);
      if (sort) queryParams.append('sort', sort);
      queryParams.append('page', page.toString());
      queryParams.append('limit', '10');

      const response = await api.get(`/leads?${queryParams.toString()}`);
      if (response.data?.success) {
        setLeads(response.data.data.leads);
        setPagination(response.data.data.pagination);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch leads list.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated function to query total statistics to display in metrics and charts
  const fetchMetrics = async () => {
    try {
      // Query ALL leads without pagination to aggregate metrics totals
      const response = await api.get('/leads?limit=1000');
      if (response.data?.success) {
        const allLeads = response.data.data.leads || [];
        setAllLeadsForAnalytics(allLeads);
        
        const total = allLeads.length;
        const newCount = allLeads.filter((l: any) => l.status === 'New').length;
        const contactedCount = allLeads.filter((l: any) => l.status === 'Contacted').length;
        const qualifiedCount = allLeads.filter((l: any) => l.status === 'Qualified').length;
        const lostCount = allLeads.filter((l: any) => l.status === 'Lost').length;

        setMetrics({
          total,
          newCount,
          contactedCount,
          qualifiedCount,
          lostCount
        });
      }
    } catch (err) {
      console.warn('⚡ Failed to sync statistics metrics cards.');
    }
  };

  // Reload lists when filter states or page indexes change
  useEffect(() => {
    fetchLeads();
  }, [debouncedSearch, status, source, sort, page]);

  // Sync metrics cards on data updates
  useEffect(() => {
    fetchMetrics();
  }, [leads]);

  // Reset page to 1 when filters are modified
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, source, sort]);

  // Generate audit activity log mockup on events
  const addActivity = (type: 'create' | 'update' | 'delete', name: string) => {
    const messages = {
      create: `Created new lead record "${name}" under primary workspace.`,
      update: `Updated properties for client lead "${name}".`,
      delete: `Permanently removed lead "${name}" from pipeline.`,
    };

    const newLog: ActivityLog = {
      id: Math.random().toString(),
      type,
      message: messages[type],
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user: user?.name || 'Authorized Member',
    };
    setActivities((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setSource('');
    setSort('latest');
    setPage(1);
  };

  const handleAddLead = () => {
    setSelectedLeadId(null);
    setIsLeadModalOpen(true);
  };

  const handleEditLead = (id: string) => {
    setSelectedLeadId(id);
    setIsLeadModalOpen(true);
  };

  const handleDeleteTrigger = (id: string) => {
    setLeadToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    
    // Find name before delete for audit logging
    const targetLead = leads.find(l => l._id === leadToDelete);
    const targetName = targetLead ? targetLead.name : 'Unknown';

    try {
      await api.delete(`/leads/${leadToDelete}`);
      setIsConfirmOpen(false);
      setLeadToDelete(null);
      addActivity('delete', targetName);
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete lead. Check permissions.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Stream-based CSV file downloader
  const handleExportCSV = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (debouncedSearch) queryParams.append('search', debouncedSearch);
      if (status) queryParams.append('status', status);
      if (source) queryParams.append('source', source);
      if (sort) queryParams.append('sort', sort);

      // Call streaming route
      const response = await api.get(`/leads/export/csv?${queryParams.toString()}`, {
        responseType: 'blob',
      });

      // Create browser link to trigger file save dialog
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to compile and download CSV file.');
    }
  };

  // Get user avatar initials
  const getAvatarInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Interactive Chart Math for Premium Donut Segment
  const totalVal = metrics.total || 1;
  const newPct = (metrics.newCount / totalVal) * 100;
  const contPct = (metrics.contactedCount / totalVal) * 100;
  const qualPct = (metrics.qualifiedCount / totalVal) * 100;
  const lostPct = (metrics.lostCount / totalVal) * 100;

  // Render SVG Donut Angles
  const r = 50;
  const circ = 2 * Math.PI * r;
  
  const newStrokeOffset = circ - (newPct / 100) * circ;
  const contStrokeOffset = circ - (contPct / 100) * circ;
  const qualStrokeOffset = circ - (qualPct / 100) * circ;
  const lostStrokeOffset = circ - (lostPct / 100) * circ;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#07080c] text-slate-800 dark:text-slate-200 transition-colors duration-200 overflow-hidden font-sans">
      {/* ==========================================
          LEFT SIDEBAR PANEL (SaaS Hub layout)
          ========================================== */}
      <aside className="w-64 border-r border-slate-200/60 dark:border-slate-900/60 bg-white dark:bg-[#0d0f17] flex flex-col justify-between hidden md:flex z-20 shrink-0">
        <div className="p-6 space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md">
              <Layers size={14} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Smart Leads
              </h1>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Enterprise CRM</span>
            </div>
          </div>

          {/* Quick Switcher Selector */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#121622] border border-slate-200/60 dark:border-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#161a29] transition-all">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-white dark:bg-[#1b2032] text-slate-700 dark:text-slate-350 rounded border border-slate-200/60 dark:border-slate-800 flex items-center justify-center text-[9px] font-bold">
                HQ
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">Primary Workspace</span>
            </div>
            <ChevronDown size={12} className="text-slate-400 dark:text-slate-300" />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeTab === 'pipeline'
                  ? 'bg-slate-100 dark:bg-[#1c2135] text-slate-900 dark:text-white border border-slate-200/30 dark:border-slate-800/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard size={14} className={activeTab === 'pipeline' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400/80'} />
              <span>Leads Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeTab === 'analytics'
                  ? 'bg-slate-100 dark:bg-[#1c2135] text-slate-900 dark:text-white border border-slate-200/30 dark:border-slate-800/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 size={14} className={activeTab === 'analytics' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400/80'} />
              <span>Visual Analytics</span>
              {metrics.total > 0 && (
                <span className="ml-auto bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                  {metrics.total}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeTab === 'activity'
                  ? 'bg-slate-100 dark:bg-[#1c2135] text-slate-900 dark:text-white border border-slate-200/30 dark:border-slate-800/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity size={14} className={activeTab === 'activity' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400/80'} />
              <span>Activity Log</span>
            </button>
          </nav>
        </div>

        {/* User Card bottom details */}
        <div className="p-6 border-t border-slate-200/60 dark:border-slate-900/60 space-y-4 bg-slate-50/50 dark:bg-[#0b0c13]">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
              {getAvatarInitials()}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {user?.name}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase ${
                  user?.role === 'Admin'
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/50 bg-white dark:bg-[#121622] text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161a29] hover:text-slate-700 dark:hover:text-slate-200 transition-all"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>

            <button
              onClick={logout}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-rose-200/40 dark:border-rose-950/20 bg-rose-50/30 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
            >
              <LogOut size={12} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN AREA CONTENT (Tabs selector)
          ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Mobile Header section */}
        <header className="sticky top-0 z-40 bg-white dark:bg-[#0d0f17] border-b border-slate-200/60 dark:border-slate-900/60 md:hidden flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center text-white">
              <Layers size={14} />
            </div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100">Smart Leads</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/50 text-slate-400 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        <div className="flex border-b border-slate-200/60 dark:border-slate-900/60 bg-white dark:bg-[#0d0f17] md:hidden">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex-1 text-center py-3 text-xs font-bold border-b-2 ${
              activeTab === 'pipeline' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-300'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 text-center py-3 text-xs font-bold border-b-2 ${
              activeTab === 'analytics' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 text-center py-3 text-xs font-bold border-b-2 ${
              activeTab === 'activity' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-300'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Dynamic Inner Panel Viewport */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* HEADER SECTION */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-wider uppercase">
                <Briefcase size={11} className="text-slate-400" />
                <span>Enterprise Workspace</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
                Welcome back, {user?.name.split(' ')[0]}
              </h2>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                Monitor customer relationships and conversion channels from your central workspace.
              </p>
            </div>
            
            {activeTab === 'pipeline' && (
              <button
                onClick={handleAddLead}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-indigo-500/10 transition-all duration-150 text-center"
              >
                <Plus size={14} />
                <span>Add Client Lead</span>
              </button>
            )}
          </section>

          {/* ==========================================
              TAB VIEW: LEADS PIPELINE (Core CRUD)
              ========================================== */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* METRIC GRID CARD SLOTS */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => <MetricSkeleton key={idx} />)
                ) : (
                  <>
                    {/* Metric 1 */}
                    <div className="relative overflow-hidden bg-white dark:bg-[#0d0f17] p-5 rounded-xl border border-slate-200/60 dark:border-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-200">
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Pipeline Total
                        </span>
                        <div className="h-7 w-7 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/20 shadow-sm shrink-0">
                          <TrendingUp size={13} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                          {metrics.total}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5">
                          Active contacts
                        </p>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="relative overflow-hidden bg-white dark:bg-[#0d0f17] p-5 rounded-xl border border-slate-200/60 dark:border-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-200">
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          New Status
                        </span>
                        <div className="h-7 w-7 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100/50 dark:border-blue-900/20 shadow-sm shrink-0">
                          <Inbox size={13} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                          {metrics.newCount}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5">
                          Awaiting follow-up
                        </p>
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="relative overflow-hidden bg-white dark:bg-[#0d0f17] p-5 rounded-xl border border-slate-200/60 dark:border-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-200">
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Contacted
                        </span>
                        <div className="h-7 w-7 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100/50 dark:border-amber-900/20 shadow-sm shrink-0">
                          <Phone size={13} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                          {metrics.contactedCount}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5">
                          In communication
                        </p>
                      </div>
                    </div>

                    {/* Metric 4 */}
                    <div className="relative overflow-hidden bg-white dark:bg-[#0d0f17] p-5 rounded-xl border border-slate-200/60 dark:border-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-200">
                      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Qualified
                        </span>
                        <div className="h-7 w-7 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-900/20 shadow-sm shrink-0">
                          <UserCheck size={13} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                          {metrics.qualifiedCount}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5">
                          High conversion ratio
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* SEARCH FILTERS AND GRID WRAPPERS */}
              <section className="bg-white dark:bg-[#0d0f17] p-5 rounded-xl border border-slate-200/60 dark:border-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  
                  {/* Clean flat search input */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={14} />
                    </div>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search leads by name or email address..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200/60 dark:border-slate-900/60 bg-slate-50/50 dark:bg-[#07080c] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  {/* Actions buttons panel */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-[#121622] text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#161a29] transition-all shrink-0"
                      title="Reset active query filters"
                    >
                      <RotateCcw size={13} />
                      <span className="hidden sm:inline">Reset Filters</span>
                    </button>

                    <button
                      onClick={handleExportCSV}
                      className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-[#121622] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#161a29] transition-all shrink-0"
                    >
                      <Download size={13} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Dropdowns filters */}
                <div className="flex flex-wrap items-center gap-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/40">
                  <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <Filter size={11} />
                    <span>Filter:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Status filter selection popover */}
                    <CustomDropdown
                      value={status}
                      onChange={setStatus}
                      options={statusOptions}
                      icon={<Activity size={12} />}
                    />

                    {/* Source filter selection popover */}
                    <CustomDropdown
                      value={source}
                      onChange={setSource}
                      options={sourceOptions}
                      icon={<Globe size={12} />}
                    />
                  </div>

                  {/* Sort direction selector */}
                  <div className="ml-auto">
                    <CustomDropdown
                      value={sort}
                      onChange={setSort}
                      options={sortOptions}
                    />
                  </div>
                </div>
              </section>

              {/* TABLE PIPELINE VIEW */}
              <section>
                {errorMsg && (
                  <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 mb-6">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {isLoading ? (
                  <TableSkeleton rows={7} />
                ) : leads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center bg-white dark:bg-[#0d0f17] p-12 rounded-xl border border-slate-200/60 dark:border-slate-900/60 text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                    <div className="h-11 w-11 bg-slate-50 dark:bg-[#07080c] rounded-lg flex items-center justify-center text-slate-400 mb-4 border border-slate-100 dark:border-slate-900/40">
                      <Inbox size={22} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">No leads match filters</h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mt-1">
                      No lead records match your active search filters. Adjust your queries or register a new user profile.
                    </p>
                    {(search || status || source) && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-slate-50 dark:bg-[#121622] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-[#161a29] transition-all"
                      >
                        <RotateCcw size={12} />
                        <span>Reset All Filters</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-900/60 bg-white dark:bg-[#0d0f17] shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-900/60 text-left">
                        <thead className="bg-slate-50/40 dark:bg-[#0b0c13] text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-900/60">
                          <tr>
                            <th className="px-6 py-4 font-bold">Lead Name</th>
                            <th className="px-6 py-4 font-bold">Email Address</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold">Source</th>
                            <th className="px-6 py-4 font-bold">Assigned Creator</th>
                            <th className="px-6 py-4 font-bold">Created Date</th>
                            <th className="px-6 py-4 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900/30 text-xs">
                          {leads.map((lead) => {
                            const createdDate = new Date(lead.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            });
                            const creatorName = lead.createdBy?.name || 'System Auto';
                            const creatorRole = lead.createdBy?.role || '';

                            return (
                              <tr
                                key={lead._id}
                                className="hover:bg-slate-50/40 dark:hover:bg-[#121622]/40 transition-colors duration-150"
                              >
                                {/* Name */}
                                <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white">
                                  {lead.name}
                                </td>
                                
                                {/* Email */}
                                <td className="px-6 py-4.5 text-slate-500 dark:text-slate-350 font-semibold font-mono">
                                  {lead.email}
                                </td>
                                
                                {/* Status Badge */}
                                <td className="px-6 py-4.5">
                                  <Badge type="status" value={lead.status} />
                                </td>
                                
                                {/* Source Badge */}
                                <td className="px-6 py-4.5">
                                  <Badge type="source" value={lead.source} />
                                </td>
                                
                                {/* Assigned Creator */}
                                <td className="px-6 py-4.5">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-750 dark:text-slate-200">
                                      {creatorName}
                                    </span>
                                    {creatorRole && (
                                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">
                                        {creatorRole}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4.5 text-slate-500 dark:text-slate-350 font-semibold">
                                  {createdDate}
                                </td>
                                
                                <td className="px-6 py-4.5 text-right">
                                  <div className="flex items-center justify-end space-x-1.5">
                                    <button
                                      onClick={() => handleEditLead(lead._id)}
                                      className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/50 bg-white dark:bg-[#121622] hover:bg-slate-50 dark:hover:bg-[#161a29] hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-400 transition-all duration-150"
                                      title="Edit details"
                                    >
                                      <Edit2 size={12} />
                                    </button>

                                    {user?.role === 'Admin' ? (
                                      <button
                                        onClick={() => handleDeleteTrigger(lead._id)}
                                        className="p-1.5 rounded-lg border border-rose-200/40 dark:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/5 text-rose-650 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-900 dark:hover:text-rose-200 transition-all duration-155"
                                        title="Delete Lead"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    ) : (
                                      <div
                                        className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-850 bg-slate-100/50 dark:bg-[#121622]/40 text-slate-350 dark:text-slate-650 cursor-not-allowed group relative"
                                        title="Role restricted. Requires Admin permissions."
                                      >
                                        <Lock size={12} />
                                        <span className="pointer-events-none absolute -top-8 right-0 w-32 rounded-md bg-slate-900 dark:bg-slate-950 border border-slate-850 px-2 py-1 text-[9px] font-semibold text-white dark:text-slate-200 opacity-0 transition-opacity group-hover:opacity-100 text-center shadow-lg z-30">
                                          Admin Role Required
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* PAGINATION PANEL FOOTER */}
                    <div className="bg-slate-50/30 dark:bg-[#0b0c13]/40 px-6 py-3.5 border-t border-slate-200/60 dark:border-slate-900/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-slate-450 font-bold uppercase tracking-wider">
                        Showing{' '}
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">
                          {pagination.totalLeads === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">
                          {Math.min(pagination.currentPage * pagination.limit, pagination.totalLeads)}
                        </span>{' '}
                        of{' '}
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">
                          {pagination.totalLeads}
                        </span>{' '}
                        records
                      </span>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={!pagination.hasPrevPage}
                          className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/50 bg-white dark:bg-[#121622] text-slate-400 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-[#161a29] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all duration-150"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <span className="text-xs font-extrabold text-slate-650 dark:text-slate-300 px-2 font-mono">
                          {pagination.currentPage} / {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                          disabled={!pagination.hasNextPage}
                          className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/50 bg-white dark:bg-[#121622] text-slate-400 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-[#161a29] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all duration-150"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ==========================================
              TAB VIEW: VISUAL ANALYTICS (SVG Renderers)
              ========================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-200">
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Visual Card 1: Status Donut Segment */}
                <div className="bg-white dark:bg-[#0d0f17] p-6 rounded-xl border border-slate-200/60 dark:border-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Interactive Status Ring</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Dynamic distribution counts of pipeline. Click on a badge below to filter pipeline.
                    </p>
                  </div>

                  {/* Reactive Donut drawing */}
                  <div className="my-6 flex items-center justify-center">
                    <div className="relative h-40 w-40">
                      {metrics.total === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                          No pipeline data
                        </div>
                      ) : (
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                          {/* Segment Lost */}
                          <circle
                            cx="60"
                            cy="60"
                            r={r}
                            fill="transparent"
                            className="stroke-rose-500 dark:stroke-rose-600"
                            strokeWidth="9"
                            strokeDasharray={circ}
                            strokeDashoffset={lostStrokeOffset}
                          />
                          {/* Segment Contacted */}
                          <circle
                            cx="60"
                            cy="60"
                            r={r}
                            fill="transparent"
                            className="stroke-amber-400 dark:stroke-amber-500"
                            strokeWidth="9"
                            strokeDasharray={circ}
                            strokeDashoffset={contStrokeOffset}
                          />
                          {/* Segment Qualified */}
                          <circle
                            cx="60"
                            cy="60"
                            r={r}
                            fill="transparent"
                            className="stroke-emerald-500 dark:stroke-emerald-600"
                            strokeWidth="9"
                            strokeDasharray={circ}
                            strokeDashoffset={qualStrokeOffset}
                          />
                          {/* Segment New */}
                          <circle
                            cx="60"
                            cy="60"
                            r={r}
                            fill="transparent"
                            className="stroke-blue-500 dark:stroke-blue-600"
                            strokeWidth="9"
                            strokeDasharray={circ}
                            strokeDashoffset={newStrokeOffset}
                          />
                        </svg>
                      )}
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#0d0f17] rounded-full m-4 border border-slate-100 dark:border-slate-800/40">
                        <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{metrics.total}</span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leads</span>
                      </div>
                    </div>
                  </div>

                  {/* Legends Filter Click targets */}
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-200/60 dark:border-slate-900/60">
                    <button
                      onClick={() => { setStatus('New'); setActiveTab('pipeline'); }}
                      className="p-2 text-left rounded-lg bg-slate-50/50 dark:bg-[#07080c] border border-slate-200/60 dark:border-slate-900/60 hover:bg-slate-100 dark:hover:bg-[#121622] hover:border-slate-350 dark:hover:border-slate-850 transition-all flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-blue-500 inline-flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span>New</span>
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{metrics.newCount}</span>
                    </button>

                    <button
                      onClick={() => { setStatus('Contacted'); setActiveTab('pipeline'); }}
                      className="p-2 text-left rounded-lg bg-slate-50/50 dark:bg-[#07080c] border border-slate-200/60 dark:border-slate-900/60 hover:bg-slate-100 dark:hover:bg-[#121622] hover:border-slate-350 dark:hover:border-slate-850 transition-all flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-amber-500 inline-flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        <span>Contacted</span>
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{metrics.contactedCount}</span>
                    </button>

                    <button
                      onClick={() => { setStatus('Qualified'); setActiveTab('pipeline'); }}
                      className="p-2 text-left rounded-lg bg-slate-50/50 dark:bg-[#07080c] border border-slate-200/60 dark:border-slate-900/60 hover:bg-slate-100 dark:hover:bg-[#121622] hover:border-slate-350 dark:hover:border-slate-850 transition-all flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-emerald-500 inline-flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Qualified</span>
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{metrics.qualifiedCount}</span>
                    </button>

                    <button
                      onClick={() => { setStatus('Lost'); setActiveTab('pipeline'); }}
                      className="p-2 text-left rounded-lg bg-slate-50/50 dark:bg-[#07080c] border border-slate-200/60 dark:border-slate-900/60 hover:bg-slate-100 dark:hover:bg-[#121622] hover:border-slate-350 dark:hover:border-slate-850 transition-all flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-rose-500 inline-flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        <span>Lost</span>
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{metrics.lostCount}</span>
                    </button>
                  </div>
                </div>

                {/* Visual Card 2: Source Analytics Meter */}
                <div className="bg-white dark:bg-[#0d0f17] p-6 rounded-xl border border-slate-200/60 dark:border-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Ingestion Channels</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Dynamic distribution counts of lead channels.
                    </p>
                  </div>

                  {/* Horizontal visual graphs */}
                  <div className="space-y-5 my-8">
                    {/* Source: Website */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Globe size={12} className="text-slate-400" />
                          <span>Website Ingestions</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {allLeadsForAnalytics.filter(l => l.source === 'Website').length} leads
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-[#07080c] rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-900/30">
                        <div
                          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${(allLeadsForAnalytics.filter(l => l.source === 'Website').length / (metrics.total || 1)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Instagram size={12} className="text-slate-400" />
                          <span>Instagram Leads</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {allLeadsForAnalytics.filter(l => l.source === 'Instagram').length} leads
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-[#07080c] rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-900/30">
                        <div
                          className="h-full bg-purple-600 dark:bg-purple-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${(allLeadsForAnalytics.filter(l => l.source === 'Instagram').length / (metrics.total || 1)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Source: Referral */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <UserCheck size={12} className="text-slate-400" />
                          <span>Direct Referral</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {allLeadsForAnalytics.filter(l => l.source === 'Referral').length} leads
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-[#07080c] rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-900/30">
                        <div
                          className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${(allLeadsForAnalytics.filter(l => l.source === 'Referral').length / (metrics.total || 1)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-900/60 text-[11px] text-slate-500 dark:text-slate-450">
                    Percentages are calculated relative to the total pipeline records saved on the CRM database.
                  </div>
                </div>

              </section>
            </div>
          )}

          {/* ==========================================
              TAB VIEW: ACTIVITY LOGS (CRM Audit Trail)
              ========================================== */}
          {activeTab === 'activity' && (
            <div className="space-y-5 animate-in slide-in-from-right duration-200 max-w-3xl mx-auto">
              <div className="bg-white dark:bg-[#0d0f17] p-6 rounded-xl border border-slate-200/60 dark:border-slate-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-900/60">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">CRM Live Activity Log</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Audit trail logs tracking lead CRUD executions in this browser session.
                    </p>
                  </div>
                  <button
                    onClick={() => setActivities([])}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200/60 dark:border-slate-800/40 bg-slate-50/50 dark:bg-[#121622] text-slate-650 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#161a29] transition-all"
                  >
                    Clear History
                  </button>
                </div>

                {activities.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <Activity size={20} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="text-xs font-semibold">No active log entries recorded.</p>
                    <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1">Actions like adding, editing, or deleting leads will stream audits here.</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50/50 dark:bg-[#07080c] border border-slate-200/60 dark:border-slate-900/40 animate-in fade-in"
                      >
                        <div className={`mt-0.5 h-5 w-5 rounded flex items-center justify-center text-xs font-bold ${
                          act.type === 'create'
                            ? 'bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
                            : act.type === 'update'
                            ? 'bg-amber-50/50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                            : 'bg-rose-50/50 text-rose-650 dark:bg-rose-950/20 dark:text-rose-450'
                        }`}>
                          {act.type === 'create' ? <Plus size={10} /> : act.type === 'update' ? <Edit2 size={10} /> : <Trash2 size={10} />}
                        </div>
                        <div className="flex-1 text-xs text-left">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{act.message}</p>
                          <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">
                            <span>Creator: {act.user}</span>
                            <span>•</span>
                            <span>Recorded: {act.timestamp}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider inline-flex items-center">
                          Audit <ArrowUpRight size={9} className="ml-0.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* LEAD CREATION & EDIT MODAL OVERLAY */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        leadId={selectedLeadId}
        onSaveSuccess={(type, name) => {
          fetchLeads();
          addActivity(type, name);
        }}
      />

      {/* CONFIRM LEAD DELETION DIALOG */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Lead Record"
        message="Are you absolutely sure you want to delete this lead? This action is permanent and cannot be undone."
        isConfirming={isDeleting}
      />
    </div>
  );
};
