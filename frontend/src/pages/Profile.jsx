import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  BookOpen
} from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import api from '../services/api.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';

export const Profile = () => {
  const { user, checkAuth } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || user?.phoneNumber || '',
    department: user?.department || '',
    course: user?.course || '',
    year: user?.year || 1,
    semester: user?.semester || 1,
    className: user?.className || user?.classDivision || ''
  });

  // Sync if user updates from background
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || '',
        phone: user.phone || user.phoneNumber || '',
        department: user.department || '',
        course: user.course || '',
        year: user.year || 1,
        semester: user.semester || 1,
        className: user.className || user.classDivision || ''
      });
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (success) setSuccess(false);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        phoneNumber: formData.phone.trim(),
        department: formData.department.trim(),
        course: formData.course.trim(),
        year: parseInt(formData.year, 10),
        semester: parseInt(formData.semester, 10),
        className: formData.className.trim(),
        classDivision: formData.className.trim()
      };

      await api.patch('/users/profile', payload);
      await checkAuth();
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to update student profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Profile Header */}
      <div className="border-b border-[#D9E2E8] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#16324F] tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-[#00695C]" />
            Campus Identity Profile
          </h1>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            Your university identity credentials used for ownership validation at security holding desks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {user?.accountStatus || 'Active'}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFF3E0] border border-[#FF9800]/30 text-[#F57C00] flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            {user?.role === 'admin' ? 'Administrator' : 'Student'}
          </span>
        </div>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 flex items-center gap-2.5 text-[#2E7D32] text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile information updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FFEBEE] border border-[#D32F2F]/30 flex items-center gap-2.5 text-[#D32F2F] text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Verified Campus Credentials (Read Only) */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9E2E8]">
            <ShieldCheck className="w-5 h-5 text-[#00695C]" />
            <div>
              <h2 className="text-sm font-bold text-[#16324F]">Verified University Credentials</h2>
              <p className="text-xs text-[#526579] font-medium">Permanent university registry identifiers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                Institutional Email
              </span>
              <p className="font-bold text-[#16324F] flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#00695C]" />
                {user?.email}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#D9E2E8] space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                Register / Roll Number
              </span>
              <p className="font-mono font-bold text-[#00695C] flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-[#00695C]" />
                {user?.registerNumber || 'Unassigned / Campus Staff'}
              </p>
            </div>
          </div>
        </Card>

        {/* Card 2: Contact Information */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9E2E8]">
            <User className="w-5 h-5 text-[#00695C]" />
            <div>
              <h2 className="text-sm font-bold text-[#16324F]">Personal & Contact Details</h2>
              <p className="text-xs text-[#526579] font-medium">Used for claim verification and handover alerts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                id="profile-fullName"
                name="fullName"
                label="Full Name"
                required
                value={formData.fullName}
                onChange={handleChange}
                icon={User}
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                id="profile-phone"
                name="phone"
                type="tel"
                label="Contact Phone Number"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
                helperText="Only visible to security desk upon confirmed item claim"
              />
            </div>
          </div>
        </Card>

        {/* Card 3: Academic Department & Course Details */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9E2E8]">
            <BookOpen className="w-5 h-5 text-[#00695C]" />
            <div>
              <h2 className="text-sm font-bold text-[#16324F]">Academic Information</h2>
              <p className="text-xs text-[#526579] font-medium">Your course division and current class enrollment.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="profile-department"
              name="department"
              label="Department / Faculty"
              placeholder="e.g. Computer Science"
              value={formData.department}
              onChange={handleChange}
              icon={Building}
            />

            <Input
              id="profile-course"
              name="course"
              label="Course / Degree Program"
              placeholder="e.g. B.Tech Computer Engineering"
              value={formData.course}
              onChange={handleChange}
            />

            <div className="sm:col-span-2">
              <Input
                id="profile-className"
                name="className"
                label="Class / Division / Section"
                placeholder="e.g. Section B"
                value={formData.className}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                Year of Study
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full h-11 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
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
                className="w-full h-11 rounded-xl bg-white border border-[#D9E2E8] text-[#16324F] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            className="w-full font-bold shadow-xs"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>

      <div className="pt-4 border-t border-[#D9E2E8] flex flex-col sm:flex-row items-center justify-between text-xs text-[#718096] gap-2">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#00695C]" />
          Last session: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Active now'}
        </span>
        <span>Register number modifications require campus registry approval</span>
      </div>
    </div>
  );
};

export default Profile;
