/**
 * ECCU Generative AI & Python Summer Camp 2026 — Google Classroom bootstrap
 * ---------------------------------------------------------------------------
 * Personal Gmail accounts cannot create/activate courses via the API
 * (@CourseStateDenied), so the flow is:
 *
 *   STEP A (you, in the Classroom UI · ~4 minutes):
 *     Go to https://classroom.google.com → "+" → Create class → accept the
 *     terms prompt if shown. Create FOUR classes with these names
 *     (any close spelling works — matching is by keyword):
 *       ECCU GenAI & Python Summer Camp 2026 — SKN
 *       ECCU GenAI & Python Summer Camp 2026 — SVG
 *       ECCU GenAI & Python Summer Camp 2026 — Anguilla & Montserrat
 *       ECCU GenAI & Python Summer Camp 2026 — Dominica
 *
 *   STEP B (here, once):
 *     Run  populateAllCohorts  → it finds each class by name keyword and
 *     fills it: Week 1–4 topics, all 20 day materials, the pinned
 *     'Your Studio & Client' material, section/description, co-teacher
 *     invitations. Safe to re-run: already-populated classes are skipped.
 *
 *   STEP C: Run  printJoinMessages  → copy the send-ready join blocks.
 *
 *   Optional: Run  deleteStrayProvisioned  once to remove the invisible
 *   half-created 'SKN' course left over from the earlier failed attempts.
 */

// ── CONFIG ──────────────────────────────────────────────────────────────────

var COHORTS = [
  'SKN',
  'SVG',
  'Anguilla & Montserrat',
  'Dominica'
];

// Optional: co-teachers to invite per cohort. Leave arrays empty to skip.
var CO_TEACHERS = {
  // Owner (tellyonu@gmail.com) creates the courses — no self-invite needed.
  'SKN': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@gmail.com'],
  'SVG': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@gmail.com', 'kelvin.pompey@gmail.com', 'vialey2392@gmail.com'],
  'Anguilla & Montserrat': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@gmail.com', 'the.maxwell.22@gmail.com'],
  'Dominica': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@gmail.com']
};

// AI Studio workspace folders (Drive) + client discovery briefs, per cohort.
// Posted as a pinned 'Your Studio & Client' material in each class.
var STUDIO_LINKS = {
  'SKN': [
    {t:'Sub-Studio A — SCASPA · Pods 1–4 · pod folders', u:'https://drive.google.com/drive/folders/1oBT6L7HoQ7X9xSj31ZGFqHHkvPG47iob?v=4'},
    {t:'SCASPA — client discovery brief', u:'https://drive.google.com/file/d/1NDJSnjdaxLjPntbu0tZEj6J-a-KUgsVw/view'},
    {t:'Sub-Studio B — ASPIRE · Pods 5–8 · pod folders', u:'https://drive.google.com/drive/folders/18I4bkWXZWTrjgpT9IpuJ6l_UimvkHMku?v=5'},
    {t:'ASPIRE — client discovery brief (from your Jul 17 interview)', u:'https://docs.google.com/document/d/17VK5IUDHl2soxOo8OZ2tYwhH138eYfsRjbKgAnNJqLo/view'},
    {t:'ASPIRE — programme website & official FAQs', u:'https://aspire.gov.kn/'},
    {t:'Sub-Studio C — ACB Caribbean · pod folders', u:'https://drive.google.com/drive/folders/1dbnLShHxdyTLIpg-K6KII1mH8hKBMykB'},
    {t:'ACB Caribbean — client discovery brief', u:'https://drive.google.com/file/d/10ocqnYqHAP5xerQAxIGO6nCPWU0KZI9v/view'}
  ],
  'SVG': [
    {t:'Sub-Studio A — NAWASA · Pods 1–6 · pod folders', u:'https://drive.google.com/drive/folders/1Yy3bFfX8uJNDbYsUothPlRHTDHBlzncJ?v=4'},
    {t:'NAWASA — client discovery brief', u:'https://drive.google.com/file/d/155nWhXp0APLqlce2Fop7nzSG0NKCE7yn/view'},
    {t:'Sub-Studio B — IRD Grenada · Pods 7–12 · pod folders', u:'https://drive.google.com/drive/folders/13GpIf64NsniH4bFlHNvgOSvMuaqed409?v=4'},
    {t:'IRD Grenada — client discovery brief', u:'https://drive.google.com/file/d/1GDAmvok28TEDtGVJffXSb_3Ipvc1iqZt/view'}
  ],
  'Anguilla & Montserrat': [
    {t:'Studio — CUB · pod folders', u:'https://drive.google.com/drive/folders/1ri7TP-b-nW_AbQJBVWWWy3eWg-9mRvY-?v=4'},
    {t:'CUB — client discovery brief', u:'https://drive.google.com/file/d/1Hrxh9MqnaiLeBOStbh32ZFwgercsf5R_/view'}
  ],
  'Dominica': [
    {t:'Studio — IRD Anguilla · pod folders', u:'https://drive.google.com/drive/folders/1GV_iceJuq0Blu62ZT-Sw3PVBqC82TFTx?v=4'},
    {t:'IRD Anguilla — client discovery brief', u:'https://drive.google.com/file/d/1RkbYG9zfnqbc8t6PID0Eq2Gfrn9FbHy5/view'}
  ]
};

var COURSE_NAME_PREFIX = 'ECCU GenAI & Python Summer Camp 2026 — ';
var SECTION = 'Level 1 · Chat-bot Edition · Jul 13 – Aug 9 · 9:00am–4:00pm';

var HUB = 'https://eccuaicamp2026.netlify.app';

// Camper-facing materials per week — workbook, deck, special template,
// skeleton code. Facilitator guides/cheat-cards/kits are NOT linked here;
// those live in the Facilitator Room on the hub.
var CAMPER_WEEK = {
  1: [
    {t:'Week 1 Participant Workbook', u:'https://drive.google.com/file/d/1KajAL2nDEEagnOXiWxgxZdAhWjrlBN91/view'},
    {t:'Week 1 Deck (Days 1\u20135)', u:'https://drive.google.com/file/d/15CjpKRmmvyRAsC0A59yKql0KmGjy6lwg/view'},
    {t:'Chatbot Blueprint Template', u:'https://drive.google.com/file/d/1gzuoncAoATA7pxg9Acsbvx-hBOU4u2O-/view'},
    {t:'Skeleton code \u2014 Days 1\u20135', u:'https://drive.google.com/drive/folders/1xsLT-_WykPkKMEZETmmM1AU7eEvjs67Y?v=4'}
  ],
  2: [
    {t:'Week 2 Participant Workbook', u:'https://drive.google.com/file/d/1NE_umOE8iSWeF6xo2NimB91QfJqCBsAd/view'},
    {t:'Week 2 Deck (Days 6\u201310)', u:'https://drive.google.com/file/d/18EXy5MxvEpy7e2VAV6YhYiyBvpeehepr/view'},
    {t:'Documentation Package Template', u:'https://drive.google.com/file/d/1pzUmonJfH4kjSBovVOhSLOG9C4B3g1Wp/view'},
    {t:'Skeleton code \u2014 Days 6\u201310', u:'https://drive.google.com/drive/folders/1Juu-pLKqAVMIMlF3jRoeNu16Ej1F7dFb?v=4'}
  ],
  3: [
    {t:'Week 3 Participant Workbook', u:'https://drive.google.com/file/d/1fNsPdvJ2qr4kT4s49tHuJTUV-Pd74xHt/view'},
    {t:'Week 3 Deck (Days 11\u201315)', u:'https://drive.google.com/file/d/11oNBsP82aYtv_ZhZdbJWCflWdz9yDu6e/view'},
    {t:'Multi-Modal Feature Card', u:'https://drive.google.com/file/d/1eBXEWpd617dLJcimq2o3KiUSDarOaOhY/view'},
    {t:'Skeleton code \u2014 Days 11\u201315', u:'https://drive.google.com/drive/folders/1bd35cfooFYJxn-N2Ink0JxJocqj5p-fH?v=4'}
  ],
  4: [
    {t:'Week 4 Participant Workbook', u:'https://drive.google.com/file/d/1pEzLpZLvkecoK3DgsvTYmyreGDq9_ieU/view'},
    {t:'Week 4 Deck (Days 16\u201320)', u:'https://drive.google.com/file/d/1A3Ykryt4ZmFj26CJh2WQSjlywVk2rzTz/view'},
    {t:'Handover Package Template', u:'https://drive.google.com/file/d/1ducTt9rVkjguFJ-ySRcQLBoEG7KrERdf/view'},
    {t:'Skeleton code \u2014 Days 16\u201320', u:'https://drive.google.com/drive/folders/1OppBXPw2kqGgv0RZMufxeMYTFiVfsaVX?v=4'}
  ]
};

