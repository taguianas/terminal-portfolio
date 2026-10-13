import { CONFIG } from '../config.js';

// ---------------------------------------------------------------
//  Text of every file on the desktop.
//  Source: Anas's CV (October 2026) and his public GitHub.
//  Keep in sync with src/data/profile.js (the recruiter view).
// ---------------------------------------------------------------

export const README = `
 Welcome to ${CONFIG.host}'s machine
 ===========================

 You just logged into my portfolio. It works like a real
 Kali Linux desktop, so use it the way you prefer:

   * Mouse:    double-click the icons on the desktop
               (about.txt, experience.txt, projects ...)
   * Terminal: type "help" to see every command
               try:  ls   cat about.txt   nmap anas
   * Real Kali: double-click "Kali Linux (real VM)" or
               type kali-vm. It boots a genuine Kali
               (i386) inside your browser, with real
               nmap, radare2, python3 ... and a mini CTF.
   * In a hurry? Click "Recruiter view" in the top panel
               for a one-page profile (FR / EN).

 Quick links
   About me ........ about.txt
   Experience ...... experience.txt
   Skills .......... skills.md
   Projects ........ projects/
   Labs & CTF ...... labs/
   Certifications .. certifications.txt
   Education ....... education.txt
   Resume (PDF) .... resume.pdf
   Contact ......... contact.info

 Have fun, and look around: there are a few hidden things.
`;

export const ABOUT = `
Hi, I am ${CONFIG.fullName}.

Fourth-year cybersecurity engineering student at ESAIP (Angers,
France), specializing in cybersecurity and networks. I am looking
for a one-year work-study program (alternance) from October 2026.

I work mostly Blue Team and SOC: threat detection, incident
response and SIEM/SOAR (Wazuh, Splunk, TheHive, Shuffle), with
real offensive practice through CTFs and labs. What drives me is
understanding a system in depth so I can protect it better.

Certified Google Cybersecurity, CEH in progress, TryHackMe Top 2%.
Arabic and French native, English fluent, Spanish intermediate.

Next:  cat experience.txt  |  ls projects  |  open resume.pdf
`;

export const SKILLS = `
# Technical skills

## SIEM / SOAR / CTI
Wazuh, Splunk, TheHive, Shuffle, MISP, OpenCTI,
VirusTotal API, AbuseIPDB

## Pentest & offensive security
Metasploit, Burp Suite, Nmap, Nessus, OpenVAS, Hydra, Netcat

## Network & services
TCP/IP, DNS, DHCP, VLAN, firewalls, Wireshark, Cisco

## Systems & infrastructure
Linux / Kali, Windows Server, Active Directory, Docker, Kubernetes

## Forensics & malware analysis
Ghidra, x64dbg, Autopsy

## Development & scripting
Python, Bash, PowerShell, JavaScript, Java

## Frameworks
MITRE ATT&CK, OWASP Top 10, ISO 27001, NIST

Tip: run "nmap anas" in the terminal for another view of this file.
`;

export const EXPERIENCE = `
Professional experience
========================

Systems & Security Administrator (internship)       Jun - Sep 2026
EUTECH Engineers, Rome, Italy
  - Windows and Linux administration: virtual machines, Active
    Directory, DHCP/DNS, mail server, OS installation.
  - Vulnerability scanning and technical reporting.
  - Tools: MySQL, WordPress, Docker, Nagios, GitHub.

Network & Security Technician (internship)          Jun - Aug 2025
Orange | Fiber-optic deployment, Bourg-en-Bresse, France
  - Traffic analysis and anomaly detection with Wireshark on the
    fiber-optic infrastructure.
  - Configured VLANs and Cisco firewall rules to segment and
    secure network flows.
  - Log correlation to identify incidents and strengthen the
    network's defensive posture.

IT Technician (internship)                          Jun - Sep 2023
Ministry of Equipment, Transport and Logistics, Morocco
  - Deployed and hardened 20+ workstations (OS, software, security
    best practices).
  - On-site support, incident resolution and knowledge-base
    documentation.
`;

export const EDUCATION = `
Education
=========

Engineering degree, Computer Science & Networks      2024 - 2027
ESAIP, Angers, France
  Specialization in cybersecurity and networks.

Exchange semester: Cybersecurity & Networks      Feb - Jul 2026
La Salle, Barcelona, Spain

Exchange semester: Computer Science & Security   Feb - Jul 2025
Politechnika Warszawska, Warsaw, Poland
  Software engineering, cryptography, databases,
  computer networks and operating systems.
`;

export const CERTIFICATIONS = `
Certifications & practice
=========================

Certified Ethical Hacker (CEH)       EC-Council      in progress 2026
Google Cybersecurity Certificate     Google          2025
SOC Analyst Path, Top 2%             TryHackMe       since 2024
CTF                                  Hack The Box, Root Me, picoCTF

Profiles
  TryHackMe .. https://tryhackme.com/p/anastagui
  GitHub ..... https://github.com/${CONFIG.github}
  LinkedIn ... ${CONFIG.linkedin}
`;

