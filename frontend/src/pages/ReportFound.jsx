import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Camera,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Lock,
  User,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  Building2,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import itemService from '../services/itemService.js';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../utils/constants.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Card from '../components/Card.jsx';
import ImageUploader from '../components/ImageUploader.jsx';

const STEPS = [
  { id: 1, name: 'Item Info', icon: ShieldCheck, desc: 'What was found?' },
  { id: 2, name: 'Location & Storage', icon: MapPin, desc: 'Where & custody' },
  { id: 3, name: 'Photographs', icon: Camera, desc: 'Visual proof' },
  { id: 4, name: 'Review & Reporter', icon: User, desc: 'Confirm handover' },
  { id: 5, name: 'Submit', icon: CheckCircle, desc: 'Publish to board' }
];

export const ReportFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedReport, setSubmittedReport] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Item Info
    itemName: '',
    category: ITEM_CATEGORIES[0],
    description: '',
    color: '',
    brand: '',
    model: '',
    identifyingMarks: '',

    // Step 2: Location & Storage
    dateFound: new Date().toISOString().split('T')[0],
    timeFound: '',
    location: CAMPUS_LOCATIONS[0],
    locationDetails: '',
    storageLocation: CAMPUS_LOCATIONS[7] || 'Administration & Security Desk',

    // Step 3: Images
    images: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleImagesChange = (newImages) => {
    setFormData((prev) => ({
      ...prev,
      images: newImages
    }));
  };

  // Validations per step
  const validateStep = (step) => {
    setError(null);
    if (step === 1) {
      if (!formData.itemName.trim()) {
        setError('Please enter what item was found.');
        return false;
      }
      if (!formData.description.trim() || formData.description.trim().length < 10) {
        setError('Please provide a helpful description (at least 10 characters).');
        return false;
      }
    } else if (step === 2) {
      if (!formData.dateFound) {
        setError('Please specify the date when the item was discovered.');
        return false;
      }
      const selectedDate = new Date(formData.dateFound);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        setError('Date found cannot be in the future.');
        return false;
      }
      if (!formData.location.trim()) {
        setError('Please choose or enter where the item was found.');
        return false;
      }
      if (!formData.storageLocation.trim()) {
        setError('Please specify where the item is currently kept or deposited.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        itemName: formData.itemName.trim(),
        title: formData.itemName.trim(),
        category: formData.category,
        description: formData.description.trim(),
        color: formData.color.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        identifyingMarks: formData.identifyingMarks.trim(),
        identifyingFeatures: formData.identifyingMarks.trim(),
        dateFound: formData.dateFound,
        date: formData.dateFound,
        timeFound: formData.timeFound.trim(),
        location: formData.location.trim(),
        locationDetails: formData.locationDetails.trim(),
        storageLocation: formData.storageLocation.trim(),
        images: formData.images,
        status: 'FOUND'
      };

      const res = await itemService.reportFoundItem(payload);
      const createdItem = res?.data?.item || res?.data?.data || res?.data;
      setSubmittedReport(createdItem);
    } catch (err) {
      console.error('Found report submission error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit the found item report. Please check your network and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Render Success Confirmation
  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="text-center space-y-6 p-8 border-[#D9E2E8] bg-white shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#16324F]">Found Item Registered!</h1>
            <p className="text-sm text-[#526579] font-medium max-w-lg mx-auto">
              Thank you for turning in <span className="font-bold text-[#00695C]">{submittedReport.itemName || formData.itemName}</span>. It is now registered in the campus lost &amp; found system.
            </p>
          </div>

          <div className="bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl p-4 text-left max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#718096] font-medium">Tracking Reference:</span>
              <span className="text-[#00695C] font-mono font-bold">{submittedReport._id || 'Registered'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#718096] font-medium">Status:</span>
              <span className="text-[#2E7D32] font-bold uppercase">{submittedReport.status || 'FOUND'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#718096] font-medium">Handover Location:</span>
              <span className="text-[#16324F] font-semibold">{formData.storageLocation}</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FFF8E1] border border-[#F9A825]/40 rounded-lg text-[#D84315] text-xs flex items-center justify-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 shrink-0 text-[#FF9800]" />
            <span>The smart match engine will compare this with reported lost items to notify potential owners.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/browse-found')}
            >
              Browse Found Registry
            </Button>
            <Button
              variant="accent"
              size="md"
              onClick={() => navigate('/my-reports')}
            >
              View in My Reports
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F2F1] border border-[#00897B]/30 text-[#00695C] text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          Turn-in &amp; Custody Registry
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
          Report a Found Item
        </h1>
        <p className="text-xs sm:text-sm text-[#526579] font-medium">
          Help reunite lost property with fellow students. Your good deed is logged securely with the campus office.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white border border-[#D9E2E8] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-5 gap-2 text-center">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id < currentStep) setCurrentStep(s.id);
                }}
                disabled={s.id > currentStep}
                className={`flex flex-col items-center group transition-all ${
                  isCurrent
                    ? 'opacity-100 scale-102'
                    : isCompleted
                    ? 'opacity-90 hover:opacity-100 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors mb-1.5 ${
                    isCurrent
                      ? 'bg-[#00695C] text-white shadow-xs ring-2 ring-[#00695C]/30'
                      : isCompleted
                      ? 'bg-[#E0F2F1] text-[#00695C] border border-[#00897B]/40'
                      : 'bg-[#F7FAFC] text-[#718096] border border-[#D9E2E8]'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold truncate max-w-full ${
                  isCurrent ? 'text-[#00695C]' : isCompleted ? 'text-[#2E7D32]' : 'text-[#718096]'
                }`}>
                  {s.name}
                </span>
                <span className="hidden sm:block text-[9px] text-[#718096] truncate max-w-full font-medium">
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress track */}
        <div className="w-full bg-[#E0F2F1] h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-[#00695C] transition-all duration-300 rounded-full"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FFEBEE] border border-[#D32F2F]/30 flex items-start gap-3 text-[#D32F2F] text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#D32F2F]" />
          <div className="space-y-1">
            <p className="font-bold text-[#D32F2F]">Please check the required fields:</p>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <Card className="p-6 sm:p-8 space-y-6 bg-white border-[#D9E2E8] shadow-xs">
        {/* STEP 1: ITEM INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-[#D9E2E8] pb-3">
              <h2 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00695C]" />
                Step 1: Item Information
              </h2>
              <p className="text-xs text-[#526579] font-medium mt-0.5">
                Describe the item found on campus.
              </p>
            </div>

            <Input
              id="found-item-name"
              name="itemName"
              label="Item Name / Type"
              placeholder="e.g. Black Leather Tri-fold Wallet / Casio FX-991EX Calculator"
              required
              value={formData.itemName}
              onChange={handleChange}
              helperText="Give a recognizable general title"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                  Category <span className="text-[#D84315]">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-11 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
                >
                  {ITEM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                id="found-color"
                name="color"
                label="Primary Color"
                placeholder="e.g. Silver, Black, Red"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="found-brand"
                name="brand"
                label="Brand / Manufacturer (if visible)"
                placeholder="e.g. Samsung, Wildcraft, Fastrack"
                value={formData.brand}
                onChange={handleChange}
              />

              <Input
                id="found-model"
                name="model"
                label="Model / Edition (if visible)"
                placeholder="e.g. Galaxy Buds 2, Classic 500"
                value={formData.model}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                Public Description <span className="text-[#D84315]">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Describe visible exterior condition, casing color, general design. Do NOT write secret identifying details here."
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />
              <p className="text-[11px] text-[#526579] font-medium mt-1">
                Minimum 10 characters. Keep it general so genuine owners can verify ownership through secret questions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8E1] border border-[#F9A825]/40 space-y-2">
              <label className="block text-xs font-bold text-[#D84315] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Confidential Identifying Characteristics (Private)
              </label>
              <textarea
                name="identifyingMarks"
                rows={2}
                placeholder="e.g. Exact cash amount in wallet, keychain charm name, sticker text on underside..."
                value={formData.identifyingMarks}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs p-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />
              <p className="text-[11px] text-[#526579] font-medium">
                🔒 Hidden from the public. Only campus authorities use this to test and verify rightful claimants.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION & STORAGE */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-[#D9E2E8] pb-3">
              <h2 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00695C]" />
                Step 2: Location &amp; Custody Storage
              </h2>
              <p className="text-xs text-[#526579] font-medium mt-0.5">
                Where was the item recovered and where is it currently stored?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="found-date"
                name="dateFound"
                type="date"
                label="Date Discovered"
                required
                value={formData.dateFound}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />

              <Input
                id="found-time"
                name="timeFound"
                type="time"
                label="Approximate Time Found (Optional)"
                value={formData.timeFound}
                onChange={handleChange}
                icon={Clock}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                Campus Location Where Found <span className="text-[#D84315]">*</span>
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full h-11 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                Specific Location Details
              </label>
              <input
                type="text"
                name="locationDetails"
                placeholder="e.g. Under Table 14 in Central Cafeteria, or CS Lab 2 desk"
                value={formData.locationDetails}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#E0F2F1] border border-[#00897B]/30 space-y-2">
              <label className="block text-xs font-bold text-[#00695C] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Current Custody / Storage Desk <span className="text-[#D84315]">*</span>
              </label>
              <select
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleChange}
                className="w-full h-11 rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] font-medium text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value="With Reporter (Self-Custody pending handover)">
                  With Reporter (Self-Custody pending handover)
                </option>
              </select>
              <p className="text-[11px] text-[#526579] font-medium">
                Please hand in high-value items (wallets, phones, laptops, IDs) to the campus security desk or department front office promptly.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: PHOTOGRAPHS */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-[#D9E2E8] pb-3">
              <h2 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#00695C]" />
                Step 3: Item Photographs
              </h2>
              <p className="text-xs text-[#526579] font-medium mt-0.5">
                Snap photos of the found property. Avoid capturing confidential ID numbers or cash contents directly.
              </p>
            </div>

            <ImageUploader
              images={formData.images}
              onChange={handleImagesChange}
              maxImages={5}
              label="Found Item Images"
              helperText="Upload up to 5 photos (JPEG, PNG, WEBP < 5MB each). Real photos accelerate claim verification."
            />

            <div className="p-3.5 rounded-xl bg-[#F0F7F6] border border-[#D9E2E8] flex items-start gap-2.5 text-xs text-[#526579] font-medium">
              <Info className="w-4 h-4 shrink-0 text-[#00695C] mt-0.5" />
              <span>
                Tip: If the item has a visible student register number or name, you may note it in your description or confidential notes.
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & REPORTER RECORD */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#D9E2E8] pb-3">
              <h2 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
                <User className="w-5 h-5 text-[#00695C]" />
                Step 4: Review Report &amp; Reporter Record
              </h2>
              <p className="text-xs text-[#526579] font-medium mt-0.5">
                Review the report specifications and your recorded student profile.
              </p>
            </div>

            {/* Reporter Profile */}
            <div className="bg-[#E0F2F1] border border-[#00897B]/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00695C] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Logged Reporter (Your Account)
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-[#00695C] border border-[#00897B]/40 font-bold shadow-xs">
                  Verified Campus Member
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[#526579] block text-[11px] font-semibold">Full Name</span>
                  <span className="font-bold text-[#16324F]">{user?.fullName || user?.name || 'Authenticated Student'}</span>
                </div>
                <div>
                  <span className="text-[#526579] block text-[11px] font-semibold">Register Number</span>
                  <span className="font-bold text-[#00695C] font-mono">{user?.registerNumber || user?.studentId || 'Linked Profile'}</span>
                </div>
                <div>
                  <span className="text-[#526579] block text-[11px] font-semibold">Department</span>
                  <span className="font-bold text-[#16324F]">{user?.department || 'Campus Student'}</span>
                </div>
                <div>
                  <span className="text-[#526579] block text-[11px] font-semibold">Year</span>
                  <span className="font-bold text-[#16324F]">{user?.year ? `Year ${user.year}` : 'Active Student'}</span>
                </div>
                <div>
                  <span className="text-[#526579] block text-[11px] font-semibold">Class / Division</span>
                  <span className="font-bold text-[#16324F]">{user?.className || user?.class || user?.course || 'Campus Division'}</span>
                </div>
                <div>
                  <span className="text-[#526579] block text-[11px] font-semibold">Phone Number</span>
                  <span className="font-bold text-[#16324F]">{user?.phone || user?.phoneNumber || 'Private / Linked'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[#526579] block text-[11px] font-semibold">Campus Email</span>
                  <span className="font-bold text-[#16324F]">{user?.email}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#526579] pt-2 border-t border-[#00897B]/20 flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-[#00695C] shrink-0" />
                Your identity is never exposed publicly to prevent harassment. Campus security tracks custody handovers.
              </p>
            </div>

            {/* Found Item Details Summary */}
            <div className="bg-[#F7FAFC] border border-[#D9E2E8] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#16324F] flex items-center justify-between">
                <span>Found Item Summary</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#00695C] font-bold hover:underline cursor-pointer"
                >
                  Edit Item
                </button>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#718096] block text-[11px] font-semibold">Item Name</span>
                  <span className="font-bold text-[#16324F]">{formData.itemName}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[11px] font-semibold">Category</span>
                  <span className="font-bold text-[#16324F]">{formData.category}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[11px] font-semibold">Date Found</span>
                  <span className="font-bold text-[#16324F]">{formData.dateFound}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[11px] font-semibold">Location Found</span>
                  <span className="font-bold text-[#16324F]">{formData.location}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#718096] block text-[11px] font-semibold">Custody / Holding Desk</span>
                  <span className="font-bold text-[#00695C]">{formData.storageLocation}</span>
                </div>
                {formData.color && (
                  <div>
                    <span className="text-[#718096] block text-[11px] font-semibold">Color</span>
                    <span className="font-bold text-[#16324F]">{formData.color}</span>
                  </div>
                )}
                {formData.brand && (
                  <div>
                    <span className="text-[#718096] block text-[11px] font-semibold">Brand / Model</span>
                    <span className="font-bold text-[#16324F]">{formData.brand} {formData.model}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[#718096] block text-[11px] font-semibold mb-1">Public Description</span>
                <p className="text-xs text-[#16324F] font-medium bg-white p-3 rounded-lg border border-[#D9E2E8]">
                  {formData.description}
                </p>
              </div>

              {formData.images.length > 0 && (
                <div>
                  <span className="text-[#718096] block text-[11px] font-semibold mb-1.5">
                    Attached Photographs ({formData.images.length})
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {formData.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="preview"
                        className="w-16 h-16 rounded-lg object-cover border border-[#D9E2E8] shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION & PUBLISH */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#D9E2E8] pb-3">
              <h2 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#2E7D32]" />
                Step 5: Handover Confirmation
              </h2>
              <p className="text-xs text-[#526579] font-medium mt-0.5">
                Final check before posting this found item to the public university registry.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF8E1] border border-[#F9A825]/40 space-y-4">
              <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D84315]" />
                Found Property Commitment
              </h3>
              <ul className="text-xs text-[#526579] font-medium space-y-2 list-disc pl-5">
                <li>
                  I agree to keep the item safe or hand it over to the specified campus holding desk ({formData.storageLocation}).
                </li>
                <li>
                  I acknowledge that items not claimed within university regulation periods are managed according to campus disposal procedures.
                </li>
                <li>
                  Students submitting claims will be vetted by authorized staff before the item is released.
                </li>
              </ul>
            </div>

            <div className="bg-[#F7FAFC] border border-[#D9E2E8] p-4 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#16324F] block">Initial Lifecycle Status</span>
                <span className="text-[#526579] font-medium">Available for verified claim requests</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#E0F2F1] text-[#00695C] border border-[#00897B]/30 font-bold uppercase tracking-wider text-[11px]">
                FOUND
              </span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D9E2E8]">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBack}
              disabled={loading}
              className="gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              className="gap-1.5 font-semibold"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="accent"
              size="lg"
              onClick={handleSubmit}
              isLoading={loading}
              className="gap-2 font-bold px-8 shadow-xs"
            >
              Publish Found Item <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReportFound;