var DEEPNOTE = 'https://eccuaicamp2026.netlify.app/go/deepnote-cert?v=4';
var COLAB_FALLBACK = 'https://drive.google.com/drive/folders/1cj2u5d__YZDOhU4vrn1RWj_ssWTPKJrE';

// One entry per camp day. `extra` links are appended after the standard set.
var DAYS = [
  {n:1, wk:1, title:"Deconstruct \u2014 Inside the Bot: Deconstruct Before You Construct",
    desc:"Six components. One central rule. First lines of Python. Vision-Cast opens the day; pods probe the two bench bots.",
    extra:[
      {t:'Miss Khalifa AI — chat live', u:'https://eccuaicamp2026.netlify.app/bots/misskhalifa?v=4'},
      {t:'Ancestra & The Guardian — chat live', u:'https://eccuaicamp2026.netlify.app/bots/ancestra?v=4'}
    ]},
  {n:2, wk:1, title:"Design \u2014 Designing for People Before Programming",
    desc:"Persona \u2192 Empathy Map \u2192 Wardrobe. First conditionals in code.",
    extra:[
      {t:'Day 2 Notebook — Deepnote', u:'https://eccuaicamp2026.netlify.app/go/day2-notebook?v=4'},
      {t:'Day 2 · Interview Masterclass (deck)', u:'https://docs.google.com/presentation/d/1Dx9LCwVOhLG0FR7Fw-wP1sP8XDhJMnLKy4ubo7tDaGI/edit'},
      {t:'Day 2 · Pod Interview Prep Deck', u:'https://docs.google.com/presentation/d/1FFxNfz_dTAyQnSZE-E4d8nNN7epmUZ4gZ9xbrc4eq7A/edit'},
      {t:'Day 2 · Video Response Deck', u:'https://docs.google.com/presentation/d/1YQZVoOXgcNBwyJfFy7wnF-ECYFo3y1aSuoD8FNpluhA/edit'}
    ]},
  {n:3, wk:1, title:"Prototype \u2014 From Assumptions to Understanding",
    desc:"Scavenger Hunt. Facts + Tone. Functions in code."},
  {n:4, wk:1, title:"Refine \u2014 A Human Voice + Location & Context",
    desc:"The Map & the Rulebook. Dignity in words. Dictionaries in code."},
  {n:5, wk:1, title:"Integrate \u2014 Bringing the Design Together (A.R.T. + The Premiere)",
    desc:"The VIP Bouncer. Three checks. Cabinet-Pitch."},
  {n:6, wk:2, title:"Data Analysis + Axis 1 (Authority)",
    desc:"From building to observing. Read real interaction data. Tag every failure."},
  {n:7, wk:2, title:"Prompt Engineering (TCRDEI) + Axis 2 (Register)",
    desc:"The System Prompt is the bot's DNA. Plus the three advanced beats: Prompt-vs-Context Split \u00b7 Few-Shot \u00b7 Persona Anchoring."},
  {n:8, wk:2, title:"Gen AI Integration + Axis 3 (Territory) + Mid-Point Client Check-in",
    desc:"The live AI comes in \u2014 but behind the classifier, never in front."},
  {n:9, wk:2, title:"Quality Assurance (QA) & Accessibility \u2014 Bug Hunter / Crash Test",
    desc:"Become the user. Try to break your own bot before the client does."},
  {n:10, wk:2, title:"Documentation & Planning \u2014 Client Handover + Week-2 Retrospective",
    desc:"Documentation is how your bot survives after you graduate."},
  {n:11, wk:3, title:"Sense \u2014 Document Reading + Privacy",
    desc:"Vision APIs are the bot's eyes; PII redaction is its discretion."},
  {n:12, wk:3, title:"Speak \u2014 Voice I/O as Accessibility",
    desc:"Text-to-Speech is how your bot speaks; parameters are its vocal cords."},
  {n:13, wk:3, title:"Show \u2014 Guides & Checklists by Territory",
    desc:"Dynamic UI is how your bot guides; prompts are its teaching voice. RAG + Selective Retrieval."},
  {n:14, wk:3, title:"Decide \u2014 Agentic Journey + Distress Safeguard",
    desc:"The state machine is the bot's memory; the safeguard is its conscience. Guardrails Wall: six checks."},
  {n:15, wk:3, title:"Demonstrate \u2014 Internal Showcase (Client + ECCB)",
    desc:"A demo is a product; setup and teardown are part of the UX."},
  {n:16, wk:4, title:"Refine \u2014 Act on the Week-3 Feedback",
    desc:"Feedback is a gift. Triage it. Ship the fixes. 5-Beat pitch prep begins."},
  {n:17, wk:4, title:"Confirm \u2014 Client Working Session (Confirmation Register)",
    desc:"No unverified guesses. Every fact and tone is signed off."},
  {n:18, wk:4, title:"Harden \u2014 Accessibility & Resilience",
    desc:"Break it before the public does. safe_call fallback chain; deploy to a real URL."},
  {n:19, wk:4, title:"Document & Certify \u2014 Handover Package + freeCodeCamp Exam",
    desc:"If it isn't documented, it doesn't exist. Then: certify. Invigilated exam day \u2014 not the normal 9\u20134 rhythm."},
  {n:20, wk:4, title:"Hand Over \u2014 Private Demo Day (Cabinet Pitch) + Graduation",
    desc:"The knighting. You are now builders. Demo Day + Awards \u2014 not the normal 9\u20134 rhythm."}
];

// ── SCRIPT ──────────────────────────────────────────────────────────────────

// Keywords used to match your hand-created classes to cohorts (lowercased).
var COHORT_KEYWORDS = {
  'SKN': ['skn', 'kitts', 'nevis'],
  'SVG': ['svg', 'vincent', 'grenadines'],
  'Anguilla & Montserrat': ['anguilla', 'montserrat', 'ang ', 'ang&', 'ang &', 'mont'],
  'Dominica': ['dominica', 'dom ', 'dom-', 'dom&']
};

