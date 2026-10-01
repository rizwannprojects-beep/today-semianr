import { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Shield,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  BookmarkCheck,
  PackageCheck,
  Megaphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

export const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    inApp: {
      matchNotifications: true,
      claimUpdates: true,
      returnReminders: true,
      announcements: true,
      securityAlerts: true
    },
    email: {
      claimStatusChanged: true,
      returnScheduled: true,
      returnReminders: true,
      importantAnnouncements: true,
      securityAlerts: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        setLoading(true);
        const res = await notificationService.getPreferences();
        if (res?.data?.data) {
          setPreferences((prev) => ({
            ...prev,
            inApp: { ...prev.inApp, ...res.data.data.inApp, securityAlerts: true },
            email: { ...prev.email, ...res.data.data.email, securityAlerts: true }
          }));
        }
      } catch (err) {
        console.warn('Could not fetch preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleToggle = (channel, key) => {
    if (key === 'securityAlerts') return; // Cannot disable security alerts
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: !prev[channel][key]
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback({ type: '', message: '' });
      await notificationService.updatePreferences({
        inApp: preferences.inApp,
        email: preferences.email
      });
      setFeedback({
        type: 'success',
        message: 'Your notification preferences have been saved successfully.'
      });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save preferences. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const Switch = ({ checked, onChange, disabled = false, label, description, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#D9E2E8] last:border-0 gap-4">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="p-2 rounded-xl bg-[#F1FAF9] border border-[#E0F2F1] shrink-0 mt-0.5 text-[#00695C]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs sm:text-sm font-bold text-[#16324F]">{label}</p>
            {disabled && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-[#00695C] bg-[#E0F2F1] px-1.5 py-0.5 rounded-full border border-[#00695C]/30 font-bold">
                <Lock className="w-2.5 h-2.5" />
                Required
              </span>
            )}
          </div>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${checked ? 'bg-[#00695C]' : 'bg-[#D9E2E8]'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="border-b border-[#D9E2E8] pb-4">
        <Link
          to="/notifications"
          className="inline-flex items-center gap-1.5 text-xs text-[#00695C] hover:text-[#00897B] font-bold mb-1 focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Notification Center
        </Link>
        <h1 className="text-2xl font-extrabold text-[#16324F] tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#00695C]" />
          Notification Preferences
        </h1>
        <p className="text-xs text-[#526579] mt-0.5 font-medium">
          Control which events send in-app notifications and email summaries to your campus address.
        </p>
      </div>

      {feedback.message && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-medium ${
            feedback.type === 'error'
              ? 'bg-[#FFEBEE] text-[#D32F2F] border border-[#D32F2F]/30'
              : 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-[#526579] space-y-2">
          <div className="w-6 h-6 border-2 border-[#00695C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-medium">Loading your preferences...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* In-App Alerts */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-3">
              <Bell className="w-5 h-5 text-[#00695C]" />
              <div>
                <h2 className="text-sm font-bold text-[#16324F]">In-App Notification Feed</h2>
                <p className="text-xs text-[#526579] font-medium">
                  Visible in your campus notification center and navigation badge.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#D9E2E8]">
              <Switch
                label="Possible Matches"
                description="Receive alerts when a found item matches your lost item report."
                icon={Sparkles}
                checked={preferences.inApp.matchNotifications}
                onChange={() => handleToggle('inApp', 'matchNotifications')}
              />
              <Switch
                label="Claim Updates"
                description="Receive alerts when your claim is submitted, reviewed, approved, or rejected."
                icon={BookmarkCheck}
                checked={preferences.inApp.claimUpdates}
                onChange={() => handleToggle('inApp', 'claimUpdates')}
              />
              <Switch
                label="Return Handover Reminders"
                description="Receive scheduling updates and 24-hour / 1-hour appointment reminders."
                icon={PackageCheck}
                checked={preferences.inApp.returnReminders}
                onChange={() => handleToggle('inApp', 'returnReminders')}
              />
              <Switch
                label="Campus Broadcasts & Announcements"
                description="Notices posted by campus security personnel and administrators."
                icon={Megaphone}
                checked={preferences.inApp.announcements}
                onChange={() => handleToggle('inApp', 'announcements')}
              />
              <Switch
                label="Account Security Alerts"
                description="Suspicious login attempts, account suspension, or repeated verification failures."
                icon={Shield}
                checked={true}
                disabled={true}
                onChange={() => {}}
              />
            </div>
          </Card>

          {/* Email Notifications */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9E2E8] pb-3">
              <Mail className="w-5 h-5 text-[#FF9800]" />
              <div>
                <h2 className="text-sm font-bold text-[#16324F]">Transactional Email Summaries</h2>
                <p className="text-xs text-[#526579] font-medium">
                  Delivered to your registered campus email address. Spam is strictly prevented.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#D9E2E8]">
              <Switch
                label="Claim Decisions"
                description="Email when your ownership claim is approved or requires additional information."
                icon={BookmarkCheck}
                checked={preferences.email.claimStatusChanged}
                onChange={() => handleToggle('email', 'claimStatusChanged')}
              />
              <Switch
                label="Return Scheduled"
                description="Email confirmation when a return handover appointment is booked."
                icon={PackageCheck}
                checked={preferences.email.returnScheduled}
                onChange={() => handleToggle('email', 'returnScheduled')}
              />
              <Switch
                label="Return Appointment Reminders"
                description="Advance email reminders 24 hours and 1 hour before scheduled handover."
                icon={PackageCheck}
                checked={preferences.email.returnReminders}
                onChange={() => handleToggle('email', 'returnReminders')}
              />
              <Switch
                label="Important Campus Notices"
                description="Campus-wide announcements regarding item clearance or security desk hours."
                icon={Megaphone}
                checked={preferences.email.importantAnnouncements}
                onChange={() => handleToggle('email', 'importantAnnouncements')}
              />
              <Switch
                label="Urgent Security Alerts"
                description="Immediate emails regarding unauthorized access attempts or security incidents."
                icon={Shield}
                checked={true}
                disabled={true}
                onChange={() => {}}
              />
            </div>
          </Card>

          {/* Security Notice */}
          <div className="p-4 rounded-xl bg-[#F1FAF9] border border-[#E0F2F1] flex items-start gap-3 text-xs text-[#526579]">
            <Shield className="w-5 h-5 text-[#00695C] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#16324F]">Security-Critical Policy</p>
              <p className="mt-0.5 leading-relaxed font-medium">
                For student safety and institutional compliance, account security alerts cannot be disabled.
                Secret verification codes and credentials are never included in email or notification payloads.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NotificationPreferences;
