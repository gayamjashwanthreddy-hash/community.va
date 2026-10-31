"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { 
  Calendar, 
  ArrowLeft, 
  Save, 
  UploadCloud, 
  CheckCircle2, 
  QrCode, 
  CreditCard, 
  Trash2,
  RefreshCw,
  AlertCircle,
  Users
} from "lucide-react";
import FormQuestionBuilder from "@/components/admin/FormQuestionBuilder";
import { EventFormQuestion, EventItem, EventStatus } from "@/lib/events/types";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
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

  const [regStartDate, setRegStartDate] = useState("");
  const [regEndDate, setRegEndDate] = useState("");
  const [capacity, setCapacity] = useState(100);

  const [organizer, setOrganizer] = useState("COMMUNITY.VA");
  const [contactEmail, setContactEmail] = useState("community.va@gmail.com");
  const [instructions, setInstructions] = useState("");
  const [status, setStatus] = useState<EventStatus>("DRAFT");

  // Payment Details
  const [isPaid, setIsPaid] = useState(false);
  const [feeAmount, setFeeAmount] = useState(199);
  const [feeCurrency] = useState("INR");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [paymentUpiId, setPaymentUpiId] = useState("");
  const [paymentPayeeName, setPaymentPayeeName] = useState("");
  const [paymentQrPath, setPaymentQrPath] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);
  const [paymentVerificationRequired, setPaymentVerificationRequired] = useState(true);

  // Dynamic Questions
  const [questions, setQuestions] = useState<EventFormQuestion[]>([]);

  // Fetch Event Data
  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        if (data.success && data.event) {
          const e: EventItem = data.event;
          setTitle(e.title || "");
          setCategory(e.category || "Technology & Innovation");
          setDescription(e.description || "");
          setVenue(e.venue || "");
          setCoverImagePath(e.cover_image_path || "");
          setCapacity(e.capacity || 100);
          setOrganizer(e.organizer || "COMMUNITY.VA");
          setContactEmail(e.contact_email || "community.va@gmail.com");
          setInstructions(e.instructions || "");
          setStatus(e.status || "DRAFT");

          // Dates parsing
          if (e.event_start) {
            const startD = new Date(e.event_start);
            setEventStartDate(startD.toISOString().split("T")[0]);
            setEventStartTime(startD.toISOString().substring(11, 16));
          }
          if (e.event_end) {
            const endD = new Date(e.event_end);
            setEventEndDate(endD.toISOString().split("T")[0]);
            setEventEndTime(endD.toISOString().substring(11, 16));
          }
          if (e.registration_start) {
            setRegStartDate(new Date(e.registration_start).toISOString().split("T")[0]);
          }
          if (e.registration_end) {
            setRegEndDate(new Date(e.registration_end).toISOString().split("T")[0]);
          }

          // Payment
          setIsPaid(Boolean(e.is_paid));
          setFeeAmount(e.fee_amount || 0);
          setPaymentInstructions(e.payment_instructions || "");
          setPaymentUpiId(e.payment_upi_id || "");
          setPaymentPayeeName(e.payment_payee_name || "");
          setPaymentQrPath(e.payment_qr_path || "");
          setPaymentVerificationRequired(Boolean(e.payment_verification_required));

          // Questions
          setQuestions(e.questions || []);
        } else {
          setErrorMsg("Could not find event.");
        }
      } catch (err) {
        console.error("Error loading event", err);
        setErrorMsg("Failed to load event.");
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !venue.trim() || !eventStartDate) {
      setErrorMsg("Title, venue, and start date are required.");
      return;
    }

    if (isPaid && !paymentQrPath) {
      setErrorMsg("Please upload the official payment QR code for paid events.");
      return;
    }

    setSubmitting(true);

    const eventStart = `${eventStartDate}T${eventStartTime || "09:00"}:00Z`;
    const eventEnd = `${eventEndDate || eventStartDate}T${eventEndTime || "18:00"}:00Z`;
    const registrationStart = `${regStartDate || eventStartDate}T00:00:00Z`;
    const registrationEnd = `${regEndDate || eventStartDate}T23:59:59Z`;

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
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
        setErrorMsg(data.message || "Failed to update event.");
      }
    } catch (err: any) {
      console.error("Update event error", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-blue mb-2" />
          <p className="text-xs font-mono uppercase text-brand-muted">Loading event details...</p>
        </div>
      </div>
    );
  }

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
            <span className="text-xs font-bold font-mono uppercase text-brand-blue truncate max-w-xs">
              Edit: {title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/events/${eventId}/registrations`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border-dark text-neutral-300 text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-brand-blue" />
              <span>View Registrations</span>
            </Link>

            <button
              onClick={handleSave}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <form onSubmit={handleSave} className="space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Core Details */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-6">
            <div className="border-b border-brand-border pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-brand-dark flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-blue" />
                  <span>01. Event Details & Scheduling</span>
                </h2>
                <p className="text-xs text-brand-muted mt-1">
                  Manage title, description, venue, and lifecycle status.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-brand-muted block">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className="mt-0.5 text-xs font-mono font-bold px-2.5 py-1.5 border border-brand-border rounded bg-white outline-none focus:border-brand-dark"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
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
                className="w-full px-3.5 py-2.5 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark leading-relaxed"
              />
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark">
                Event Cover Image
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
                    <span className="text-[11px] text-neutral-400">No cover image</span>
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    id="cover-upload-edit"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "COVER");
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="cover-upload-edit"
                      className="px-3 py-2 text-xs font-bold rounded-md border border-brand-border bg-white hover:bg-neutral-50 text-brand-dark cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{uploadingCover ? "Uploading..." : "Replace Cover Image"}</span>
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
                    placeholder="Image URL"
                    className="w-full px-3 py-1.5 text-xs border border-brand-border rounded outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dates & Schedule */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  Organizer Unit
                </label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-brand-border rounded outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                Instructions / What to Bring
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
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
                Configure event pricing and the exact UPI QR code to display.
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
                  Free Event
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
                  Paid Event (Manual UPI Verification)
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
                        id="qr-upload-edit"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "QR");
                        }}
                      />
                      <label
                        htmlFor="qr-upload-edit"
                        className="px-4 py-2 text-xs font-bold rounded-md bg-brand-dark text-white hover:bg-black cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{uploadingQr ? "Uploading QR..." : "Replace UPI QR Code"}</span>
                      </label>
                      <p className="text-[11px] text-neutral-500">
                        Upload official UPI QR code graphic. Participants scan this exact image.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                    Payment Instructions
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-blue text-white text-xs font-extrabold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Saving Updates..." : "Save Event Updates"}</span>
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
