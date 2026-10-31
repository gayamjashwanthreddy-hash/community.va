"use client";

import { useState } from "react";
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  HelpCircle,
  CheckCircle2, 
  ListOrdered,
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  List,
  CheckSquare,
  CircleDot,
  Calendar,
  UploadCloud,
  X
} from "lucide-react";
import { EventFormQuestion, QuestionType } from "@/lib/events/types";

interface Props {
  questions: EventFormQuestion[];
  onChange: (questions: EventFormQuestion[]) => void;
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: any; hasOptions?: boolean }[] = [
  { type: "short_text", label: "Short Text", icon: Type },
  { type: "long_text", label: "Long Text / Paragraph", icon: AlignLeft },
  { type: "email", label: "Email Address", icon: Mail },
  { type: "phone", label: "Phone Number", icon: Phone },
  { type: "number", label: "Number", icon: Hash },
  { type: "dropdown", label: "Single-Choice Dropdown", icon: List, hasOptions: true },
  { type: "checkboxes", label: "Multiple-Choice Checkboxes", icon: CheckSquare, hasOptions: true },
  { type: "radio", label: "Radio Buttons", icon: CircleDot, hasOptions: true },
  { type: "date", label: "Date", icon: Calendar },
  { type: "file_upload", label: "File Upload", icon: UploadCloud },
];

