# ------------------------------------------------------------------
#  Real Kali Linux for the browser.
#  Built as a 32-bit (i386) image because CheerpX, the engine that
#  runs it inside the visitor's browser, only runs 32-bit x86 code.
#  Built and published by .github/workflows/kali-vm-image.yml
# ------------------------------------------------------------------
FROM --platform=linux/386 docker.io/kalilinux/kali-rolling

ARG DEBIAN_FRONTEND=noninteractive

# Base system with Kali's defaults (its bash prompt is the same two-line
# prompt as the zsh one). zsh is not used: it hangs on pipes in CheerpX.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      kali-defaults bash-completion ca-certificates less nano vim-tiny file procps man-db

# Tools. Installed one at a time so that a package that no longer
# exists for i386 is skipped instead of breaking the whole build.
COPY packages.txt /tmp/packages.txt
RUN for p in $(grep -v '^\s*#' /tmp/packages.txt); do \
      apt-get install -y --no-install-recommends "$p" || echo "$p" >> /tmp/skipped.txt; \
    done; \
    echo "---- skipped packages ----"; cat /tmp/skipped.txt 2>/dev/null || echo none; \
    apt-get clean && rm -rf /var/lib/apt/lists/* /var/cache/* /tmp/packages.txt \
      /usr/share/doc/* /usr/share/info/* /usr/share/lintian/* && \
    find /usr/share/locale -mindepth 1 -maxdepth 1 ! -name 'en*' ! -name 'locale.alias' -exec rm -rf {} + && \
    find / -xdev -name '__pycache__' -type d -prune -exec rm -rf {} +

# The default Kali user (password: kali)
RUN useradd -m -s /bin/bash kali && \
    echo 'kali:kali' | chpasswd && echo 'root:kali' | chpasswd

# Portfolio files (generated from src/data/fs.js by export-home.mjs)
COPY --chown=1000:1000 home/ /home/kali/
COPY --chown=1000:1000 challenges/ /home/kali/challenges/
COPY motd /etc/motd
COPY bashrc-extra /tmp/bashrc-extra
COPY sudo /usr/local/bin/sudo
RUN cat /tmp/bashrc-extra >> /home/kali/.bashrc && rm /tmp/bashrc-extra && \
    echo 'cat /etc/motd' >> /home/kali/.profile && \
    chmod 755 /usr/local/bin/sudo /home/kali/challenges/unlock.sh /home/kali/challenges/crack.py && \
    chown -R kali:kali /home/kali && chmod 755 /home/kali

WORKDIR /home/kali
ENV HOME=/home/kali USER=kali SHELL=/bin/bash TERM=xterm-256color LANG=C.UTF-8
CMD ["/bin/bash", "--login"]
