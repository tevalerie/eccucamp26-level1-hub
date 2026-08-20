#!/usr/bin/env python3
"""
Build the password-gated client portal from ops/clients.json.

Each client's links (bot, repo, profile PDF, podcast) are encrypted with
AES-GCM under a key derived from that client's password. Without the
password the links are not present in the page in any recoverable form —
this is a real lock, not a hidden div.

    python3 ops/build_client_portal.py

Writes clients/index.html. Re-run after editing ops/clients.json.

What this protects, and what it does not
----------------------------------------
Protects: someone who finds the URL cannot see any client's links.
Does NOT protect: once a client has their own links, those Drive files are
"anyone with the link" and can be forwarded. Nor does it stop a client who
knows one password from seeing that one card. Both are fine for a review
portal; neither makes this a vault.
"""
import base64
import html
import json
import os
import pathlib
import secrets

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import hashlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CFG = ROOT / "ops" / "clients.json"
OUT = ROOT / "clients" / "index.html"
ITERATIONS = 200_000


def encrypt(payload: dict, password: str):
    salt = secrets.token_bytes(16)
    iv = secrets.token_bytes(12)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS, 32)
    ct = AESGCM(key).encrypt(iv, json.dumps(payload).encode(), None)
    b64 = lambda b: base64.b64encode(b).decode()
    return {"salt": b64(salt), "iv": b64(iv), "ct": b64(ct)}


def main():
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    cards, blobs, missing = [], {}, []

    for c in cfg["clients"]:
        payload = {k: c.get(k, "") for k in
                   ("bot", "repo", "profile", "podcast", "podcastTitle")}
        for k in ("bot", "repo"):
            if not payload[k]:
                missing.append("%s: %s" % (c["name"], k))
        blobs[c["id"]] = encrypt(payload, c["password"])

        initials = "".join(w[0] for w in html.unescape(c["name"]).split()[:2]).upper()
        thumb = ROOT / "clients" / "thumbs" / ("%s.png" % c["id"])
        art = ('<img src="thumbs/%s.png" alt="">' % c["id"] if thumb.exists()
               else '<span class="init">%s</span>' % initials)

        cards.append(
            '<article class="card locked" data-id="%s" style="--accent:%s">'
            '  <button class="shot" aria-label="Unlock %s">%s'
            '    <span class="veil"><span class="lockicon">&#128274;</span>'
            '    <span class="lockword">Locked</span></span>'
            '  </button>'
            '  <div class="meta">'
            '    <h3>%s</h3>'
            '    <p class="by">Built by <b>%s</b></p>'
            '    <p class="terr">%s &middot; %s</p>'
            '    <button class="unlock">Unlock</button>'
            '    <form class="pw" hidden>'
            '      <label>Password'
            '        <input type="password" autocomplete="off" spellcheck="false" required>'
            '      </label>'
            '      <button type="submit">Open</button>'
            '      <p class="err" hidden>That password did not work. Check with the camp team.</p>'
            '    </form>'
            '    <div class="links" hidden></div>'
            '  </div>'
            '</article>'
            % (c["id"], c["accent"], html.unescape(c["name"]), art,
               c["name"], c["team"], c["territory"], c["sector"])
        )

    page = TEMPLATE.replace("__TITLE__", cfg["title"]) \
                   .replace("__SUBTITLE__", cfg["subtitle"]) \
                   .replace("__CARDS__", "\n".join(cards)) \
                   .replace("__BLOBS__", json.dumps(blobs)) \
                   .replace("__ITER__", str(ITERATIONS))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    (OUT.parent / "thumbs").mkdir(exist_ok=True)
    OUT.write_text(page, encoding="utf-8")

    print("wrote %s (%d bytes, %d clients)"
          % (OUT.relative_to(ROOT), len(page.encode()), len(cfg["clients"])))
    print("\npasswords — send each client only their own:")
    for c in cfg["clients"]:
        print("  %-24s %s" % (html.unescape(c["name"]), c["password"]))
    if missing:
        print("\nstill blank (renders as 'coming soon', not a dead link):")
        for m in missing:
            print("  -", m)


TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>__TITLE__ — ECCU GenAI &amp; Python Camp 2026</title>
<style>
:root{--bg:#0d1420;--panel:#141d2e;--line:#243149;--ink:#e8eef8;--mute:#8fa0bd;
 --teal:#2fb5a8;--accent:#7C6CF0}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
 background:var(--bg);color:var(--ink);line-height:1.6}
