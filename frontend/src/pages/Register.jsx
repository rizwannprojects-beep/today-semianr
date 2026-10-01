import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Building,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Card from '../components/Card.jsx';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    registerNumber: '',
    department: '',
    course: '',
    year: '1',
    semester: '1',
    classDivision: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fill demo presentation account Arjun Nair
  const handleFillDemo = () => {
    setFormData({
      name: 'Arjun Nair',
      email: 'arjun.nair@campus.edu',
      password: 'Campus@123',
      confirmPassword: 'Campus@123',
      phone: '9876543210',
      registerNumber: 'BCA2024001',
      department: 'BCA',
      course: 'BCA Honours',
      year: '3',
      semester: '5',
      classDivision: 'BCA-A'
    });
    setError(null);
  };

  // Real-time password criteria
  const passwordCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setError('Please ensure your password satisfies all security criteria below.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both password entries.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        fullName: formData.name.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone.trim() || undefined,
        phoneNumber: formData.phone.trim() || undefined,
        registerNumber: formData.registerNumber.trim() || undefined,
        department: formData.department.trim() || undefined,
        course: formData.course.trim() || undefined,
        year: formData.year ? parseInt(formData.year, 10) : undefined,
        semester: formData.semester ? parseInt(formData.semester, 10) : undefined,
        className: formData.classDivision.trim() || undefined,
        classDivision: formData.classDivision.trim() || undefined
      };

      await register(payload);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-11 h-11 rounded-xl bg-[#E0F2F1] border border-[#00897B]/40 flex items-center justify-center text-[#00695C] group-hover:scale-105 transition-transform shadow-xs">
              <Compass className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
            Create Student / Campus Account
          </h1>
          <p className="text-xs sm:text-sm text-[#526579] font-medium max-w-md mx-auto">
            Provide institutional details to report belongings and verify ownership at campus security holding desks.
          </p>
        </div>

        {isSuccess ? (
          <Card className="text-center py-10 px-6 space-y-5 bg-white border-[#D9E2E8] shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] border border-[#2E7D32]/30 flex items-center justify-center text-[#2E7D32] mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#16324F]">
                Account created successfully.
              </h2>
              <p className="text-sm text-[#526579] max-w-md mx-auto">
                Welcome to Campus Lost &amp; Found, <strong className="text-[#16324F]">{formData.name}</strong>! Your student account ({formData.email}) is ready for secure item reporting and verification.
              </p>
            </div>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="primary" size="lg" className="shadow-xs w-full sm:w-auto">
                  Continue to Sign In
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="space-y-6 bg-white border-[#D9E2E8] shadow-xs">
            {/* Quick Demo Preload Banner for Classroom Presentation */}
            <div className="p-3.5 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-[#00695C] block">College Presentation Demo Mode</span>
                <span className="text-[#526579]">Pre-fill with verified presentation credentials (Arjun Nair, BCA Honours, Year 3)</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1.5 rounded-lg bg-[#00695C] hover:bg-[#004D40] text-white font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
              >
                Auto-Fill Arjun Nair
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-[#FFEBEE] border border-[#D32F2F]/30 flex items-start gap-2.5 text-[#D32F2F] text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Account Credentials */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00695C] flex items-center gap-1.5 border-b border-[#D9E2E8] pb-2">
                  <User className="w-4 h-4" /> 1. Account Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      id="reg-name"
                      name="name"
                      label="Full Name"
                      placeholder="e.g. Alex Morgan"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      icon={User}
                      autoComplete="name"
                    />
                  </div>

                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    label="Institutional Email"
                    placeholder="student@campus.edu"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    icon={Mail}
                    autoComplete="email"
                  />

                  <Input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    label="Phone Number (Private)"
                    placeholder="+1 (555) 000-0000"
                    helperText="Kept private from public listings"
                    value={formData.phone}
                    onChange={handleChange}
                    icon={Phone}
                    autoComplete="tel"
                  />

                  <Input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Create secure password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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
                    id="reg-confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Repeat password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                </div>

              {/* Password Quality Breakdown */}
              {formData.password && (
                <div className="p-3 rounded-lg bg-[#F7FAFC] border border-[#D9E2E8] space-y-1.5 text-xs">
                  <p className="font-bold text-[#16324F] text-[11px] uppercase tracking-wider mb-1">
                    Security Requirements:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
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
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${passwordCriteria.special ? 'text-[#2E7D32]' : 'text-[#718096]'}`}>
                      {passwordCriteria.special ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      Special Symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Institutional Identification */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#00695C] flex items-center gap-1.5 border-b border-[#D9E2E8] pb-2">
                <GraduationCap className="w-4 h-4" /> 2. Campus &amp; Academic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="reg-regNo"
                  name="registerNumber"
                  label="Register / Roll Number"
                  placeholder="e.g. CS2024-889"
                  value={formData.registerNumber}
                  onChange={handleChange}
                  helperText="Unique university ID for item handovers"
                />

                <Input
                  id="reg-dept"
                  name="department"
                  label="Department / Faculty"
                  placeholder="e.g. Computer Science & Eng"
                  value={formData.department}
                  onChange={handleChange}
                  icon={Building}
                />

                <Input
                  id="reg-course"
                  name="course"
                  label="Course / Degree Program"
                  placeholder="e.g. B.Tech Computer Science"
                  value={formData.course}
                  onChange={handleChange}
                />

                <Input
                  id="reg-division"
                  name="classDivision"
                  label="Class / Division / Section"
                  placeholder="e.g. Section B"
                  value={formData.classDivision}
                  onChange={handleChange}
                />

                <div>
                  <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                    Year of Study
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
                  >
                    {[1, 2, 3, 4, 5, 6].map((yr) => (
                      <option key={yr} value={yr}>
                        Year {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                    Current Semester
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Privacy Shield Notice */}
            <div className="p-3.5 rounded-xl bg-[#E0F2F1] border border-[#00897B]/30 flex items-start gap-2.5 text-xs text-[#526579] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#00695C] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#16324F]">Privacy Protected:</strong> Your register number and contact details are never shown on public listings. They are only utilized by campus administrators during verified item handovers.
              </span>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="md"
              isLoading={loading}
              className="w-full text-sm font-bold shadow-xs"
            >
              Complete Registration &amp; Enter
            </Button>
          </form>

          <div className="pt-4 border-t border-[#D9E2E8] text-center">
            <p className="text-xs text-[#526579] font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-[#00695C] hover:text-[#00897B] font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
        )}
      </div>
    </div>
  );
};

export default Register;