function populateAllCohorts() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  if (!courses.length) { Logger.log('No ACTIVE classes found — do STEP A first.'); return; }

  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) { Logger.log('SKIP %s — no class name matched its keywords.', cohort); return; }
    Logger.log('COURSE  %s  →  "%s"  (id %s · join code %s)', cohort, course.name, course.id, course.enrollmentCode);

    // section + description (idempotent)
    Classroom.Courses.patch({
      section: SECTION,
      descriptionHeading: 'The Bot is the GPS. The Human is the Driver.',
      description: 'Four weeks · 20 days · Deconstruct → Design → Build → Pitch. Hub: ' + HUB
    }, course.id, { updateMask: 'section,descriptionHeading,description' });

    // topics: reuse existing by name, create missing (reverse so Week 1 tops)
    var topicByName = {};
    ((Classroom.Courses.Topics.list(course.id).topic) || []).forEach(function (t) { topicByName[t.name] = t.topicId; });
    ['Week 4', 'Week 3', 'Week 2', 'Week 1'].forEach(function (name) {
      if (!topicByName[name]) {
        topicByName[name] = Classroom.Courses.Topics.create({ name: name }, course.id).topicId;
        Utilities.sleep(150);
      }
    });

    // existing materials by title → only create what's missing
    var existing = {};
    var page = null;
    do {
      page = Classroom.Courses.CourseWorkMaterials.list(course.id, { pageSize: 60, pageToken: page ? page.nextPageToken : undefined });
      ((page && page.courseWorkMaterial) || []).forEach(function (m) { existing[m.title] = true; });
    } while (page && page.nextPageToken);

    var made = 0, skipped = 0;
    DAYS.slice().reverse().forEach(function (d) {
      var title = 'Day ' + pad2(d.n) + ' · ' + d.title;
      if (existing[title]) { skipped++; return; }
      var links = [{ link: { url: HUB + '/#curriculum', title: 'Camp hub — curriculum' } }];
      (CAMPER_WEEK[d.wk] || []).forEach(function (x) { links.push(toMaterial(x.u, x.t)); });
      if (d.n === 1) {
        links.push({ link: { url: HUB + '/go/day1-notebook?v=4', title: 'Day 1 Notebook — Deepnote (GenAI Certification Notes)' } });
        links.push({ link: { url: HUB + '/go/day1-colab?v=4', title: 'Day 1 Notebook — Google Colab version' } });
      } else {
        links.push({ link: { url: DEEPNOTE, title: 'Camp Notebook — Deepnote (Certification Notes)' } });
        links.push({ link: { url: COLAB_FALLBACK, title: 'Camp Notebook — Google Colab version' } });
      }
      (d.extra || []).forEach(function (x) { links.push(toMaterial(x.u, x.t)); });
      if (createMaterialWithRetry({
        title: title, description: d.desc, materials: links,
        topicId: topicByName['Week ' + d.wk], state: 'PUBLISHED'
      }, course.id, title)) made++;
    });

    // 'Your Studio & Client' pinned topic + material
    var studioTitle = 'Your AI Studio workspace & client brief';
    if (!existing[studioTitle]) {
      if (!topicByName['Your Studio & Client']) {
        topicByName['Your Studio & Client'] = Classroom.Courses.Topics.create({ name: 'Your Studio & Client' }, course.id).topicId;
      }
      var studioLinks = (STUDIO_LINKS[cohort] || []).map(function (x) { return toMaterial(x.u, x.t); });
      studioLinks.push({ link: { url: HUB + '/#clients', title: 'The Client Board — all ten briefs' } });
      if (createMaterialWithRetry({
        title: studioTitle,
        description: 'Save every Google AI Studio prompt into YOUR pod folder — that folder is your studio. Read your client\'s discovery brief before the Day 3 client interview. Roles rotate Mondays; the pod folder stays.',
        materials: studioLinks,
        topicId: topicByName['Your Studio & Client'],
        state: 'PUBLISHED'
      }, course.id, studioTitle)) made++;
    } else { skipped++; }

    Logger.log('  materials: %s created · %s already there', made, skipped);

    // co-teacher invitations (errors = usually already invited; harmless)
    (CO_TEACHERS[cohort] || []).forEach(function (email) {
      try {
        Classroom.Invitations.create({ courseId: course.id, role: 'TEACHER', userId: email });
        Logger.log('  invited teacher: %s', email);
      } catch (e) {
        Logger.log('  note: %s — %s', email, (e.message || '').slice(0, 80));
      }
    });
  });
  Logger.log('Done. Run verifySetup to confirm, then announcePodAssignments.');
}

/**
 * ONE-SHOT FIX: deletes every existing 'Day NN · ...' material in all four
 * classes (they linked the full week folders, which contain facilitator
 * material), then repopulates with camper-only links. The 'Your Studio &
 * Client' material is left untouched. Run this INSTEAD of populateAllCohorts.
 */
function rebuildCamperMaterials() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) return;
    var removed = 0, page = null;
    do {
      page = Classroom.Courses.CourseWorkMaterials.list(course.id, { pageSize: 60, pageToken: page ? page.nextPageToken : undefined });
      ((page && page.courseWorkMaterial) || []).forEach(function (m) {
        if (m.title.indexOf('Day ') === 0 || m.title.indexOf('Your ') === 0) {
          for (var attempt = 1; attempt <= 3; attempt++) {
            try {
              Classroom.Courses.CourseWorkMaterials.remove(course.id, m.id);
              removed++;
              Utilities.sleep(150);
              break;
            } catch (e) {
              Logger.log('  delete retry %s/3 for "%s" — %s', attempt, m.title, (e.message || '').slice(0, 70));
              Utilities.sleep(1500 * attempt);
              if (attempt === 3) Logger.log('  could not delete "%s" — re-run rebuild later to replace it.', m.title);
            }
          }
        }
      });
    } while (page && page.nextPageToken);
    Logger.log('%s: removed %s old day materials', cohort, removed);
  });
  populateAllCohorts();
}

/** Creates one material with 3 attempts + backoff. Returns true on success. */
function createMaterialWithRetry(payload, courseId, label) {
  for (var attempt = 1; attempt <= 3; attempt++) {
    try {
      Classroom.Courses.CourseWorkMaterials.create(payload, courseId);
      Utilities.sleep(250);
      return true;
    } catch (e) {
      Logger.log('  retry %s/3 for "%s" — %s', attempt, label, (e.message || '').slice(0, 90));
      Utilities.sleep(1200 * attempt);
    }
  }
  Logger.log('  FAILED after 3 tries: "%s" — re-run populateAllCohorts later to fill it.', label);
  return false;
}

function findCourse(courses, cohort) {
  var kws = COHORT_KEYWORDS[cohort];
  for (var i = 0; i < courses.length; i++) {
    var name = courses[i].name.toLowerCase();
    for (var k = 0; k < kws.length; k++) {
      if (name.indexOf(kws[k]) !== -1) return courses[i];
    }
  }
  return null;
}

/** Removes invisible PROVISIONED leftovers from the earlier failed runs. */
function deleteStrayProvisioned() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['PROVISIONED'] });
  ((res && res.courses) || []).forEach(function (c) {
    if (c.name.indexOf(COURSE_NAME_PREFIX) === 0) {
      Classroom.Courses.remove(c.id);
      Logger.log('deleted stray provisioned course: %s (%s)', c.name, c.id);
    }
  });
  Logger.log('stray cleanup done.');
}

/**
 * Run AFTER populateAllCohorts. Prints a ready-to-send join message per
 * cohort — copy each block straight into WhatsApp / email.
 */
function printJoinMessages() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  (res.courses || []).forEach(function (c) {
    var cohort = null;
    Object.keys(COHORT_KEYWORDS).forEach(function (co) {
      if (findCourse([c], co)) cohort = cohort || co;
    });
    if (!cohort) return;
    Logger.log('──────── %s ────────\n' +
      'Welcome to the ECCU GenAI & Python Summer Camp 2026 (%s)!\n' +
      '1. Go to https://classroom.google.com (sign in with your personal Google account)\n' +
      '2. Click the +  →  Join class\n' +
      '3. Enter this class code:  %s\n' +
      'All 20 days of materials are inside. See you in the Studio!\n' +
      'Camp hub: %s',
      cohort, cohort, c.enrollmentCode, HUB);
  });
}

/**
 * ONE-CLICK FIX for all 'Just a moment...' links: reposts Day 01 (live bots
 * via hub redirects) AND the explainer materials (Gamma decks via hub
 * redirects). Idempotent — run as many times as you like.
 */
function fixExternalLinks() {
  fixDay1Links();
  repostExplainerMaterials();
}

/**
 * Posts a multiple-choice Question in each class: campers SELECT their client.
 * Teachers see the live tally per student — a self-built studio roster.
 * Re-run safe: replaces any previous copy of the question.
 */
var CLIENT_CHOICES = {
  'SKN': ['SCASPA (Sub-Studio A)', 'ASPIRE (Sub-Studio B)', 'ACB Caribbean (Sub-Studio C)'],
  'SVG': ['NAWASA (Sub-Studio A)', 'IRD Grenada (Sub-Studio B)'],
  'Anguilla & Montserrat': ['Caribbean Union Bank (CUB) — that\'s my client!'],
  'Dominica': ['IRD Anguilla — that\'s my client!']
};