header{border-bottom:1px solid var(--line);padding:18px 24px}
header .in{max-width:1080px;margin:0 auto;display:flex;align-items:center;gap:14px}
.badge{width:44px;height:44px;border-radius:12px;flex:none;display:flex;align-items:center;
 justify-content:center;font-weight:800;font-size:15px;color:#08121f;
 background:linear-gradient(135deg,var(--teal),#7C6CF0)}
header h1{margin:0;font-size:19px}
header p{margin:2px 0 0;color:var(--mute);font-size:13.5px}
.wrap{max-width:1080px;margin:0 auto;padding:30px 24px 70px}
.lock-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid #1f5c55;
 background:#11302e;color:var(--teal);border-radius:22px;padding:6px 15px;font-size:12px;
 font-weight:800;letter-spacing:.08em;text-transform:uppercase}
h2{margin:16px 0 8px;font-size:31px;line-height:1.2}
.lede{color:var(--mute);font-size:16px;max-width:660px;margin:0 0 24px}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:32px}
@media(max-width:760px){.steps{grid-template-columns:1fr}}
.step{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:14px 17px}
.step .n{width:26px;height:26px;border-radius:50%;background:#11302e;color:var(--teal);
 display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;margin-bottom:8px}
.step h4{margin:0 0 3px;font-size:14.5px}
.step p{margin:0;color:var(--mute);font-size:13.4px}
.rule{display:flex;align-items:center;gap:14px;color:var(--mute);font-size:11.5px;
 letter-spacing:.1em;text-transform:uppercase;font-weight:800;margin-bottom:16px}
.rule:after{content:"";flex:1;height:1px;background:var(--line)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:760px){.grid{grid-template-columns:1fr}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:15px;overflow:hidden;
 border-top:3px solid var(--accent)}
