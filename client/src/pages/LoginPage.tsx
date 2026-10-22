import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await login({ email, password });
      toast.success('Welcome back to AlignTrack! ✨');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-[#E9E3FF]/30 to-[#DCE9FF]/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
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
          <h2 className="text-xl font-bold text-[#292747] mb-2">Welcome Back</h2>
          <p className="text-xs text-[#8885A5] mb-6">Log in to track your clear aligner progress</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button variant="primary" type="submit" isLoading={isLoading} className="w-full mt-2">
              <span className="flex items-center gap-2">
                Sign In <ArrowRight size={16} />
              </span>
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E9E3FF]/60 text-center">
            <p className="text-xs text-[#8885A5]">
              Don't have an account?{' '}
              <NavLink to="/register" className="font-bold text-[#7775E8] hover:underline">
                Create one now
              </NavLink>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
