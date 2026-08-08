#!/usr/bin/env python3
"""
Generate ElevenLabs narration for the Agentic RAG build-along lab.

Reads the narration lines straight out of labs/agentic-rag.html, so the audio
can never drift from the text on screen. Each line is content-hashed, so a
re-run only spends credits on lines that actually changed.

    python3 ops/gen_lab_audio.py --balance       # characters left this month
    python3 ops/gen_lab_audio.py --list          # show available voices
    python3 ops/gen_lab_audio.py --dry-run       # cost estimate, spends nothing
    python3 ops/gen_lab_audio.py                 # generate what is missing
    python3 ops/gen_lab_audio.py --voice <id>    # use a specific voice
    python3 ops/gen_lab_audio.py --model <id>    # default is multilingual v2

Model choice: latency does not matter here, because every clip is generated
once and served as a static file. Pay for quality, not speed.

    eleven_multilingual_v2   $0.10 / 1K chars   <- default, best quality
    eleven_flash_v2_5        $0.05 / 1K chars   half price, slightly thinner

The API key lives in ~/.elevenlabs-api-key (chmod 600). It is never printed
and never written into the repo.
"""
import hashlib
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
LAB = ROOT / "labs" / "agentic-rag.html"
AUDIO = ROOT / "labs" / "audio"
MANIFEST = AUDIO / "manifest.json"
KEYFILE = pathlib.Path.home() / ".elevenlabs-api-key"

API = "https://api.elevenlabs.io/v1"
MODEL = "eleven_multilingual_v2"
# Annakay is a library voice, so it needs Starter or above. On the Free plan
# it returns 402 and the only Caribbean fallback is Aura (Hx7SBPuH2w11Pf8ETM84).
DEFAULT_VOICE = "RRIjxt3K1iKEkfsLGRXU"      # Annakay — Jamaican, young, upbeat
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")


def key():
    if not KEYFILE.exists():
        sys.exit(
            "No API key found.\n\n"
            "  1. Get one at https://elevenlabs.io -> Profile -> API Key\n"
            "  2. Save it:   printf '%s' 'YOUR_KEY' > ~/.elevenlabs-api-key\n"
            "  3. Lock it:   chmod 600 ~/.elevenlabs-api-key\n"
        )
    return KEYFILE.read_text().strip()


def api(path, data=None, raw=False):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(data).encode() if data else None,
        headers={"xi-api-key": key(), "User-Agent": UA,
                 **({"Content-Type": "application/json"} if data else {})},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read() if raw else json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:300]
        if e.code == 401:
            if "user_read" in body or "models_read" in body:
                raise PermissionError(body)
            sys.exit("401 Unauthorized — the key in ~/.elevenlabs-api-key was rejected.")
        if e.code == 429:
            sys.exit("429 — out of credits, or rate limited. Check your quota.")
        sys.exit("HTTP %s from ElevenLabs: %s" % (e.code, body))


def narration():
    """Pull the tutor's lines out of the lab, in the order they are spoken."""
    html = LAB.read_text(encoding="utf-8")
    intro = json.loads(re.search(r"var STEP_INTRO = (\[.*?\]);\n", html, re.S).group(1))
    beats = json.loads(re.search(r"var STEP_BEATS = (\[.*?\]);\nvar STEP_INTRO",
                                 html, re.S).group(1))
    lines = []
    for i, text in enumerate(intro):
        lines.append({"id": "intro-%02d" % i, "step": i + 1, "cue": None, "text": text})
    for i, step in enumerate(beats):
        for j, (cue, text) in enumerate(step):
            lines.append({"id": "beat-%02d-%d" % (i, j), "step": i + 1,
                          "cue": cue, "text": text})
    for ln in lines:
        ln["hash"] = hashlib.sha1(ln["text"].encode("utf-8")).hexdigest()[:12]
        ln["file"] = "%s-%s.mp3" % (ln["id"], ln["hash"])
    return lines