export const CONTACT = `
Contact
=======
Email ..... ${CONFIG.email}
LinkedIn .. ${CONFIG.linkedin}
GitHub .... https://github.com/${CONFIG.github}
TryHackMe . https://tryhackme.com/p/anastagui

Open to a one-year work-study program (alternance) from
October 2026, in SOC, cybersecurity, systems or networks.
Based in Angers, open to relocation in France. Driving licence.
`;

// ------------------------------ projects --------------------------

export const P_PHISHGUARD = `
PhishGuard-AI | Anti-phishing detection
=======================================
Stack: Python, TypeScript, VirusTotal API, XGBoost

URL scoring and classification into three risk levels (safe,
suspicious, malicious) for non-technical users. Reputation
analysis of URLs and domains via the VirusTotal API to spot
phishing sites and fraudulent domains. The AI version adds
heuristic rules, typosquatting detection, a trained XGBoost
classifier and LLM-based email analysis, with full
authentication and per-user data isolation.

Reproduces a Tier-1 SOC analyst workflow: scoring, alerting
and IOC logging.

Code: https://github.com/${CONFIG.github}/PhishGuard-AI
`;

export const P_SOCLAB = `
SOC Home Lab | SIEM/SOAR homelab (in progress)
==============================================
Stack: Wazuh, TheHive, Shuffle

A virtual SOC that reproduces an enterprise detection pipeline:
detection, investigation and automated response. Controlled
attack scenarios (brute force, SQL injection), multi-source
log correlation and SOAR playbooks to cut manual response time.

Code: https://github.com/${CONFIG.github}/soc-home-lab
`;

export const P_MCP = `
Kali Linux MCP Server
=====================
Stack: Python, FastMCP, Docker, Kali

A dockerized MCP (Model Context Protocol) server exposing 18+
Kali tools (nmap, nikto, sqlmap ...) to AI clients such as
Claude Code, so a penetration test can be driven in natural
language.

Code: https://github.com/${CONFIG.github}/kali-mcp-server
`;

export const P_SECURECRYPT = `
SecureCrypt | End-to-end encryption
===================================
Stack: Node.js, React, AES-GCM, RSA-OAEP

A full-stack web application for end-to-end encryption,
decryption and digital signing from the browser. Industry
standard algorithms (AES-GCM, RSA-OAEP) and a hardened
HTTPS/TLS REST API, built with the OWASP Top 10 in mind.

Code: https://github.com/${CONFIG.github}/encryption-app
`;

export const P_REDTEAM = `
Red Team Shell Framework
========================
Stack: Bash, socat, nc/rlwrap, MITRE ATT&CK

A modular Red Team framework: encrypted reverse shells and
recon / exploitation / post-exploitation phases mapped to
MITRE ATT&CK, to speed up the setup of a penetration test.

Code: https://github.com/${CONFIG.github}/redteam-shell-framework
`;

export const P_ADMIN = `
Admin-Script | Linux & Windows security automation
==================================================
Stack: Bash, PowerShell, Python

A suite of audit and administration scripts for Linux and
Windows Server: user rights, file integrity, log rotation,
incremental backups and network service monitoring.

Code: https://github.com/${CONFIG.github}/admin-script
`;

export const P_PORTFOLIO = `
Kali Desktop Portfolio (this website)
=====================================
Stack: React, Tailwind CSS, Vite, CheerpX

A simulated Kali Linux machine in the browser (boot loader,
login, Xfce-style desktop, window manager, file manager,
editor, document viewer, browser, terminal) plus a REAL Kali
Linux (i386) VM running client-side with CheerpX.

Code: https://github.com/${CONFIG.github}/terminal-portfolio
`;

// ------------------------------- labs -----------------------------

export const L_ENDGAME = `
CTF: Operation Endgame (TryHackMe)
==================================
Full Active Directory domain compromise: Kerberoasting,
abuse of GenericWrite, attack-path mapping with BloodHound
and credential operations with Impacket.
`;

export const L_OWASP = `
Web security labs (OWASP Top 10)
================================
Hands-on exploitation and remediation: CSRF, JWT bypass,
IDOR, broken access control. Tools: Burp Suite, DVWA and
the PortSwigger Web Security Academy.
`;

export const L_SMURF = `
Lab: Smurf attack
=================
ICMP amplification denial-of-service study with hping3,
and the matching mitigations (disabling directed
broadcasts, ingress filtering, rate limiting).
`;

export const README_LABS = `
Labs & CTF
==========
A few hands-on labs and CTF write-ups:

  endgame-ad.txt ..... Active Directory compromise (TryHackMe)
  owasp-web.txt ...... Web security labs (OWASP Top 10)
  smurf-dos.txt ...... ICMP amplification DoS lab

More on my profiles:
  TryHackMe .. https://tryhackme.com/p/anastagui
  GitHub ..... https://github.com/${CONFIG.github}
`;

export const ZSH_HISTORY = `
sudo apt update && sudo apt full-upgrade -y
nmap -sV 10.10.10.0/24
wazuh-control status
cd ~/projects && git push origin main
echo "hire me" > /dev/recruiter
`;

export const FLAG = `
FLAG{y0u_f0und_th3_h1dd3n_f1l3}

Nice recon. Mention this flag when you contact me ;)
`;
