import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
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
  { id: 1, name: 'Item Info', icon: FileText, desc: 'What was lost?' },
  { id: 2, name: 'Location & Date', icon: MapPin, desc: 'Where & when?' },
  { id: 3, name: 'Photographs', icon: Camera, desc: 'Visual proof' },
  { id: 4, name: 'Review & Student Info', icon: User, desc: 'Confirm details' },
  { id: 5, name: 'Submit', icon: CheckCircle, desc: 'Publish report' }
];

export const ReportLost = () => {
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
    estimatedValue: '',
    identifyingMarks: '',

    // Step 2: Location & Date
    dateLost: new Date().toISOString().split('T')[0],
    timeLost: '',
    location: CAMPUS_LOCATIONS[0],
    locationDetails: '',

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

  // Step Validations
  const validateStep = (step) => {
    setError(null);
    if (step === 1) {
      if (!formData.itemName.trim()) {
        setError('Please enter the item name or title.');
        return false;
      }
      if (!formData.description.trim() || formData.description.trim().length < 10) {
        setError('Please provide a detailed description (at least 10 characters).');
        return false;
      }
    } else if (step === 2) {
      if (!formData.dateLost) {
        setError('Please specify the date when the item was lost.');
        return false;
      }
      const selectedDate = new Date(formData.dateLost);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        setError('The date lost cannot be in the future.');
        return false;
      }
      if (!formData.location.trim()) {
        setError('Please choose or enter the campus location.');
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
        estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
        identifyingMarks: formData.identifyingMarks.trim(),
        identifyingFeatures: formData.identifyingMarks.trim(),
        dateLost: formData.dateLost,
        date: formData.dateLost,
        timeLost: formData.timeLost.trim(),
        location: formData.location.trim(),
        locationDetails: formData.locationDetails.trim(),
        images: formData.images
      };

      const res = await itemService.reportLostItem(payload);
      const createdItem = res?.data?.item || res?.data?.data || res?.data;
      setSubmittedReport(createdItem);
    } catch (err) {
      console.error('Report submission error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit the lost item report. Please check your network and try again.'
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
            <h1 className="text-2xl font-bold text-[#16324F]">Lost Report Submitted Successfully!</h1>
            <p className="text-sm text-[#526579] font-medium max-w-lg mx-auto">
              Your report for <span className="font-bold text-[#00695C]">{submittedReport.itemName || formData.itemName}</span> has been indexed and published to the campus lost registry.
            </p>
          </div>

          <div className="bg-[#F7FAFC] border border-[#D9E2E8] rounded-xl p-4 text-left max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#718096] font-medium">Tracking Reference:</span>
              <span className="text-[#00695C] font-mono font-bold">{submittedReport._id || 'Registered'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#718096] font-medium">Status:</span>
              <span className="text-[#2E7D32] font-bold uppercase">{submittedReport.status || 'ACTIVE'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#718096] font-medium">Category &amp; Location:</span>
              <span className="text-[#16324F] font-semibold">{formData.category} &bull; {formData.location}</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FFF8E1] border border-[#F9A825]/40 rounded-lg text-[#D84315] text-xs flex items-center justify-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 shrink-0 text-[#FF9800]" />
            <span>Campus security and smart match engine will alert you when a match is cataloged.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/browse-lost')}
            >
              Browse Lost Items
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBEE] border border-[#D32F2F]/30 text-[#D32F2F] text-xs font-bold">
          <FileText className="w-3.5 h-3.5" />
          Campus Incident Registry
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
          Report a Lost Item
        </h1>
        <p className="text-xs sm:text-sm text-[#526579] font-medium">
          File a lost property incident. Your student details are linked automatically for secure verification.
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
                <FileText className="w-5 h-5 text-[#00695C]" />
                Step 1: Item Information
              </h2>
              <p className="text-xs text-[#526579] font-medium mt-0.5">
                Provide clear details about what was lost so others can identify it.
              </p>
            </div>

            <Input
              id="lost-item-name"
              name="itemName"
              label="Item Name / Title"
              placeholder="e.g. Navy Blue HP Pavilion 15 / Stainless Hydro Flask"
              required
              value={formData.itemName}
              onChange={handleChange}
              helperText="Be specific with brand, model or color"
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
                id="lost-color"
                name="color"
                label="Primary Color"
                placeholder="e.g. Space Grey, Matte Black, Blue"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                id="lost-brand"
                name="brand"
                label="Brand / Manufacturer"
                placeholder="e.g. Apple, Casio, Dell"
                value={formData.brand}
                onChange={handleChange}
              />

              <Input
                id="lost-model"
                name="model"
                label="Model Number / Series"
                placeholder="e.g. iPhone 13, FX-991EX"
                value={formData.model}
                onChange={handleChange}
              />

              <Input
                id="lost-value"
                name="estimatedValue"
                type="number"
                min="0"
                label="Estimated Value (Optional)"
                placeholder="Approximate ₹ or $"
                value={formData.estimatedValue}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                Detailed Description <span className="text-[#D84315]">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Describe visible condition, size, distinctive features, stickers, casing, or contents..."
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />
              <p className="text-[11px] text-[#526579] font-medium mt-1">
                Minimum 10 characters. Avoid posting private secrets here (use the private notes box below).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8E1] border border-[#F9A825]/40 space-y-2">
              <label className="block text-xs font-bold text-[#D84315] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Confidential Identifying Marks (Kept Private)
              </label>
              <textarea
                name="identifyingMarks"
                rows={2}
                placeholder="e.g. Serial # snippet, specific lockscreen wallpaper, engraving on back, internal pocket note..."
                value={formData.identifyingMarks}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-xs p-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />
              <p className="text-[11px] text-[#526579] font-medium">
                🔒 This is completely hidden from the public browse board. Used by campus security to verify genuine ownership claims.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION & DATE */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-[#D9E2E8] pb-3">
              <h2 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00695C]" />
                Step 2: Location &amp; Date Lost
              </h2>
              <p className="text-xs text-[#526579] font-medium mt-0.5">
                Pinpoint where and when you last remember having the item.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="lost-date"
                name="dateLost"
                type="date"
                label="Date Lost"
                required
                value={formData.dateLost}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />

              <Input
                id="lost-time"
                name="timeLost"
                type="time"
                label="Approximate Time Lost (Optional)"
                value={formData.timeLost}
                onChange={handleChange}
                icon={Clock}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16324F] uppercase tracking-wider mb-1.5">
                Campus Location <span className="text-[#D84315]">*</span>
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
                placeholder="e.g. 2nd floor reading area, cubicle near east window, or bus stop #3 bench"
                value={formData.locationDetails}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-[#D9E2E8] text-[#16324F] text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 focus:border-[#00695C]"
              />
              <p className="text-[11px] text-[#526579] font-medium mt-1">
                Helps staff and finders cross-check exact campus spot.
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
                Upload clear reference photos. (Past photos, product image, or similar item photos).
              </p>
            </div>

            <ImageUploader
              images={formData.images}
              onChange={handleImagesChange}
              maxImages={5}
              label="Item Images"
              helperText="Upload up to 5 photos (JPEG, PNG, WEBP < 5MB each). Real photos increase return rate by 3x!"
            />

            <div className="p-3.5 rounded-xl bg-[#F0F7F6] border border-[#D9E2E8] flex items-start gap-2.5 text-xs text-[#526579] font-medium">
              <Info className="w-4 h-4 shrink-0 text-[#00695C] mt-0.5" />
              <span>
                Don't have a photo? You can still submit the report! Adding photos later or using a generic product reference photo also works.
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & STUDENT INFO */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#D9E2E8] pb-3">
              <h2 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
                <User className="w-5 h-5 text-[#00695C]" />
                Step 4: Review Report &amp; Student Profile
              </h2>
              <p className="text-xs text-[#526579] font-medium mt-0.5">
                Verify report accuracy and review your authenticated student profile link.
              </p>
            </div>

            {/* Student details card - auto populated */}
            <div className="bg-[#E0F2F1] border border-[#00897B]/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00695C] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Authenticated Reporter Profile
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-[#00695C] border border-[#00897B]/40 font-bold shadow-xs">
                  Verified Campus ID
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
                  <span className="font-bold text-[#16324F]">{user?.department || 'University Student'}</span>
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
                Your personal contact info is NEVER displayed publicly. Only security officers can coordinate item returns with you.
              </p>
            </div>

            {/* Item summary */}
            <div className="bg-[#F7FAFC] border border-[#D9E2E8] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#16324F] flex items-center justify-between">
                <span>Item Summary</span>
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
                  <span className="text-[#718096] block text-[11px] font-semibold">Date Lost</span>
                  <span className="font-bold text-[#16324F]">{formData.dateLost}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[11px] font-semibold">Location</span>
                  <span className="font-bold text-[#16324F]">{formData.location}</span>
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
                {formData.locationDetails && (
                  <div className="col-span-2">
                    <span className="text-[#718096] block text-[11px] font-semibold">Location Specifics</span>
                    <span className="font-bold text-[#16324F]">{formData.locationDetails}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[#718096] block text-[11px] font-semibold mb-1">Description</span>
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

        {/* STEP 5: FINAL CONFIRMATION & SUBMIT */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#D9E2E8] pb-3">
              <h2 className="text-lg font-bold text-[#16324F] flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#2E7D32]" />
                Step 5: Final Submission Confirmation
              </h2>
              <p className="text-xs text-[#526579] font-medium mt-0.5">
                Confirm your pledge and submit this incident report to the active campus database.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF8E1] border border-[#F9A825]/40 space-y-4">
              <h3 className="text-sm font-bold text-[#16324F] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D84315]" />
                Reporting Conditions &amp; University Policy
              </h3>
              <ul className="text-xs text-[#526579] font-medium space-y-2 list-disc pl-5">
                <li>
                  I certify that the information provided is accurate and belongs to me or someone I am authorized to represent.
                </li>
                <li>
                  I understand that campus security and lost &amp; found administrators will review this report.
                </li>
                <li>
                  When an item matching these specifications is surrendered, an automated notification will be dispatched to my campus email.
                </li>
                <li>
                  False or misleading reports are subject to campus disciplinary review.
                </li>
              </ul>
            </div>

            <div className="bg-[#F7FAFC] border border-[#D9E2E8] p-4 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#16324F] block">Report Status on Publish</span>
                <span className="text-[#526579] font-medium">Will be marked as active in campus registry</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 font-bold uppercase tracking-wider text-[11px]">
                ACTIVE
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
              Confirm &amp; Publish Report <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReportLost;
