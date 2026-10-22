import React, { useState, useEffect } from 'react';
import { IssueCard } from '../components/journal/IssueCard';
import { IssueForm } from '../components/journal/IssueForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import {
  listJournalEntriesApi,
  createJournalEntryApi,
  updateJournalEntryApi,
  resolveJournalEntryApi,
  deleteJournalEntryApi,
} from '../api/journal';
import { JournalEntry } from '../types';
import { JOURNAL_CATEGORIES } from '../utils/constants';
import { Plus, BookOpen, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [unresolvedOnly, setUnresolvedOnly] = useState<boolean>(false);
  const [needsDiscussionOnly, setNeedsDiscussionOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const data = await listJournalEntriesApi({
        category: categoryFilter || undefined,
        unresolved: unresolvedOnly || undefined,
        needsDiscussion: needsDiscussionOnly || undefined,
        search: searchTerm || undefined,
      });
      setEntries(data);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [categoryFilter, unresolvedOnly, needsDiscussionOnly, searchTerm]);

  const handleCreate = async (payload: any) => {
    try {
      await createJournalEntryApi(payload);
      toast.success('Symptom entry logged');
      setIsAddOpen(false);
      await fetchEntries();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to log symptom');
    }
  };

  const handleUpdate = async (payload: any) => {
    if (!editingEntry) return;
    try {
      await updateJournalEntryApi(editingEntry._id, payload);
      toast.success('Journal entry updated');
      setEditingEntry(null);
      await fetchEntries();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update entry');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveJournalEntryApi(id);
      toast.success('Marked as resolved');
      await fetchEntries();
    } catch (err) {
      toast.error('Failed to resolve entry');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJournalEntryApi(id);
      toast.success('Entry deleted');
      await fetchEntries();
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#292747]">Issue & Symptom Journal</h2>
          <p className="text-xs text-[#8885A5]">
            Keep track of pressure, fit concerns, and things to discuss with your orthodontist
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={14} className="mr-1.5" /> Log Symptom
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E9E3FF] flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8885A5]" />
          <input
            type="text"
            placeholder="Search symptoms or areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F8F7FF] border border-[#E9E3FF] rounded-xl pl-9 pr-4 py-2 text-xs text-[#292747] focus:outline-none focus:ring-2 focus:ring-[#9B8AFB]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 bg-[#F8F7FF] border border-[#E9E3FF] rounded-xl px-3 py-2 text-xs text-[#292747] focus:outline-none focus:ring-2 focus:ring-[#9B8AFB]"
        >
          <option value="">All Categories</option>
          {JOURNAL_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-4 w-full sm:w-auto text-xs text-[#292747]">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={unresolvedOnly}
              onChange={(e) => setUnresolvedOnly(e.target.checked)}
              className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
            />
            <span>Unresolved only</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={needsDiscussionOnly}
              onChange={(e) => setNeedsDiscussionOnly(e.target.checked)}
              className="rounded border-[#E9E3FF] text-[#9B8AFB] focus:ring-[#9B8AFB]"
            />
            <span>Flagged for visit</span>
          </label>
        </div>
      </div>

      {/* Entry Cards List */}
      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="No symptom entries found"
          description="Log any tightness, attachment issues, sharp edges, or questions that come up during wear."
          actionText="Log First Symptom"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <IssueCard
              key={entry._id}
              entry={entry}
              onEdit={(e) => setEditingEntry(e)}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log Symptom / Issue">
        <IssueForm onSubmit={handleCreate} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingEntry} onClose={() => setEditingEntry(null)} title="Edit Symptom Entry">
        <IssueForm
          initialData={editingEntry}
          onSubmit={handleUpdate}
          onCancel={() => setEditingEntry(null)}
        />
      </Modal>
    </div>
  );
};
