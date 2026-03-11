'use client';

import { useState, useRef, useEffect } from 'react';

type Step =
  | 'greeting'
  | 'material'
  | 'setting'
  | 'photo'
  | 'timeline'
  | 'zip'
  | 'name'
  | 'phone'
  | 'submitting'
  | 'done';

interface ChatMessage {
  role: 'bot' | 'user';
  text?: string;
  image?: string;
}

interface LeadData {
  type: string;
  material: string;
  setting: string;
  timeline: string;
  zip: string;
  name: string;
  phone: string;
  scope: string;
  photos: string[];
}

const JOB_TYPES = ['Repair', 'New Build', 'Custom Fabrication', 'Not Sure'];
const MATERIALS = ['Steel', 'Aluminum', 'Stainless Steel', 'Wrought Iron', 'Not Sure'];
const SETTINGS = ['Residential', 'Commercial', 'Industrial'];
const TIMELINES = ['ASAP', 'This week', 'Within 2 weeks', 'No rush'];

export default function ChatWidget() {
  const [step, setStep] = useState<Step>('greeting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({
    type: '', material: '', setting: '', timeline: '',
    zip: '', name: '', phone: '', scope: '', photos: [],
  });
  const [leadResult, setLeadResult] = useState<{ tier?: string; score?: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages or typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus text input when entering a text-input step
  useEffect(() => {
    if (['zip', 'name', 'phone'].includes(step)) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [step]);

  // Initial greeting on mount
  useEffect(() => {
    addBotMessage(
      "Hey there! Welcome to Southern Steel — San Antonio's go-to for welding and metal fabrication. What kind of project can we help you with?",
      700
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addBotMessage(text: string, delay = 500) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text }]);
    }, delay);
  }

  function addUserMessage(text?: string, image?: string) {
    setMessages(prev => [...prev, { role: 'user', text, image }]);
  }

  // --- Option button clicks ---
  function handleOption(value: string) {
    addUserMessage(value);

    switch (step) {
      case 'greeting': {
        setLeadData(d => ({ ...d, type: value }));
        setStep('material');
        const responses: Record<string, string> = {
          'Repair': "Repair work — we handle that all the time. What kind of metal are we dealing with?",
          'New Build': "New build, nice! What material are you thinking for this one?",
          'Custom Fabrication': "Custom fab is our bread and butter. What material do you want to work with?",
          'Not Sure': "No problem at all — we'll figure it out together. Do you know what kind of metal is involved?",
        };
        addBotMessage(responses[value] || "Sounds good! What material are we working with?");
        break;
      }
      case 'material':
        setLeadData(d => ({ ...d, material: value }));
        setStep('setting');
        addBotMessage("Good deal. Is this for a home, a business, or an industrial site?");
        break;
      case 'setting':
        setLeadData(d => ({ ...d, setting: value }));
        setStep('photo');
        addBotMessage(
          "If you've got any photos of the job site or what you need done, drop them in — it really helps us dial in the estimate. You can also just describe the work, or hit Skip if you'd rather move on."
        );
        break;
      case 'timeline': {
        setLeadData(d => ({ ...d, timeline: value }));
        setStep('zip');
        addBotMessage("What zip code is the job at? Just want to make sure we cover your area.");
        break;
      }
    }
  }

  // --- Photo step actions ---
  function handleSkipPhoto() {
    addUserMessage("Skip — no photos right now");
    setStep('timeline');
    addBotMessage("No worries at all. What's your timeline looking like?");
  }

  function handleContinueFromPhoto() {
    addUserMessage("That's all the photos");
    setStep('timeline');
    addBotMessage("Great, that gives us a solid picture. What's your timeline?");
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;

      // Store photo and show it in chat
      setLeadData(d => ({ ...d, photos: [...d.photos, dataUrl] }));
      addUserMessage(undefined, dataUrl);

      // Analyze with Claude Vision
      setIsTyping(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: dataUrl }),
        });
        const data = await res.json();
        const analysis = data.reply || "Got the photo — thanks!";

        // Append analysis to scope
        setLeadData(d => ({
          ...d,
          scope: d.scope ? `${d.scope} | ${analysis}` : analysis,
        }));
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          { role: 'bot', text: `${analysis}\n\nWant to add another photo, or ready to move on?` },
        ]);
      } catch {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          { role: 'bot', text: "Got the photo, thanks! Want to add another one, or shall we keep going?" },
        ]);
      }
    };
    reader.readAsDataURL(file);

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // --- Text input submission ---
  async function handleSubmit() {
    if (!input.trim()) return;
    const val = input.trim();
    setInput('');
    addUserMessage(val);

    switch (step) {
      case 'photo':
        // User typed a description instead of uploading
        setLeadData(d => ({ ...d, scope: d.scope ? `${d.scope} | ${val}` : val }));
        setStep('timeline');
        addBotMessage("Thanks for the details. What's your timeline looking like?");
        break;

      case 'zip':
        setLeadData(d => ({ ...d, zip: val }));
        setStep('name');
        addBotMessage("Almost done — what's your name?");
        break;

      case 'name':
        setLeadData(d => ({ ...d, name: val }));
        setStep('phone');
        addBotMessage(`Good to meet you, ${val}! Last thing — what's the best number to reach you at?`);
        break;

      case 'phone':
        await submitLead(val);
        break;
    }
  }

  // --- Submit lead to API ---
  async function submitLead(phone: string) {
    const finalName = leadData.name;
    const finalData = {
      ...leadData,
      phone,
      source: 'chatbot',
      // Don't send massive base64 strings to the DB — the scope has the AI analysis
      photos: leadData.photos.length > 0
        ? leadData.photos.map((_, i) => `chatbot_upload_${i + 1}`)
        : [],
    };

    setLeadData(d => ({ ...d, phone }));
    setStep('submitting');
    setIsTyping(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
      const lead = await res.json();
      setIsTyping(false);
      setStep('done');
      setLeadResult({ tier: lead.tier, score: lead.score });

      const tierMsg: Record<string, string> = {
        URGENT: "This looks like a priority job — we'll have someone reach out to you right away.",
        WARM: "We'll get back to you real soon, expect a call within the day.",
        LOW: "We'll review everything and be in touch within a couple of days.",
      };
      const followUp = tierMsg[lead.tier] || tierMsg['WARM'];

      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: `All set, ${finalName}! Your request has been submitted and our team is on it. ${followUp}\n\nThanks for choosing Southern Steel — we appreciate your business.`,
        },
      ]);
    } catch {
      setIsTyping(false);
      setStep('done');
      setLeadResult({ tier: 'WARM' });
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: `Thanks, ${finalName}! We've got your info. Someone from our team will give you a call soon. Appreciate you reaching out to Southern Steel!`,
        },
      ]);
    }
  }

  // --- Determine which UI elements to show ---
  const optionSets: Partial<Record<Step, string[]>> = {
    greeting: JOB_TYPES,
    material: MATERIALS,
    setting: SETTINGS,
    timeline: TIMELINES,
  };
  const currentOptions = optionSets[step] || null;
  const isTextStep = ['zip', 'name', 'phone', 'photo'].includes(step);
  const isPhotoStep = step === 'photo';
  const hasPhotos = leadData.photos.length > 0;
  const isActive = step !== 'done' && step !== 'submitting';

  return (
    <div className="h-dvh bg-bg flex flex-col">
      {/* ── Header ── */}
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rust to-ember flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-base leading-tight">
            <span className="text-text">Southern</span>{' '}
            <span className="text-rust">Steel</span>
          </h1>
          <p className="text-[11px] font-mono text-green-forge flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-forge inline-block animate-pulse" />
            Online now
          </p>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {/* Bot avatar */}
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-surface2 border border-border flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-rust text-[10px] font-bold font-mono">SS</span>
              </div>
            )}

            <div className={`max-w-[80%] space-y-1`}>
              {/* Inline image */}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Uploaded photo"
                  className={`rounded-xl max-h-52 border border-border ${msg.role === 'user' ? 'ml-auto' : ''}`}
                />
              )}
              {/* Text bubble */}
              {msg.text && (
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-rust text-white rounded-tr-md'
                      : 'bg-surface2 text-text border border-border rounded-tl-md'
                  }`}
                >
                  {msg.text}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-surface2 border border-border flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-rust text-[10px] font-bold font-mono">SS</span>
            </div>
            <div className="bg-surface2 border border-border rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-text-dim animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-text-dim animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-text-dim animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      {isActive && (
        <div className="border-t border-border p-3 flex-shrink-0 bg-surface/80 backdrop-blur-sm space-y-2.5">
          {/* Quick-reply option buttons */}
          {currentOptions && (
            <div className="flex flex-wrap gap-2">
              {currentOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleOption(opt)}
                  className="px-4 py-2 text-sm bg-surface2 border border-border rounded-full text-text-sec hover:border-rust hover:text-rust transition-all active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Photo step: action buttons (skip / upload more / continue) */}
          {isPhotoStep && !hasPhotos && (
            <div className="flex gap-2">
              <button
                onClick={handleSkipPhoto}
                className="px-4 py-2 text-sm bg-surface2 border border-border rounded-full text-text-sec hover:border-rust hover:text-rust transition-all"
              >
                Skip
              </button>
            </div>
          )}
          {isPhotoStep && hasPhotos && (
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm bg-surface2 border border-border rounded-full text-text-sec hover:border-rust hover:text-rust transition-all"
              >
                Add another photo
              </button>
              <button
                onClick={handleContinueFromPhoto}
                className="px-4 py-2 text-sm bg-rust/15 border border-rust/30 rounded-full text-rust hover:bg-rust/25 transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* Text input row */}
          {isTextStep && (
            <div className="flex gap-2 items-center">
              {/* Photo upload button */}
              {isPhotoStep && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-surface2 border border-border flex items-center justify-center text-text-sec hover:border-rust hover:text-rust transition-all"
                  aria-label="Upload photo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              )}

              <input
                ref={inputRef}
                type={step === 'phone' ? 'tel' : 'text'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={
                  step === 'zip' ? 'Enter your zip code...'
                    : step === 'name' ? 'Your name...'
                    : step === 'phone' ? 'Phone number...'
                    : 'Describe the work needed...'
                }
                className="flex-1 bg-surface2 border border-border rounded-full px-4 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-rust transition-colors"
              />

              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-rust flex items-center justify-center hover:bg-ember transition-all active:scale-95 disabled:opacity-40 disabled:hover:bg-rust"
                aria-label="Send"
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      )}

      {/* ── Done State ── */}
      {step === 'done' && (
        <div className="border-t border-border p-4 bg-surface flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-forge animate-pulse" />
              <span className="text-sm font-mono text-green-forge">Lead submitted</span>
              {leadResult?.tier && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                  leadResult.tier === 'URGENT'
                    ? 'text-rust border-rust/30 bg-rust/10'
                    : leadResult.tier === 'WARM'
                    ? 'text-yellow-warm border-yellow-warm/30 bg-yellow-warm/10'
                    : 'text-text-sec border-border bg-surface2'
                }`}>
                  {leadResult.tier}
                </span>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-mono text-text-dim hover:text-rust transition-colors"
            >
              New conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
