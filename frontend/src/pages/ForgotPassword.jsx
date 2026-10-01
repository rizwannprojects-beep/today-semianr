import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Card from '../components/Card.jsx';

export const ForgotPassword = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your university email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await forgotPassword(email.trim());
      setSubmitted(true);
      if (res?.data?.devResetUrl) {
        setDevResetUrl(res.data.devResetUrl);
      }
    } catch (err) {
      setError(err.message || 'Unable to process reset request. Please try again.');
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
          Reset Account Password
        </h1>
        <p className="text-xs text-[#526579] font-medium max-w-sm mx-auto">
          Enter your registered campus email to receive a secure, time-limited password recovery link.
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

          {submitted ? (
            <div className="space-y-5 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#16324F]">Recovery Link Dispatched</h3>
                <p className="text-xs text-[#526579] font-medium leading-relaxed">
                  If an account exists for <span className="text-[#16324F] font-bold">{email}</span>, instructions have been sent. The reset link expires in 60 minutes.
                </p>
              </div>

              {devResetUrl && (
                <div className="p-3 rounded-lg bg-[#FFF8E1] border border-[#F9A825]/40 text-left text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#D84315] text-[11px] uppercase tracking-wider">
                    <KeyRound className="w-3.5 h-3.5" /> Local Development Reset Link:
                  </div>
                  <Link
                    to={devResetUrl.replace('http://localhost:5173', '').replace('http://localhost:5174', '')}
                    className="block text-[#00695C] hover:text-[#00897B] font-mono text-[11px] break-all underline font-semibold"
                  >
                    Click here to reset password directly
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#00695C] hover:text-[#00897B] font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="forgot-email"
                name="email"
                type="email"
                label="Campus / Institutional Email"
                placeholder="student@campus.edu"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                icon={Mail}
                autoComplete="email"
                helperText="Enter the official address registered to your account"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={loading}
                  className="w-full text-sm font-semibold shadow-xs"
                >
                  Send Recovery Link
                </Button>
              </div>

              <div className="pt-4 border-t border-[#D9E2E8] flex items-center justify-between text-xs text-[#526579]">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-[#526579] hover:text-[#16324F] font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-[#FF9800] hover:text-[#F57C00] font-bold"
                >
                  Need an account?
                </Link>
              </div>
            </form>
          )}

          <div className="p-3 rounded-lg bg-[#F7FAFC] border border-[#D9E2E8] flex items-center gap-2 text-[11px] text-[#718096] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#00695C] shrink-0" />
            <span>Email addresses are verified against campus student databases securely.</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

