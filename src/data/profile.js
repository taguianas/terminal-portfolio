// ---------------------------------------------------------------
//  Recruiter profile (FR / EN).
//  Source of truth: Anas's CV (October 2026). Keep it in sync with
//  public/resume.pdf. Nothing here may be invented.
// ---------------------------------------------------------------

export const PROFILE = {
  name: 'Anas Tagui',
  photo: '/photo.jpg',
  email: 'atagui.ir2027@esaip.org',
  links: {
    linkedin: 'https://www.linkedin.com/in/taguianas',
    github: 'https://github.com/taguianas',
    tryhackme: 'https://tryhackme.com/p/anastagui',
  },
  resume: '/resume.pdf',

  fr: {
    title: 'Étudiant ingénieur en cybersécurité',
    focus: 'SOC · Blue Team · Sécurité offensive',
    availability: "Recherche une alternance d'un an · Dès octobre 2026",
    location: 'Angers · Mobilité France · Permis B',
    about:
      "Étudiant ingénieur en 4e année à l'ESAIP (Informatique & Réseaux), spécialisé en cybersécurité et réseaux. " +
      "Orienté Blue Team et SOC : détection de menaces, réponse aux incidents, SIEM/SOAR (Wazuh, Splunk, TheHive, Shuffle), " +
      "avec une vraie pratique offensive en CTF et en labs. Ce qui me motive : comprendre un système en profondeur pour mieux le protéger. " +
      "Curieux, rigoureux et orienté service, je cherche une alternance d'un an pour contribuer à des projets concrets.",
    facts: [
      ['4e année', "Cycle ingénieur ESAIP"],
      ['3 stages', 'Systèmes, réseau et support'],
      ['Top 2 %', 'TryHackMe'],
      ['CEH', 'EC-Council (en cours)'],
    ],
  },
  en: {
    title: 'Cybersecurity Engineering Student',
    focus: 'SOC · Blue Team · Offensive security',
    availability: 'Looking for a 1-year work-study (alternance) · From October 2026',
    location: 'Angers, France · Open to relocation in France · Driving licence',
    about:
      'Fourth-year engineering student at ESAIP (Computer Science & Networks), specializing in cybersecurity and networks. ' +
      'Focused on Blue Team and SOC work: threat detection, incident response, SIEM/SOAR (Wazuh, Splunk, TheHive, Shuffle), ' +
      'with hands-on offensive practice through CTFs and labs. What drives me: understanding a system in depth to protect it better. ' +
      'Curious, rigorous and service-minded, I am looking for a one-year work-study position to contribute to real projects.',
    facts: [
      ['4th year', 'ESAIP engineering program'],
      ['3 internships', 'Systems, network and support'],
      ['Top 2%', 'TryHackMe'],
      ['CEH', 'EC-Council (in progress)'],
    ],
  },

  experience: [
    {
      fr: { role: 'Administrateur Systèmes & Sécurité (stage)', date: 'Juin à sept. 2026' },
      en: { role: 'Systems & Security Administrator (internship)', date: 'Jun to Sep 2026' },
      company: 'EUTECH Engineers',
      place: { fr: 'Rome, Italie', en: 'Rome, Italy' },
      points: {
        fr: [
          'Administration Windows et Linux : machines virtuelles, Active Directory, DHCP/DNS, serveur mail, installation d’OS.',
          'Scans de vulnérabilités et rédaction de rapports techniques.',
        ],
        en: [
          'Windows and Linux administration: virtual machines, Active Directory, DHCP/DNS, mail server, OS installation.',
          'Vulnerability scanning and technical reporting.',
        ],
      },
      tags: ['Active Directory', 'DNS/DHCP', 'Docker', 'Nagios', 'MySQL', 'WordPress'],
    },
    {
      fr: { role: 'Technicien Réseau & Sécurité (stage)', date: 'Juin à août 2025' },
      en: { role: 'Network & Security Technician (internship)', date: 'Jun to Aug 2025' },
      company: 'Orange · Déploiement fibre optique',
      place: { fr: 'Bourg-en-Bresse, France', en: 'Bourg-en-Bresse, France' },
      points: {
        fr: [
          'Analyse du trafic et détection d’anomalies avec Wireshark sur l’infrastructure fibre optique.',
          'Configuration de VLANs et de règles de pare-feu Cisco pour segmenter et sécuriser les flux.',
          'Corrélation de logs pour identifier les incidents et renforcer la posture défensive du réseau.',
        ],
        en: [
          'Traffic analysis and anomaly detection with Wireshark on the fiber-optic infrastructure.',
          'Configured VLANs and Cisco firewall rules to segment and secure network flows.',
          'Log correlation to identify incidents and strengthen the network’s defensive posture.',
        ],
      },
      tags: ['Wireshark', 'Cisco', 'VLAN', 'Firewall', 'Logs'],
    },
    {
      fr: { role: 'Technicien Informatique (stage)', date: 'Juin à sept. 2023' },
      en: { role: 'IT Technician (internship)', date: 'Jun to Sep 2023' },
      company: 'Ministère de l’Équipement, du Transport et de la Logistique',
      place: { fr: 'Maroc', en: 'Morocco' },
      points: {
        fr: [
          'Déploiement et durcissement de plus de 20 postes de travail (OS, logiciels, bonnes pratiques de sécurité).',
          'Support de proximité, résolution d’incidents et rédaction de fiches pour la base de connaissances IT.',
        ],
        en: [
          'Deployed and hardened 20+ workstations (OS, software, security best practices).',
          'On-site support, incident resolution and knowledge-base documentation.',
        ],
      },
      tags: ['Windows', 'Hardening', 'Support'],
    },
  ],

  projects: [
    {
      name: 'PhishGuard-AI',
      repo: 'https://github.com/taguianas/PhishGuard-AI',
      fr: 'Détection anti-phishing : scoring et classification d’URLs (sûre, suspecte, malveillante) via l’API VirusTotal, heuristiques, détection de typosquatting et classificateur XGBoost.',
      en: 'Anti-phishing detection: URL scoring and classification (safe, suspicious, malicious) with the VirusTotal API, heuristics, typosquatting detection and an XGBoost classifier.',
      stack: ['Python', 'TypeScript', 'VirusTotal API', 'XGBoost'],
      kind: 'Blue Team',
    },
    {
      name: 'SOC Home Lab',
      repo: 'https://github.com/taguianas/soc-home-lab',
      fr: 'SOC virtuel (en cours) : détection, investigation et réponse automatisée, scénarios d’attaques contrôlées (brute-force, injection SQL), corrélation multi-sources et playbooks SOAR.',
      en: 'Virtual SOC (in progress): detection, investigation and automated response, controlled attack scenarios (brute force, SQL injection), multi-source correlation and SOAR playbooks.',
      stack: ['Wazuh', 'TheHive', 'Shuffle'],
      kind: 'Blue Team',
    },
    {
      name: 'Kali Linux MCP Server',
      repo: 'https://github.com/taguianas/kali-mcp-server',
      fr: 'Serveur MCP dockerisé exposant plus de 18 outils Kali (nmap, nikto, sqlmap…) à des clients IA pour mener des tests d’intrusion en langage naturel.',
      en: 'Dockerized MCP server exposing 18+ Kali tools (nmap, nikto, sqlmap…) to AI clients to run penetration tests in natural language.',
      stack: ['Python', 'FastMCP', 'Docker', 'Kali'],
      kind: 'Offensive',
    },
    {
      name: 'SecureCrypt',
      repo: 'https://github.com/taguianas/encryption-app',
      fr: 'Application de chiffrement de bout en bout (AES-GCM, RSA-OAEP) avec API REST durcie en HTTPS/TLS, conçue en tenant compte de l’OWASP Top 10.',
      en: 'End-to-end encryption app (AES-GCM, RSA-OAEP) with a hardened HTTPS/TLS REST API, built with the OWASP Top 10 in mind.',
      stack: ['Node.js', 'React', 'AES-GCM', 'RSA'],
      kind: 'AppSec',
    },
    {
      name: 'Red Team Shell Framework',
      repo: 'https://github.com/taguianas/redteam-shell-framework',
      fr: 'Framework Red Team modulaire : reverse shells chiffrés, phases de reconnaissance, exploitation et post-exploitation alignées sur MITRE ATT&CK.',
      en: 'Modular Red Team framework: encrypted reverse shells, recon, exploitation and post-exploitation phases mapped to MITRE ATT&CK.',
      stack: ['Bash', 'socat', 'MITRE ATT&CK'],
      kind: 'Offensive',
    },
    {
      name: 'Admin-Script',
      repo: 'https://github.com/taguianas/admin-script',
      fr: 'Scripts d’audit et d’administration Linux et Windows Server : droits utilisateurs, intégrité des fichiers, rotation des logs.',
      en: 'Audit and administration scripts for Linux and Windows Server: user rights, file integrity, log rotation.',
      stack: ['Bash', 'PowerShell', 'Python'],
      kind: 'SysAdmin',
    },
  ],

  skills: [
    { fr: 'SIEM / SOAR / CTI', en: 'SIEM / SOAR / CTI', items: ['Wazuh', 'Splunk', 'TheHive', 'Shuffle', 'MISP', 'OpenCTI', 'VirusTotal', 'AbuseIPDB'] },
    { fr: 'Pentest & offensif', en: 'Pentest & offensive', items: ['Metasploit', 'Burp Suite', 'Nmap', 'Nessus', 'OpenVAS', 'Hydra', 'Netcat'] },
    { fr: 'Réseau & services', en: 'Networking', items: ['TCP/IP', 'DNS', 'DHCP', 'VLAN', 'Pare-feu', 'Wireshark', 'Cisco'] },
    { fr: 'Systèmes & infrastructure', en: 'Systems & infrastructure', items: ['Linux / Kali', 'Windows Server', 'Active Directory', 'Docker', 'Kubernetes'] },
    { fr: 'Forensique & malware', en: 'Forensics & malware', items: ['Ghidra', 'x64dbg', 'Autopsy'] },
    { fr: 'Développement & scripting', en: 'Development & scripting', items: ['Python', 'Bash', 'PowerShell', 'JavaScript', 'Java'] },
    { fr: 'Référentiels', en: 'Frameworks', items: ['MITRE ATT&CK', 'OWASP Top 10', 'ISO 27001', 'NIST'] },
  ],

  education: [
    { fr: 'Cycle ingénieur Informatique & Réseaux', en: 'Engineering degree, Computer Science & Networks', school: 'ESAIP', place: { fr: 'Angers, France', en: 'Angers, France' }, date: '2024 - 2027' },
    { fr: 'Échange international : Cybersécurité & Réseaux', en: 'Exchange semester: Cybersecurity & Networks', school: 'La Salle', place: { fr: 'Barcelone, Espagne', en: 'Barcelona, Spain' }, date: { fr: 'Fév. à juil. 2026', en: 'Feb to Jul 2026' } },
    { fr: 'Échange international : Informatique & Sécurité', en: 'Exchange semester: Computer Science & Security', school: 'Politechnika Warszawska', place: { fr: 'Varsovie, Pologne', en: 'Warsaw, Poland' }, date: { fr: 'Fév. à juil. 2025', en: 'Feb to Jul 2025' } },
  ],

  certifications: [
    { name: 'Certified Ethical Hacker (CEH)', by: 'EC-Council', status: { fr: 'En cours · 2026', en: 'In progress · 2026' } },
    { name: 'Google Cybersecurity Certificate', by: 'Google', status: { fr: '2025', en: '2025' } },
    { name: 'SOC Analyst Path · Top 2 %', by: 'TryHackMe', status: { fr: 'Depuis 2024', en: 'Since 2024' } },
    { name: 'CTF', by: 'Hack The Box · Root Me · picoCTF', status: { fr: 'Pratique régulière', en: 'Regular practice' } },
  ],

  languages: {
    fr: [['Arabe', 'Natif'], ['Français', 'Natif'], ['Anglais', 'Courant'], ['Espagnol', 'Intermédiaire']],
    en: [['Arabic', 'Native'], ['French', 'Native'], ['English', 'Fluent'], ['Spanish', 'Intermediate']],
  },
  interests: {
    fr: ['Taekwondo (ceinture noire)', 'Snooker', 'Veille cybersécurité (CTF, blogs spécialisés)'],
    en: ['Taekwondo (black belt)', 'Snooker', 'Cybersecurity watch (CTFs, specialized blogs)'],
  },
};