def main():
    args = sys.argv[1:]
    voice = DEFAULT_VOICE
    if "--voice" in args:
        voice = args[args.index("--voice") + 1]
    model = MODEL
    if "--model" in args:
        model = args[args.index("--model") + 1]

    if "--balance" in args:
        try:
            sub = api("/user/subscription")
        except PermissionError:
            need = sum(len(l["text"]) for l in narration())
            print("This key cannot read your quota (no 'user_read' permission).")
            print("That is fine \u2014 it only blocks this check, not generation.\n")
            print("this job : %s characters" % format(need, ","))
            print("Check the balance in the ElevenLabs dashboard, or just run --dry-run.")
            return
        used = sub.get("character_count", 0)
        cap = sub.get("character_limit", 0)
        left = max(0, cap - used)
        need = sum(len(l["text"]) for l in narration())
        print("tier      : %s" % sub.get("tier", "?"))
        print("used      : %s of %s characters" % (format(used, ","), format(cap, ",")))
        print("remaining : %s characters" % format(left, ","))
        print("this job  : %s characters" % format(need, ","))
        print()
        if left >= need:
            print("ENOUGH — you can generate the whole lab without topping up.")
        else:
            print("SHORT by %s characters. Top up, or wait for the monthly reset."
                  % format(need - left, ","))
        if sub.get("next_character_count_reset_unix"):
            import datetime
            r = datetime.datetime.fromtimestamp(sub["next_character_count_reset_unix"])
            print("allowance resets: %s" % r.strftime("%d %b %Y"))
        return

    if "--list" in args:
        for v in api("/voices")["voices"]:
            labels = v.get("labels", {})
            print("%-24s %-18s %s" % (
                v["voice_id"], v["name"],
                ", ".join("%s=%s" % kv for kv in sorted(labels.items()))))
        return

    lines = narration()
    AUDIO.mkdir(parents=True, exist_ok=True)
    have = {p.name for p in AUDIO.glob("*.mp3")}
    todo = [l for l in lines if l["file"] not in have]
    chars = sum(len(l["text"]) for l in todo)

    print("clips total   : %d" % len(lines))
    print("already built : %d" % (len(lines) - len(todo)))
    rate = 0.05 if "flash" in model or "turbo" in model else 0.10
    print("model         : %s" % model)
    print("to generate   : %d  (%s characters ~= $%.2f)"
          % (len(todo), format(chars, ","), chars / 1000 * rate))

    if "--dry-run" in args:
        print("\ndry run — nothing spent, nothing written.")
        return
    if not todo:
        print("\nnothing to do; writing manifest only.")
    else:
        print("\nvoice: %s | model: %s\n" % (voice, model))
        for n, ln in enumerate(todo, 1):
            audio = api("/text-to-speech/%s" % voice,
                        {"text": ln["text"], "model_id": model,
                         "voice_settings": {"stability": 0.45,
                                            "similarity_boost": 0.75,
                                            "style": 0.0,
                                            "use_speaker_boost": True}},
                        raw=True)
            (AUDIO / ln["file"]).write_bytes(audio)
            print("  [%2d/%2d] %-22s %5d B  %s"
                  % (n, len(todo), ln["file"][:22], len(audio), ln["text"][:44]))

    MANIFEST.write_text(json.dumps(
        {"voice": voice, "model": model,
         "clips": [{"id": l["id"], "step": l["step"], "cue": l["cue"],
                    "file": l["file"]} for l in lines]},
        indent=1))

    stale = have - {l["file"] for l in lines}
    for f in stale:
        (AUDIO / f).unlink()
    total = sum(p.stat().st_size for p in AUDIO.glob("*.mp3"))
    print("\nmanifest : %s" % MANIFEST.relative_to(ROOT))
    print("removed  : %d stale clip(s)" % len(stale))
    print("total    : %.1f MB across %d clips"
          % (total / 1e6, len(list(AUDIO.glob("*.mp3")))))


if __name__ == "__main__":
    main()
