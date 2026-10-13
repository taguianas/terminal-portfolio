Mini CTF
========

hash.txt contains a password hash taken from my "server".

  1. Find the hash type       hashid $(cut -d: -f2 hash.txt)
  2. Crack it                 python3 crack.py hash.txt /usr/share/john/password.lst
  3. Claim the flag           ./unlock.sh <password>

crack.py is a real (tiny) dictionary attack: read it, it is 20 lines.
(john is installed, but it needs timers this browser VM does not have.)

Mention the flag when you contact me ;)
