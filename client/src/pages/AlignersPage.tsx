import React, { useState, useEffect } from 'react';
import { AlignerTimeline } from '../components/aligners/AlignerTimeline';
import { AlignerSetForm } from '../components/aligners/AlignerSetForm';
import { ConfirmChangeDialog } from '../components/aligners/ConfirmChangeDialog';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import {
  listAlignerSetsApi,
  createAlignerSetApi,
  updateAlignerSetApi,
  confirmAlignerChangeApi,
  generatePlanApi,
} from '../api/alignerSets';
import { AlignerSet } from '../types';
import { useApp } from '../contexts/AppContext';
import { Plus, Wand2, Layers, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AlignersPage: React.FC = () => {
  const { refreshAll } = useApp();
  const [sets, setSets] = useState<AlignerSet[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<AlignerSet | null>(null);
  const [confirmingSet, setConfirmingSet] = useState<AlignerSet | null>(null);
  const [isGeneratePlanOpen, setIsGeneratePlanOpen] = useState(false);

  // Generate Plan form state
  const [planStartDate, setPlanStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [planTotalSets, setPlanTotalSets] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchSets = async () => {
    try {
      setIsLoading(true);
      const data = await listAlignerSetsApi(statusFilter === 'all' ? undefined : statusFilter);
      setSets(data);
    } catch (err) {
      console.error('Error fetching aligner sets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, [statusFilter]);

  const handleCreateSet = async (payload: any) => {
    try {
      await createAlignerSetApi(payload);
      toast.success('Aligner set created');
      setIsAddOpen(false);
      await fetchSets();
      await refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create set');
    }
  };

  const handleUpdateSet = async (payload: any) => {
    if (!editingSet) return;
    try {
      await updateAlignerSetApi(editingSet._id, payload);
      toast.success('Aligner set updated');
      setEditingSet(null);
      await fetchSets();
      await refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update set');
    }
  };

  const handleConfirmChange = async (payload: any) => {
    if (!confirmingSet) return;
    try {
      await confirmAlignerChangeApi(confirmingSet._id, payload);
      toast.success('Switched to next aligner set! 🌸');
      setConfirmingSet(null);
      await fetchSets();
      await refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to confirm aligner change');
    }
  };

  const handleMakeActive = async (set: AlignerSet) => {
    try {
      await updateAlignerSetApi(set._id, { status: 'current' });
      toast.success(`Set #${set.setNumber} marked as currently active! 🌸`);
      await fetchSets();
      await refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to activate set');
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      await generatePlanApi({
        startDate: planStartDate,
        totalSets: Number(planTotalSets),
      });
      toast.success(`Generated treatment plan with ${planTotalSets} sets! ✨`);
      setIsGeneratePlanOpen(false);
      await fetchSets();
      await refreshAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#292747]">Aligner Sets & Timeline</h2>
          <p className="text-xs text-[#8885A5]">
            Manage planned durations, record actual switches, and track your smile journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsGeneratePlanOpen(true)}>
            <Wand2 size={14} className="mr-1.5" /> Auto-Generate Plan
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus size={14} className="mr-1.5" /> Add Set
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'current', 'planned', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              statusFilter === tab
                ? 'bg-[#7775E8] text-white shadow-sm'
                : 'bg-white border border-[#E9E3FF] text-[#8885A5] hover:text-[#292747]'
            }`}
          >
            {tab === 'all' ? 'All Sets' : tab}
          </button>
        ))}
      </div>

      {/* Timeline or empty state */}
      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : sets.length === 0 ? (
        <EmptyState
          icon={<Layers size={28} />}
          title="No aligner sets found"
          description="Create your first aligner set or generate a 20-set plan based on your orthodontist's prescribed schedule."
          actionText="Auto-Generate Plan"
          onAction={() => setIsGeneratePlanOpen(true)}
        />
      ) : (
        <AlignerTimeline
          sets={sets}
          onEdit={(set) => setEditingSet(set)}
          onConfirmChange={(set) => setConfirmingSet(set)}
          onMakeActive={handleMakeActive}
        />
      )}

      {/* Modals */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Aligner Set">
        <AlignerSetForm onSubmit={handleCreateSet} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingSet} onClose={() => setEditingSet(null)} title="Edit Aligner Set">
        <AlignerSetForm
          initialData={editingSet}
          onSubmit={handleUpdateSet}
          onCancel={() => setEditingSet(null)}
        />
      </Modal>

      <ConfirmChangeDialog
        isOpen={!!confirmingSet}
        onClose={() => setConfirmingSet(null)}
        currentSet={confirmingSet}
        onConfirm={handleConfirmChange}
      />

      {/* Auto Generate Plan Modal */}
      <Modal
        isOpen={isGeneratePlanOpen}
        onClose={() => setIsGeneratePlanOpen(false)}
        title="Auto-Generate Treatment Plan"
      >
        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <p className="text-xs text-[#8885A5] leading-relaxed">
            Quickly initialize multiple aligner sets based on your configured treatment defaults: 10 days for Sets 1–5 (Phase A) and 7 days for Set 6 onward (Phase B).
          </p>

          <Input
            label="Treatment Start Date (Set 1)"
            type="date"
            required
            value={planStartDate}
            onChange={(e) => setPlanStartDate(e.target.value)}
          />

          <Input
            label="Total Sets in Treatment"
            type="number"
            min={1}
            max={99}
            required
            value={planTotalSets}
            onChange={(e) => setPlanTotalSets(Number(e.target.value))}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E3FF]">
            <Button variant="ghost" type="button" onClick={() => setIsGeneratePlanOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isGenerating}>
              Generate Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
