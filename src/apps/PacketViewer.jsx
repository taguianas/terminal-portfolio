import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';

// A Wireshark-style capture viewer over a static sample capture: an nmap
// scan, a DNS lookup, an HTTP request and a TLS handshake against the VM.
// Three panes (packet list, protocol tree, hex) and a display filter.

const H = '10.0.2.15';   // our host
const G = '10.0.2.2';    // gateway / scanner
const DNS = '10.0.2.3';

// [no, time, src, dst, proto, len, info, color, layers]
const PK = [
  [1, 0.000000, G, H, 'ARP', 42, `Who has ${H}? Tell ${G}`, 'arp'],
  [2, 0.000112, H, G, 'ARP', 42, `${H} is at 08:00:27:a7:a5:00`, 'arp'],
  [3, 0.104331, H, DNS, 'DNS', 74, 'Standard query 0x1a2b A kali.org', 'dns'],
  [4, 0.142778, DNS, H, 'DNS', 170, 'Standard query response 0x1a2b A 192.124.249.10', 'dns'],
  [5, 1.002190, G, H, 'TCP', 58, '44321 > 22 [SYN] Seq=0 Win=1024 Len=0 MSS=1460', 'tcp'],
  [6, 1.002231, H, G, 'TCP', 58, '22 > 44321 [SYN, ACK] Seq=0 Ack=1 Win=64240', 'tcp'],
  [7, 1.002402, G, H, 'TCP', 54, '44321 > 22 [RST] Seq=1 Win=0 Len=0', 'tcp'],
  [8, 1.004881, G, H, 'TCP', 58, '44322 > 80 [SYN] Seq=0 Win=1024 Len=0 MSS=1460', 'tcp'],
  [9, 1.004902, H, G, 'TCP', 58, '80 > 44322 [SYN, ACK] Seq=0 Ack=1 Win=64240', 'tcp'],
  [10, 1.005120, G, H, 'TCP', 54, '44322 > 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0', 'tcp'],
  [11, 1.020551, G, H, 'HTTP', 142, 'GET / HTTP/1.1 ', 'http'],
  [12, 1.020603, H, G, 'TCP', 54, '80 > 44322 [ACK] Seq=1 Ack=89 Win=64240 Len=0', 'tcp'],
  [13, 1.028874, H, G, 'HTTP', 486, 'HTTP/1.1 200 OK  (text/html)', 'http'],
  [14, 1.041222, G, H, 'TCP', 54, '44322 > 80 [FIN, ACK] Seq=89 Ack=433 Win=64240', 'tcp'],
  [15, 2.330190, G, H, 'TCP', 58, '51200 > 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460', 'tcp'],
  [16, 2.330240, H, G, 'TCP', 58, '443 > 51200 [SYN, ACK] Seq=0 Ack=1 Win=64240', 'tcp'],
  [17, 2.330470, G, H, 'TCP', 54, '51200 > 443 [ACK] Seq=1 Ack=1 Win=64240 Len=0', 'tcp'],
  [18, 2.331910, G, H, 'TLSv1.3', 571, 'Client Hello (SNI=kali.org)', 'tls'],
  [19, 2.332004, H, G, 'TCP', 54, '443 > 51200 [ACK] Seq=1 Ack=518 Win=64240 Len=0', 'tcp'],
  [20, 2.345880, H, G, 'TLSv1.3', 1484, 'Server Hello, Change Cipher Spec, Encrypted Extensions', 'tls'],
  [21, 2.361002, G, H, 'TLSv1.3', 134, 'Finished', 'tls'],
  [22, 2.361880, G, H, 'TLSv1.3', 158, 'Application Data', 'tls'],
  [23, 3.880771, G, H, 'ICMP', 98, 'Echo (ping) request  id=0x1a2b seq=1/256', 'icmp'],
  [24, 3.880802, H, G, 'ICMP', 98, 'Echo (ping) reply    id=0x1a2b seq=1/256', 'icmp'],
];

