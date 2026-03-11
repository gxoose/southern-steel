'use client';

import { useState, useRef, useEffect } from 'react';

type Step = 'greeting' | 'type' | 'material' | 'setting' | 'photo' | 'timeline' | 'zip' | 'name' | 'phone' | 'done';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

const JOB_TYPES = ['Repair', 'New Build', 'Custom Fabrication', 'Not Sure'];
const MATERIALS = ['Steel', 'Aluminum', 'Stainless', 'Wrought Iron', 'Not Sure'];
const SETTINGS = ['Residential', 'Commercial', 'Industrial'];
const TIMELINES = ['ASAP', 'This week', 'Within 2 weeks', 'No rush'];

export default function ChatWidget() {
  const [step, setStep] = useState<Step>('greeting');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hey! I'm the Southern Steel assistant. Need some welding or fabrication work done? I can get you a quick estimate. What kind of work are you looking for?" },
  ]);
  const [input, setInput] = useState('');
  const [leadData, setLeadData] = useState({
    type: '',
    material: '',
    setting: '',
    timeline: '',
    zip: '',
    name: '',
    phone: '',
    scope: '',
    photos: [] as string[],
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function addMessages(userMsg: string, botMsg: string, nextStep: Step) {
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userMsg },
      { role: 'bot', text: botMsg },
    ]);
    setStep(nextStep);
  }

  function handleOption(value: string) {
    switch (step) {
      case 'greeting':
        setLeadData((d) => ({ ...d, type: value }));
        addMessages(value, "What material are you thinking?", 'material');
        break;
      case 'material':
        setLeadData((d) => ({ ...d, material: value }));
        addMessages(value, "Is this for a residential, commercial, or industrial property?", 'setting');
        break;
      case 'setting':
        setLeadData((d) => ({ ...d, setting: value }));
        addMessages(value, "Got any photos of the job site or what you need built? You can upload them here, or type 'skip' to continue.", 'photo');
        break;
      case 'photo':
        addMessages('No photos', "What's your timeline?", 'timeline');
        break;
      case 'timeline':
        setLeadData((d) => ({ ...d, timeline: value }));
        addMessages(value, "What's your zip code? This helps us check if we service your area.", 'zip');
        break;
    }
  }

  function handleSubmit() {
    if (!input.trim()) return;
    const val = input.trim();
    setInput('');

    switch (step) {
      case 'photo':
        setLeadData((d) => ({ ...d, scope: val }));
        addMessages(val, "What's your timeline?", 'timeline');
        break;
      case 'zip':
        setLeadData((d) => ({ ...d, zip: val }));
        addMessages(val, "What's your name?", 'name');
        break;
      case 'name':
        setLeadData((d) => ({ ...d, name: val }));
        addMessages(val, "And a phone number so we can reach you?", 'phone');
        break;
      case 'phone':
        setLeadData((d) => ({ ...d, phone: val }));
        setMessages((prev) => [
          ...prev,
          { role: 'user', text: val },
          { role: 'bot', text: "You're all set! We'll be in touch shortly. Thanks for reaching out to Southern Steel." },
        ]);
        setStep('done');
        // Submit lead
        const finalData = { ...leadData, phone: val, source: 'chatbot' };
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalData),
        }).catch(console.error);
        break;
    }
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        const photoUrl = ev.target.result as string;
        setLeadData((d) => ({ ...d, photos: [...d.photos, photoUrl] }));
        setMessages((prev) => [
          ...prev,
          { role: 'user', text: '(Photo uploaded)' },
          { role: 'bot', text: "Got it! You can upload more, or type any description of the work needed." },
        ]);
      }
    };
    reader.readAsDataURL(file);
  }

  const options: Record<string, string[]> = {
    greeting: JOB_TYPES,
    material: MATERIALS,
    setting: SETTINGS,
    timeline: TIMELINES,
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl overflow-hidden flex flex-col" style={{ height: '600px' }}>
        {/* Header */}
        <div className="bg-surface2 border-b border-border px-4 py-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-forge" />
          <span className="font-display text-sm">
            <span className="text-text">Southern</span>{' '}
            <span className="text-rust">Steel</span>
          </span>
          <span className="text-xs font-mono text-text-dim ml-auto">Online</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-rust text-white'
                    : 'bg-surface2 text-text-sec border border-border'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Options or Input */}
        {step !== 'done' && (
          <div className="border-t border-border p-3">
            {options[step] && (
              <div className="flex flex-wrap gap-2 mb-3">
                {options[step].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOption(opt)}
                    className="px-3 py-1.5 text-xs font-mono bg-surface2 border border-border rounded-md text-text-sec hover:border-rust hover:text-text transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              {step === 'photo' && (
                <label className="btn-outline text-xs px-3 py-2 cursor-pointer flex-shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  Upload
                </label>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={step === 'photo' ? "Describe the work or skip..." : "Type here..."}
                className="flex-1 bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-rust"
              />
              <button onClick={handleSubmit} className="btn-rust text-sm px-4">
                Send
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="border-t border-border p-4 text-center">
            <p className="text-xs font-mono text-green-forge">Lead submitted successfully</p>
          </div>
        )}
      </div>
    </div>
  );
}
