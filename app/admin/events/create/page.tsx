"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  ArrowLeft, 
  Save, 
  UploadCloud, 
  CheckCircle2, 
  QrCode, 
  CreditCard, 
  HelpCircle,
  X,
  FileText,
  AlertCircle
} from "lucide-react";
import FormQuestionBuilder from "@/components/admin/FormQuestionBuilder";
import { EventFormQuestion, EventStatus } from "@/lib/events/types";
import { OFFICIAL_COMMUNITY_EMAIL } from "@/lib/constants";

export default function CreateEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Core Event Details
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Technology & Innovation");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [coverImagePath, setCoverImagePath] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("09:00");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("18:00");

  const [regStartDate, setRegStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [regEndDate, setRegEndDate] = useState("");
  const [capacity, setCapacity] = useState(100);

  const [organizer, setOrganizer] = useState("COMMUNITY.VA");
  const [contactEmail, setContactEmail] = useState(OFFICIAL_COMMUNITY_EMAIL);
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState<EventStatus>("DRAFT");

  // Payment Details
  const [isPaid, setIsPaid] = useState(false);
  const [feeAmount, setFeeAmount] = useState(199);
  const [feeCurrency] = useState("INR");
  const [paymentInstructions, setPaymentInstructions] = useState(
    "Scan the official COMMUNITY.VA UPI QR code below using Google Pay, PhonePe, or Paytm. Submit the transaction screenshot and UTR number below."
  );
  const [paymentUpiId, setPaymentUpiId] = useState("community.va@okaxis");
  const [paymentPayeeName, setPaymentPayeeName] = useState("COMMUNITY VA YOUTH FORUM");
  const [paymentQrPath, setPaymentQrPath] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);
  const [paymentVerificationRequired, setPaymentVerificationRequired] = useState(true);

  // Dynamic Questions
  const [questions, setQuestions] = useState<EventFormQuestion[]>([
    {
      id: "q_col",
      label: "College / University Name",
      description: "Institution you are currently attending",
      question_type: "short_text",
      is_required: true,
      placeholder: "e.g., JNTU Hyderabad / CBIT / Osmania University",
      display_order: 1,
    },
    {
      id: "q_br",
      label: "Branch & Study Year",
      question_type: "dropdown",
      is_required: true,
      options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated / Other"],
      display_order: 2,
    }
  ]);

  // Upload handler for cover image or payment QR code
  const handleFileUpload = async (file: File, target: "COVER" | "QR") => {
    const isCover = target === "COVER";
    if (isCover) setUploadingCover(true);
    else setUploadingQr(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "public");

      const res = await fetch("/api/events/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.filePath) {
        if (isCover) setCoverImagePath(data.filePath);
        else setPaymentQrPath(data.filePath);
      } else {
        alert(data.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Error uploading file. Please try again.");
    } finally {
      if (isCover) setUploadingCover(false);
      else setUploadingQr(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter an event title.");
      return;
    }
    if (!venue.trim()) {
      setErrorMsg("Please specify the event venue or virtual link.");
      return;
    }
    if (!eventStartDate) {
      setErrorMsg("Please specify the event start date.");
      return;
    }

    if (isPaid && !paymentQrPath) {
      setErrorMsg("Please upload the official payment QR code for paid events.");
      return;
    }

    setSubmitting(true);

    const eventStart = `${eventStartDate}T${eventStartTime || "09:00"}:00Z`;
    const eventEnd = `${eventEndDate || eventStartDate}T${eventEndTime || "18:00"}:00Z`;
    const registrationStart = `${regStartDate || new Date().toISOString().split("T")[0]}T00:00:00Z`;
    const registrationEnd = `${regEndDate || eventStartDate}T23:59:59Z`;

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventData: {
            title,
            category,
            description,
            venue,
            cover_image_path: coverImagePath,
            event_start: eventStart,
            event_end: eventEnd,
            registration_start: registrationStart,
            registration_end: registrationEnd,
            capacity: Number(capacity),
            organizer,
            contact_email: contactEmail,
            instructions,
            status,
            is_paid: isPaid,
            fee_amount: isPaid ? Number(feeAmount) : 0,
            fee_currency: feeCurrency,
            payment_instructions: isPaid ? paymentInstructions : null,
            payment_upi_id: isPaid ? paymentUpiId : null,
            payment_payee_name: isPaid ? paymentPayeeName : null,
            payment_qr_path: isPaid ? paymentQrPath : null,
            payment_verification_required: isPaid ? paymentVerificationRequired : false,
          },
          questions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/events");
      } else {
        setErrorMsg(data.message || "Failed to create event");
      }
    } catch (err: any) {
      console.error("Create event error", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-brand-dark text-white border-b border-brand-border-dark sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/events"
              className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events</span>
            </Link>
            <span className="text-neutral-500">|</span>
            <span className="text-xs font-bold font-mono uppercase text-brand-red">
              New Event Builder
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-red text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{submitting ? "Saving Event..." : "Save & Publish Event"}</span>
          </button>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <form onSubmit={handleSubmit} className="space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Core Details */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-brand-dark flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-blue" />
                <span>01. Event Details & Scheduling</span>
              </h2>
              <p className="text-xs text-brand-muted mt-1">
                Define the core title, category, timings, and venue for the event.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. COMMUNITY.VA Hyderabad Innovation Hackathon 2026"
                  className="w-full px-3.5 py-2.5 text-sm border border-brand-border rounded-lg outline-none focus:border-brand-dark font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-brand-border rounded-lg outline-none focus:border-brand-dark bg-white font-medium"
                >
                  <option value="Technology & Innovation">Technology & Innovation</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Events & Entertainment">Events & Entertainment</option>
                  <option value="Sports & Activities">Sports & Activities</option>
                  <option value="Career & Opportunities">Career & Opportunities</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark">
                Event Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed overview of what participants will learn, build, or experience..."
                className="w-full px-3.5 py-2.5 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark leading-relaxed"
              />
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark">
                Event Cover Image (Optional)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-48 h-28 rounded-lg border border-brand-border bg-neutral-50 overflow-hidden relative flex items-center justify-center">
                  {coverImagePath ? (
                    <Image
                      src={coverImagePath}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-neutral-400">No image chosen</span>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    id="cover-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "COVER");
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="cover-upload"
                      className="px-3 py-2 text-xs font-bold rounded-md border border-brand-border bg-white hover:bg-neutral-50 text-brand-dark cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{uploadingCover ? "Uploading..." : "Upload Cover Image"}</span>
                    </label>
                    {coverImagePath && (
                      <button
                        type="button"
                        onClick={() => setCoverImagePath("")}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={coverImagePath}
                    onChange={(e) => setCoverImagePath(e.target.value)}
                    placeholder="Or enter direct image URL (https://...)"
                    className="w-full px-3 py-1.5 text-xs border border-brand-border rounded outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Scheduling & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  End Time
                </label>
                <input
                  type="time"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  Max Capacity (Seats) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none font-medium"
                />
              </div>
            </div>

            {/* Venue & Organizer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. T-Hub Phase 2, Madhapur, Hyderabad"
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none bg-white font-bold font-mono"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED (Live on site)</option>
                  <option value="REGISTRATION_CLOSED">REGISTRATION CLOSED</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                Instructions / What to Bring (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Bring college ID, laptops, and chargers. Wi-Fi and lunch provided."
                className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none"
              />
            </div>
          </div>

          {/* Section 2: Payment Configuration */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="text-xl font-extrabold text-brand-dark flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-red" />
                <span>02. Payment Configuration (Manual UPI QR)</span>
              </h2>
              <p className="text-xs text-brand-muted mt-1">
                Set event as Free or Paid. For paid events, upload the official COMMUNITY.VA payment QR code.
              </p>
            </div>

            {/* Free vs Paid Toggle */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="paymentType"
                  checked={!isPaid}
                  onChange={() => setIsPaid(false)}
                  className="w-4 h-4 text-brand-dark focus:ring-brand-dark"
                />
                <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                  Free Event (No Fee / No QR Required)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="paymentType"
                  checked={isPaid}
                  onChange={() => setIsPaid(true)}
                  className="w-4 h-4 text-brand-red focus:ring-brand-red"
                />
                <span className="text-xs font-bold text-brand-red uppercase tracking-wider">
                  Paid Event (UPI QR Code & Manual Verification)
                </span>
              </label>
            </div>

            {/* Paid Details Fields */}
            {isPaid && (
              <div className="space-y-5 p-5 rounded-xl bg-red-50/20 border border-red-100 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                      Registration Fee (INR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-muted">₹</span>
                      <input
                        type="number"
                        min={1}
                        required={isPaid}
                        value={feeAmount}
                        onChange={(e) => setFeeAmount(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-xs border border-brand-border rounded outline-none font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                      Official UPI ID
                    </label>
                    <input
                      type="text"
                      value={paymentUpiId}
                      onChange={(e) => setPaymentUpiId(e.target.value)}
                      placeholder="community.va@okaxis"
                      className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                      Payee Display Name
                    </label>
                    <input
                      type="text"
                      value={paymentPayeeName}
                      onChange={(e) => setPaymentPayeeName(e.target.value)}
                      placeholder="COMMUNITY VA YOUTH FORUM"
                      className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none font-medium"
                    />
                  </div>
                </div>

                {/* QR Code Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark">
                    Official Payment QR Code Upload *
                  </label>
                  <p className="text-[11px] text-brand-muted">
                    Upload the exact QR code graphic generated from your UPI app or bank. This exact image will be displayed to participants during registration.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    <div className="w-40 h-40 rounded-xl border-2 border-dashed border-brand-border bg-white overflow-hidden relative flex items-center justify-center p-2 shadow-inner">
                      {paymentQrPath ? (
                        <Image
                          src={paymentQrPath}
                          alt="Official Payment QR"
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="text-center p-3 text-neutral-400">
                          <QrCode className="w-8 h-8 mx-auto mb-1 opacity-40" />
                          <span className="text-[10px]">No QR Uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        id="qr-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "QR");
                        }}
                      />
                      <label
                        htmlFor="qr-upload"
                        className="px-4 py-2 text-xs font-bold rounded-md bg-brand-dark text-white hover:bg-black cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{uploadingQr ? "Uploading QR..." : "Upload Official UPI QR Code"}</span>
                      </label>
                      <p className="text-[11px] text-neutral-500">
                        Supports PNG, JPG, WebP up to 5MB. Must be sharp and readable by phone cameras.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                    Payment Instructions for Participants
                  </label>
                  <textarea
                    rows={2}
                    value={paymentInstructions}
                    onChange={(e) => setPaymentInstructions(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Dynamic Registration Questions Builder */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm">
            <FormQuestionBuilder questions={questions} onChange={setQuestions} />
          </div>

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-brand-border">
            <Link
              href="/admin/events"
              className="text-xs font-semibold text-brand-muted hover:text-brand-dark"
            >
              Cancel and Return
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-red text-white text-xs font-extrabold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Publishing Event..." : "Create & Save Event"}</span>
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-border py-4 text-center text-xs text-brand-muted">
        COMMUNITY.VA Administration Console • Events & Payments Verification Desk • Hyderabad
      </footer>
    </div>
  );
}
