'use client';

import { useState } from 'react';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  function handleOpen() {
    setOpen(true);
    setHasOpened(true);
  }

  return (
    <>
      {/* Chat iframe modal */}
      {open && (
        <div className="fixed z-50 top-1/2 right-[100px] -translate-y-1/2 w-[400px] h-[600px] max-w-[calc(100vw-6rem)] max-h-[calc(100dvh-4rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-border">
          {/* Modal close bar */}
          <div className="flex items-center justify-between bg-surface2 border-b border-border px-4 py-2 flex-shrink-0">
            <span className="text-xs font-mono text-text-sec">Southern Steel Chat</span>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-surface3 border border-border flex items-center justify-center text-text-sec hover:text-white hover:bg-red-hot transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <iframe
            src="/widget/chat"
            className="flex-1 w-full bg-bg"
            title="Southern Steel Chat"
          />
        </div>
      )}

      {/* Floating label + arrow (only before first open) */}
      {!hasOpened && !open && (
        <div className="fixed z-50 right-[100px] top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <span className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
            Chat with us!
          </span>
          {/* Bouncing arrow pointing right at the bubble */}
          <svg
            className="w-6 h-6 text-white animate-bounce-x flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10 6l6 6-6 6V6z" />
          </svg>
        </div>
      )}

      {/* Floating bubble — vertically centered, pinned to right edge */}
      <button
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className="fixed z-50 right-4 top-1/2 -translate-y-1/2 w-[70px] h-[70px] rounded-full bg-rust hover:bg-ember transition-colors flex items-center justify-center chat-bubble-glow"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {/* Glow pulse rings */}
        {!open && (
          <>
            <span className="absolute inset-0 rounded-full bg-rust animate-ping opacity-20" />
            <span className="absolute -inset-2 rounded-full border-2 border-rust opacity-40 animate-pulse" />
          </>
        )}

        {open ? (
          <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      <style jsx>{`
        .chat-bubble-glow {
          box-shadow:
            0 0 20px rgba(212, 90, 40, 0.5),
            0 0 40px rgba(212, 90, 40, 0.3),
            0 0 60px rgba(212, 90, 40, 0.15);
        }
        .chat-bubble-glow:hover {
          box-shadow:
            0 0 25px rgba(232, 136, 58, 0.6),
            0 0 50px rgba(232, 136, 58, 0.35),
            0 0 70px rgba(232, 136, 58, 0.2);
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
