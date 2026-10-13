#!/usr/bin/env python3
"""Tiny dictionary attack against raw MD5 hashes.

usage: python3 crack.py hash.txt /usr/share/john/password.lst
hash.txt lines look like  user:md5hash
"""
import hashlib
import sys

if len(sys.argv) != 3:
    sys.exit(__doc__)

targets = {}
for line in open(sys.argv[1]):
    user, _, h = line.strip().rpartition(":")
    targets[h.lower()] = user or "?"

tried = 0
for word in open(sys.argv[2], errors="ignore"):
    word = word.strip()
    if not word or word.startswith("#!comment"):
        continue
    tried += 1
    h = hashlib.md5(word.encode()).hexdigest()
    if h in targets:
        print(f"[+] {targets.pop(h)}:{word}   (after {tried} tries)")
        if not targets:
            break
else:
    print(f"[-] nothing found in {tried} words")