function postClientQuestion() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) return;
    // sweep previous copies (re-run safe)
    try {
      var cw = Classroom.Courses.CourseWork.list(course.id, { pageSize: 30 });
      ((cw && cw.courseWork) || []).forEach(function (w) {
        if (w.title && w.title.indexOf('Which client are you building for?') === 0) {
          Classroom.Courses.CourseWork.remove(course.id, w.id);
        }
      });
    } catch (e) { Logger.log('%s: sweep note — %s', cohort, (e.message || '').slice(0, 70)); }
    var topicId = null;
    ((Classroom.Courses.Topics.list(course.id).topic) || []).forEach(function (t) {
      if (t.name === 'Your Studio & Client') topicId = t.topicId;
    });
    var choices = (CLIENT_CHOICES[cohort] || []).concat(['Not sure yet — ask a facilitator']);
    Classroom.Courses.CourseWork.create({
      title: 'Which client are you building for?',
      description: 'Pick your Studio\'s client. If you\'re not sure, ask a facilitator before choosing — then read your client\'s explainer deck and brief under \'Your Studio & Client\'.',
      workType: 'MULTIPLE_CHOICE_QUESTION',
      multipleChoiceQuestion: { choices: choices },
      topicId: topicId || undefined,
      state: 'PUBLISHED'
    }, course.id);
    Logger.log('%s: client question posted (%s choices)', cohort, choices.length);
  });
  Logger.log('Client questions done.');
}

/**
 * ONE-SHOT (Jul 20, 2026): SKN Sub-Studio B switches client — Sagicor Finance
 * out, ASPIRE (aspire.gov.kn) in. Renames the studio Drive folder, trashes the
 * old Sagicor decks filed there, files the ASPIRE explainer PDF, then reposts
 * SKN's studio material and SKN's client question with the new choices.
 * NOTE: reposting the question clears SKN campers' previous answers — they
 * answer again (Sagicor voters must re-pick anyway). Other cohorts untouched.
 * AFTER this, run repostExplainerMaterials (rebuilds every class's explainer
 * material: ASPIRE PDF in, Sagicor out, FestPass attached).
 */
function switchSknToAspire() {
  // 1) Drive: rename folder, trash Sagicor decks, file the ASPIRE PDF
  var folder = DriveApp.getFolderById('18I4bkWXZWTrjgpT9IpuJ6l_UimvkHMku');
  folder.setName('SKN \u00b7 Sub-Studio B \u2014 ASPIRE');
  var files = folder.getFiles(), trashed = 0;
  while (files.hasNext()) {
    var f = files.next();
    if (f.getName().indexOf('Sagicor') !== -1) { f.setTrashed(true); trashed++; }
  }
  Logger.log('Folder renamed \u00b7 %s Sagicor file(s) trashed', trashed);
  var pdfId = deckPdfId(EXPLAINER_DECKS.aspire, 'ASPIRE \u2014 Explained (teen edition).pdf');
  Logger.log(pdfId ? 'ASPIRE explainer PDF filed in the studio folder'
                   : 'ASPIRE PDF NOT filed \u2014 exportUrl may have expired (~7 days); regenerate');

  // 2) SKN: repost the studio material with the new links
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var course = findCourse(res.courses || [], 'SKN');
  if (!course) { Logger.log('SKN course not found'); return; }
  var topicId = null;
  ((Classroom.Courses.Topics.list(course.id).topic) || []).forEach(function (t) {
    if (t.name === 'Your Studio & Client') topicId = t.topicId;
  });
  var studioTitle = 'Your AI Studio workspace & client brief';
  var page = Classroom.Courses.CourseWorkMaterials.list(course.id, { pageSize: 60 });
  ((page && page.courseWorkMaterial) || []).forEach(function (m) {
    if (m.title === studioTitle) Classroom.Courses.CourseWorkMaterials.remove(course.id, m.id);
  });
  var studioLinks = (STUDIO_LINKS['SKN'] || []).map(function (x) { return toMaterial(x.u, x.t); });
  studioLinks.push({ link: { url: HUB + '/#clients', title: 'The Client Board \u2014 all ten briefs' } });
  createMaterialWithRetry({
    title: studioTitle,
    description: 'Save every Google AI Studio prompt into YOUR pod folder \u2014 that folder is your studio. Read your client\'s discovery brief before the client interview. Roles rotate Mondays; the pod folder stays.',
    materials: studioLinks,
    topicId: topicId || undefined,
    state: 'PUBLISHED'
  }, course.id, studioTitle);
  Logger.log('SKN studio material reposted');

  // 3) SKN: repost the client question with ASPIRE in the choices
  var cw = Classroom.Courses.CourseWork.list(course.id, { pageSize: 30 });
  ((cw && cw.courseWork) || []).forEach(function (w) {
    if (w.title && w.title.indexOf('Which client are you building for?') === 0) {
      Classroom.Courses.CourseWork.remove(course.id, w.id);
    }
  });
  var choices = (CLIENT_CHOICES['SKN'] || []).concat(['Not sure yet \u2014 ask a facilitator']);
  Classroom.Courses.CourseWork.create({
    title: 'Which client are you building for?',
    description: 'UPDATE: Sub-Studio B\'s client is now ASPIRE (not Sagicor). Everyone please answer again \u2014 if you picked Sagicor before, choose ASPIRE or another Studio. Read the ASPIRE explainer under \'Your Studio & Client\' first.',
    workType: 'MULTIPLE_CHOICE_QUESTION',
    multipleChoiceQuestion: { choices: choices },
    topicId: topicId || undefined,
    state: 'PUBLISHED'
  }, course.id);
  Logger.log('SKN client question reposted with ASPIRE. NOW RUN repostExplainerMaterials.');
}

/**
 * One-shot after the client swap (A&M -> CUB, Dominica -> IRD Anguilla):
 * renames the two studio folders and moves the explainer PDFs/PPTX between
 * them so each studio folder holds ITS client's deck.
 */
function renameSwappedStudios() {
  var am = DriveApp.getFolderById('1ri7TP-b-nW_AbQJBVWWWy3eWg-9mRvY-');
  var dom = DriveApp.getFolderById('1GV_iceJuq0Blu62ZT-Sw3PVBqC82TFTx');
  am.setName('Anguilla & Montserrat — CUB');
  dom.setName('Dominica — IRD Anguilla');
  var moved = 0;
  [[am, dom, 'IRD Anguilla'], [dom, am, 'CUB']].forEach(function (job) {
    var files = job[0].getFiles();
    while (files.hasNext()) {
      var f = files.next();
      if (f.getName().indexOf(job[2]) === 0) { f.moveTo(job[1]); moved++; }
    }
  });
  var root = DriveApp.getFolderById('1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd');
  var acbFolder = DriveApp.getFolderById('1dbnLShHxdyTLIpg-K6KII1mH8hKBMykB');
  var rootFiles = root.getFiles();
  while (rootFiles.hasNext()) {
    var rf = rootFiles.next();
    if (rf.getName().indexOf('ACB Caribbean') === 0) { rf.moveTo(acbFolder); moved++; }
  }
  Logger.log('studios renamed · %s explainer files moved to their correct studio', moved);
}

/**
 * Replaces the OLD Mystery Gaps PDF/PPTX in the AI Studio root with v2
 * (final client map). Run once after the deck regeneration.
 */
function refileMysteryGapsDeck() {
  var root = DriveApp.getFolderById('1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd');
  var files = root.getFiles();
  var trashed = 0;
  while (files.hasNext()) {
    var f = files.next();
    if (f.getName().indexOf('The Mystery Gaps') === 0) { f.setTrashed(true); trashed++; }
  }
  var d = EXPLAINER_DECKS.mystery_gaps;
  [['exportUrl', '.pdf'], ['pptxUrl', '.pptx']].forEach(function (fmt) {
    var blob = UrlFetchApp.fetch(d[fmt[0]]).getBlob()
      .setName('The Mystery Gaps — What the Briefs Didn\'t Say (Day 3 prep)' + fmt[1]);
    root.createFile(blob);
  });
  Logger.log('Mystery Gaps v2 filed (%s old files trashed).', trashed);
}

/**
 * Day 4 Pod Homework — GROUP assignment, due Friday 17 Jul 2:30 PM AST.
 * Paste the infographic's Drive file ID into DAY4_IMAGE_ID to attach it;
 * leave '' to post without (attach via UI afterwards). Re-run safe.
 */
var DAY4_IMAGE_ID = '';   // auto-filled: fetched from the hub into your Drive on first run
var DAY4_IMAGE_URL = 'https://eccuaicamp2026.netlify.app/assets/day4-homework-infographic.jpeg';

