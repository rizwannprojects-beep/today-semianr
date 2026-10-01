import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#16324F] tracking-tight">
          Campus Lost & Found Helpdesk
        </h1>
        <p className="text-xs sm:text-sm text-[#526579] max-w-lg mx-auto font-medium">
          Need assistance verifying an item, locating a holding desk, or reporting sensitive items like passports or official IDs?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#00695C] border-b border-[#D9E2E8] pb-2">
              Central Recovery Office
            </h2>

            <div className="space-y-4 text-xs text-[#16324F]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#FF9800] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#16324F]">Main Campus Security Office</p>
                  <p className="text-[#526579] mt-0.5 font-medium">
                    Ground Floor, Administrative Block (Opposite Central Plaza)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#00695C] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#16324F]">Telephone Contacts</p>
                  <p className="text-[#526579] mt-0.5 font-medium">Campus Ext: 4421 / 4422</p>
                  <p className="text-[#526579] font-medium">Direct Line: +1 (555) 019-4820</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#FF9800] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#16324F]">Official Email</p>
                  <p className="text-[#526579] mt-0.5 font-medium">lostandfound@campus.edu</p>
                  <p className="text-[#526579] font-medium">security.desk@campus.edu</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#00695C] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#16324F]">Operating Hours</p>
                  <p className="text-[#526579] mt-0.5 font-medium">
                    Monday to Friday: 08:30 AM – 05:30 PM
                  </p>
                  <p className="text-[#526579] font-medium">Saturday: 09:00 AM – 01:00 PM</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-4 rounded-xl bg-[#E0F2F1] border border-[#00695C]/20 flex items-center gap-3 text-xs text-[#00695C] font-semibold">
            <ShieldCheck className="w-5 h-5 text-[#00695C] shrink-0" />
            <span>Emergency lockouts or high-value recoveries can contact 24/7 Security Dispatch via Ext. 000.</span>
          </div>
        </div>

        {/* Message Form */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#16324F] border-b border-[#D9E2E8] pb-2">
            Send an Inquiry
          </h2>

          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto border border-[#2E7D32]/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#16324F] text-base">Inquiry Received</h3>
              <p className="text-xs text-[#526579] max-w-xs mx-auto font-medium leading-relaxed">
                Campus security administration has received your message and will respond within 24 operational hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name"
                placeholder="Student / Faculty Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Input
                label="Institutional Email"
                type="email"
                placeholder="student@campus.edu"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Subject"
                placeholder="e.g. Inquiring about misplaced laptop bag in Lib 2F"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />

              <div>
                <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your question or emergency details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white border border-[#D9E2E8] rounded-xl p-3 text-xs text-[#16324F] placeholder:text-[#718096] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full font-bold">
                Submit Helpdesk Inquiry
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Contact;
