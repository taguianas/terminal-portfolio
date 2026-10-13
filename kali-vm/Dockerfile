# ------------------------------------------------------------------
#  Real Kali Linux for the browser.
#  Built as a 32-bit (i386) image because CheerpX, the engine that
#  runs it inside the visitor's browser, only runs 32-bit x86 code.
#  Built and published by .github/workflows/kali-vm-image.yml
# ------------------------------------------------------------------
FROM --platform=linux/386 docker.io/kalilinux/kali-rolling

ARG DEBIAN_FRONTEND=noninteractive

# Base system: Kali's own zsh prompt and defaults
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      kali-defaults zsh zsh-autosuggestions zsh-syntax-highlighting \
      sudo ca-certificates less nano vim file procps man-db

# Tools. Installed one at a time so that a package that no longer
# exists for i386 is skipped instead of breaking the whole build.
COPY packages.txt /tmp/packages.txt
RUN for p in $(grep -v '^\s*#' /tmp/packages.txt); do \
      apt-get install -y --no-install-recommends "$p" || echo "$p" >> /tmp/skipped.txt; \
    done; \
    echo "---- skipped packages ----"; cat /tmp/skipped.txt 2>/dev/null || echo none; \
    apt-get clean && rm -rf /var/lib/apt/lists/* /usr/share/doc/* /tmp/packages.txt

# The default Kali user (password: kali), with sudo like on a real install
RUN useradd -m -s /bin/zsh -G sudo kali && \
    echo 'kali:kali' | chpasswd && echo 'root:kali' | chpasswd && \
    echo 'kali ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/kali && chmod 440 /etc/sudoers.d/kali

# Portfolio files (generated from src/data/fs.js by export-home.mjs)
COPY --chown=1000:1000 home/ /home/kali/
COPY --chown=1000:1000 challenges/ /home/kali/challenges/
COPY motd /etc/motd
RUN chmod +x /home/kali/challenges/unlock.sh && \
    echo 'cat /etc/motd' > /home/kali/.zlogin && chown 1000:1000 /home/kali/.zlogin

WORKDIR /home/kali
ENV HOME=/home/kali USER=kali SHELL=/bin/zsh TERM=xterm-256color LANG=C.UTF-8
CMD ["/bin/zsh", "-l"]