function postDay4Homework() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  var desc = 'GROUP HOMEWORK — one submission per pod.\n' +
    'Your pod\'s homework · due Friday 2:30 PM, before the PM Build block.\n\n' +
    'Each team develops:\n' +
    '• Three conversation pathways\n' +
    '• At least five decision points where the chatbot must choose between two or more responses\n' +
    '• A conversation flow diagram showing how users move through the chatbot\n' +
    '• A list of situations where the chatbot should transfer the user to a human\n\n' +
    'Python integration challenge: modify your team\'s Python program to include at least one decision using an if...else statement.\n' +
    'If your client requires calculations (pricing, totals, grades, attendance, booking costs) also incorporate a simple math operation.\n\n' +
    'Remember: not every chatbot needs calculations, but EVERY chatbot makes decisions.\n\n' +
    'Submit: upload your flow diagram (photo or screenshot) + your Python file, OR paste a link to your pod\'s working deck.';
  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) return;
    try {
      var cw = Classroom.Courses.CourseWork.list(course.id, { pageSize: 30 });
      ((cw && cw.courseWork) || []).forEach(function (w) {
        if (w.title && (w.title.indexOf('Day 3 Pod Homework') === 0 || w.title.indexOf('Day 4 Pod Homework') === 0)) {
          Classroom.Courses.CourseWork.remove(course.id, w.id);
        }
      });
    } catch (e) {}
    var topicId = null;
    ((Classroom.Courses.Topics.list(course.id).topic) || []).forEach(function (t) {
      if (t.name === 'Week 1') topicId = t.topicId;
    });
    if (!DAY4_IMAGE_ID) {
      var blob = UrlFetchApp.fetch(DAY4_IMAGE_URL).getBlob().setName('Day 4 Homework — Build · Decide · Connect.jpeg');
      DAY4_IMAGE_ID = DriveApp.createFile(blob).getId();
      Logger.log('infographic saved to Drive: %s', DAY4_IMAGE_ID);
    }
    var materials = [{ driveFile: { driveFile: { id: DAY4_IMAGE_ID }, shareMode: 'VIEW' } }];
    Classroom.Courses.CourseWork.create({
      title: 'Day 4 Pod Homework · Build · Decide · Connect',
      description: desc,
      workType: 'ASSIGNMENT',
      materials: materials,
      topicId: topicId || undefined,
      state: 'PUBLISHED',
      dueDate: { year: 2026, month: 7, day: 17 },
      dueTime: { hours: 18, minutes: 30 }   // 2:30 PM AST (UTC-4) = 18:30 UTC · Friday 17 Jul
    }, course.id);
    Logger.log('%s: Day 4 homework posted with infographic', cohort);
  });
  Logger.log('Day 4 homework done.');
}

/** Files each per-client gap deck PDF into its studio folder. Run once. */
function fileGapDecks() {
  Object.keys(GAP_DECKS).forEach(function (slug) {
    var d = GAP_DECKS[slug];
    if (!d.exportUrl) return;
    try {
      var blob = UrlFetchApp.fetch(d.exportUrl).getBlob().setName(d.fileName + '.pdf');
      DriveApp.getFolderById(d.folderId).createFile(blob);
      Logger.log('%s: filed to studio folder', slug);
    } catch (e) {
      Logger.log('%s: FAILED — %s', slug, (e.message || '').slice(0, 80));
    }
  });
  Logger.log('gap decks filed.');
}

/** Renames the homework infographic in Drive from Day 3 to Day 4 —
 *  the attachment name updates in all four classes automatically. */
function renameDay4Image() {
  var files = DriveApp.getFilesByName('Day 3 Homework — Build · Decide · Connect.jpeg');
  var n = 0;
  while (files.hasNext()) {
    files.next().setName('Day 4 Homework — Build · Decide · Connect.jpeg');
    n++;
  }
  Logger.log(n ? n + ' file(s) renamed to Day 4.' : 'No Day 3-named image found — maybe already renamed?');
}

/** Renames the three Day 2 Slides in Drive so attachments show friendly names. */
function renameDay2Decks() {
  var m = {
    '1Dx9LCwVOhLG0FR7Fw-wP1sP8XDhJMnLKy4ubo7tDaGI': 'Day 2 · Interview Masterclass',
    '1FFxNfz_dTAyQnSZE-E4d8nNN7epmUZ4gZ9xbrc4eq7A': 'Day 2 · Pod Interview Prep Deck',
    '1YQZVoOXgcNBwyJfFy7wnF-ECYFo3y1aSuoD8FNpluhA': 'Day 2 · Video Response Deck'
  };
  Object.keys(m).forEach(function (id) {
    try { DriveApp.getFileById(id).setName(m[id]); Logger.log('renamed: %s', m[id]); }
    catch (e) { Logger.log('rename failed %s — %s', m[id], (e.message || '').slice(0, 70)); }
  });
  Logger.log('Day 2 decks renamed.');
}

/**
 * Posts the Zoom Breakout Rooms camper guide (PDF from Drive) as a material
 * in every class, under 'Your Studio & Client'. Re-run safe.
 */
var ZOOM_GUIDE = {
  fileName: 'In Fast, Out Clean — Zoom Breakout Rooms (Camper Guide)',
  exportUrl: "https://assets.api.gamma.app/export/pdf/f4ie04ghiojkiaq/66f74af8e9ec9c24ef744fd91529bb97/In-Fast-Out-Clean-Zoom-Breakout-Rooms-Camper-Guide.pdf",
  folderId: '1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd'
};

function postZoomGuide() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  var fid = deckPdfId(ZOOM_GUIDE, ZOOM_GUIDE.fileName + '.pdf');
  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) return;
    var page = Classroom.Courses.CourseWorkMaterials.list(course.id, { pageSize: 60 });
    ((page && page.courseWorkMaterial) || []).forEach(function (m) {
      if (m.title.indexOf('Zoom Breakout Rooms') !== -1) {
        Classroom.Courses.CourseWorkMaterials.remove(course.id, m.id);
      }
    });
    var topicId = null;
    ((Classroom.Courses.Topics.list(course.id).topic) || []).forEach(function (t) {
      if (t.name === 'Week 2') topicId = t.topicId;
    });
    Classroom.Courses.CourseWorkMaterials.create({
      title: 'Zoom Breakout Rooms — In Fast, Out Clean (camper guide)',
      description: 'How your pod\'s breakout room works: join in 30 seconds, ASK FOR HELP like a professional, and never hit the wrong red button. Two minutes to read — saves you every day.',
      materials: fid ? [{ driveFile: { driveFile: { id: fid }, shareMode: 'VIEW' } }] : [],
      topicId: topicId || undefined,
      state: 'PUBLISHED'
    }, course.id);
    Logger.log('%s: Zoom guide posted', cohort);
  });
  Logger.log('Zoom guide done.');
}

/**
 * Posts 'The People Behind the Messages' (Personas & Empathy Maps, FestPass
 * edition — the refresher lesson before Prompt Engineering) as a PDF material
 * under Week 2 in every class. Re-run safe.
 */
var PERSONAS_DECK = {
  fileName: 'The People Behind the Messages — Personas & Empathy Maps (FestPass Edition)',
  exportUrl: "https://assets.api.gamma.app/export/pdf/ilwz6ysqhho7pr3/aff35495921bbf9246dff16c84f725df/The-People-Behind-the-Messages-Personas-and-Empathy-Maps-FestPass-Edition.pdf",
  folderId: '1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd'
};

function postPersonasDeck() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  var fid = deckPdfId(PERSONAS_DECK, PERSONAS_DECK.fileName + '.pdf');
  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) return;
    var page = Classroom.Courses.CourseWorkMaterials.list(course.id, { pageSize: 60 });
    ((page && page.courseWorkMaterial) || []).forEach(function (m) {
      if (m.title.indexOf('People Behind the Messages') !== -1) {
        Classroom.Courses.CourseWorkMaterials.remove(course.id, m.id);
      }
    });
    var topicId = null;
    ((Classroom.Courses.Topics.list(course.id).topic) || []).forEach(function (t) {
      if (t.name === 'Week 2') topicId = t.topicId;
    });
    Classroom.Courses.CourseWorkMaterials.create({
      title: 'The People Behind the Messages — Personas & Empathy Maps (FestPass edition)',
      description: 'Meet the seven humans your bot must serve — full empathy maps for every FestPass persona, each ending in the register it demands. Your refresher before Prompt Engineering: persona → arrival states → register → prompt. Then build the same for YOUR client.',
      materials: fid ? [{ driveFile: { driveFile: { id: fid }, shareMode: 'VIEW' } }] : [],
      topicId: topicId || undefined,
      state: 'PUBLISHED'
    }, course.id);
    Logger.log('%s: Personas deck posted', cohort);
  });
  Logger.log('Personas deck done.');
}

