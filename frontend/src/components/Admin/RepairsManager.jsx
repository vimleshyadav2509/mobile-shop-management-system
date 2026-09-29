import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  Filter,
  DollarSign,
  User,
  Smartphone,
  FileText,
  History,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { fetchRepairHistory } from '../../services/api';
import { SUPPORTED_MOBILE_BRANDS } from '../../data/mockData';

const STATUS_OPTIONS = [
  'Received',
  'Diagnosing',
  'In Repair',
  'Waiting for Parts',
  'Waiting for Approval',
  'Ready for Pickup',
  'Delivered',
  'Cancelled'
];

function getStatusStyle(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('approval')) {
    return {
      label: 'Waiting for Approval',
      color: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400'
    };
  }
  if (s.includes('parts')) {
    return {
      label: 'Waiting for Parts',
      color: 'text-purple-400',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      dot: 'bg-purple-400'
    };
  }
  if (s.includes('ready')) {
    return {
      label: 'Ready for Pickup',
      color: 'text-teal-500',
      badge: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
      dot: 'bg-teal-500'
    };
  }
  if (s.includes('repair')) {
    return {
      label: 'In Repair',
      color: 'text-indigo-500',
      badge: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      dot: 'bg-indigo-500'
    };
  }
  if (s.includes('diagnos')) {
    return {
      label: 'Diagnosing',
      color: 'text-blue-500',
      badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      dot: 'bg-blue-500'
    };
  }
  if (s.includes('deliver')) {
    return {
      label: 'Delivered',
      color: 'text-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      dot: 'bg-emerald-500'
    };
  }
  if (s.includes('cancel')) {
    return {
      label: 'Cancelled',
      color: 'text-rose-500',
      badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      dot: 'bg-rose-500'
    };
  }
  return {
    label: 'Received',
    color: 'text-amber-500',
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    dot: 'bg-amber-500'
  };
}

