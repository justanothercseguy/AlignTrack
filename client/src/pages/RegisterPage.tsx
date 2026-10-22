import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await register({
        displayName,
        email,
        password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      });
      toast.success('Account created! Welcome to AlignTrack ✨');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-[#E9E3FF]/30 to-[#DCE9FF]/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#9B8AFB] to-[#7775E8] flex items-center justify-center text-white shadow-lg shadow-[#9B8AFB]/30 mb-3">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292747] tracking-tight">AlignTrack</h1>
          <p className="text-xs sm:text-sm text-[#8885A5] mt-1 font-medium">
            Your smile journey, one day at a time ✨
          </p>
        </div>

        <Card className="shadow-xl border-[#E9E3FF]">
          <h2 className="text-xl font-bold text-[#292747] mb-2">Create Your Account</h2>
          <p className="text-xs text-[#8885A5] mb-6">Begin tracking your aligners with clarity & peace of mind</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name / Display Name"
              placeholder="e.g. Adhya"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password (min 6 characters)"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button variant="primary" type="submit" isLoading={isLoading} className="w-full mt-2">
              <span className="flex items-center gap-2">
                Start My Smile Journey <ArrowRight size={16} />
              </span>
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E9E3FF]/60 text-center">
            <p className="text-xs text-[#8885A5]">
              Already have an account?{' '}
              <NavLink to="/login" className="font-bold text-[#7775E8] hover:underline">
                Sign in
              </NavLink>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