function pad2(n) { return (n < 10 ? '0' : '') + n; }

/**
 * Drive files attach natively (real name, icon, preview, auto view-permission
 * for the class). Folders and external links stay links.
 */
/**
 * Re-posts ONLY the Day 01 material (deletes + recreates) — used after the
 * live-bot links moved behind hub redirect pages so titles scrape properly.
 */
function fixDay1Links() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  var d = DAYS[0];
  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) return;
    var topicId = null;
    ((Classroom.Courses.Topics.list(course.id).topic) || []).forEach(function (t) {
      if (t.name === 'Week 1') topicId = t.topicId;
    });
    var page = Classroom.Courses.CourseWorkMaterials.list(course.id, { pageSize: 60 });
    ((page && page.courseWorkMaterial) || []).forEach(function (m) {
      if (m.title.indexOf('Day 01 ·') === 0) {
        Classroom.Courses.CourseWorkMaterials.remove(course.id, m.id);
      }
    });
    var links = [{ link: { url: HUB + '/#curriculum', title: 'Camp hub — curriculum' } }];
    (CAMPER_WEEK[1] || []).forEach(function (x) { links.push(toMaterial(x.u, x.t)); });
    links.push({ link: { url: HUB + '/go/day1-notebook?v=4', title: 'Day 1 Notebook — Deepnote (GenAI Certification Notes)' } });
    links.push({ link: { url: HUB + '/go/day1-colab?v=4', title: 'Day 1 Notebook — Google Colab version' } });
    (d.extra || []).forEach(function (x) { links.push(toMaterial(x.u, x.t)); });
    createMaterialWithRetry({
      title: 'Day ' + pad2(d.n) + ' · ' + d.title,
      description: d.desc, materials: links, topicId: topicId, state: 'PUBLISHED'
    }, course.id, 'Day 01 rebuild');
    Logger.log('%s: Day 01 reposted with hub bot links', cohort);
  });
  Logger.log('fixDay1Links done.');
}

/**
 * Finds a deck's PDF in its studio folder by name; if absent, fetches the
 * export and files it. Returns the Drive file ID (or null).
 */
function deckPdfId(deck, pdfName) {
  try {
    var folder = DriveApp.getFolderById(deck.folderId);
    var files = folder.getFilesByName(pdfName);
    if (files.hasNext()) return files.next().getId();
    if (deck.exportUrl) {
      var blob = UrlFetchApp.fetch(deck.exportUrl).getBlob().setName(pdfName);
      return folder.createFile(blob).getId();
    }
  } catch (e) {
    Logger.log('deckPdfId(%s): %s', pdfName, (e.message || '').slice(0, 80));
  }
  return null;
}

function toMaterial(url, title) {
  var m = url.match(/(?:drive|docs)\.google\.com\/(?:file\/d\/|document\/d\/|presentation\/d\/|spreadsheets\/d\/)([-\w]{20,})/);
  if (m) {
    return { driveFile: { driveFile: { id: m[1] }, shareMode: 'VIEW' } };
  }
  return { link: { url: url, title: title } };
}

/**
 * Health check — run any time. Prints, for each cohort's class:
 * topics, day materials, studio material, announcements, teachers.
 * Paste the log output back to Claude to confirm everything landed.
 */
function verifySetup() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) { Logger.log('%s: NO MATCHING CLASS', cohort); return; }
    var topics = (Classroom.Courses.Topics.list(course.id).topic || []).map(function (t) { return t.name; });
    var titles = [];
    var page = null;
    do {
      page = Classroom.Courses.CourseWorkMaterials.list(course.id, { pageSize: 60, pageToken: page ? page.nextPageToken : undefined });
      ((page && page.courseWorkMaterial) || []).forEach(function (m) { titles.push(m.title); });
    } while (page && page.nextPageToken);
    var days = titles.filter(function (t) { return t.indexOf('Day ') === 0; }).length;
    var missing = [];
    DAYS.forEach(function (dd) {
      var want = 'Day ' + pad2(dd.n) + ' · ';
      if (!titles.some(function (t) { return t.indexOf(want) === 0; })) missing.push(pad2(dd.n));
    });
    var studio = titles.some(function (t) { return t.indexOf('Your AI Studio workspace') === 0; });
    var anns = Classroom.Courses.Announcements.list(course.id, { pageSize: 10 });
    var annCount = ((anns && anns.announcements) || []).length;
    var teachers = (Classroom.Courses.Teachers.list(course.id).teachers || []).length;
    var invites = (Classroom.Invitations.list({ courseId: course.id }).invitations || []).length;
    Logger.log('%s → "%s"\n  topics: %s\n  day materials: %s / 20 · studio material: %s · MISSING DAYS: %s\n  announcements: %s · teachers joined: %s · invites pending: %s\n  join code: %s',
      cohort, course.name, topics.join(' · ') || 'NONE', days, studio ? 'YES' : 'MISSING', missing.length ? missing.join(', ') : 'none',
      annCount, teachers, invites, course.enrollmentCode);
  });
  Logger.log('verify done.');
}

// ── POD ROSTERS (generated from Pod_Assignments_ALL_Studios.xlsx) ──────────
var POD_ROSTERS = {
  "SKN": [
    {pod:"Pod 1", client:"Sub-Studio A \u00b7 SCASPA", names:"Ivoniyah Nisbett, Hallie-Jahz Harris, Nyare' Clarke, Kaija Delpleche"},
    {pod:"Pod 2", client:"Sub-Studio A \u00b7 SCASPA", names:"Chéanna Browne, Jernyah Mills, Kylie Richards, Josiah Benjamin"},
    {pod:"Pod 3", client:"Sub-Studio A \u00b7 SCASPA", names:"Nahamani Carey, Dejunique Stapleton, Zenahj Harris, Ahjanique Hodge"},
    {pod:"Pod 4", client:"Sub-Studio A \u00b7 SCASPA", names:"Xiomara Titre, SHAMA WALTERS, Jayden Warner, Dré Martin"},
    {pod:"Pod 5", client:"Sub-Studio B \u00b7 ASPIRE", names:"Chanardo Evans, Emma Morris, Nya Jack, Veronique Mardenborough"},
    {pod:"Pod 6", client:"Sub-Studio B \u00b7 ASPIRE", names:"Amarni Moore, Ashaun Moore, Cayden Williams, Addijah Daniel"},
    {pod:"Pod 7", client:"Sub-Studio B \u00b7 ASPIRE", names:"Antwan Daniel, Rhae-Jae Williams, Ke'Tashee Ward, Christian Corbie"},
    {pod:"Pod 8", client:"Sub-Studio B \u00b7 ASPIRE", names:"Arianna Blanchard, Yendri Nisbett, (name pending)"},
  ],
  "SVG": [
    {pod:"Pod 1", client:"Sub-Studio A \u00b7 NAWASA", names:"Jomel Gellizeau, Sydelle Campbell, Jeriah Diamond, Isaiah Williams"},
    {pod:"Pod 2", client:"Sub-Studio A \u00b7 NAWASA", names:"Simlet Pierre, Kyla Fraser, Gabrielle Charles, Jadon Hamilton"},
    {pod:"Pod 3", client:"Sub-Studio A \u00b7 NAWASA", names:"Luke Simon, Sadieann Robertson, Safiya Solomon, Anessia Patterson"},
    {pod:"Pod 4", client:"Sub-Studio A \u00b7 NAWASA", names:"Zephan Knights, Gabrielle Phillips, Maalik Adams, Cornel London"},
    {pod:"Pod 5", client:"Sub-Studio A \u00b7 NAWASA", names:"Leanna Bailey, Zaafir Bascombe, Kaveisha Simmons, Keleisha Simmons"},
    {pod:"Pod 6", client:"Sub-Studio A \u00b7 NAWASA", names:"Azaray Defreitas, Rachel Lawrence, Alysson Ambrose, Céronique Mitchell"},
    {pod:"Pod 7", client:"Sub-Studio B \u00b7 IRD Grenada", names:"Kyron Quashie, McLoren Jr. Burke, Maxwell John, Jarell Charles"},
    {pod:"Pod 8", client:"Sub-Studio B \u00b7 IRD Grenada", names:"Nasir Antoine, Faith Charles, Dilonzo Texeira, Nylah Mattis-Barker"},
    {pod:"Pod 9", client:"Sub-Studio B \u00b7 IRD Grenada", names:"Kyle Williams, Arianna Peters, Aren Ollivierre, Carla Bennette"},
    {pod:"Pod 10", client:"Sub-Studio B \u00b7 IRD Grenada", names:"Kendre Findlay, Leah Archibald, Malia Guy, Tahir Primus"},
    {pod:"Pod 11", client:"Sub-Studio B \u00b7 IRD Grenada", names:"Zakeel Pompey, Vialene RICHARDS, J'Nae Edwards, Shanon Ralph"},
    {pod:"Pod 12", client:"Sub-Studio B \u00b7 IRD Grenada", names:"Treece Oliver, Chloe Taylor [PLACEHOLDER — details pending]"},
  ],
  "Anguilla & Montserrat": [
    {pod:"Pod 1", client:"Inland Revenue Anguilla", names:"Michaela Connor, Kevin E.A Irish Lively, Michaela Shanee Raina Connor, Camia Gumbs"},
    {pod:"Pod 2", client:"Inland Revenue Anguilla", names:"Zenia Francis, Hadassah Williams, Kai Gray, Khan Gray (virtual)"},
  ],
  "Dominica": [
    {pod:"Pod 1", client:"CUB", names:"Minran Isaac, Anyella Birmingham (virtual), Anayah Anselm, Sarafina Charles"},
    {pod:"Pod 2", client:"CUB", names:"Jeanelle Hypolite (virtual), Rasheed Augustine (virtual), Samuel Stoddard (virtual), Kiera Langford (virtual)"},
    {pod:"Pod 3", client:"CUB", names:"Colin Grant, Mosi Timothy (virtual), Teri Davis, Shaneska Auguiste"},
    {pod:"Pod 4", client:"CUB", names:"An-Suani Prosper"},
  ],
};

