import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TreatmentSettings as ITreatmentSettings } from '../../types';
import toast from 'react-hot-toast';

interface TreatmentSettingsProps {
  initialSettings?: ITreatmentSettings;
  onSave: (settings: ITreatmentSettings) => Promise<void>;
  isLoading?: boolean;
}

export const TreatmentSettings: React.FC<TreatmentSettingsProps> = ({
  initialSettings,
  onSave,
  isLoading = false,
}) => {
  const [phase1Duration, setPhase1Duration] = useState<number>(
    initialSettings?.phases[0]?.defaultDurationDays || 10
  );
  const [phase1Target, setPhase1Target] = useState<number>(
    initialSettings?.phases[0]?.defaultWearTimeTarget || 18
  );
  const [phaseTransitionSet, setPhaseTransitionSet] = useState<number>(
    initialSettings?.phases[1]?.startSet || 6
  );
  const [phase2Duration, setPhase2Duration] = useState<number>(
    initialSettings?.phases[1]?.defaultDurationDays || 7
  );
  const [phase2Target, setPhase2Target] = useState<number>(
    initialSettings?.phases[1]?.defaultWearTimeTarget || 20
  );
  const [schedulingMode, setSchedulingMode] = useState<'actual' | 'planned'>(
    initialSettings?.schedulingMode || 'actual'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ITreatmentSettings = {
      schedulingMode,
      phases: [
        {
          name: 'Phase A',
          startSet: 1,
          endSet: phaseTransitionSet - 1,
          defaultDurationDays: Number(phase1Duration),
          defaultWearTimeTarget: Number(phase1Target),
        },
        {
          name: 'Phase B',
          startSet: Number(phaseTransitionSet),
          endSet: null,
          defaultDurationDays: Number(phase2Duration),
          defaultWearTimeTarget: Number(phase2Target),
        },
      ],
    };
    await onSave(payload);
    toast.success('Treatment policy updated successfully');
  };

  return (
    <Card className="mb-6">
      <div className="mb-4">
        <h3 className="font-bold text-base text-[#292747]">Treatment Schedule & Phase Policies</h3>
        <p className="text-xs text-[#8885A5]">
          Configure default aligner wear duration and daily targets per treatment phase.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phase A */}
        <div className="bg-[#F8F7FF] p-4 rounded-2xl border border-[#E9E3FF]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#7775E8] mb-3">
            Phase A (Initial Sets 1 to {phaseTransitionSet - 1})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default Duration (Days/Set)"
              type="number"
              min={1}
              max={90}
              required
              value={phase1Duration}
              onChange={(e) => setPhase1Duration(Number(e.target.value))}
              helperText="Default is 10 days per set"
            />
            <Input
              label="Daily Wear Target (Hours/Day)"
              type="number"
              min={1}
              max={24}
              step={0.5}
              required
              value={phase1Target}
              onChange={(e) => setPhase1Target(Number(e.target.value))}
              helperText="Default is 18 hours per day"
            />
          </div>
        </div>

        {/* Phase B */}
        <div className="bg-[#F8F7FF] p-4 rounded-2xl border border-[#E9E3FF]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7775E8]">
              Phase B (Transition Set {phaseTransitionSet} onward)
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Phase B Starts At Set #"
              type="number"
              min={2}
              max={100}
              required
              value={phaseTransitionSet}
              onChange={(e) => setPhaseTransitionSet(Number(e.target.value))}
              helperText="Default starts at Set 6"
            />
            <Input
              label="Default Duration (Days/Set)"
              type="number"
              min={1}
              max={90}
              required
              value={phase2Duration}
              onChange={(e) => setPhase2Duration(Number(e.target.value))}
              helperText="e.g. 7 days if approved by doctor"
            />
            <Input
              label="Daily Wear Target (Hours/Day)"
              type="number"
              min={1}
              max={24}
              step={0.5}
              required
              value={phase2Target}
              onChange={(e) => setPhase2Target(Number(e.target.value))}
              helperText="Default is 20 hours per day"
            />
          </div>
        </div>

        {/* Scheduling Mode */}
        <div className="bg-[#F8F7FF] p-4 rounded-2xl border border-[#E9E3FF]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#7775E8] mb-2">
            Timeline Projection Convention
          </h4>
          <p className="text-xs text-[#8885A5] mb-3 leading-relaxed">
            Convention: Planned change date = start date + prescribed duration (e.g. Oct 24 + 10 days = Nov 3).
          </p>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="schedulingMode"
                value="actual"
                checked={schedulingMode === 'actual'}
                onChange={() => setSchedulingMode('actual')}
                className="text-[#9B8AFB] focus:ring-[#9B8AFB]"
              />
              <span className="font-semibold text-[#292747]">
                Base future planned sets on actual confirmed change dates (Recommended)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="schedulingMode"
                value="planned"
                checked={schedulingMode === 'planned'}
                onChange={() => setSchedulingMode('planned')}
                className="text-[#9B8AFB] focus:ring-[#9B8AFB]"
              />
              <span className="text-[#8885A5]">
                Keep original scheduled dates regardless of actual change dates
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Save Treatment Policies
          </Button>
        </div>
      </form>
    </Card>
  );
};
