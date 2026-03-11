'use client';

import { useState } from 'react';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat iframe modal */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[370px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-7rem)] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-border">
          <iframe
            src="/widget/chat"
            className="w-full h-full bg-bg"
            title="Southern Steel Chat"
          />
        </div>
      )}

      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-rust hover:bg-ember transition-colors shadow-lg shadow-rust/30 flex items-center justify-center group"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-rust animate-ping opacity-25" />
        )}

        {/* Icon: chat when closed, X when open */}
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </>
  );
}
