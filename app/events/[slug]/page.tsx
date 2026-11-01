"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  UploadCloud, 
  QrCode, 
  Copy, 
  Check, 
  AlertCircle, 
  CreditCard, 
  Sparkles,
  Ticket,
  FileCheck,
  Info,
  X,
  Share2
} from "lucide-react";
import CinematicNavbar from "@/components/motion/CinematicNavbar";
import { EventItem, EventFormQuestion, EventRegistration } from "@/lib/events/types";
import QRCode from "qrcode";

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [participantPhone, setParticipantPhone] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Payment Proof Fields
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProofPath, setPaymentProofPath] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState<EventRegistration | null>(null);
  const [alreadyRegisteredNotice, setAlreadyRegisteredNotice] = useState<EventRegistration | null>(null);
  const [passQrDataUrl, setPassQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    async function makeQr() {
      const activeReg = registeredSuccess || alreadyRegisteredNotice;
      if (!activeReg || !activeReg.qr_token) {
        setPassQrDataUrl(null);
        return;
      }

      // Check payment status if paid event
      const pay = activeReg.payment;
      const isEligible = !event?.is_paid || pay?.payment_status === "PAYMENT_VERIFIED";

      if (isEligible) {
        try {
          const url = await QRCode.toDataURL(activeReg.qr_token, {
            width: 240,
            margin: 2,
            color: { dark: "#111111", light: "#FFFFFF" }
          });
          setPassQrDataUrl(url);
        } catch (e) {
          console.error("[QR Render Error]", e);
        }
      } else {
        setPassQrDataUrl(null);
      }
    }

    makeQr();
  }, [registeredSuccess, alreadyRegisteredNotice, event]);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${slug}`);
        const data = await res.json();
        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          setErrorMsg("Event could not be found or has ended.");
        }
      } catch (err) {
        console.error("Error loading event", err);
        setErrorMsg("Failed to load event.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadEvent();
    }
  }, [slug]);

  const handleCopyUpi = () => {
    if (!event?.payment_upi_id) return;
    navigator.clipboard.writeText(event.payment_upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleAnswerChange = (questionId: string, val: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: val,
    }));
  };

  const handleCheckboxToggle = (questionId: string, option: string) => {
    const current = (answers[questionId] as string[]) || [];
    if (current.includes(option)) {
      handleAnswerChange(questionId, current.filter(item => item !== option));
    } else {
      handleAnswerChange(questionId, [...current, option]);
    }
  };

  // Upload Payment Proof Screenshot
  const handleProofUpload = async (file: File) => {
    setUploadingProof(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "payment-proof");

      const res = await fetch("/api/events/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.filePath) {
        setPaymentProofPath(data.filePath);
      } else {
        setErrorMsg(data.message || "Failed to upload payment proof screenshot.");
      }
    } catch (err) {
      console.error("Upload error", err);
      setErrorMsg("Error uploading payment proof screenshot.");
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setErrorMsg(null);

    // Validate Contact Info
    if (!participantName.trim() || !participantEmail.trim() || !participantPhone.trim()) {
      setErrorMsg("Please provide your full name, email address, and phone number.");
      return;
    }

    // Validate Required Questions
    if (event.questions && event.questions.length > 0) {
      for (const q of event.questions) {
        if (q.is_required) {
          const val = answers[q.id];
          if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
            setErrorMsg(`Please answer mandatory question: "${q.label}"`);
            return;
          }
        }
      }
    }

    // Validate Payment Proof for Paid Event
    if (event.is_paid && !paymentProofPath) {
      setErrorMsg("Please upload your completed payment screenshot before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName,
          participantEmail,
          participantPhone,
          answers,
          paymentProofPath: event.is_paid ? paymentProofPath : null,
          paymentReference: event.is_paid ? paymentReference : null,
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.alreadyRegistered) {
        setAlreadyRegisteredNotice(data.registration);
      } else if (data.success && data.registration) {
        setRegisteredSuccess(data.registration);
      } else {
        setErrorMsg(data.message || "Registration could not be completed.");
      }
    } catch (err: any) {
      console.error("Registration error", err);
      setErrorMsg("An unexpected network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono uppercase tracking-wider text-brand-muted">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
        <CinematicNavbar />
        <div className="max-w-md mx-auto text-center py-40 px-4">
          <AlertCircle className="w-12 h-12 text-brand-red mx-auto mb-3" />
          <h2 className="text-xl font-extrabold text-brand-dark">Event Not Found</h2>
          <p className="text-xs text-brand-muted mt-2">
            The requested event may be draft, closed, or no longer accessible.
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-black"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Events</span>
          </Link>
        </div>
      </div>
    );
  }

  const isRegistrationClosed = event.status !== "PUBLISHED" || new Date(event.registration_end) < new Date();
  const startDate = new Date(event.event_start);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark flex flex-col justify-between selection:bg-brand-blue selection:text-white">
      <CinematicNavbar />

      {/* Main Content Area */}
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex-1">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-muted hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Events</span>
          </Link>
        </div>

        {/* Success Screen Card */}
        {registeredSuccess ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-brand-border p-8 sm:p-12 shadow-2xl text-center space-y-6 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-emerald-50 text-emerald-800">
                Registration Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase tracking-tight mt-3">
                You are registered for {event.title}!
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted mt-2 leading-relaxed max-w-md mx-auto">
                A confirmation email has been dispatched to <strong>{registeredSuccess.participant_email}</strong>.
              </p>
            </div>

            {/* Registration Pass Box */}
            <div className="p-6 rounded-2xl bg-neutral-50 border border-brand-border text-left space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
                <span className="text-[11px] text-brand-muted uppercase font-bold">Registration Pass ID</span>
                <span className="text-sm font-extrabold text-brand-blue">{registeredSuccess.registration_number}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">Participant</span>
                <span className="font-bold text-brand-dark">{registeredSuccess.participant_name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">Schedule</span>
                <span className="font-bold text-brand-dark">
                  {startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} • {startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">Venue</span>
                <span className="font-bold text-brand-dark truncate max-w-xs">{event.venue}</span>
              </div>
              {event.is_paid && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-brand-border">
                  <span className="text-brand-muted">Payment Proof</span>
                  <span className="font-bold text-amber-600">Pending Manual Verification</span>
                </div>
              )}
            </div>

            {/* QR Pass Display or Payment Notice */}
            {passQrDataUrl ? (
              <div className="p-6 rounded-2xl bg-white border-2 border-dashed border-brand-blue text-center">
                <span className="text-[11px] font-mono font-bold uppercase text-brand-blue tracking-wider block mb-2">
                  Official Entry QR Pass (Active)
                </span>
                <img
                  src={passQrDataUrl}
                  alt="Entry QR Pass"
                  className="w-48 h-48 mx-auto rounded-xl border border-brand-border shadow-xs"
                />
                <p className="text-[11px] font-mono text-brand-muted mt-2">
                  Present this QR code to the entrance desk scanner for instant check-in.
                </p>
              </div>
            ) : event.is_paid ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 leading-relaxed">
                <strong>Next Step:</strong> Your uploaded payment screenshot is being reviewed by our administrative team. Once verified against our bank UPI ledger, your entry QR pass will be activated and emailed to you.
              </div>
            ) : null}

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-brand-border text-brand-dark text-xs font-bold uppercase tracking-wider hover:bg-neutral-50"
              >
                Print / Save Pass
              </button>
              <Link
                href="/events"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-brand-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-black"
              >
                Explore Other Events
              </Link>
            </div>
          </div>
        ) : alreadyRegisteredNotice ? (
          /* Already Registered Notice */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-brand-border p-8 sm:p-12 shadow-xl text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-blue-50 text-brand-blue">
                Already Registered
              </span>
              <h2 className="text-2xl font-extrabold text-brand-dark uppercase tracking-tight mt-3">
                You Already Have A Pass!
              </h2>
              <p className="text-xs text-brand-muted mt-2 max-w-md mx-auto">
                An active registration already exists for <strong>{alreadyRegisteredNotice.participant_email}</strong>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-brand-border text-left space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-brand-border pb-2">
                <span className="text-brand-muted uppercase font-bold">Registration ID</span>
                <span className="font-extrabold text-brand-blue text-sm">{alreadyRegisteredNotice.registration_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Registered Name</span>
                <span className="font-bold text-brand-dark">{alreadyRegisteredNotice.participant_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Payment Status</span>
                <span className="font-bold text-brand-dark">
                  {alreadyRegisteredNotice.payment?.payment_status || (event.is_paid ? "PENDING" : "CONFIRMED")}
                </span>
              </div>
            </div>

            {/* QR Pass if eligible */}
            {passQrDataUrl ? (
              <div className="p-6 rounded-2xl bg-white border-2 border-dashed border-brand-blue text-center">
                <span className="text-[11px] font-mono font-bold uppercase text-brand-blue tracking-wider block mb-2">
                  Official Entry QR Pass (Active)
                </span>
                <img
                  src={passQrDataUrl}
                  alt="Entry QR Pass"
                  className="w-48 h-48 mx-auto rounded-xl border border-brand-border shadow-xs"
                />
                <p className="text-[11px] font-mono text-brand-muted mt-2">
                  Present this QR code to the entrance desk scanner for instant check-in.
                </p>
              </div>
            ) : event.is_paid ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 leading-relaxed font-mono">
                <strong>Payment Verification Status:</strong> Your payment proof is under review. Your entry QR pass will activate automatically once verified by an administrator.
              </div>
            ) : null}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {passQrDataUrl && (
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-brand-border text-brand-dark text-xs font-bold uppercase tracking-wider hover:bg-neutral-50"
                >
                  Print / Save Pass
                </button>
              )}
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-black"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Events Listing</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Normal Event Detail & Registration Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Event Overview & Schedule (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Cover Card */}
              <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm">
                <div className="relative h-64 w-full bg-neutral-100">
                  {event.cover_image_path ? (
                    <Image
                      src={event.cover_image_path}
                      alt={event.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white font-mono text-sm font-bold uppercase tracking-widest">
                      COMMUNITY.VA
                    </div>
                  )}

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-white">
                      {event.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 right-4">
                    {event.is_paid ? (
                      <span className="px-3 py-1 rounded-full text-sm font-mono font-extrabold bg-brand-red text-white shadow-md">
                        ₹{event.fee_amount}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-mono font-extrabold bg-emerald-600 text-white shadow-md">
                        FREE ENTRY
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight leading-tight">
                    {event.title}
                  </h1>

                  <div className="space-y-3 pt-2 border-t border-brand-border text-xs text-brand-dark font-medium">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">
                          {startDate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="text-brand-muted text-[11px] font-mono">
                          {startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} onwards
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">{event.venue}</div>
                        <div className="text-brand-muted text-[11px]">Hyderabad, Telangana</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Ticket className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Participant Capacity: {event.capacity} Seats</div>
                        <div className="text-brand-muted text-[11px]">Organized by {event.organizer}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-border">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">
                      About This Experience
                    </h3>
                    <p className="text-xs text-brand-muted leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>

                  {event.instructions && (
                    <div className="p-4 rounded-xl bg-neutral-50 border border-brand-border text-xs space-y-1">
                      <span className="font-bold text-brand-dark uppercase tracking-wider text-[10px] block">
                        What to Bring & Instructions
                      </span>
                      <p className="text-brand-muted leading-relaxed">{event.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Registration Form & Payment Proof (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-sm">
                {isRegistrationClosed ? (
                  <div className="py-12 text-center space-y-3">
                    <Clock className="w-10 h-10 text-neutral-400 mx-auto" />
                    <h3 className="text-lg font-bold text-brand-dark">Registration is Closed</h3>
                    <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
                      Registration for this event cycle has closed or reached maximum capacity. Follow our community channels for subsequent event editions.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitRegistration} className="space-y-8">
                    <div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-brand-dark text-white">
                        Official Entry Form
                      </span>
                      <h2 className="text-2xl font-extrabold text-brand-dark uppercase tracking-tight mt-2">
                        Event Registration
                      </h2>
                      <p className="text-xs text-brand-muted mt-1">
                        Complete all mandatory fields. For paid passes, follow the manual UPI QR instructions below.
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Step 1: Participant Identity */}
                    <div className="space-y-4 pt-2 border-t border-brand-border">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
                        <span>1. Your Information</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                            Full Name <span className="text-brand-red">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={participantName}
                            onChange={(e) => setParticipantName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                            Email Address <span className="text-brand-red">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={participantEmail}
                            onChange={(e) => setParticipantEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                            Mobile Number <span className="text-brand-red">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={participantPhone}
                            onChange={(e) => setParticipantPhone(e.target.value)}
                            placeholder="+91 98490 00000"
                            className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Dynamic Questions Configured by Admin */}
                    {event.questions && event.questions.length > 0 && (
                      <div className="space-y-5 pt-4 border-t border-brand-border">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                          2. Event Questionnaire
                        </h3>

                        <div className="space-y-5">
                          {event.questions.map((q, idx) => (
                            <div key={q.id} className="space-y-1.5">
                              <label className="block text-xs font-bold text-brand-dark">
                                {q.label}
                                {q.is_required ? (
                                  <span className="text-brand-red ml-1 font-mono text-[11px]">*</span>
                                ) : (
                                  <span className="text-brand-muted font-normal text-[10px] ml-1.5">(Optional)</span>
                                )}
                              </label>

                              {q.description && (
                                <p className="text-[11px] text-brand-muted">{q.description}</p>
                              )}

                              {/* Question Renderers */}
                              {q.question_type === "short_text" && (
                                <input
                                  type="text"
                                  required={q.is_required}
                                  value={answers[q.id] || ""}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  placeholder={q.placeholder || "Enter your answer"}
                                  className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark font-medium"
                                />
                              )}

                              {q.question_type === "long_text" && (
                                <textarea
                                  rows={3}
                                  required={q.is_required}
                                  value={answers[q.id] || ""}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  placeholder={q.placeholder || "Provide details..."}
                                  className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark leading-relaxed"
                                />
                              )}

                              {q.question_type === "email" && (
                                <input
                                  type="email"
                                  required={q.is_required}
                                  value={answers[q.id] || ""}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  placeholder={q.placeholder || "example@college.edu"}
                                  className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark"
                                />
                              )}

                              {q.question_type === "phone" && (
                                <input
                                  type="tel"
                                  required={q.is_required}
                                  value={answers[q.id] || ""}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  placeholder={q.placeholder || "+91 90000 00000"}
                                  className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark"
                                />
                              )}

                              {q.question_type === "number" && (
                                <input
                                  type="number"
                                  required={q.is_required}
                                  value={answers[q.id] || ""}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  placeholder={q.placeholder || "0"}
                                  className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark"
                                />
                              )}

                              {q.question_type === "dropdown" && (
                                <select
                                  required={q.is_required}
                                  value={answers[q.id] || ""}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark bg-white font-medium"
                                >
                                  <option value="">Select an option...</option>
                                  {(q.options || []).map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              )}

                              {q.question_type === "radio" && (
                                <div className="space-y-2 pt-1">
                                  {(q.options || []).map((opt, i) => (
                                    <label key={i} className="flex items-center gap-2.5 text-xs text-brand-dark cursor-pointer">
                                      <input
                                        type="radio"
                                        name={q.id}
                                        required={q.is_required}
                                        checked={answers[q.id] === opt}
                                        onChange={() => handleAnswerChange(q.id, opt)}
                                        className="w-3.5 h-3.5 text-brand-blue"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {q.question_type === "checkboxes" && (
                                <div className="space-y-2 pt-1">
                                  {(q.options || []).map((opt, i) => {
                                    const selectedList = (answers[q.id] as string[]) || [];
                                    const isChecked = selectedList.includes(opt);
                                    return (
                                      <label key={i} className="flex items-center gap-2.5 text-xs text-brand-dark cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => handleCheckboxToggle(q.id, opt)}
                                          className="w-3.5 h-3.5 rounded text-brand-blue"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}

                              {q.question_type === "date" && (
                                <input
                                  type="date"
                                  required={q.is_required}
                                  value={answers[q.id] || ""}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark"
                                />
                              )}

                              {q.question_type === "file_upload" && (
                                <div className="space-y-2">
                                  <input
                                    type="file"
                                    required={q.is_required && !answers[q.id]}
                                    id={`file-${q.id}`}
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const fd = new FormData();
                                        fd.append("file", file);
                                        fd.append("type", "public");
                                        const r = await fetch("/api/events/upload", { method: "POST", body: fd });
                                        const d = await r.json();
                                        if (d.success) handleAnswerChange(q.id, d.filePath);
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`file-${q.id}`}
                                    className="px-3.5 py-2 rounded border border-brand-border text-xs font-semibold hover:bg-neutral-50 cursor-pointer inline-flex items-center gap-1.5"
                                  >
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>{answers[q.id] ? "File Uploaded ✓ (Click to replace)" : "Choose File (Max 5MB)"}</span>
                                  </label>
                                  {answers[q.id] && (
                                    <div className="text-[11px] text-emerald-700 font-mono truncate">
                                      Attached: {answers[q.id]}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Payment Section (Only for Paid Events) */}
                    {event.is_paid && (
                      <div className="space-y-6 pt-6 border-t border-brand-border">
                        <div>
                          <div className="flex items-center gap-2 text-brand-red mb-1">
                            <CreditCard className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                              3. Payment Verification & Official QR Code
                            </h3>
                          </div>
                          <p className="text-xs text-brand-muted">
                            Complete the registration fee via your UPI application and upload the transaction screenshot proof.
                          </p>
                        </div>

                        {/* Payment Card with QR Code */}
                        <div className="p-6 rounded-2xl bg-neutral-50 border border-brand-border space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block">
                                Pass Registration Fee
                              </span>
                              <div className="text-3xl font-extrabold text-brand-dark font-mono">
                                ₹{event.fee_amount} <span className="text-xs font-sans font-medium text-brand-muted">INR</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block">
                                Verified Payee
                              </span>
                              <div className="text-xs font-bold text-brand-dark">
                                {event.payment_payee_name || "COMMUNITY.VA"}
                              </div>
                            </div>
                          </div>

                          {/* UPI ID Copy Box */}
                          {event.payment_upi_id && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-brand-border">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-brand-muted block font-mono">
                                  Official COMMUNITY.VA UPI ID
                                </span>
                                <span className="font-mono text-xs font-bold text-brand-dark">
                                  {event.payment_upi_id}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-border hover:bg-neutral-50 text-xs font-bold text-brand-dark transition-colors"
                              >
                                {copiedUpi ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy UPI ID</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* QR Code Container */}
                          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-white border border-brand-border shadow-inner">
                            <div className="w-48 h-48 rounded-xl border border-brand-border overflow-hidden relative flex-shrink-0 bg-white p-2 flex items-center justify-center">
                              {event.payment_qr_path ? (
                                <Image
                                  src={event.payment_qr_path}
                                  alt="Official Payment QR Code"
                                  fill
                                  className="object-contain p-2"
                                  priority
                                />
                              ) : (
                                <div className="text-center p-4 text-neutral-400">
                                  <QrCode className="w-8 h-8 mx-auto mb-1 opacity-50" />
                                  <span className="text-[10px]">QR Code pending</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 text-xs leading-relaxed text-brand-muted">
                              <div className="font-bold text-brand-dark uppercase tracking-wider text-[11px]">
                                How to complete payment:
                              </div>
                              <ol className="list-decimal list-inside space-y-1 font-medium">
                                <li>Open Google Pay, PhonePe, Paytm, or BHIM.</li>
                                <li>Scan the official QR code on the left.</li>
                                <li>Pay exactly <strong>₹{event.fee_amount}</strong>.</li>
                                <li>Take a screenshot of the completed payment showing the 12-digit UTR / Reference ID.</li>
                                <li>Upload the screenshot below.</li>
                              </ol>
                            </div>
                          </div>

                          {/* UTR / Reference input */}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                              UPI Transaction ID / 12-Digit UTR Number (Optional but recommended)
                            </label>
                            <input
                              type="text"
                              value={paymentReference}
                              onChange={(e) => setPaymentReference(e.target.value)}
                              placeholder="e.g. 410294819284 or PhonePe Ref ID"
                              className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none font-mono font-medium focus:border-brand-dark"
                            />
                          </div>

                          {/* Payment Proof Screenshot Upload */}
                          <div className="space-y-2 pt-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark">
                              Upload Payment Screenshot Proof <span className="text-brand-red">*</span>
                            </label>

                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              id="payment-proof-upload"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleProofUpload(file);
                              }}
                            />

                            {paymentProofPath ? (
                              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded border border-brand-border overflow-hidden relative flex-shrink-0 bg-white">
                                    <Image
                                      src={paymentProofPath}
                                      alt="Screenshot preview"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      Payment Proof Attached
                                    </span>
                                    <span className="text-[11px] text-emerald-700">Ready for administrative review</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <label
                                    htmlFor="payment-proof-upload"
                                    className="px-3 py-1.5 text-xs font-bold rounded border border-brand-border bg-white hover:bg-neutral-50 text-brand-dark cursor-pointer"
                                  >
                                    Replace
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setPaymentProofPath("")}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                    title="Remove Screenshot"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label
                                htmlFor="payment-proof-upload"
                                className="border-2 border-dashed border-brand-border hover:border-brand-dark rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white text-center"
                              >
                                <UploadCloud className="w-8 h-8 text-neutral-400 mb-2" />
                                <span className="text-xs font-bold text-brand-dark">
                                  {uploadingProof ? "Uploading Screenshot..." : "Click to Upload Payment Screenshot"}
                                </span>
                                <span className="text-[11px] text-brand-muted mt-1">
                                  Supports PNG, JPG, WebP up to 5MB
                                </span>
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Clarification Alert */}
                        <div className="p-4 rounded-xl bg-neutral-100 border border-brand-border text-xs text-brand-muted leading-relaxed">
                          <strong className="text-brand-dark block mb-0.5">Payment Verification Notice:</strong>
                          COMMUNITY.VA uses manual UPI payment verification. When you submit your proof, our organizing team verifies the UTR number against the community account before granting verified pass clearance.
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-brand-border">
                      <button
                        type="submit"
                        disabled={submitting || uploadingProof}
                        className="w-full py-3.5 px-6 rounded-xl bg-brand-red text-white font-display text-xs font-extrabold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>
                          {submitting
                            ? "Processing Registration..."
                            : event.is_paid
                              ? "Submit Registration & Payment Proof"
                              : "Confirm Event Registration"}
                        </span>
                      </button>

                      <p className="text-[11px] text-center text-brand-muted mt-3">
                        By registering, you agree to COMMUNITY.VA community conduct guidelines.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Community Footer */}
      <footer className="bg-brand-dark text-white border-t border-brand-border-dark py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-8 w-28">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Logo"
                fill
                className="object-contain invert"
              />
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Connecting People • Creating Opportunities — Hyderabad
            </span>
          </div>

          <div className="text-xs font-mono text-neutral-500">
            Desk: <a href="mailto:community.va@gmail.com" className="text-white hover:underline">community.va@gmail.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
