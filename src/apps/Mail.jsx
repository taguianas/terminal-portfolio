import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mail as MailIcon, User, Linkedin, Github, CheckCircle2, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { CONFIG } from '../config';
import { useOS } from '../os/OSContext';

// A Thunderbird-style compose window. Visitors send a real message:
// if CONFIG.contactEndpoint (a Formspree URL) is set, it is POSTed there;
// otherwise it falls back to opening the visitor's own mail client.

const DRAFT_KEY = 'mail-draft';

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {}; } catch { return {}; }
}

export default function Mail({ setTitle }) {
  const os = useOS();
  const [name, setName] = useState(() => loadDraft().name || '');
  const [from, setFrom] = useState(() => loadDraft().from || '');
  const [subject, setSubject] = useState(() => loadDraft().subject || `Work-study opportunity for ${CONFIG.fullName}`);
  const [body, setBody] = useState(() => loadDraft().body || '');
  const [hp, setHp] = useState(''); // honeypot (bots fill it, humans don't)
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error | fallback
  const [errorMsg, setErrorMsg] = useState('');
  const firstRef = useRef(null);

  useEffect(() => { setTitle?.('Compose: New message - Mail'); }, [setTitle]);
  useEffect(() => { firstRef.current?.focus(); }, []);

  // keep a draft so a half-written message survives closing the window
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, from, subject, body })); } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(t);
  }, [name, from, subject, body]);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from);
  const canSend = name.trim() && validEmail && body.trim() && status !== 'sending';

  const mailtoFallback = () => {
    const lines = [`From: ${name} <${from}>`, '', body].join('\n');
    const href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
    window.location.href = href;
    setStatus('fallback');
  };

  const send = async (e) => {
    e?.preventDefault();
    if (!canSend) return;
    if (hp) return; // silently drop bots
    setStatus('sending');
    setErrorMsg('');

    if (!CONFIG.contactEndpoint) {
      mailtoFallback();
      return;
    }
    try {
      const res = await fetch(CONFIG.contactEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: from, _replyto: from, subject, message: body, _subject: subject }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.errors?.[0]?.message || `HTTP ${res.status}`);
      }
      setStatus('sent');
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      os.notify?.('Message sent', `Your message to ${CONFIG.fullName} was delivered.`);
      setBody('');
    } catch (err) {
      setErrorMsg(err.message || 'Network error');
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <Centered>
        <CheckCircle2 size={56} className="text-[#2fa36b] mb-4" />
        <div className="text-xl font-semibold">Message sent</div>
        <p className="text-[#aeb4c0] mt-2 max-w-sm text-center">Thanks, {name.split(' ')[0]}. Your message reached {CONFIG.fullName}. You will get a reply at {from}.</p>
        <button onClick={() => { setStatus('idle'); setName(''); setBody(''); }} className="mt-6 px-4 py-2 rounded bg-[#367bf0] hover:bg-[#4a8bff] text-white text-sm font-medium">Write another</button>
      </Centered>
    );
  }

  if (status === 'fallback') {
    return (
      <Centered>
        <MailIcon size={52} className="text-[#5aa2ff] mb-4" />
        <div className="text-xl font-semibold">Opening your email app</div>
        <p className="text-[#aeb4c0] mt-2 max-w-sm text-center">Your message was handed to your email client, already addressed to {CONFIG.email}. Just press send there.</p>
        <p className="text-[#7b8494] mt-3 text-[12.5px] max-w-sm text-center">Nothing happened? Email me directly at <a className="text-[#5aa2ff] underline" href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a>.</p>
        <button onClick={() => setStatus('idle')} className="mt-6 px-4 py-2 rounded bg-[#2f3340] hover:bg-[#3a3f4d] text-sm">Back to the message</button>
      </Centered>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1f2129] text-[#dfe3ea] text-[13px]">
      {/* toolbar */}
      <div className="flex items-center gap-2 h-11 px-3 border-b border-[#2b2e38] bg-[#242730]">
        <button
          onClick={send}
          disabled={!canSend}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#367bf0] hover:bg-[#4a8bff] disabled:opacity-40 disabled:hover:bg-[#367bf0] text-white font-medium"
        >
          {status === 'sending' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {status === 'sending' ? 'Sending…' : 'Send'}
        </button>
        <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded text-[#8b93a3]"><Paperclip size={15} /> Attach</button>
        <div className="ml-auto flex items-center gap-3 text-[#8b93a3]">
          <a href={CONFIG.linkedin} target="_blank" rel="noreferrer" className="hover:text-white" title="LinkedIn"><Linkedin size={16} /></a>
          <a href={`https://github.com/${CONFIG.github}`} target="_blank" rel="noreferrer" className="hover:text-white" title="GitHub"><Github size={16} /></a>
        </div>
      </div>

      <form onSubmit={send} className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <Field label="To">
          <div className="flex items-center gap-2 text-[#c4c9d3]">
            <span className="px-2 py-0.5 rounded bg-[#2f3340] text-[12.5px]">{CONFIG.fullName} &lt;{CONFIG.email}&gt;</span>
          </div>
        </Field>
        <Field label="Your name">
          <div className="flex items-center gap-2 flex-1">
            <User size={14} className="text-[#6b7383]" />
            <input ref={firstRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Recruiter" className="flex-1 bg-transparent outline-none placeholder:text-[#6b7383]" />
          </div>
        </Field>
        <Field label="Your email">
          <div className="flex items-center gap-2 flex-1">
            <MailIcon size={14} className="text-[#6b7383]" />
            <input type="email" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="you@company.com" className="flex-1 bg-transparent outline-none placeholder:text-[#6b7383]" />
            {from && !validEmail && <span className="text-[11.5px] text-[#ff8f8f]">invalid</span>}
          </div>
        </Field>
        <Field label="Subject">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="flex-1 bg-transparent outline-none" />
        </Field>

        {/* honeypot: hidden from humans, bots fill it */}
        <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="absolute opacity-0 w-0 h-0 pointer-events-none" aria-hidden="true" />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Hi ${CONFIG.fullName.split(' ')[0]},\n\nWe have a work-study (alternance) opening in our SOC and your profile caught our attention...`}
          className="flex-1 min-h-[160px] resize-none bg-[#14161d] outline-none p-4 font-mono text-[13.5px] leading-relaxed"
        />

        {status === 'error' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#4a1f24] text-[#ffb4b4] text-[12.5px]">
            <AlertTriangle size={14} /> Could not send ({errorMsg}).{' '}
            <button type="button" onClick={mailtoFallback} className="underline hover:text-white">Open my email app instead</button>
          </div>
        )}

        <div className="flex items-center gap-2 px-4 py-2 text-[11.5px] text-[#7b8494] border-t border-[#2b2e38]">
          <Shield size={13} /> {CONFIG.contactEndpoint
            ? 'Sent securely. Your address is used only to reply.'
            : 'This opens your own email app, pre-addressed. Your address stays with you.'}
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex items-center gap-3 px-4 h-10 border-b border-[#2b2e38]">
      <span className="w-20 shrink-0 text-[#8b93a3] text-[12.5px]">{label}</span>
      {children}
    </div>
  );
}

function Centered({ children }) {
  return <div className="h-full flex flex-col items-center justify-center bg-[#1f2129] text-[#dfe3ea] p-6">{children}</div>;
}