export default function RepairsManager({
  repairs = [],
  onUpdateRepairStatus,
  onCreateRepairJob,
  searchQuery = '',
  setSearchQuery = () => {}
}) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [activeJobForModal, setActiveJobForModal] = useState(null);
  const [modalNewStatus, setModalNewStatus] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [statusSuccess, setStatusSuccess] = useState(null);
  
  // New Job Sheet Modal state
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newBrand, setNewBrand] = useState('Samsung');
  const [newModel, setNewModel] = useState('');
  const [newIssue, setNewIssue] = useState('Display / Folder Replacement');
  const [newEstimatedCost, setNewEstimatedCost] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [jobError, setJobError] = useState('');

  const filteredRepairs = useMemo(() => {
    return repairs.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        r.job_sheet_id.toLowerCase().includes(q) ||
        r.customer_name.toLowerCase().includes(q) ||
        r.customer_phone.toLowerCase().includes(q) ||
        r.device_brand.toLowerCase().includes(q) ||
        r.device_model.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatusFilter === 'all' ||
        r.status.toLowerCase() === selectedStatusFilter.toLowerCase() ||
        (selectedStatusFilter === 'pending' && !['delivered', 'cancelled'].includes(r.status.toLowerCase()));

      return matchesSearch && matchesStatus;
    });
  }, [repairs, searchQuery, selectedStatusFilter]);

  const [modalHistory, setModalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const openStatusUpdateModal = async (job) => {
    setActiveJobForModal(job);
    setModalNewStatus(job.status || 'Received');
    setModalNotes(job.technician_notes || '');
    setStatusError(null);
    setStatusSuccess(null);
    setIsUpdatingStatus(false);
    setModalHistory(job.history || []);
    setLoadingHistory(true);
    try {
      const hist = await fetchRepairHistory(job.job_sheet_id);
      if (Array.isArray(hist) && hist.length > 0) {
        setModalHistory(hist);
      }
    } catch (e) {
      console.warn('Failed to load repair history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!activeJobForModal || !onUpdateRepairStatus) return;

    setIsUpdatingStatus(true);
    setStatusError(null);
    setStatusSuccess(null);
    try {
      await onUpdateRepairStatus(activeJobForModal.job_sheet_id, modalNewStatus, modalNotes);
      setStatusSuccess(`Status updated to "${modalNewStatus}" successfully.`);
      setTimeout(() => {
        setActiveJobForModal(null);
        setIsUpdatingStatus(false);
        setStatusSuccess(null);
      }, 700);
    } catch (err) {
      setStatusError(err.message || 'Failed to update repair status. Please try again.');
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    setJobError('');

    if (!newCustName.trim() || !newCustPhone.trim() || !newModel.trim()) {
      setJobError('Please fill in customer name, phone number, and device model.');
      return;
    }

    const payload = {
      job_sheet_id: `AMS-${105 + repairs.length}`,
      customer_name: newCustName.trim(),
      customer_phone: newCustPhone.trim(),
      device_brand: newBrand,
      device_model: newModel.trim(),
      issue_type: newIssue,
      issue_description: newNotes || 'Logged at shop counter.',
      status: 'Received',
      estimated_cost: parseFloat(newEstimatedCost) || 0,
      technician_notes: newNotes || 'Logged at Amit Mobile Shop counter.',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    if (onCreateRepairJob) {
      onCreateRepairJob(payload);
    }

    setIsNewJobModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewModel('');
    setNewEstimatedCost('');
    setNewNotes('');
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-card-fade">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
            Repair Jobs & Job Sheets
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {filteredRepairs.length} {filteredRepairs.length === 1 ? 'ticket' : 'tickets'} in service tracker
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewJobModalOpen(true)}
          className="admin-btn-primary w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Repair Ticket</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card p-3 sm:p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Job Sheet ID (e.g. AMS-101), customer phone, or device..."
            className="admin-input pl-9"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'pending', label: 'Pending Active' },
            { id: 'Received', label: 'Received' },
            { id: 'Diagnosing', label: 'Diagnosing' },
            { id: 'In Repair', label: 'In Repair' },
            { id: 'Waiting for Approval', label: 'Waiting Approval' },
            { id: 'Waiting for Parts', label: 'Waiting Parts' },
            { id: 'Ready for Pickup', label: 'Ready' },
            { id: 'Delivered', label: 'Delivered' }
          ].map((tab) => {
            const isSelected = selectedStatusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 shadow-sm'
                    : 'bg-[var(--card-elevated)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content: Desktop Table + Mobile Cards */}
      {filteredRepairs.length === 0 ? (
        <div className="admin-card p-8 sm:p-12 text-center text-[var(--muted-foreground)]">
          <Wrench className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold text-[var(--foreground)]">No repair job sheets found</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Try changing your search query or filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--table-header-bg)] text-[var(--muted-foreground)] border-b border-[var(--border)]">
                    <th className="py-3 px-4 font-semibold">Job ID</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Device</th>
                    <th className="py-3 px-4 font-semibold">Problem / Issue</th>
                    <th className="py-3 px-4 font-semibold">Estimate</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredRepairs.map((job) => {
                    const badge = getStatusStyle(job.status);
                    return (
                      <tr key={job.job_sheet_id} className="hover:bg-[var(--card-hover)] transition-colors">
                        <td className="py-3 px-4 font-bold text-indigo-500">
                          {job.job_sheet_id}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[var(--foreground)]">{job.customer_name}</p>
                          <div className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)] mt-0.5">
                            <Phone className="w-3 h-3 opacity-60" />
                            <span>{job.customer_phone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--foreground)] font-medium">
                          {job.device_brand} {job.device_model}
                        </td>
                        <td className="py-3 px-4 text-[var(--muted-foreground)] max-w-[180px] truncate" title={job.issue_type}>
                          {job.issue_type}
                        </td>
                        <td className="py-3 px-4 text-[var(--foreground)] font-bold">
                          ₹{job.estimated_cost?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => openStatusUpdateModal(job)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all hover:scale-105 ${badge.badge}`}
                            title="Click to update repair status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{badge.label}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`tel:${job.customer_phone}`}
                              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                              title="Call customer"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                            <a
                              href={`https://wa.me/91${job.customer_phone}?text=${encodeURIComponent(`Namaste ${job.customer_name}, this is Amit Mobile Shop regarding your repair job ${job.job_sheet_id} (${job.device_brand} ${job.device_model}). Status: ${job.status}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-teal-500 hover:bg-teal-500/10 transition-colors"
                              title="WhatsApp notification"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => openStatusUpdateModal(job)}
                              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-indigo-500 hover:bg-[var(--card-hover)] transition-colors"
                              title="Update ticket"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredRepairs.map((job) => {
              const badge = getStatusStyle(job.status);
              return (
                <div
                  key={job.job_sheet_id}
                  className="admin-card p-3.5 flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-500 tracking-wider">
                      {job.job_sheet_id}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => openStatusUpdateModal(job)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">
                      {job.customer_name}
                    </h3>
                    <p className="text-xs text-indigo-500 font-medium mt-0.5">
                      {job.device_brand} {job.device_model}
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-1 line-clamp-2">
                      <span className="opacity-70 font-medium">Issue: </span>
                      {job.issue_type}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                    <div>
                      <span className="text-[var(--muted-foreground)] text-[10px]">Estimated Price</span>
                      <p className="font-extrabold text-[var(--foreground)] text-sm">
                        ₹{job.estimated_cost?.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[var(--muted-foreground)] text-[10px]">Date Logged</span>
                      <p className="text-[var(--muted-foreground)] text-[11px]">
                        {job.created_at ? job.created_at.substring(0, 10) : 'Recent'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <a
                      href={`tel:${job.customer_phone}`}
                      className="p-2.5 rounded-xl bg-[var(--card-elevated)] text-[var(--foreground)] border border-[var(--border)] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--card-hover)]"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://wa.me/91${job.customer_phone}?text=${encodeURIComponent(`Namaste ${job.customer_name}, this is Amit Mobile Shop regarding your repair job ${job.job_sheet_id} (${job.device_brand} ${job.device_model}). Status: ${job.status}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-teal-500/20"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => openStatusUpdateModal(job)}
                      className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-indigo-500/20"
                    >
                      <span>Update</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Quick Status Update Modal */}
      {activeJobForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="admin-card w-full max-w-md p-5 sm:p-6 shadow-2xl relative animate-card-fade">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Update Repair Status
                </h3>
                <p className="text-xs text-indigo-500 font-semibold">
                  {activeJobForModal.job_sheet_id} — {activeJobForModal.customer_name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveJobForModal(null)}
                className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            {statusSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-2">
                  Select Repair Stage *
                </label>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((st) => {
                    const badge = getStatusStyle(st);
                    const isSelected = modalNewStatus.toLowerCase() === st.toLowerCase();
                    return (
                      <label
                        key={st}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500 text-[var(--foreground)] font-semibold'
                            : 'bg-[var(--card-elevated)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--card-hover)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                          <span className="text-xs">{st}</span>
                        </div>
                        <input
                          type="radio"
                          name="status-choice"
                          value={st}
                          checked={isSelected}
                          onChange={() => setModalNewStatus(st)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Technician Notes for Customer
                </label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Folder fitted and tested. Ready for delivery at shop counter."
                  className="admin-input resize-none"
                />
              </div>

              {/* Status Transition History Timeline */}
              <div className="pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-400" />
                    Status Transition History
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    {modalHistory.length} event{modalHistory.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {loadingHistory ? (
                  <div className="p-3 text-center text-xs text-[var(--muted-foreground)]">
                    Loading timeline...
                  </div>
                ) : modalHistory.length === 0 ? (
                  <div className="p-2.5 rounded-lg bg-[var(--card-elevated)] border border-[var(--border)] text-[11px] text-[var(--muted-foreground)] text-center">
                    Initial intake logged. No status transitions yet.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {modalHistory.map((step, idx) => (
                      <div key={step.id || idx} className="p-2 rounded-lg bg-[var(--card-elevated)] border border-[var(--border)] text-[11px] space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--foreground)]">
                            {step.old_status ? `${step.old_status} → ${step.new_status}` : step.new_status}
                          </span>
                          <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                            {step.created_at ? new Date(step.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Logged'}
                          </span>
                        </div>
                        {step.note && (
                          <p className="text-[10px] text-[var(--muted-foreground)]">
                            {step.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => setActiveJobForModal(null)}
                  className="admin-btn-secondary flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="admin-btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdatingStatus ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Status</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="admin-card w-full max-w-lg p-5 sm:p-6 shadow-2xl relative animate-card-fade max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Log New Repair Job Sheet
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Generate official counter receipt ticket for customer
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewJobModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {jobError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                {jobError}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Customer Phone (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Device Brand *
                  </label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="admin-input"
                  >
                    {SUPPORTED_MOBILE_BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Device Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Galaxy M31 / iPhone 11"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Repair Issue / Service *
                  </label>
                  <select
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    className="admin-input"
                  >
                    <option value="Display / Folder Replacement">Display / Folder Replacement</option>
                    <option value="Battery Replacement">Battery Replacement</option>
                    <option value="Charging Port / Sub-board">Charging Port / Sub-board</option>
                    <option value="Water Damage Treatment">Water Damage Treatment</option>
                    <option value="Speaker / Mic Repair">Speaker / Mic Repair</option>
                    <option value="Motherboard IC / Chip Level">Motherboard IC / Chip Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Estimated Cost (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newEstimatedCost}
                    onChange={(e) => setNewEstimatedCost(e.target.value)}
                    placeholder="e.g. 1850"
                    className="admin-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Counter Inspection Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Glass cracked, touch dead on top right, frame intact."
                  className="admin-input resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="admin-btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary flex-1"
                >
                  Generate Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
