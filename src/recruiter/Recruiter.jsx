import { useState, useEffect, useRef } from 'react';
import { Download, Mail, MapPin, Printer, ArrowUpRight, Terminal as TerminalIcon, Briefcase, GraduationCap, ShieldCheck, Languages, Heart, Copy, Check } from 'lucide-react';
import { PROFILE as P, UI } from '../data/profile';

// Recruiter mode: a clean, printable one-page profile for people who
// don't have time to explore the Kali desktop. FR / EN.

const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
  </svg>
);
const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);
const ThmIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M9 12l2 2 4-4" />
  </svg>
);

const KIND_COLORS = {
  'Blue Team': 'bg-[#e8f1ff] text-[#1d5fd6]',
  Offensive: 'bg-[#fdecec] text-[#c0392b]',
  AppSec: 'bg-[#f1eafd] text-[#6b3fc2]',
  SysAdmin: 'bg-[#e9f7ef] text-[#1e7a46]',
  Network: 'bg-[#e6f6f4] text-[#0f766e]',
};

function loadLang() {
  try {
    const saved = localStorage.getItem('recruiter-lang');
    if (saved === 'fr' || saved === 'en') return saved;
  } catch { /* ignore */ }
  return (navigator.language || '').toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] : v);

export default function Recruiter({ onExit }) {
  const [lang, setLang] = useState(loadLang);
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState('about');
  const scroller = useRef(null);
  const t = UI[lang];
  const L = P[lang];
  const ids = ['about', 'experience', 'projects', 'skills', 'education', 'volunteering'];

  useEffect(() => {
    try { localStorage.setItem('recruiter-lang', lang); } catch { /* ignore */ }
    document.documentElement.lang = lang;
    document.title = `${P.name} | ${L.title}`;
    return () => { document.title = 'Anas Tagui | Cybersecurity Portfolio'; };
  }, [lang, L.title]);

  // highlight the section in view
  useEffect(() => {
    const root = scroller.current;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { root, rootMargin: '-35% 0px -60% 0px' },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(P.email); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };

  return (
    <div ref={scroller} className="recruiter-root fixed inset-0 z-[300000] overflow-y-auto bg-[#f6f7f9] text-[#16181d] font-sans antialiased" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      {/* ------------------------------------------------ header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-[#e6e8ec] print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <button onClick={() => go('top')} className="flex items-center gap-2.5 shrink-0">
            <img src={P.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-semibold tracking-tight hidden sm:inline">{P.name}</span>
          </button>
          <nav className="hidden md:flex items-center gap-1 mx-auto text-[14px]">
            {ids.map((id, i) => (
              <button key={id} onClick={() => go(id)} className={`px-3 py-1.5 rounded-md transition-colors ${active === id ? 'text-[#1d5fd6] bg-[#eef4ff]' : 'text-[#4b5260] hover:text-[#16181d]'}`}>
                {t.nav[i]}
              </button>
            ))}
          </nav>
          <div className="ml-auto md:ml-0 flex items-center gap-2">
            <div className="flex rounded-md border border-[#dfe2e7] overflow-hidden text-[12.5px] font-semibold">
              {['fr', 'en'].map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`px-2.5 py-1 ${lang === l ? 'bg-[#16181d] text-white' : 'text-[#4b5260] hover:bg-[#f1f3f6]'}`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={() => window.print()} title={t.print} className="hidden sm:flex p-2 rounded-md text-[#4b5260] hover:bg-[#f1f3f6]"><Printer size={16} /></button>
            <button onClick={onExit} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0f1115] text-white text-[13px] font-medium hover:bg-[#262a33]">
              <TerminalIcon size={14} /> <span className="hidden sm:inline">{t.back}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ------------------------------------------------ hero */}
        <section className="pt-10 sm:pt-16 pb-10 grid md:grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e9f7ef] text-[#1e7a46] text-[13px] font-medium mb-5">
              <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-[#2fa36b] animate-ping opacity-60" /><span className="relative w-2 h-2 rounded-full bg-[#2fa36b]" /></span>
              {L.availability}
            </div>
            <h1 className="text-[40px] sm:text-[56px] leading-[1.05] font-bold tracking-tight">{P.name}</h1>
            <p className="mt-3 text-[20px] sm:text-[24px] text-[#1d5fd6] font-semibold">{L.title}</p>
            <p className="mt-1 text-[16px] text-[#4b5260]">{L.focus}</p>
            <p className="mt-4 flex items-center gap-1.5 text-[14px] text-[#6b7280]"><MapPin size={15} /> {L.location}</p>
            <div className="mt-7 flex flex-wrap gap-2.5 print:hidden">
              <a href={P.resume} download="Anas_TAGUI_CV.pdf" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1d5fd6] hover:bg-[#174fb5] text-white font-medium text-[14.5px] shadow-sm">
                <Download size={16} /> {t.download}
              </a>
              <a href={`mailto:${P.email}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-[#dfe2e7] hover:border-[#b9bfc9] font-medium text-[14.5px]">
                <Mail size={16} /> {t.contact}
              </a>
              <IconLink href={P.links.linkedin} label="LinkedIn"><LinkedinIcon /></IconLink>
              <IconLink href={P.links.github} label="GitHub"><GithubIcon /></IconLink>
              <IconLink href={P.links.tryhackme} label="TryHackMe"><ThmIcon /></IconLink>
            </div>
            <div className="hidden print:block mt-4 text-[13px]">{P.email} · linkedin.com/in/taguianas · github.com/taguianas</div>
          </div>
          <div className="justify-self-start md:justify-self-end order-first md:order-none">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#1d5fd6] to-[#5aa2ff] opacity-20 blur-xl" />
              <img src={P.photo} alt={P.name} className="relative w-28 h-28 sm:w-56 sm:h-56 rounded-full object-cover ring-4 ring-white shadow-xl" />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ facts */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-12">
          {L.facts.map(([big, small]) => (
            <div key={big} className="rounded-xl bg-white border border-[#e6e8ec] px-5 py-4">
              <div className="text-[22px] font-bold tracking-tight">{big}</div>
              <div className="text-[13.5px] text-[#6b7280] mt-0.5">{small}</div>
            </div>
          ))}
        </section>

        {/* ------------------------------------------------ about */}
        <Section id="about" title={t.about}>
          <p className="text-[16.5px] leading-[1.75] text-[#2b3038] max-w-3xl">{L.about}</p>
        </Section>

        {/* ------------------------------------------------ experience */}
        <Section id="experience" title={t.experience} icon={Briefcase}>
          <ol className="relative border-l-2 border-[#e1e5ec] ml-2 space-y-8">
            {P.experience.map((x) => (
              <li key={x.company + x.en.date} className="pl-6 relative break-inside-avoid">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-[3px] border-[#1d5fd6]" />
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[17px] font-semibold">{x[lang].role}</h3>
                  <span className="text-[13.5px] text-[#6b7280] tabular-nums">{x[lang].date}</span>
                </div>
                <div className="text-[14.5px] text-[#1d5fd6] font-medium">{x.company} <span className="text-[#6b7280] font-normal">· {pick(x.place, lang)}</span></div>
                <ul className="mt-2.5 space-y-1.5 text-[15px] text-[#2b3038]">
                  {x.points[lang].map((p) => (
                    <li key={p} className="flex gap-2.5"><span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-[#9aa3b2] shrink-0" />{p}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">{x.tags.map((g) => <Chip key={g}>{g}</Chip>)}</div>
              </li>
            ))}
          </ol>
        </Section>

        {/* ------------------------------------------------ projects */}
        <Section id="projects" title={t.projects} sub={t.projectsSub} icon={ShieldCheck}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {P.projects.map((p) => (
              <div key={p.name} className="group flex flex-col rounded-xl bg-white border border-[#e6e8ec] overflow-hidden hover:border-[#1d5fd6]/50 hover:shadow-[0_8px_30px_rgba(29,95,214,0.08)] transition-all break-inside-avoid">
                {p.img && (
                  <a href={p.demo || p.repo} target="_blank" rel="noreferrer" className="block relative h-36 bg-[#eef1f5] overflow-hidden print:hidden">
                    <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    {p.flagship && <span className="absolute top-2 left-2 bg-[#1d5fd6] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">{lang === 'fr' ? 'Projet phare' : 'Flagship'}</span>}
                  </a>
                )}
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11.5px] font-semibold px-2 py-0.5 rounded ${KIND_COLORS[p.kind]}`}>{p.kind}</span>
                    {!p.img && p.flagship && <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#eef4ff] text-[#1d5fd6]">{lang === 'fr' ? 'Projet phare' : 'Flagship'}</span>}
                  </div>
                  <h3 className="mt-3 text-[17px] font-semibold">{p.name}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#4b5260] flex-1">{p[lang]}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">{p.stack.map((s) => <Chip key={s}>{s}</Chip>)}</div>
                  <div className="mt-4 flex items-center gap-4 text-[13px] font-medium print:hidden">
                    <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#1d5fd6] hover:underline"><GithubIcon size={14} /> {t.viewCode}</a>
                    {p.demo && <a href={p.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#1d5fd6] hover:underline">{t.demo} <ArrowUpRight size={13} /></a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ------------------------------------------------ skills */}
        <Section id="skills" title={t.skills}>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-5">
            {P.skills.map((g) => (
              <div key={g.en} className="break-inside-avoid">
                <div className="text-[13px] font-semibold uppercase tracking-wider text-[#6b7280] mb-2">{g[lang]}</div>
                <div className="flex flex-wrap gap-1.5">{g.items.map((i) => <Chip key={i} strong>{i}</Chip>)}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ------------------------------------------------ education + certs */}
        <Section id="education" title={t.education} icon={GraduationCap}>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {P.education.map((e) => (
                <div key={e.school} className="rounded-xl bg-white border border-[#e6e8ec] p-5 break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="font-semibold text-[15.5px]">{e[lang]}</h3>
                    <span className="text-[13px] text-[#6b7280] tabular-nums">{pick(e.date, lang)}</span>
                  </div>
                  <div className="text-[14px] text-[#1d5fd6] font-medium mt-0.5">{e.school} <span className="text-[#6b7280] font-normal">· {pick(e.place, lang)}</span></div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#6b7280] mb-3">{t.certs}</h3>
              <div className="rounded-xl bg-white border border-[#e6e8ec] divide-y divide-[#eef0f3]">
                {P.certifications.map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <div className="font-semibold text-[15px]">{c.name}</div>
                      <div className="text-[13.5px] text-[#6b7280]">{c.by}</div>
                    </div>
                    <span className="text-[12.5px] text-[#4b5260] bg-[#f1f3f6] px-2 py-0.5 rounded whitespace-nowrap">{pick(c.status, lang)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-[#6b7280] mb-3"><Languages size={14} /> {t.languages}</h3>
                  <ul className="space-y-1.5 text-[14.5px]">
                    {P.languages[lang].map(([l, lvl]) => <li key={l} className="flex justify-between gap-2"><span>{l}</span><span className="text-[#6b7280]">{lvl}</span></li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-[#6b7280] mb-3"><Heart size={14} /> {t.interests}</h3>
                  <ul className="space-y-1.5 text-[14.5px]">{P.interests[lang].map((i) => <li key={i}>{i}</li>)}</ul>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------ volunteering */}
        <Section id="volunteering" title={t.volunteering} icon={Heart}>
          <div className="grid sm:grid-cols-2 gap-4">
            {P.volunteering.map((v) => (
              <div key={v.name} className="group flex flex-col rounded-xl bg-white border border-[#e6e8ec] overflow-hidden hover:border-[#1d5fd6]/50 hover:shadow-[0_8px_30px_rgba(29,95,214,0.08)] transition-all break-inside-avoid">
                {v.img && (
                  <a href={v.demo || '#'} target="_blank" rel="noreferrer" className="block relative h-36 bg-[#eef1f5] overflow-hidden print:hidden">
                    <img src={v.img} alt={v.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  </a>
                )}
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-[17px] font-semibold">{v.name}</h3>
                  {v.role && <div className="text-[13.5px] text-[#1d5fd6] font-medium mt-0.5">{pick(v.role, lang)}</div>}
                  <p className="mt-2 text-[14.5px] leading-relaxed text-[#4b5260] flex-1">{v[lang]}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">{v.stack.map((s) => <Chip key={s}>{s}</Chip>)}</div>
                  {v.demo && (
                    <div className="mt-4 text-[13px] font-medium print:hidden">
                      <a href={v.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#1d5fd6] hover:underline">{t.demo} <ArrowUpRight size={13} /></a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ------------------------------------------------ CTA */}
        <section className="my-14 rounded-2xl bg-[#0f1115] text-white p-8 sm:p-10 grid md:grid-cols-[1fr_auto] gap-8 items-center print:hidden">
          <div>
            <h2 className="text-[26px] sm:text-[30px] font-bold tracking-tight">{t.ctaTitle}</h2>
            <p className="mt-2 text-[#aeb4c0] text-[15.5px]">{t.ctaText}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href={`mailto:${P.email}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1d5fd6] hover:bg-[#2a6ef0] font-medium text-[14.5px]"><Mail size={16} /> {P.email}</a>
              <button onClick={copyEmail} className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-[14px]">{copied ? <Check size={15} /> : <Copy size={15} />}</button>
              <a href={P.links.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 font-medium text-[14.5px]"><LinkedinIcon /> LinkedIn</a>
              <a href={P.resume} download="Anas_TAGUI_CV.pdf" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 font-medium text-[14.5px]"><Download size={16} /> {t.download}</a>
            </div>
          </div>
          <button onClick={onExit} className="text-left rounded-xl border border-white/15 hover:border-[#5aa2ff]/60 bg-white/[0.03] p-5 max-w-sm transition-colors group">
            <div className="flex items-center gap-2 font-semibold"><TerminalIcon size={17} className="text-[#5aa2ff]" /> {t.explore} <ArrowUpRight size={16} className="text-[#9aa3b2] group-hover:text-white" /></div>
            <p className="mt-1.5 text-[13.5px] text-[#aeb4c0] leading-relaxed">{t.exploreSub}</p>
          </button>
        </section>

        <footer className="pb-10 text-center text-[13px] text-[#9aa3b2]">© {new Date().getFullYear()} {P.name}</footer>
      </main>
    </div>
  );
}

function Section({ id, title, sub, icon: Icon, children }) {
  return (
    <section id={id} className="scroll-mt-20 py-10 border-t border-[#e6e8ec]">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-[24px] font-bold tracking-tight">{Icon && <Icon size={20} className="text-[#1d5fd6]" />}{title}</h2>
        {sub && <p className="text-[14px] text-[#6b7280] mt-1">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Chip({ children, strong }) {
  return <span className={`text-[12.5px] px-2 py-0.5 rounded-md border ${strong ? 'bg-white border-[#dfe2e7] text-[#2b3038]' : 'bg-[#f6f7f9] border-[#eceef2] text-[#4b5260]'}`}>{children}</span>;
}

function IconLink({ href, label, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" title={label} aria-label={label} className="inline-flex items-center justify-center w-[42px] h-[42px] rounded-lg bg-white border border-[#dfe2e7] hover:border-[#b9bfc9] text-[#2b3038]">
      {children}
    </a>
  );
}
