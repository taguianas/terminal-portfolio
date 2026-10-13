const LINK_RE = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

// Turns URLs and e-mail addresses inside plain text into links.
// `onUrl` lets the desktop open http links in the fake Firefox.
export default function Linkify({ text, onUrl }) {
  const parts = text.split(LINK_RE);
  return parts.map((part, i) => {
    if (i % 2 === 0) return part;
    const isMail = !part.startsWith('http');
    const href = isMail ? `mailto:${part}` : part;
    return (
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#5aa2ff] underline decoration-dotted underline-offset-2 hover:decoration-solid"
        onClick={(e) => {
          e.stopPropagation();
          if (!isMail && onUrl) {
            e.preventDefault();
            onUrl(part);
          }
        }}
      >
        {part}
      </a>
    );
  });
}
