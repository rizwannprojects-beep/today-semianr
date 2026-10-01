import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-[#D9E2E8] bg-white text-[#526579] text-xs mt-auto">
      <div className="app-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: System Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-center text-[#00695C]">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-[#16324F] text-sm">
                Campus Lost &amp; Found
              </span>
            </div>
            <p className="text-[#526579] leading-relaxed">
              Official campus platform facilitating safe item reporting, identity verification, and ownership return for all students and university staff.
            </p>
            <div className="flex items-center gap-1.5 text-[#2E7D32] text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Campus Security &amp; Administration Monitored</span>
            </div>
          </div>

          {/* Col 2: Fast Navigation */}
          <div>
            <h4 className="text-[#16324F] font-bold text-xs uppercase tracking-wider mb-3">
              Item Recovery
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/browse-lost" className="hover:text-[#00695C] transition-colors">
                  Browse Lost Items
                </Link>
              </li>
              <li>
                <Link to="/browse-found" className="hover:text-[#00695C] transition-colors">
                  Browse Found Items
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-[#00695C] transition-colors">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-[#00695C] transition-colors">
                  Turn In a Found Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Guidelines & Verification */}
          <div>
            <h4 className="text-[#16324F] font-bold text-xs uppercase tracking-wider mb-3">
              Safety &amp; Verification
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/guidelines" className="hover:text-[#00695C] transition-colors">
                  Ownership Verification Protocol
                </Link>
              </li>
              <li>
                <Link to="/guidelines#desks" className="hover:text-[#00695C] transition-colors">
                  Designated Campus Holding Desks
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#00695C] transition-colors">
                  Campus Security Helpdesk
                </Link>
              </li>
              <li>
                <span className="text-[#718096]">Student Privacy Shield (Enabled)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Desk Info */}
          <div>
            <h4 className="text-[#16324F] font-bold text-xs uppercase tracking-wider mb-3">
              Central Holding Desk
            </h4>
            <ul className="space-y-2 text-[#526579]">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                <span>Security Office, Ground Floor, Admin Block</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                <span>Ext. 4421 / (0555) 987-234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                <span>lostandfound@campus.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#D9E2E8] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#718096]">
          <p>© {new Date().getFullYear()} University Campus Lost &amp; Found Portal. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/guidelines" className="hover:text-[#00695C]">
              Privacy &amp; Data Safeguards
            </Link>
            <span>•</span>
            <Link to="/guidelines" className="hover:text-[#00695C]">
              Terms of Handover
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