export default function FormQuestionBuilder({ questions, onChange }: Props) {
  const [activePreview, setActivePreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addQuestion = (type: QuestionType = "short_text") => {
    const newQ: EventFormQuestion = {
      id: `q-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      label: "",
      question_type: type,
      is_required: true,
      placeholder: "",
      description: "",
      options: ["dropdown", "checkboxes", "radio"].includes(type) ? ["Option 1", "Option 2"] : undefined,
      display_order: questions.length + 1,
    };
    onChange([...questions, newQ]);
    setEditingId(newQ.id);
  };

  const updateQuestion = (id: string, updates: Partial<EventFormQuestion>) => {
    onChange(questions.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const deleteQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const moveQuestion = (idx: number, direction: "UP" | "DOWN") => {
    const targetIdx = direction === "UP" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const copy = [...questions];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  const addOption = (questionId: string) => {
    const q = questions.find(item => item.id === questionId);
    if (!q) return;
    const currentOptions = q.options || [];
    updateQuestion(questionId, {
      options: [...currentOptions, `Option ${currentOptions.length + 1}`]
    });
  };

  const updateOption = (questionId: string, optIdx: number, val: string) => {
    const q = questions.find(item => item.id === questionId);
    if (!q || !q.options) return;
    const updated = [...q.options];
    updated[optIdx] = val;
    updateQuestion(questionId, { options: updated });
  };

  const removeOption = (questionId: string, optIdx: number) => {
    const q = questions.find(item => item.id === questionId);
    if (!q || !q.options) return;
    updateQuestion(questionId, {
      options: q.options.filter((_, i) => i !== optIdx)
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-brand-blue" />
            Dynamic Registration Form Questions
          </h3>
          <p className="text-xs text-brand-muted mt-1">
            Build custom questions for participants. Changes preserve historical submissions and answers.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {questions.length > 0 && (
            <button
              type="button"
              onClick={() => setActivePreview(!activePreview)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-brand-border hover:bg-neutral-100 transition-colors text-brand-dark"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{activePreview ? "Hide Preview" : "Live Form Preview"}</span>
            </button>
          )}

          <div className="relative group">
            <button
              type="button"
              onClick={() => addQuestion("short_text")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md bg-brand-dark text-white hover:bg-black transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Drawer / Accordion */}
      {activePreview && (
        <div className="p-6 rounded-xl border border-brand-blue/30 bg-blue-50/20 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              Participant Form Preview (Live Rendering)
            </span>
            <button
              type="button"
              onClick={() => setActivePreview(false)}
              className="text-brand-muted hover:text-brand-dark"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-5 bg-white p-6 rounded-lg border border-brand-border shadow-inner">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark">
                  {idx + 1}. {q.label || "Untitled Question"}
                  {q.is_required ? (
                    <span className="text-brand-red ml-1 font-mono">* (Required)</span>
                  ) : (
                    <span className="text-brand-muted text-[10px] ml-1 font-normal font-sans">(Optional)</span>
                  )}
                </label>
                {q.description && (
                  <p className="text-[11px] text-brand-muted">{q.description}</p>
                )}

                {/* Render Mock Preview Inputs */}
                {q.question_type === "short_text" && (
                  <input
                    type="text"
                    disabled
                    placeholder={q.placeholder || "Your answer..."}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded bg-neutral-50 text-neutral-400 cursor-not-allowed"
                  />
                )}
                {q.question_type === "long_text" && (
                  <textarea
                    rows={3}
                    disabled
                    placeholder={q.placeholder || "Enter detailed response..."}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded bg-neutral-50 text-neutral-400 cursor-not-allowed"
                  />
                )}
                {q.question_type === "email" && (
                  <input
                    type="email"
                    disabled
                    placeholder={q.placeholder || "user@example.com"}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded bg-neutral-50 text-neutral-400 cursor-not-allowed"
                  />
                )}
                {q.question_type === "phone" && (
                  <input
                    type="tel"
                    disabled
                    placeholder={q.placeholder || "+91 98490 00000"}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded bg-neutral-50 text-neutral-400 cursor-not-allowed"
                  />
                )}
                {q.question_type === "number" && (
                  <input
                    type="number"
                    disabled
                    placeholder={q.placeholder || "0"}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded bg-neutral-50 text-neutral-400 cursor-not-allowed"
                  />
                )}
                {q.question_type === "dropdown" && (
                  <select
                    disabled
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded bg-neutral-50 text-neutral-400 cursor-not-allowed"
                  >
                    <option>Select an option...</option>
                    {q.options?.map((opt, i) => (
                      <option key={i}>{opt}</option>
                    ))}
                  </select>
                )}
                {q.question_type === "checkboxes" && (
                  <div className="space-y-1.5 pt-1">
                    {q.options?.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 text-xs text-neutral-500">
                        <input type="checkbox" disabled className="rounded border-brand-border" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.question_type === "radio" && (
                  <div className="space-y-1.5 pt-1">
                    {q.options?.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 text-xs text-neutral-500">
                        <input type="radio" disabled name={q.id} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.question_type === "date" && (
                  <input
                    type="date"
                    disabled
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded bg-neutral-50 text-neutral-400 cursor-not-allowed"
                  />
                )}
                {q.question_type === "file_upload" && (
                  <div className="border border-dashed border-neutral-300 rounded p-4 text-center bg-neutral-50 text-neutral-400 text-xs">
                    <UploadCloud className="w-5 h-5 mx-auto mb-1 text-neutral-400" />
                    <span>Upload file (Max 5MB)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {questions.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-brand-border bg-neutral-50">
          <HelpCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-brand-dark">No custom questions configured yet</p>
          <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
            By default, participants provide Full Name, Email, and Phone. Add custom questions for branch, year, college, skills, or team preferences.
          </p>
          <button
            type="button"
            onClick={() => addQuestion("short_text")}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md bg-brand-blue text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isEditing = editingId === q.id || !q.label;
            const currentTypeObj = QUESTION_TYPES.find(t => t.type === q.question_type) || QUESTION_TYPES[0];
            const Icon = currentTypeObj.icon;

            return (
              <div
                key={q.id}
                className={`rounded-xl border transition-all ${
                  isEditing
                    ? "border-brand-dark shadow-md bg-white p-5"
                    : "border-brand-border bg-white hover:border-neutral-400 p-4"
                }`}
              >
                {/* Header row of Question Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-brand-dark text-xs font-mono font-bold">
                      {idx + 1}
                    </span>
                    <div className="p-1.5 rounded bg-neutral-100 text-brand-dark">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="truncate flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-dark truncate">
                          {q.label || "Untitled Question (Click to edit)"}
                        </span>
                        {q.is_required ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-700">
                            Required
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-600">
                            Optional
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-brand-muted">
                        Type: {currentTypeObj.label}
                      </span>
                    </div>
                  </div>

                  {/* Move Up / Down / Edit / Delete Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveQuestion(idx, "UP")}
                      className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === questions.length - 1}
                      onClick={() => moveQuestion(idx, "DOWN")}
                      className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : q.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded border border-brand-border hover:bg-neutral-100 text-brand-dark"
                    >
                      {isEditing ? "Close" : "Edit"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteQuestion(q.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Question Configuration Form */}
                {isEditing && (
                  <div className="mt-5 pt-4 border-t border-brand-border space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                          Question Label / Title *
                        </label>
                        <input
                          type="text"
                          value={q.label}
                          onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                          placeholder="e.g. What is your college or university name?"
                          className="w-full px-3 py-2 text-xs border border-brand-border rounded focus:border-brand-dark focus:ring-1 focus:ring-brand-dark outline-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                          Question Type
                        </label>
                        <select
                          value={q.question_type}
                          onChange={(e) => {
                            const newType = e.target.value as QuestionType;
                            const hasOpts = ["dropdown", "checkboxes", "radio"].includes(newType);
                            updateQuestion(q.id, {
                              question_type: newType,
                              options: hasOpts ? (q.options?.length ? q.options : ["Option 1", "Option 2"]) : undefined
                            });
                          }}
                          className="w-full px-3 py-2 text-xs border border-brand-border rounded focus:border-brand-dark focus:ring-1 focus:ring-brand-dark outline-none bg-white font-medium"
                        >
                          {QUESTION_TYPES.map(t => (
                            <option key={t.type} value={t.type}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                          Help Text / Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={q.description || ""}
                          onChange={(e) => updateQuestion(q.id, { description: e.target.value })}
                          placeholder="Short instructions shown under question"
                          className="w-full px-3 py-2 text-xs border border-brand-border rounded focus:border-brand-dark focus:ring-1 focus:ring-brand-dark outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                          Placeholder (Optional)
                        </label>
                        <input
                          type="text"
                          value={q.placeholder || ""}
                          onChange={(e) => updateQuestion(q.id, { placeholder: e.target.value })}
                          placeholder="e.g. Enter name or ID"
                          className="w-full px-3 py-2 text-xs border border-brand-border rounded focus:border-brand-dark focus:ring-1 focus:ring-brand-dark outline-none"
                        />
                      </div>
                    </div>

                    {/* Required / Optional Toggle */}
                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.is_required}
                          onChange={(e) => updateQuestion(q.id, { is_required: e.target.checked })}
                          className="rounded border-brand-border text-brand-blue focus:ring-brand-blue w-4 h-4"
                        />
                        <span className="text-xs font-bold text-brand-dark">
                          Mandatory Question (Required to complete registration)
                        </span>
                      </label>
                    </div>

                    {/* Choice Options Editor (for dropdown, checkboxes, radio) */}
                    {["dropdown", "checkboxes", "radio"].includes(q.question_type) && (
                      <div className="p-3.5 rounded-lg bg-neutral-50 border border-brand-border space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark">
                            Answer Choices
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(q.id)}
                            className="text-xs text-brand-blue font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Option
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(q.options || []).map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="text-xs font-mono text-neutral-400 w-4 text-right">
                                {optIdx + 1}.
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                className="flex-1 px-2.5 py-1.5 text-xs border border-brand-border rounded bg-white outline-none focus:border-brand-dark"
                              />
                              {(q.options?.length || 0) > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(q.id, optIdx)}
                                  className="text-neutral-400 hover:text-red-600 p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