.shot{display:block;width:100%;height:190px;border:0;padding:0;cursor:pointer;position:relative;
 background:linear-gradient(140deg,color-mix(in srgb,var(--accent) 34%,#0d1420),#0d1420)}
.shot img{width:100%;height:100%;object-fit:cover;display:block;
 filter:grayscale(1) brightness(.38) blur(3px);transform:scale(1.04);transition:filter .45s,transform .45s}
.shot .init{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
 font-size:52px;font-weight:800;color:color-mix(in srgb,var(--accent) 55%,#ffffff);opacity:.22;
 filter:blur(2px);transition:filter .45s,opacity .45s}
.card.open .shot .init{filter:none;opacity:.4}
.veil{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
 justify-content:center;gap:8px;
 background:linear-gradient(180deg,rgba(8,14,26,.55),rgba(8,14,26,.78))}
.lockicon{width:52px;height:52px;border-radius:50%;border:2px solid var(--teal);
 display:flex;align-items:center;justify-content:center;font-size:22px;background:rgba(17,48,46,.75)}
.lockword{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#cfe}
.card.open .veil{display:none}
.card.open .shot img{filter:none;transform:none}
.meta{padding:16px 18px 18px}
.meta h3{margin:0;font-size:19px;color:var(--accent)}
.by{margin:4px 0 0;font-size:14px;color:var(--ink)}
.by b{color:var(--ink)}
.terr{margin:2px 0 12px;font-size:13px;color:var(--mute)}
button{font-family:inherit}
.unlock{background:transparent;border:1px solid var(--teal);color:var(--teal);border-radius:9px;
 padding:9px 16px;font-size:13.5px;font-weight:700;cursor:pointer}
.unlock:hover{background:#11302e}
.pw{margin-top:6px}
.pw label{display:block;font-size:12px;color:var(--mute);margin-bottom:6px}
.pw input{width:100%;margin-top:5px;background:#0b1220;border:1px solid var(--line);color:var(--ink);
 border-radius:9px;padding:10px 12px;font-size:14px;font-family:inherit}
.pw input:focus{outline:0;border-color:var(--teal)}
.pw button{margin-top:9px;background:var(--teal);border:0;color:#08121f;border-radius:9px;
 padding:9px 18px;font-weight:800;font-size:13.5px;cursor:pointer}
.err{color:#ff9d9d;font-size:13px;margin:9px 0 0}
.links{display:flex;flex-direction:column;gap:9px}
.links a,.links .soon{display:flex;align-items:center;gap:10px;text-decoration:none;
 background:#0b1220;border:1px solid var(--line);border-radius:10px;padding:11px 13px;
 color:var(--ink);font-size:14px;font-weight:600}
.links a:hover{border-color:var(--accent)}
.links .soon{color:var(--mute);font-weight:400;font-style:italic}
.links .ic{width:26px;text-align:center;font-size:15px;flex:none}
.links .sub{display:block;font-weight:400;font-size:12.8px;color:var(--mute);
 font-style:italic;margin-top:2px;line-height:1.35}
.links a{align-items:flex-start}
.media{margin-top:11px;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.media iframe{display:block;width:100%;border:0}
.note{margin-top:30px;background:var(--panel);border:1px solid var(--line);border-radius:13px;
 padding:15px 18px;color:var(--mute);font-size:13.4px}
.note b{color:var(--ink)}
footer{max-width:1080px;margin:0 auto;padding:0 24px 50px;color:var(--mute);font-size:13px;
 text-align:center;border-top:1px solid var(--line);padding-top:22px}
footer .fine{font-size:11.8px;opacity:.75}
</style>
</head>
<body>
<header><div class="in">
  <div class="badge">EC</div>
  <div><h1>__TITLE__</h1><p>__SUBTITLE__</p></div>
</div></header>

<div class="wrap">
  <span class="lock-pill">&#128274; Private — password required</span>
  <h2>See what your team built</h2>
  <p class="lede">Each organisation below has a chatbot built for it by a team at the ECCU
  GenAI &amp; Python Camp 2026. Your bot, its code, your profile and your podcast are locked
  until you enter your password.</p>

  <div class="steps">
    <div class="step"><div class="n">1</div><h4>Find your organisation</h4>
      <p>Look for your name on one of the cards below.</p></div>
    <div class="step"><div class="n">2</div><h4>Click the card</h4>
      <p>Click the image, or the Unlock button.</p></div>
    <div class="step"><div class="n">3</div><h4>Enter your password</h4>
      <p>Use the password the camp team sent you.</p></div>
  </div>

  <div class="rule">Click your organisation to unlock</div>
  <div class="grid">
__CARDS__
  </div>

  <div class="note"><b>A note on the lock.</b> Each card's links are encrypted with its own
  password. Nothing about your bot, your code or your files exists on this page until the
  correct password is entered — so a stray visitor sees nothing. Once you are in, the links are
  yours to keep.</div>
</div>

<footer>ECCU GenAI Camp 2026 &middot; Kittivisianwood AI Studio<br>
<span class="fine">Chatbot Division &middot; this page is unlisted and not indexed by search engines.</span></footer>

<script>
var BLOBS = __BLOBS__, ITER = __ITER__;
var b642buf = function (s) {
  var raw = atob(s), a = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) a[i] = raw.charCodeAt(i);
  return a;
};

async function unlock(id, password) {
  var b = BLOBS[id];
  var base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password),
    "PBKDF2", false, ["deriveKey"]);
  var key = await crypto.subtle.deriveKey(
    {name: "PBKDF2", salt: b642buf(b.salt), iterations: ITER, hash: "SHA-256"},
    base, {name: "AES-GCM", length: 256}, false, ["decrypt"]);
  var plain = await crypto.subtle.decrypt({name: "AES-GCM", iv: b642buf(b.iv)},
    key, b642buf(b.ct));
  return JSON.parse(new TextDecoder().decode(plain));
}

function render(card, data) {
  var box = card.querySelector(".links"), h = "";
  h += data.bot
    ? '<a href="' + data.bot + '" target="_blank" rel="noopener"><span class="ic">&#128172;</span>Open the chatbot</a>'
    : '<span class="soon"><span class="ic">&#128172;</span>Chatbot link coming</span>';
  h += data.repo
    ? '<a href="' + data.repo + '" target="_blank" rel="noopener"><span class="ic">&#128187;</span>View the code on GitHub</a>'
    : '<span class="soon"><span class="ic">&#128187;</span>Code link coming</span>';
  if (data.profile)
    h += '<a href="https://drive.google.com/file/d/' + data.profile + '/view" target="_blank" rel="noopener"><span class="ic">&#128196;</span>Client profile (PDF)</a>'
       + '<div class="media"><iframe src="https://drive.google.com/file/d/' + data.profile + '/preview" height="380" allow="autoplay"></iframe></div>';
  if (data.podcast)
    h += '<a href="https://drive.google.com/file/d/' + data.podcast + '/view" target="_blank" rel="noopener">'
       + '<span class="ic">&#127911;</span><span>Podcast (audio)'
       + (data.podcastTitle ? '<span class="sub">' + data.podcastTitle + '</span>' : '')
       + '</span></a>'
       + '<div class="media"><iframe src="https://drive.google.com/file/d/' + data.podcast + '/preview" height="80" allow="autoplay"></iframe></div>';
  box.innerHTML = h;
  box.hidden = false;
  card.classList.remove("locked");
  card.classList.add("open");
  card.querySelector(".pw").hidden = true;
  card.querySelector(".unlock").hidden = true;
}

document.querySelectorAll(".card").forEach(function (card) {
  var id = card.dataset.id,
      form = card.querySelector(".pw"),
      input = form.querySelector("input"),
      err = form.querySelector(".err");

  function reveal() {
    if (card.classList.contains("open")) return;
    form.hidden = false;
    card.querySelector(".unlock").hidden = true;
    input.focus();
  }
  card.querySelector(".unlock").addEventListener("click", reveal);
  card.querySelector(".shot").addEventListener("click", reveal);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    err.hidden = true;
    try {
      var data = await unlock(id, input.value);
      try { sessionStorage.setItem("cp-" + id, input.value); } catch (x) {}
      render(card, data);
    } catch (x) {
      err.hidden = false;
      input.select();
    }
  });

  // stay unlocked while this tab is open, so a refresh is not a re-login
  try {
    var saved = sessionStorage.getItem("cp-" + id);
    if (saved) unlock(id, saved).then(function (d) { render(card, d); }).catch(function () {});
  } catch (x) {}
});
</script>
</body>
</html>
"""

if __name__ == "__main__":
    main()