/**
 * Posts a pinned-style announcement to each class Stream telling every camper
 * which pod and which client they belong to. Run once (re-running posts again).
 */
function announcePodAssignments() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) { Logger.log('SKIP %s — no matching class.', cohort); return; }
    // sweep previous pod announcements (posted by this script) — re-run safe
    try {
      var anns = Classroom.Courses.Announcements.list(course.id, { pageSize: 20 });
      ((anns && anns.announcements) || []).forEach(function (a) {
        if (a.text && a.text.indexOf('WHICH STUDIO AM I IN?') === 0) {
          Classroom.Courses.Announcements.remove(course.id, a.id);
        }
      });
    } catch (e) { Logger.log('%s: old announcement sweep note — %s', cohort, (e.message || '').slice(0, 70)); }
    var pods = POD_ROSTERS[cohort] || [];
    var text = 'WHICH STUDIO AM I IN?\n' +
               'Find your name below — that is your Pod, and your Pod\'s client.\n' +
               'Roles rotate every Monday; your Pod stays the same.\n\n';
    var lastClient = '';
    pods.forEach(function (p) {
      if (p.client !== lastClient) {
        text += '━━━ ' + p.client + ' ━━━\n';
        lastClient = p.client;
      }
      text += p.pod + ':  ' + p.names + '\n';
    });
    text += '\nYour pod\'s AI Studio folder is linked under \'Your Studio & Client\' in Classwork.';
    Classroom.Courses.Announcements.create({ text: text, state: 'PUBLISHED' }, course.id);
    Logger.log('announced pods in %s (%s pods)', course.name, pods.length);
  });
  Logger.log('Pod announcements done.');
}