const COLORS = {
  arp: 'bg-[#2a2d1a]', dns: 'bg-[#15262e]', tcp: 'bg-transparent', http: 'bg-[#15241a]',
  tls: 'bg-[#1a2033]', icmp: 'bg-[#2a1a26]',
};
const PROTO_COLOR = {
  ARP: '#d6c04f', DNS: '#56b6c2', TCP: '#9aa3b2', HTTP: '#4fd16b', 'TLSv1.3': '#5aa2ff', ICMP: '#d68fe8',
};

function macFor(ip) { return ip === H ? '08:00:27:a7:a5:00' : ip === G ? '52:55:0a:00:02:02' : '52:55:0a:00:02:03'; }

// deterministic hex dump for a given packet number + length
function hexDump(no, len) {
  const bytes = [];
  let seed = no * 2654435761 % 4294967296;
  for (let i = 0; i < len; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; bytes.push(seed % 256); }
  const rows = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const slice = bytes.slice(i, i + 16);
    const hex = slice.map((b) => b.toString(16).padStart(2, '0')).join(' ');
    const asc = slice.map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.')).join('');
    rows.push(`${i.toString(16).padStart(4, '0')}  ${hex.padEnd(47)}  ${asc}`);
  }
  return rows.join('\n');
}

function layers(p) {
  const [no, , src, dst, proto, len, info] = p;
  const l = [
    { t: `Frame ${no}: ${len} bytes on wire, ${len} bytes captured`, c: [`Arrival: ${p[1].toFixed(6)}s`, `Frame Length: ${len} bytes`, 'Interface: eth0'] },
    { t: `Ethernet II, Src: ${macFor(src)}, Dst: ${macFor(dst)}`, c: [`Destination: ${macFor(dst)}`, `Source: ${macFor(src)}`, `Type: ${proto === 'ARP' ? 'ARP (0x0806)' : 'IPv4 (0x0800)'}`] },
  ];
  if (proto !== 'ARP') {
    l.push({ t: `Internet Protocol Version 4, Src: ${src}, Dst: ${dst}`, c: ['Version: 4', 'Header Length: 20 bytes', `Protocol: ${proto === 'ICMP' ? 'ICMP (1)' : proto === 'DNS' ? 'UDP (17)' : 'TCP (6)'}`, `Time to Live: ${src === H ? 64 : 63}`] });
  }
  if (['TCP', 'HTTP', 'TLSv1.3'].includes(proto)) {
    const m = info.match(/(\d+) > (\d+) \[([^\]]+)\]/);
    l.push({ t: `Transmission Control Protocol${m ? `, Src Port: ${m[1]}, Dst Port: ${m[2]}` : ''}`, c: m ? [`Source Port: ${m[1]}`, `Destination Port: ${m[2]}`, `Flags: ${m[3]}`] : ['Stream reassembled'] });
  }
  if (proto === 'DNS') l.push({ t: 'Domain Name System', c: [info.includes('response') ? 'Response, No error' : 'Query', 'Name: kali.org', 'Type: A'] });
  if (proto === 'HTTP') l.push({ t: `Hypertext Transfer Protocol`, c: info.startsWith('GET') ? ['GET / HTTP/1.1', 'Host: 10.0.2.15', 'User-Agent: Mozilla/5.0'] : ['HTTP/1.1 200 OK', 'Content-Type: text/html', 'Server: nginx'] });
  if (proto === 'TLSv1.3') l.push({ t: 'Transport Layer Security', c: [info, 'Version: TLS 1.3', 'Cipher: TLS_AES_256_GCM_SHA384'] });
  if (proto === 'ICMP') l.push({ t: 'Internet Control Message Protocol', c: [info.includes('request') ? 'Type: 8 (Echo request)' : 'Type: 0 (Echo reply)', 'Checksum: 0x4d2a [correct]'] });
  return l;
}

