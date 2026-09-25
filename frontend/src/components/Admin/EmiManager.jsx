import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Percent,
  Clock,
  ExternalLink,
  RefreshCw,
  X,
  FileCheck,
  Check
} from 'lucide-react';
import {
  fetchEmiPlans,
  createEmiPlan,
  updateEmiPlan,
  deleteEmiPlan
} from '../../services/api';

export default function EmiManager() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formProvider, setFormProvider] = useState('Bajaj Finserv');
  const [formDuration, setFormDuration] = useState('6');
  const [formMonthlyEmi, setFormMonthlyEmi] = useState('');
  const [formDownPayment, setFormDownPayment] = useState('0');
  const [formProcessingFee, setFormProcessingFee] = useState('199');
  const [formInterestRate, setFormInterestRate] = useState('0');
  const [formAvailable, setFormAvailable] = useState(true);

  const loadPlans = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchEmiPlans(null, true);
      setPlans(data);
    } catch (err) {
      console.warn('Failed to load EMI plans:', err);
      setErrorMsg('Failed to load EMI plans from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openAddModal = () => {
    setEditingPlan(null);
    setFormProvider('Bajaj Finserv');
    setFormDuration('6');
    setFormMonthlyEmi('');
    setFormDownPayment('0');
    setFormProcessingFee('199');
    setFormInterestRate('0');
    setFormAvailable(true);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormProvider(plan.provider || 'Bajaj Finserv');
    setFormDuration(String(plan.duration_months || 6));
    setFormMonthlyEmi(String(plan.monthly_emi || ''));
    setFormDownPayment(String(plan.down_payment ?? 0));
    setFormProcessingFee(String(plan.processing_fee ?? 0));
    setFormInterestRate(String(plan.interest_rate ?? 0));
    setFormAvailable(plan.available !== false);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!formProvider || !formMonthlyEmi) {
      setErrorMsg('Please specify provider name and monthly EMI amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        provider: formProvider.trim(),
        duration_months: parseInt(formDuration, 10) || 6,
        monthly_emi: parseFloat(formMonthlyEmi) || 0,
        down_payment: parseFloat(formDownPayment) || 0,
        processing_fee: parseFloat(formProcessingFee) || 0,
        interest_rate: parseFloat(formInterestRate) || 0,
        available: formAvailable
      };

      if (editingPlan) {
        await updateEmiPlan(editingPlan.id, payload);
        setSuccessMsg(`EMI plan for ${payload.provider} updated.`);
      } else {
        await createEmiPlan(payload);
        setSuccessMsg(`New EMI plan for ${payload.provider} created.`);
      }

      await loadPlans();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (plan) => {
    try {
      await updateEmiPlan(plan.id, { available: !plan.available });
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, available: !p.available } : p));
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this EMI plan?')) return;
    try {
      await deleteEmiPlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      alert(err.message || 'Failed to delete plan.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-card-fade">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight font-['Poppins']">
            Database-backed EMI Plans & Financing
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Configure partner loan tenures, monthly installments, zero down payment, and counter approval rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPlans}
            disabled={loading}
            className="admin-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-400' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="admin-btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add EMI Plan</span>
          </button>
        </div>
      </div>

      {/* Plans List Table */}
      <div className="admin-card p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)] mb-3 flex items-center justify-between">
          <span>Active & Counter Financing Plans ({plans.length})</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary-400" />
            <span>Loading database EMI plans...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No EMI plans configured yet. Click "Add EMI Plan" above to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 pb-2">
                  <th className="pb-2 font-semibold">Finance Partner</th>
                  <th className="pb-2 font-semibold">Duration</th>
                  <th className="pb-2 font-semibold">Monthly EMI</th>
                  <th className="pb-2 font-semibold">Down Payment</th>
                  <th className="pb-2 font-semibold">Fees & Interest</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary-400 shrink-0" />
                        <span>{plan.provider}</span>
                      </div>
                    </td>

                    <td className="py-3 text-slate-300 font-medium">
                      {plan.duration_months} Months
                    </td>

                    <td className="py-3 font-mono font-bold text-emerald-400">
                      ₹{Number(plan.monthly_emi).toLocaleString('en-IN')}/mo
                    </td>

                    <td className="py-3 text-slate-300 font-mono">
                      {plan.down_payment > 0 ? `₹${Number(plan.down_payment).toLocaleString('en-IN')}` : '₹0 (Zero DP)'}
                    </td>

                    <td className="py-3 text-slate-400 text-[11px]">
                      Fee: ₹{plan.processing_fee} • {plan.interest_rate > 0 ? `${plan.interest_rate}% Int.` : '0% Interest'}
                    </td>

                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(plan)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          plan.available
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${plan.available ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span>{plan.available ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(plan)}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit EMI Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-bold text-white font-['Poppins']">
                  {editingPlan ? 'Edit EMI Scheme' : 'Add Counter EMI Scheme'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePlan} className="p-5 space-y-3.5 text-xs">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Financing Partner / Bank *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bajaj Finserv, TVS Credit, HDFC Bank"
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Duration (Months) *
                  </label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="9">9 Months</option>
                    <option value="12">12 Months</option>
                    <option value="18">18 Months</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Monthly EMI (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 3499"
                    value={formMonthlyEmi}
                    onChange={(e) => setFormMonthlyEmi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Down Pay (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formDownPayment}
                    onChange={(e) => setFormDownPayment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Proc. Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formProcessingFee}
                    onChange={(e) => setFormProcessingFee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Interest %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formInterestRate}
                    onChange={(e) => setFormInterestRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-primary-600"
                  />
                  <span className="font-medium">Active on Store Counter & Product Cards</span>
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-primary-700 text-white font-semibold hover:bg-primary-600 transition flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{editingPlan ? 'Update Plan' : 'Save Plan'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
