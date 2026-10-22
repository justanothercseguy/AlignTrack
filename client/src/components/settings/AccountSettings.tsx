import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { updateProfileApi, changePasswordApi, deleteAccountApi } from '../../api/auth';
import { exportDataApi } from '../../api/settings';
import { useAuth } from '../../contexts/AuthContext';
import { Download, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const AccountSettings: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      await updateProfileApi({ displayName, timezone });
      await refreshUser();
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsChangingPassword(true);
      await changePasswordApi({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      await exportDataApi();
      toast.success('Treatment data exported');
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccountApi();
      toast.success('Account permanently deleted');
      logout();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card>
        <h3 className="font-bold text-base text-[#292747] mb-4">Account Profile</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input label="Email Address" disabled value={user?.email || ''} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              placeholder="e.g. Jane"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              label="Timezone (IANA)"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              helperText="e.g. Asia/Kolkata, America/New_York"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit" isLoading={isUpdatingProfile}>
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <h3 className="font-bold text-base text-[#292747] mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="secondary" type="submit" isLoading={isChangingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Export & Privacy */}
      <Card>
        <h3 className="font-bold text-base text-[#292747] mb-2">Data Export & Backup</h3>
        <p className="text-xs text-[#8885A5] mb-4">
          Download a complete JSON export of all your aligner sets, wear logs, symptoms, questions, and notes.
        </p>
        <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
          <Download size={16} />
          <span>Export My Treatment Data</span>
        </Button>
      </Card>

      {/* Danger Zone: Delete Account */}
      <Card className="border-[#FFD0CB] bg-[#FFE8E5]/30">
        <div className="flex items-start gap-3">
          <ShieldAlert className="text-[#BF2600] shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-bold text-base text-[#BF2600] mb-1">Delete Account & Treatment Records</h3>
            <p className="text-xs text-[#8885A5] mb-4 leading-relaxed">
              Permanently delete your account and all associated treatment history, wear logs, and journal entries. This action cannot be undone.
            </p>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
              Delete My Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        message="Are you sure you want to permanently delete your account and all associated treatment data? This action is immediate and cannot be recovered."
        confirmText="Yes, Permanently Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