export default function PacketViewer({ setTitle }) {
  const [sel, setSel] = useState(0);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState({ 0: false, 1: false });

  useEffect(() => { setTitle?.('eth0 - sample.pcap - Wireshark'); }, [setTitle]);

  const rows = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return PK;
    return PK.filter((p) => {
      const proto = p[4].toLowerCase();
      if (f === proto || (f === 'tcp' && ['http', 'tlsv1.3'].includes(proto))) return true;
      if (['ip.addr', 'tcp.port', 'http', 'dns', 'tls', 'icmp', 'arp'].some((kw) => f.startsWith(kw) && proto.includes(f.replace(/[^a-z0-9.]/g, '').slice(0, 4)))) return true;
      return `${p[2]} ${p[3]} ${p[4]} ${p[6]}`.toLowerCase().includes(f);
    });
  }, [filter]);

  const selPk = rows.find((p) => p[0] === sel) || rows[0] || PK[0];

  return (
    <div className="h-full flex flex-col bg-[#1f2129] text-[#dfe3ea] text-[12.5px]">
      {/* filter bar */}
      <div className="flex items-center gap-2 p-2 border-b border-[#2b2e38]">
        <div className="flex-1 flex items-center gap-2 h-8 px-3 rounded bg-[#15241a] border border-[#2a5a3a]">
          <Search size={14} className="text-[#4fd16b]" />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Apply a display filter … (try: http, dns, tcp, tls, icmp)" className="flex-1 bg-transparent outline-none placeholder:text-[#6b8a74] font-mono text-[12px]" spellCheck={false} />
        </div>
        <span className="text-[11px] text-[#7b8494] px-1">{rows.length} / {PK.length}</span>
      </div>

      {/* packet list */}
      <div className="flex-1 min-h-0 overflow-auto kali-scroll border-b border-[#2b2e38]">
        <table className="w-full font-mono text-[12px]">
          <thead className="sticky top-0 bg-[#242730] text-[#8b93a3] text-left">
            <tr>
              {['No.', 'Time', 'Source', 'Destination', 'Proto', 'Len', 'Info'].map((h) => <th key={h} className="px-2 py-1 font-medium whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p[0]} onClick={() => setSel(p[0])} className={`cursor-default ${p[0] === sel ? 'bg-[#2f4b8f] text-white' : COLORS[p[7] || p[4].toLowerCase()] || ''} hover:brightness-125`}>
                <td className="px-2 py-0.5 text-[#9aa3b2] tabular-nums">{p[0]}</td>
                <td className="px-2 py-0.5 text-[#9aa3b2] tabular-nums">{p[1].toFixed(6)}</td>
                <td className="px-2 py-0.5">{p[2]}</td>
                <td className="px-2 py-0.5">{p[3]}</td>
                <td className="px-2 py-0.5 font-semibold" style={{ color: p[0] === sel ? '#fff' : PROTO_COLOR[p[4]] }}>{p[4]}</td>
                <td className="px-2 py-0.5 text-[#9aa3b2] tabular-nums">{p[5]}</td>
                <td className="px-2 py-0.5 truncate max-w-0">{p[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* detail + hex */}
      <div className="h-[44%] flex min-h-0">
        <div className="flex-1 overflow-auto kali-scroll p-1 font-mono text-[12px] border-r border-[#2b2e38]">
          {layers(selPk).map((layer, i) => (
            <div key={i}>
              <button onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} className="flex items-start gap-1 w-full text-left hover:bg-white/5 px-1 py-0.5">
                {open[i] ? <ChevronDown size={13} className="mt-0.5 shrink-0" /> : <ChevronRight size={13} className="mt-0.5 shrink-0" />}
                <span className="text-[#c4c9d3]">{layer.t}</span>
              </button>
              {open[i] && layer.c.map((line, j) => <div key={j} className="pl-6 py-0.5 text-[#9aa3b2]">{line}</div>)}
            </div>
          ))}
        </div>
        <pre className="w-[46%] overflow-auto kali-scroll p-2 font-mono text-[11.5px] leading-[1.5] text-[#aeb4c0] bg-[#15171d]">{hexDump(selPk[0], selPk[5])}</pre>
      </div>
    </div>
  );
}
