import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsLoading(false);
      navigate('/catalog');
    },
    [username, password, navigate]
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6">
      {/* Logo */}
      <button
        onClick={() => navigate('/catalog')}
        className="flex items-center gap-2 mb-10 group"
      >
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">IELTS · Hub</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">欢迎回来</h1>
        <p className="text-sm text-slate-400 mb-8">登录你的学习账号</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoFocus
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-rose-500 text-xs font-medium bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>登录中...</span>
              </>
            ) : (
              <span>登 录</span>
            )}
          </button>
        </form>
      </div>

      {/* Back */}
      <button
        onClick={() => navigate('/catalog')}
        className="mt-6 text-xs text-slate-400 hover:text-slate-600 transition"
      >
        ← 返回首页
      </button>
    </div>
  );
}