// ── CLIENT EXPLAINER DECKS (Gamma · teen edition) ───────────────────────────
var EXPLAINER_DECKS = {
  "scaspa": {client:"SCASPA", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/scaspa?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/thclmcngm4iryzo/95244f625f162be59d07326e49f5a845/SCASPA-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/thclmcngm4iryzo/b3353a17caaa26a98a21992185a43536/SCASPA-Explained-Your-Client-in-9-Cards.pptx", folderId:"1oBT6L7HoQ7X9xSj31ZGFqHHkvPG47iob"},
  "aspire": {client:"ASPIRE", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/aspire?v=5", exportUrl:"https://assets.api.gamma.app/export/pdf/0gvbqjat50iodtq/578cb0eeb1f33236919b718ecc299a5c/ASPIRE-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/0gvbqjat50iodtq/6b5edaf8f09c687042af55841200f672/ASPIRE-Explained-Your-Client-in-9-Cards.pptx", folderId:"18I4bkWXZWTrjgpT9IpuJ6l_UimvkHMku"},
  "ird_grenada": {client:"IRD Grenada", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/ird-grenada?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/qoihr3sttd4ioos/37b593a16e524d8dcd542138f110b90a/IRD-Grenada-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/qoihr3sttd4ioos/7a85681d943c0b852ffa08b64051e23c/IRD-Grenada-Explained-Your-Client-in-9-Cards.pptx", folderId:"13GpIf64NsniH4bFlHNvgOSvMuaqed409"},
  "lucelec": {client:"LUCELEC", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/lucelec?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/zftbqzlcvm4d8yb/ae29ac5033e265b51f88533803ca83b0/LUCELEC-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/zftbqzlcvm4d8yb/89a5f0ad2bf8e794b417d6384d1c9d02/LUCELEC-Explained-Your-Client-in-9-Cards.pptx", folderId:"1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd"},
  "acb": {client:"ACB Caribbean", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/acb?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/0ak3elrclbo5nb9/2636410282b0010163a00cd31aca7df8/ACB-Caribbean-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/0ak3elrclbo5nb9/bbf7b0673a120618fe35db5ac71a3368/ACB-Caribbean-Explained-Your-Client-in-9-Cards.pptx", folderId:"1dbnLShHxdyTLIpg-K6KII1mH8hKBMykB"},
  "cub": {client:"CUB", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/cub?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/esj91ph94orgjdm/904a09eb1fe90d40ca545e48f6233c61/Caribbean-Union-Bank-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/esj91ph94orgjdm/01376de1532bf2e44b11a6ae1219af3c/Caribbean-Union-Bank-Explained-Your-Client-in-9-Cards.pptx", folderId:"1ri7TP-b-nW_AbQJBVWWWy3eWg-9mRvY-"},
  "nis_grenada": {client:"NIS Grenada", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/nis-grenada?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/tsrpbdcim793uxx/4d0f3b42f5ff0e65e94f0bec35d6e1e6/NIS-Grenada-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/tsrpbdcim793uxx/60d02487f1ffad3e595599f26e9284b8/NIS-Grenada-Explained-Your-Client-in-9-Cards.pptx", folderId:"1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd"},
  "ird_anguilla": {client:"IRD Anguilla", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/ird-anguilla?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/jsxglvc0bprsi5u/6bad9600ca8744f1d581e3c2383a3251/IRD-Anguilla-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/jsxglvc0bprsi5u/ba28dd652a7547da64e19103173220ab/IRD-Anguilla-Explained-Your-Client-in-9-Cards.pptx", folderId:"1GV_iceJuq0Blu62ZT-Sw3PVBqC82TFTx"},
  "nawasa": {client:"NAWASA", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/nawasa?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/3lcua5uyqp75uyn/f1e297074f32df7dee8004af85611b18/NAWASA-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/3lcua5uyqp75uyn/3ca4944b9e0f5556e5e8db17f7f7c1f9/NAWASA-Explained-Your-Client-in-9-Cards.pptx", folderId:"1Yy3bFfX8uJNDbYsUothPlRHTDHBlzncJ"},
  "mystery_gaps": {client:"The Mystery Gaps", fileName:"The Mystery Gaps — What the Briefs Didn't Say (Day 3 prep)", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/mystery-gaps?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/anz6aj4umevia2u/d3ab787048c9e6c4b280345e1c5a7268/The-Mystery-Gaps-What-the-Briefs-Didnt-Say-v2.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/anz6aj4umevia2u/8f1a0756c214eefd0dc7aa7462bd0096/The-Mystery-Gaps-What-the-Briefs-Didnt-Say-v2.pptx", folderId:"1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd"}
};
var GAP_DECKS = {
  "gaps_scaspa": {client:"SCASPA", fileName:"The Mystery Gaps \u2014 SCASPA Edition (interview prep)", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/gaps-scaspa?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/buvksh7ltmuwxuk/2a04f88a756b7eadd996fc99849994fc/The-Mystery-Gaps-SCASPA-Edition.pdf", folderId:"1oBT6L7HoQ7X9xSj31ZGFqHHkvPG47iob"},
  "gaps_acb": {client:"ACB Caribbean", fileName:"The Mystery Gaps \u2014 ACB Caribbean Edition (interview prep)", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/gaps-acb?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/90oz2z7rd6lcimj/179f58ce31e5d8ed51112320be200c84/The-Mystery-Gaps-ACB-Caribbean-Edition.pdf", folderId:"1dbnLShHxdyTLIpg-K6KII1mH8hKBMykB"},
  "gaps_nawasa": {client:"NAWASA", fileName:"The Mystery Gaps \u2014 NAWASA Edition (interview prep)", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/gaps-nawasa?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/va23zo73so1rxer/6fda8874941efe3baae65ad44d431c14/The-Mystery-Gaps-NAWASA-Edition.pdf", folderId:"1Yy3bFfX8uJNDbYsUothPlRHTDHBlzncJ"},
  "gaps_ird_grenada": {client:"IRD Grenada", fileName:"The Mystery Gaps \u2014 IRD Grenada Edition (interview prep)", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/gaps-ird-grenada?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/eac61g5lz8vfnwj/6d7944fa773e24fb833f9cf177b50dd5/The-Mystery-Gaps-IRD-Grenada-Edition.pdf", folderId:"13GpIf64NsniH4bFlHNvgOSvMuaqed409"},
  "gaps_cub": {client:"CUB", fileName:"The Mystery Gaps \u2014 CUB Edition (interview prep)", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/gaps-cub?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/ttoxogrhprsxkg6/1d086633d13f8cbec93c2c3127d4efeb/The-Mystery-Gaps-CUB-Edition.pdf", folderId:"1ri7TP-b-nW_AbQJBVWWWy3eWg-9mRvY-"},
  "gaps_ird_anguilla": {client:"IRD Anguilla", fileName:"The Mystery Gaps \u2014 IRD Anguilla Edition (interview prep)", gammaUrl:"https://eccuaicamp2026.netlify.app/decks/gaps-ird-anguilla?v=4", exportUrl:"https://assets.api.gamma.app/export/pdf/b9u2wq83w6vxhm5/ec6780d73ae6c2d2d96ec916e4ae41bf/The-Mystery-Gaps-IRD-Anguilla-Edition.pdf", folderId:"1GV_iceJuq0Blu62ZT-Sw3PVBqC82TFTx"},
};
var FESTPASS_DECK = {
  client: 'FestPass',
  fileName: 'FestPass — Your Practice Client (teen edition)',
  exportUrl: "https://assets.api.gamma.app/export/pdf/3ts0snwiwvdzjn9/d6976fbd396862c9d1e3b02a4ba55e25/FestPass-Explained-Your-Practice-Client.pdf",
  folderId: '1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd'
};

var COHORT_GAPS = {
  "SKN": ["gaps_scaspa", "gaps_acb"],
  "SVG": ["gaps_nawasa", "gaps_ird_grenada"],
  "Anguilla & Montserrat": ["gaps_cub"],
  "Dominica": ["gaps_ird_anguilla"]
};

var COHORT_DECKS = {
  "SKN": [
    "scaspa",
    "aspire", "acb"
  ],
  "SVG": [
    "nawasa",
    "ird_grenada"
  ],
  "Anguilla & Montserrat": [
    "cub"
  ],
  "Dominica": [
    "ird_anguilla"
  ]
};

/**
 * 1) Saves each deck's PDF into its AI Studio Drive folder (export links
 *    expire ~7 days after generation — run this soon).
 * 2) Posts a 'Your client, explained' material to each class with the live
 *    Gamma link(s). Run ONCE. Needs Drive permission — approve when asked.
 */
function postExplainerDecks() {
  Object.keys(EXPLAINER_DECKS).forEach(function (slug) {
    var d = EXPLAINER_DECKS[slug];
    var folder = DriveApp.getFolderById(d.folderId);
    [['exportUrl', '.pdf'], ['pptxUrl', '.pptx']].forEach(function (fmt) {
      var url = d[fmt[0]];
      if (!url) { Logger.log('%s: no %s url — skipping', slug, fmt[1]); return; }
      try {
        var blob = UrlFetchApp.fetch(url).getBlob()
          .setName((d.fileName || (d.client + ' — Explained (teen edition)')) + fmt[1]);
        folder.createFile(blob);
        Logger.log('%s: %s saved to Drive folder', slug, fmt[1]);
      } catch (e) {
        Logger.log('%s: %s save FAILED — %s', slug, fmt[1], (e.message || '').slice(0, 90));
      }
    });
  });

  repostExplainerMaterials();
}

/**
 * Posts ONLY the 'Your client(s), explained' classroom materials — use this
 * when the Drive PDFs are already filed and you just need the materials back
 * (e.g. after rebuildCamperMaterials sweeps them).
 */
function repostExplainerMaterials() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) return;
    var slugs = COHORT_DECKS[cohort] || [];
    if (!slugs.length) return;
    // sweep any existing explainer material first — safe to re-run
    var page = Classroom.Courses.CourseWorkMaterials.list(course.id, { pageSize: 60 });
    ((page && page.courseWorkMaterial) || []).forEach(function (m) {
      if (m.title.indexOf('Your client') === 0) {
        Classroom.Courses.CourseWorkMaterials.remove(course.id, m.id);
      }
    });
    var topicId = null;
    ((Classroom.Courses.Topics.list(course.id).topic) || []).forEach(function (t) {
      if (t.name === 'Your Studio & Client') topicId = t.topicId;
    });
    var names = slugs.map(function (s) { return EXPLAINER_DECKS[s].client; });
    var links = [];
    slugs.forEach(function (s) {
      var d = EXPLAINER_DECKS[s];
      var pdfName = (d.fileName || (d.client + ' — Explained (teen edition)')) + '.pdf';
      var fid = deckPdfId(d, pdfName);
      if (fid) links.push({ driveFile: { driveFile: { id: fid }, shareMode: 'VIEW' } });
      else links.push({ link: { url: d.gammaUrl, title: d.client + ' — Explained (teen edition)' } });
    });
    var matTitle = (names.length > 1 ? 'Your clients, explained — ' : 'Your client, explained — ')
      + names.join(' & ') + ' (teen edition)';
    var matDesc = 'The client brief, retold in plain language with an analogy you can pitch with. '
      + (names.length > 1
          ? 'Read YOUR pod\'s client — check the pod announcement in the Stream if unsure. '
          : '')
      + 'Read it before the Day 3 client interview. The PDF copy also lives in your Studio folder.';
    var fpId = deckPdfId(FESTPASS_DECK, FESTPASS_DECK.fileName + '.pdf');
    if (fpId) links.push({ driveFile: { driveFile: { id: fpId }, shareMode: 'VIEW' } });
    (COHORT_GAPS[cohort] || []).forEach(function (gslug) {
      var gd = GAP_DECKS[gslug];
      var pdfName = gd.fileName + '.pdf';
      var fid = deckPdfId(gd, pdfName);
      if (fid) links.push({ driveFile: { driveFile: { id: fid }, shareMode: 'VIEW' } });
      else links.push({ link: { url: gd.gammaUrl, title: 'The Mystery Gaps — ' + gd.client + ' Edition' } });
    });
    Classroom.Courses.CourseWorkMaterials.create({
      title: matTitle,
      description: matDesc,
      materials: links,
      topicId: topicId || undefined,
      state: 'PUBLISHED'
    }, course.id);
    Logger.log('%s: explainer material posted (%s deck/s)', cohort, slugs.length);
  });
  Logger.log('Explainer decks done.');
}
