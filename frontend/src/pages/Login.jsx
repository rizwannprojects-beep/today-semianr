import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Card from '../components/Card.jsx';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both your campus email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      // Role-based smart redirection
      if (from) {
        navigate(from, { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials or account issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-11 h-11 rounded-xl bg-[#E0F2F1] border border-[#00897B]/40 flex items-center justify-center text-[#00695C] group-hover:scale-105 transition-transform shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-[#526579] font-medium max-w-sm mx-auto">
          Sign in to continue to Campus Lost &amp; Found.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="space-y-6 bg-white border-[#D9E2E8] shadow-xs">
          {/* Presentation Quick-Fill Buttons */}
          <div className="p-3 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#00695C] uppercase tracking-wider">
              <span>Presentation Demo Logins</span>
              <span className="text-[10px] bg-[#00695C] text-white px-2 py-0.5 rounded font-mono">1-Click</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ email: 'arjun.nair@campus.edu', password: 'Campus@123', rememberMe: false })}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#00695C]/30 text-[#00695C] text-xs font-bold hover:bg-[#F0F7F6] text-left transition-all cursor-pointer shadow-2xs"
              >
                🎓 Student: Arjun Nair
              </button>
              <button
                type="button"
                onClick={() => setFormData({ email: 'admin@campus.edu', password: 'Admin@123', rememberMe: false })}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#FF9800]/40 text-[#D84315] text-xs font-bold hover:bg-[#FFF3E0] text-left transition-all cursor-pointer shadow-2xs"
              >
                🛡️ Admin: Authority
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-[#FFEBEE] border border-[#D32F2F]/30 flex items-start gap-2.5 text-[#D32F2F] text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email"
              name="email"
              type="email"
              label="Institutional Email"
              placeholder="e.g. arjun.nair@campus.edu"
              required
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              autoComplete="email"
            />

            <Input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#718096] hover:text-[#16324F] focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#526579] font-medium hover:text-[#16324F]">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded border-[#D9E2E8] bg-white text-[#00695C] focus:ring-[#00695C] w-4 h-4 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-[#00695C] hover:text-[#00897B] transition-colors font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full text-sm font-semibold shadow-xs"
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#D9E2E8] text-center space-y-3">
            <p className="text-xs text-[#526579] font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#FF9800] hover:text-[#F57C00] font-bold">
                Join Campus
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#718096] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00695C]" />
              <span>Encrypted short-lived tokens &amp; safe session rotation</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

