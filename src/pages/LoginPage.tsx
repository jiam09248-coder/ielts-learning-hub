import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import useIsDesktop from '../hooks/useIsDesktop';
import { validatePresetAccount } from '../data/accounts';
import { setCurrentUser } from '../utils/storage';

interface LoginViewProps {
  username: string;
  password: string;
  showPassword: boolean;
  error: string;
  isLoading: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackHome: () => void;
}

function DesktopLoginView({
  username,
  password,
  showPassword,
  error,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onBackHome,
}: LoginViewProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 px-6">
      <button onClick={onBackHome} className="flex items-center gap-3 mb-10 group">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">言之英语</span>
      </button>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">欢迎回来</h1>
        <p className="text-sm text-slate-400 mb-8">登录你的学习账号</p>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="请输入用户名"
              autoFocus
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition"
                tabIndex={-1}
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-teal-500 text-xs font-medium bg-teal-50 px-3 py-2 rounded-xl border border-teal-100">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <span>登录中...</span> : <span>登 录</span>}
          </button>
        </form>
      </div>

      <button onClick={onBackHome} className="mt-6 text-xs text-slate-400 hover:text-slate-600 transition">
        ← 返回首页
      </button>
    </div>
  );
}

function MobileLoginView({
  username,
  password,
  showPassword,
  error,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onBackHome,
}: LoginViewProps) {
  return (
    <div className="min-h-screen bg-white px-5 pt-10 pb-8 flex flex-col">
      <button onClick={onBackHome} className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="text-[24px] font-bold tracking-tight text-slate-900">言之英语</span>
      </button>

      <div className="mt-4 mb-8">
        <h1 className="text-[32px] font-bold text-slate-900 mb-2">欢迎回来</h1>
        <p className="text-base text-slate-400 leading-7">登录你的学习账号，解锁正式课程。</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-2">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="请输入用户名"
            autoFocus
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-500 mb-2">密码</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition"
              tabIndex={-1}
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-teal-500 text-sm font-medium bg-teal-50 px-4 py-3 rounded-2xl border border-teal-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold text-base disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <span>登录中...</span> : <span>登 录</span>}
        </button>
      </form>

      <button onClick={onBackHome} className="mt-6 text-sm text-slate-400 hover:text-slate-600 transition">
        返回首页
      </button>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!username.trim() || !password.trim()) {
        setError('请输入账号和密码');
        return;
      }

      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsLoading(false);

      const normalizedUsername = username.trim().toLowerCase();
      const valid = validatePresetAccount({
        username: normalizedUsername,
        password,
      });

      if (!valid) {
        setError('账号或密码错误');
        return;
      }

      setCurrentUser({
        username: normalizedUsername,
        loginAt: Date.now(),
      });

      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || '/catalog', { replace: true });
    },
    [username, password, location.state, navigate]
  );

  const props: LoginViewProps = {
    username,
    password,
    showPassword,
    error,
    isLoading,
    onUsernameChange: setUsername,
    onPasswordChange: setPassword,
    onTogglePassword: () => setShowPassword((value) => !value),
    onSubmit: handleSubmit,
    onBackHome: () => navigate('/catalog'),
  };

  return isDesktop ? <DesktopLoginView {...props} /> : <MobileLoginView {...props} />;
}