export const UI = {
  fr: {
    nav: ['Profil', 'Expérience', 'Projets', 'Compétences', 'Formation'],
    download: 'Télécharger le CV',
    contact: 'Me contacter',
    about: 'Profil',
    experience: 'Expérience professionnelle',
    projects: 'Projets',
    projectsSub: 'Code source public sur GitHub',
    skills: 'Compétences techniques',
    education: 'Formation',
    certs: 'Certifications & pratique',
    languages: 'Langues',
    interests: 'Centres d’intérêt',
    viewCode: 'Voir le code',
    explore: 'Explorer le bureau Kali',
    exploreSub: 'Ce portfolio est aussi une machine Kali Linux interactive, avec une vraie VM Kali dans le navigateur.',
    print: 'Imprimer / PDF',
    back: 'Bureau Kali',
    ctaTitle: 'Discutons de votre alternance',
    ctaText: 'Disponible pour un entretien, en présentiel à Angers ou en visio.',
  },
  en: {
    nav: ['About', 'Experience', 'Projects', 'Skills', 'Education'],
    download: 'Download resume',
    contact: 'Contact me',
    about: 'About',
    experience: 'Experience',
    projects: 'Projects',
    projectsSub: 'Source code public on GitHub',
    skills: 'Technical skills',
    education: 'Education',
    certs: 'Certifications & practice',
    languages: 'Languages',
    interests: 'Interests',
    viewCode: 'View code',
    explore: 'Explore the Kali desktop',
    exploreSub: 'This portfolio is also an interactive Kali Linux machine, with a real Kali VM running in your browser.',
    print: 'Print / PDF',
    back: 'Kali desktop',
    ctaTitle: 'Let’s talk about your work-study position',
    ctaText: 'Available for an interview, in person in Angers or by video call.',
  },
};
