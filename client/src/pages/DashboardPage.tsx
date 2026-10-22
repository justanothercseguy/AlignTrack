import React, { useState, useEffect } from 'react';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard';
import { WearTimeCard } from '../components/dashboard/WearTimeCard';
import { NextAppointmentCard } from '../components/dashboard/NextAppointmentCard';
import { RecentIssuesCard } from '../components/dashboard/RecentIssuesCard';
import { UpcomingEventsCard } from '../components/dashboard/UpcomingEventsCard';
import { Modal } from '../components/ui/Modal';
import { ConfirmChangeDialog } from '../components/aligners/ConfirmChangeDialog';
import { AlignerSetForm } from '../components/aligners/AlignerSetForm';
import { ManualSessionForm } from '../components/weartime/ManualSessionForm';
import { IssueForm } from '../components/journal/IssueForm';
import { QuestionForm } from '../components/questions/QuestionForm';
import { AppointmentForm } from '../components/appointments/AppointmentForm';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

import { useApp } from '../contexts/AppContext';
import { listAppointmentsApi, createAppointmentApi } from '../api/appointments';
import { listJournalEntriesApi, createJournalEntryApi } from '../api/journal';
import { listQuestionsApi, createQuestionApi } from '../api/questions';
import { getCalendarEventsApi } from '../api/calendar';
import { createAlignerSetApi, confirmAlignerChangeApi } from '../api/alignerSets';
import { addManualWearSessionApi } from '../api/wearSessions';

import { Appointment, JournalEntry, Question, CalendarEvent } from '../types';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const { currentSet, refreshAll } = useApp();

  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [recentIssues, setRecentIssues] = useState<JournalEntry[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modals state
  const [isConfirmChangeOpen, setIsConfirmChangeOpen] = useState(false);
  const [isAddSetOpen, setIsAddSetOpen] = useState(false);
  const [isManualWearOpen, setIsManualWearOpen] = useState(false);
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [appts, issues, qs, events] = await Promise.all([
        listAppointmentsApi('upcoming'),
        listJournalEntriesApi({ unresolved: true }),
        listQuestionsApi({ isCompleted: false }),
        getCalendarEventsApi(),
      ]);

      setNextAppointment(appts.length > 0 ? appts[0] : null);
      setRecentIssues(issues);
      setQuestions(qs);
      setUpcomingEvents(events);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handlers
  const handleConfirmChange = async (payload: any) => {
    if (!currentSet) return;
    try {
      await confirmAlignerChangeApi(currentSet._id, payload);
      toast.success('Switched to next aligner set! 🌸');
      setIsConfirmChangeOpen(false);
      await refreshAll();
      await fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to switch aligner');
    }
  };

  const handleCreateSet = async (payload: any) => {
    try {
      await createAlignerSetApi(payload);
      toast.success('Aligner set created!');
      setIsAddSetOpen(false);
      await refreshAll();
      await fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create set');
    }
  };

  const handleManualWear = async (payload: any) => {
    try {
      await addManualWearSessionApi(payload);
      toast.success('Wear session logged!');
      setIsManualWearOpen(false);
      await refreshAll();
      await fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to log session');
    }
  };

  const handleCreateIssue = async (payload: any) => {
    try {
      await createJournalEntryApi(payload);
      toast.success('Symptom logged to journal');
      setIsAddIssueOpen(false);
      await fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to log symptom');
    }
  };

  const handleCreateQuestion = async (payload: any) => {
    try {
      await createQuestionApi(payload);
      toast.success('Question added for your doctor');
      setIsAddQuestionOpen(false);
      await fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add question');
    }
  };

  const handleCreateAppointment = async (payload: any) => {
    try {
      await createAppointmentApi(payload);
      toast.success('Appointment scheduled');
      setIsAddAppointmentOpen(false);
      await fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create appointment');
    }
  };

  return (
    <div>
      {/* 1. Dashboard Hero Aligner Card */}
      <DashboardHero
        currentSet={currentSet}
        onConfirmChange={() => setIsConfirmChangeOpen(true)}
        onAddNewSet={() => setIsAddSetOpen(true)}
      />

      {/* 2. Quick Actions */}
      <QuickActionsCard
        onLogWearTime={() => setIsManualWearOpen(true)}
        onAddIssue={() => setIsAddIssueOpen(true)}
        onAddAppointment={() => setIsAddAppointmentOpen(true)}
        onConfirmChange={() => {
          if (currentSet) {
            setIsConfirmChangeOpen(true);
          } else {
            setIsAddSetOpen(true);
          }
        }}
      />

      {/* 3. Three core supporting cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <WearTimeCard />
        <NextAppointmentCard
          appointment={nextAppointment}
          onAddAppointment={() => setIsAddAppointmentOpen(true)}
        />
        <RecentIssuesCard
          issues={recentIssues}
          questions={questions}
          onAddIssue={() => setIsAddIssueOpen(true)}
          onAddQuestion={() => setIsAddQuestionOpen(true)}
        />
      </div>

      {/* 4. Upcoming schedule calendar preview */}
      <UpcomingEventsCard events={upcomingEvents} />

      {/* Modals */}
      <ConfirmChangeDialog
        isOpen={isConfirmChangeOpen}
        onClose={() => setIsConfirmChangeOpen(false)}
        currentSet={currentSet}
        onConfirm={handleConfirmChange}
      />

      <Modal isOpen={isAddSetOpen} onClose={() => setIsAddSetOpen(false)} title="Add Aligner Set">
        <AlignerSetForm onSubmit={handleCreateSet} onCancel={() => setIsAddSetOpen(false)} />
      </Modal>

      <Modal isOpen={isManualWearOpen} onClose={() => setIsManualWearOpen(false)} title="Log Missed Wear Session">
        <ManualSessionForm onSubmit={handleManualWear} onCancel={() => setIsManualWearOpen(false)} />
      </Modal>

      <Modal isOpen={isAddIssueOpen} onClose={() => setIsAddIssueOpen(false)} title="Log Symptom / Issue">
        <IssueForm onSubmit={handleCreateIssue} onCancel={() => setIsAddIssueOpen(false)} />
      </Modal>

      <Modal isOpen={isAddQuestionOpen} onClose={() => setIsAddQuestionOpen(false)} title="Add Doctor Question">
        <QuestionForm onSubmit={handleCreateQuestion} onCancel={() => setIsAddQuestionOpen(false)} />
      </Modal>

      <Modal isOpen={isAddAppointmentOpen} onClose={() => setIsAddAppointmentOpen(false)} title="Schedule Doctor Appointment">
        <AppointmentForm onSubmit={handleCreateAppointment} onCancel={() => setIsAddAppointmentOpen(false)} />
      </Modal>
    </div>
  );
};
