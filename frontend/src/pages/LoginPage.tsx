import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoCredentials = [
  {
    label: 'Admin',
    email: 'admin@signacore.co.za',
    password: 'Eunice2026!',
  },
  {
    label: 'Accounts',
    email: 'accounts@signacore.co.za',
    password: 'Accounts2024!',
  },
  {
    label: 'Assistant',
    email: 'assist@signacore.co.za',
    password: 'Assist2024!',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('assist@signacore.co.za');
  const [password, setPassword] = useState('Assist2024!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (selectedEmail: string, selectedPassword: string) => {
    setEmail(selectedEmail);
    setPassword(selectedPassword);
    setError('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0800b8] px-4 py-10 text-white">
      <div className="absolute bottom-4 right-6 select-none text-[180px] font-black leading-none tracking-[-0.08em] text-white/5 md:text-[240px]">
        SIGNA
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-[#ff1b1b]" />
          <h1 className="text-4xl font-black italic tracking-wide text-white drop-shadow-sm">
            SNSG Holdings
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Business Management Platform
          </p>
        </div>

        <div className="w-full rounded-2xl bg-white p-7 shadow-2xl">
          <div className="mb-6 h-[3px] w-full rounded-full bg-gradient-to-r from-[#09006f] via-[#0800ff] to-[#ff1b1b]" />

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-[#08055f]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0800b8] focus:ring-2 focus:ring-[#0800b8]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-[#08055f]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0800b8] focus:ring-2 focus:ring-[#0800b8]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0b075f] py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#120a85] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs font-semibold text-gray-400">
            Applied Graphics and Visual Displays
          </p>
        </div>

        <div className="mt-5 w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-xs shadow-xl backdrop-blur">
          <div className="border-b border-white/10 py-3 text-center font-black uppercase tracking-[0.22em] text-blue-200">
            Login Credentials
          </div>

          {demoCredentials.map((item) => (
            <button
              key={item.email}
              type="button"
              onClick={() => fillCredentials(item.email, item.password)}
              className="grid w-full grid-cols-[92px_1fr_104px] items-center gap-2 border-b border-white/10 px-4 py-3 text-left last:border-b-0 hover:bg-white/10"
            >
              <span className="font-black text-white">{item.label}</span>
              <span className="truncate text-blue-100">{item.email}</span>
              <span className="truncate font-mono text-blue-200">
                {item.password}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
