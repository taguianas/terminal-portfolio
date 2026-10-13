Mini CTF
========

hash.txt contains a password hash taken from my "server".

  1. Find the hash type        hashid $(cut -d: -f2 hash.txt)
  2. Crack it with john        john --format=raw-md5 hash.txt
  3. Show the result           john --show --format=raw-md5 hash.txt
  4. Claim the flag            ./unlock.sh <password>

Mention the flag when you contact me ;)
