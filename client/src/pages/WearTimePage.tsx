import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProgressRing } from '../components/ui/ProgressRing';
import { SessionList } from '../components/weartime/SessionList';
import { WeeklySummaryChart } from '../components/weartime/WeeklySummaryChart';
import { ManualSessionForm } from '../components/weartime/ManualSessionForm';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';
import {
  listWearSessionsApi,
  addManualWearSessionApi,
  deleteWearSessionApi,
  getWeeklyWearSummaryApi,
} from '../api/wearSessions';
import { WearSession, DailyWearSummary } from '../types';
import { formatHoursMinutes } from '../utils/formatters';
import { Play, Square, Plus, Sparkles, CheckCircle2, Clock, Edit3, Settings } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const WearTimePage: React.FC = () => {
  const {
    activeSession,
    dailySummary,
    liveElapsedMinutes,
    startSession,
    stopSession,
    updateDailyTarget,
    isStartingSession,
    isStoppingSession,
    refreshAll,
  } = useApp();

  const [sessions, setSessions] = useState<WearSession[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<DailyWearSummary[]>([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetInput, setTargetInput] = useState<number>(20);
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Entry-based timing modals
  const [isStartEntryModalOpen, setIsStartEntryModalOpen] = useState(false);
  const [customStartTime, setCustomStartTime] = useState(format(new Date(), 'HH:mm'));

  const [isCompleteEntryModalOpen, setIsCompleteEntryModalOpen] = useState(false);
  const [completePutInTime, setCompletePutInTime] = useState('09:00');
  const [completeRemoveTime, setCompleteRemoveTime] = useState(format(new Date(), 'HH:mm'));

  const fetchWearData = async () => {
    try {
      setIsLoading(true);
      const [sessionsData, weeklyData] = await Promise.all([
        listWearSessionsApi(),
        getWeeklyWearSummaryApi(),
      ]);
      setSessions(sessionsData);
      setWeeklySummaries(weeklyData);
    } catch (err) {
      console.error('Error fetching wear time data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWearData();
  }, [activeSession]);

  const targetHours = dailySummary ? dailySummary.targetHours : 20;

  useEffect(() => {
    if (dailySummary?.targetHours) {
      setTargetInput(dailySummary.targetHours);
    }
  }, [dailySummary?.targetHours]);

  const handleManualSession = async (payload: any) => {
    try {
      await addManualWearSessionApi(payload);
      toast.success('Wear session logged successfully!');
      setIsManualModalOpen(false);
      await refreshAll();
      await fetchWearData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to log session');
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteWearSessionApi(id);
      toast.success('Session deleted');
      await refreshAll();
      await fetchWearData();
    } catch (err: any) {
      toast.error('Failed to delete session');
    }
  };

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingTarget(true);
      await updateDailyTarget(Number(targetInput));
      setIsTargetModalOpen(false);
      await fetchWearData();
    } catch (err: any) {
      // toast shown in context
    } finally {
      setIsSavingTarget(false);
    }
  };

  const handleOpenCompleteModal = () => {
    if (activeSession) {
      const startDate = new Date(activeSession.startTime);
      setCompletePutInTime(format(startDate, 'HH:mm'));
      setCompleteRemoveTime(format(new Date(), 'HH:mm'));
    }
    setIsCompleteEntryModalOpen(true);
  };

  const handleConfirmCompleteEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const startIso = new Date(`${todayStr}T${completePutInTime}:00`).toISOString();
      const endIso = new Date(`${todayStr}T${completeRemoveTime}:00`).toISOString();

      await stopSession(endIso, startIso);
      setIsCompleteEntryModalOpen(false);
      await fetchWearData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete wear entry');
    }
  };

  const handleStartCustomEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const startIso = new Date(`${todayStr}T${customStartTime}:00`).toISOString();
      await startSession(startIso);
      setIsStartEntryModalOpen(false);
      await fetchWearData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start entry');
    }
  };

  // Calculations
  const loggedMinutes = dailySummary ? dailySummary.totalMinutes : 0;
  const totalDisplayMinutes = loggedMinutes + (activeSession ? liveElapsedMinutes : 0);
  const targetMinutes = targetHours * 60;
  const progressPercent = Math.min(100, Math.round((totalDisplayMinutes / targetMinutes) * 100));

  const remainingMinutes = Math.max(0, targetMinutes - totalDisplayMinutes);
  const extraMinutes = Math.max(0, totalDisplayMinutes - targetMinutes);
  const isTargetMet = totalDisplayMinutes >= targetMinutes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#292747]">Daily Wear-Time Tracker</h2>
          <p className="text-xs text-[#8885A5]">
            Accurately log your daily aligner wear hours and maintain adherence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsTargetModalOpen(true)}>
            <Settings size={14} className="mr-1.5" /> Target: {targetHours}h
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsManualModalOpen(true)}>
            <Plus size={14} className="mr-1.5" /> Log Past Entry
          </Button>
        </div>
      </div>

      {/* Main Wear Time Hero Card */}
      <Card className="flex flex-col items-center justify-center p-6 sm:p-10 text-center relative overflow-hidden">
        {/* Adherence Tag & Clickable Target */}
        <div className="mb-4 flex items-center gap-2">
          {isTargetMet ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00875A] bg-[#E6F7F0] px-4 py-1.5 rounded-full border border-[#BDEBD9] shadow-sm">
              <CheckCircle2 size={16} /> Daily Target Reached ✨
            </span>
          ) : (
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="text-xs font-semibold text-[#8885A5] hover:text-[#5A54C7] bg-[#F8F7FF] hover:bg-[#E9E3FF]/50 px-4 py-1.5 rounded-full border border-[#E9E3FF] transition-all flex items-center gap-1.5"
              title="Click to change daily wear hours"
            >
              <span>Daily Target: <strong>{targetHours} hours</strong></span>
              <Edit3 size={12} className="text-[#9B8AFB]" />
            </button>
          )}
        </div>

        {/* Large Circular Ring */}
        <ProgressRing
          progress={progressPercent}
          size={220}
          strokeWidth={16}
          color={isTargetMet ? '#00875A' : '#9B8AFB'}
          bgColor="#E9E3FF"
        >
          <span className="text-3xl sm:text-4xl font-extrabold text-[#292747]">
            {formatHoursMinutes(totalDisplayMinutes)}
          </span>
          <span className="text-xs font-medium text-[#8885A5] mt-1">
            of {targetHours}h goal ({progressPercent}%)
          </span>
          {isTargetMet ? (
            <span className="text-xs font-bold text-[#00875A] mt-2">
              +{formatHoursMinutes(extraMinutes)} extra beyond target
            </span>
          ) : (
            <span className="text-xs font-medium text-[#8885A5] mt-2">
              {formatHoursMinutes(remainingMinutes)} remaining
            </span>
          )}
        </ProgressRing>

        {/* Status & Entry Action Buttons */}
        <div className="mt-8 w-full max-w-sm space-y-3">
          {activeSession ? (
            <div className="space-y-3">
              <div className="p-3 bg-[#E6F7F0] rounded-xl border border-[#BDEBD9] text-xs text-[#00875A] flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#00875A] animate-ping" />
                  Aligners In since {format(new Date(activeSession.startTime), 'hh:mm a')}
                </span>
                <span className="font-bold">{formatHoursMinutes(liveElapsedMinutes)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => stopSession()}
                  isLoading={isStoppingSession}
                  className="flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Square size={16} fill="currentColor" />
                  <span>Remove Now</span>
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleOpenCompleteModal}
                  className="flex items-center justify-center gap-1.5"
                >
                  <Clock size={16} />
                  <span>Complete Entry...</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => startSession()}
                isLoading={isStartingSession}
                className="w-full flex items-center justify-center gap-2 shadow-lg"
              >
                <Play size={18} fill="currentColor" />
                <span>Put Aligners In (Start Timer)</span>
              </Button>

              <button
                type="button"
                onClick={() => {
                  setCustomStartTime(format(new Date(), 'HH:mm'));
                  setIsStartEntryModalOpen(true);
                }}
                className="text-xs text-[#7775E8] hover:underline font-medium block mx-auto pt-1"
              >
                Put in earlier? Log with custom start time
              </button>
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#8885A5] mt-4 max-w-md leading-relaxed">
          Your wear entry is safely saved in local storage and synced with the server. Even if the server restarts, you will not lose your session!
        </p>
      </Card>

      {/* 7-Day Chart */}
      <WeeklySummaryChart summaries={weeklySummaries} />

      {/* Session List */}
      <SessionList sessions={sessions} onDeleteSession={handleDeleteSession} />

      {/* Change Target Modal */}
      <Modal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        title="Change Daily Wear Target"
      >
        <form onSubmit={handleSaveTarget} className="space-y-4">
          <p className="text-xs text-[#8885A5]">
            Set your daily target wear hours. Standard orthodontist recommendations are 20 to 22 hours per day.
          </p>

          <div className="flex gap-2">
            {[18, 20, 21, 22].map((hrs) => (
              <button
                type="button"
                key={hrs}
                onClick={() => setTargetInput(hrs)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  targetInput === hrs
                    ? 'bg-[#7775E8] text-white border-[#7775E8]'
                    : 'bg-[#F8F7FF] text-[#292747] border-[#E9E3FF] hover:bg-[#E9E3FF]'
                }`}
              >
                {hrs} hrs
              </button>
            ))}
          </div>

          <Input
            label="Daily Target (Hours)"
            type="number"
            min={1}
            max={24}
            step={0.5}
            required
            value={targetInput}
            onChange={(e) => setTargetInput(Number(e.target.value))}
            helperText="Applies immediately to your active aligner set and wear calculations"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E3FF]">
            <Button variant="ghost" type="button" onClick={() => setIsTargetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSavingTarget}>
              Save Target
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Entry Modal */}
      <Modal
        isOpen={isCompleteEntryModalOpen}
        onClose={() => setIsCompleteEntryModalOpen(false)}
        title="Complete Wear Entry"
      >
        <form onSubmit={handleConfirmCompleteEntry} className="space-y-4">
          <p className="text-xs text-[#8885A5]">
            Confirm the time you put your aligners in and when you removed them.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Put In At"
              type="time"
              required
              value={completePutInTime}
              onChange={(e) => setCompletePutInTime(e.target.value)}
            />
            <Input
              label="Removed At"
              type="time"
              required
              value={completeRemoveTime}
              onChange={(e) => setCompleteRemoveTime(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E3FF]">
            <Button variant="ghost" type="button" onClick={() => setIsCompleteEntryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isStoppingSession}>
              Save & Complete Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Start Custom Entry Modal */}
      <Modal
        isOpen={isStartEntryModalOpen}
        onClose={() => setIsStartEntryModalOpen(false)}
        title="Start Wear Entry (Custom Time)"
      >
        <form onSubmit={handleStartCustomEntry} className="space-y-4">
          <p className="text-xs text-[#8885A5]">
            Specify what time you actually put your aligners in today.
          </p>

          <Input
            label="Put In Time"
            type="time"
            required
            value={customStartTime}
            onChange={(e) => setCustomStartTime(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E3FF]">
            <Button variant="ghost" type="button" onClick={() => setIsStartEntryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isStartingSession}>
              Start Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manual Past Entry Modal */}
      <Modal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} title="Log Past Wear Entry">
        <ManualSessionForm
          onSubmit={handleManualSession}
          onCancel={() => setIsManualModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
