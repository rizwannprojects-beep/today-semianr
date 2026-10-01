import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  Lock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Card from '../components/Card.jsx';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const tokenParam = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Real-time password criteria
  const passwordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token.trim()) {
      setError('A valid security reset token is required.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please ensure your new password satisfies all security criteria below.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password entries.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword({
        token: token.trim(),
        password,
        confirmPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired or is invalid.');
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
          Create New Password
        </h1>
        <p className="text-xs text-[#526579] font-medium max-w-sm mx-auto">
          Establish a strong new credential to restore access to your campus Lost &amp; Found account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="space-y-6 bg-white border-[#D9E2E8] shadow-xs">
          {error && (
            <div className="p-3.5 rounded-lg bg-[#FFEBEE] border border-[#D32F2F]/30 flex items-start gap-2.5 text-[#D32F2F] text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-5 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#16324F]">Password Updated Successfully</h3>
                <p className="text-xs text-[#526579] font-medium leading-relaxed">
                  Your account password has been renewed. You can now authenticate with your updated credentials.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/login')}
                  className="w-full text-sm font-semibold shadow-xs"
                >
                  Proceed to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!tokenParam && (
                <Input
                  id="reset-token"
                  name="token"
                  type="text"
                  label="Reset Authorization Token"
                  placeholder="Paste 64-character token"
                  required
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (error) setError(null);
                  }}
                  icon={KeyRound}
                  helperText="Provided in your password reset email"
                />
              )}

              <Input
                id="reset-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                placeholder="Create strong password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                icon={Lock}
                autoComplete="new-password"
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

              <Input
                id="reset-confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm New Password"
                placeholder="Re-enter new password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                icon={Lock}
                autoComplete="new-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#718096] hover:text-[#16324F] focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Password Quality Breakdown */}
              {password && (
                <div className="p-3 rounded-lg bg-[#F7FAFC] border border-[#D9E2E8] space-y-1.5 text-xs">
                  <p className="font-bold text-[#16324F] text-[11px] uppercase tracking-wider mb-1">
                    Security Requirements:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${passwordCriteria.length ? 'text-[#2E7D32]' : 'text-[#718096]'}`}>
                      {passwordCriteria.length ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      8+ Characters
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${passwordCriteria.uppercase ? 'text-[#2E7D32]' : 'text-[#718096]'}`}>
                      {passwordCriteria.uppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      Uppercase (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${passwordCriteria.lowercase ? 'text-[#2E7D32]' : 'text-[#718096]'}`}>
                      {passwordCriteria.lowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      Lowercase (a-z)
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${passwordCriteria.number ? 'text-[#2E7D32]' : 'text-[#718096]'}`}>
                      {passwordCriteria.number ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      Number (0-9)
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold col-span-2 ${passwordCriteria.special ? 'text-[#2E7D32]' : 'text-[#718096]'}`}>
                      {passwordCriteria.special ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      Special Symbol (!@#$%...)
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={loading}
                  className="w-full text-sm font-semibold shadow-xs"
                >
                  Save &amp; Update Password
                </Button>
              </div>

              <div className="pt-4 border-t border-[#D9E2E8] text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#526579] hover:text-[#16324F] font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}

          <div className="p-3 rounded-lg bg-[#F7FAFC] border border-[#D9E2E8] flex items-center gap-2 text-[11px] text-[#718096] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#00695C] shrink-0" />
            <span>Passwords are hashed with bcrypt (work factor 12) before persistence.</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;

