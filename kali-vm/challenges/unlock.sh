#!/bin/sh
# Usage: ./unlock.sh <password>
[ -z "$1" ] && { echo "usage: ./unlock.sh <password>"; exit 1; }
if [ "$(printf '%s' "$1" | md5sum | cut -d' ' -f1)" = "$(cut -d: -f2 "$(dirname "$0")/hash.txt")" ]; then
  echo "[+] Access granted."
  echo "    FLAG{r34l_k4l1_1n_th3_br0ws3r}"
else
  echo "[-] Wrong password. Keep cracking."
  exit 1
fi
