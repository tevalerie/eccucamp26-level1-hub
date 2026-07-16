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
    {t:'Sub-Studio A — SCASPA · Pods 1–4 · pod folders', u:'https://drive.google.com/drive/folders/1oBT6L7HoQ7X9xSj31ZGFqHHkvPG47iob'},
    {t:'SCASPA — client discovery brief', u:'https://drive.google.com/file/d/1NDJSnjdaxLjPntbu0tZEj6J-a-KUgsVw/view'},
    {t:'Sub-Studio B — Sagicor Finance · Pods 5–8 · pod folders', u:'https://drive.google.com/drive/folders/18I4bkWXZWTrjgpT9IpuJ6l_UimvkHMku'},
    {t:'Sagicor Finance — client discovery brief', u:'https://drive.google.com/file/d/1He5d-bxyKRadWJLWk7fic1wZxb6bF9u4/view'}
  ],
  'SVG': [
    {t:'Sub-Studio A — NAWASA · Pods 1–6 · pod folders', u:'https://drive.google.com/drive/folders/1Yy3bFfX8uJNDbYsUothPlRHTDHBlzncJ'},
    {t:'NAWASA — client discovery brief', u:'https://drive.google.com/file/d/155nWhXp0APLqlce2Fop7nzSG0NKCE7yn/view'},
    {t:'Sub-Studio B — IRD Grenada · Pods 7–12 · pod folders', u:'https://drive.google.com/drive/folders/13GpIf64NsniH4bFlHNvgOSvMuaqed409'},
    {t:'IRD Grenada — client discovery brief', u:'https://drive.google.com/file/d/1GDAmvok28TEDtGVJffXSb_3Ipvc1iqZt/view'}
  ],
  'Anguilla & Montserrat': [
    {t:'Studio — IRD Anguilla · pod folders', u:'https://drive.google.com/drive/folders/1ri7TP-b-nW_AbQJBVWWWy3eWg-9mRvY-'},
    {t:'IRD Anguilla — client discovery brief', u:'https://drive.google.com/file/d/1RkbYG9zfnqbc8t6PID0Eq2Gfrn9FbHy5/view'}
  ],
  'Dominica': [
    {t:'Studio — CUB · pod folders', u:'https://drive.google.com/drive/folders/1GV_iceJuq0Blu62ZT-Sw3PVBqC82TFTx'},
    {t:'CUB — client discovery brief', u:'https://drive.google.com/file/d/1Hrxh9MqnaiLeBOStbh32ZFwgercsf5R_/view'}
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
    {t:'Skeleton code \u2014 Days 1\u20135', u:'https://drive.google.com/drive/folders/1xsLT-_WykPkKMEZETmmM1AU7eEvjs67Y'}
  ],
  2: [
    {t:'Week 2 Participant Workbook', u:'https://drive.google.com/file/d/1NE_umOE8iSWeF6xo2NimB91QfJqCBsAd/view'},
    {t:'Week 2 Deck (Days 6\u201310)', u:'https://drive.google.com/file/d/18EXy5MxvEpy7e2VAV6YhYiyBvpeehepr/view'},
    {t:'Documentation Package Template', u:'https://drive.google.com/file/d/1pzUmonJfH4kjSBovVOhSLOG9C4B3g1Wp/view'},
    {t:'Skeleton code \u2014 Days 6\u201310', u:'https://drive.google.com/drive/folders/1Juu-pLKqAVMIMlF3jRoeNu16Ej1F7dFb'}
  ],
  3: [
    {t:'Week 3 Participant Workbook', u:'https://drive.google.com/file/d/1fNsPdvJ2qr4kT4s49tHuJTUV-Pd74xHt/view'},
    {t:'Week 3 Deck (Days 11\u201315)', u:'https://drive.google.com/file/d/11oNBsP82aYtv_ZhZdbJWCflWdz9yDu6e/view'},
    {t:'Multi-Modal Feature Card', u:'https://drive.google.com/file/d/1eBXEWpd617dLJcimq2o3KiUSDarOaOhY/view'},
    {t:'Skeleton code \u2014 Days 11\u201315', u:'https://drive.google.com/drive/folders/1bd35cfooFYJxn-N2Ink0JxJocqj5p-fH'}
  ],
  4: [
    {t:'Week 4 Participant Workbook', u:'https://drive.google.com/file/d/1pEzLpZLvkecoK3DgsvTYmyreGDq9_ieU/view'},
    {t:'Week 4 Deck (Days 16\u201320)', u:'https://drive.google.com/file/d/1A3Ykryt4ZmFj26CJh2WQSjlywVk2rzTz/view'},
    {t:'Handover Package Template', u:'https://drive.google.com/file/d/1ducTt9rVkjguFJ-ySRcQLBoEG7KrERdf/view'},
    {t:'Skeleton code \u2014 Days 16\u201320', u:'https://drive.google.com/drive/folders/1OppBXPw2kqGgv0RZMufxeMYTFiVfsaVX'}
  ]
};

var DEEPNOTE = 'https://deepnote.com/workspace/2026-GENAI-34873e1f-ad18-4ecb-a7b3-41af1b9e6c12/project/GEN-AI-NoteBook-905d918f-9083-4b41-a913-406bd9c53b88/notebook/Certification-Notes-ab83a0f8a1fd44599f29941d4373cf1a';
var COLAB_FALLBACK = 'https://drive.google.com/drive/folders/1cj2u5d__YZDOhU4vrn1RWj_ssWTPKJrE';

// One entry per camp day. `extra` links are appended after the standard set.
var DAYS = [
  {n:1, wk:1, title:"Deconstruct \u2014 Inside the Bot: Deconstruct Before You Construct",
    desc:"Six components. One central rule. First lines of Python. Vision-Cast opens the day; pods probe the two bench bots.",
    extra:[
      {t:'Miss Khalifa AI — chat live', u:'https://misskhalifa.eccugenai.app/chat'},
      {t:'Ancestra & The Guardian — chat live', u:'https://ancestra.eccugenai.app/'}
    ]},
  {n:2, wk:1, title:"Design \u2014 Designing for People Before Programming",
    desc:"Persona \u2192 Empathy Map \u2192 Wardrobe. First conditionals in code.",
    extra:[
      {t:'Day 2 Notebook — Deepnote', u:'https://deepnote.com/workspace/2026-GEN-AI-CAMP-74429897-e60c-42c1-ace8-95e21e316d45/project/GEN-AI-WEEK-1-bd0f5f6e-7e59-4084-af2c-be18d22b537a/notebook/DAY2-ef87950d4b1243cfa28a0578773231ae'},
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
      (CAMPER_WEEK[d.wk] || []).forEach(function (x) { links.push({ link: { url: x.u, title: x.t } }); });
      links.push({ link: { url: DEEPNOTE, title: 'Deepnote — camp notebook' } });
      links.push({ link: { url: COLAB_FALLBACK, title: 'Google Colab version (if Deepnote misbehaves)' } });
      (d.extra || []).forEach(function (x) { links.push({ link: { url: x.u, title: x.t } }); });
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
      var studioLinks = (STUDIO_LINKS[cohort] || []).map(function (x) { return { link: { url: x.u, title: x.t } }; });
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
        if (m.title.indexOf('Day ') === 0) {
          Classroom.Courses.CourseWorkMaterials.remove(course.id, m.id);
          removed++;
          Utilities.sleep(150);
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

function pad2(n) { return (n < 10 ? '0' : '') + n; }

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
    var mats = Classroom.Courses.CourseWorkMaterials.list(course.id, { pageSize: 60 });
    var titles = ((mats && mats.courseWorkMaterial) || []).map(function (m) { return m.title; });
    var days = titles.filter(function (t) { return t.indexOf('Day ') === 0; }).length;
    var studio = titles.some(function (t) { return t.indexOf('Your AI Studio workspace') === 0; });
    var anns = Classroom.Courses.Announcements.list(course.id, { pageSize: 10 });
    var annCount = ((anns && anns.announcements) || []).length;
    var teachers = (Classroom.Courses.Teachers.list(course.id).teachers || []).length;
    var invites = (Classroom.Invitations.list({ courseId: course.id }).invitations || []).length;
    Logger.log('%s → "%s"\n  topics: %s\n  day materials: %s / 20 · studio material: %s\n  announcements: %s · teachers joined: %s · invites pending: %s\n  join code: %s',
      cohort, course.name, topics.join(' · ') || 'NONE', days, studio ? 'YES' : 'MISSING',
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
    {pod:"Pod 5", client:"Sub-Studio B \u00b7 SAGICOR FINANCE", names:"Chanardo Evans, Emma Morris, Nya Jack, Veronique Mardenborough"},
    {pod:"Pod 6", client:"Sub-Studio B \u00b7 SAGICOR FINANCE", names:"Amarni Moore, Ashaun Moore, Cayden Williams, Addijah Daniel"},
    {pod:"Pod 7", client:"Sub-Studio B \u00b7 SAGICOR FINANCE", names:"Antwan Daniel, Rhae-Jae Williams, Ke'Tashee Ward, Christian Corbie"},
    {pod:"Pod 8", client:"Sub-Studio B \u00b7 SAGICOR FINANCE", names:"Arianna Blanchard, Yendri Nisbett, (name pending)"},
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
  "scaspa": {client:"SCASPA", gammaUrl:"https://gamma.app/docs/thclmcngm4iryzo", exportUrl:"https://assets.api.gamma.app/export/pdf/thclmcngm4iryzo/95244f625f162be59d07326e49f5a845/SCASPA-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/thclmcngm4iryzo/b3353a17caaa26a98a21992185a43536/SCASPA-Explained-Your-Client-in-9-Cards.pptx", folderId:"1oBT6L7HoQ7X9xSj31ZGFqHHkvPG47iob"},
  "sagicor": {client:"Sagicor Finance", gammaUrl:"https://gamma.app/docs/nhs8rcvweo7mx6w", exportUrl:"https://assets.api.gamma.app/export/pdf/nhs8rcvweo7mx6w/f4ab73c99e1ca2b74446f5b4fd1aad33/Sagicor-Finance-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/nhs8rcvweo7mx6w/c66d052646c506c6ccee9236d76b4872/Sagicor-Finance-Explained-Your-Client-in-9-Cards.pptx", folderId:"18I4bkWXZWTrjgpT9IpuJ6l_UimvkHMku"},
  "ird_grenada": {client:"IRD Grenada", gammaUrl:"https://gamma.app/docs/qoihr3sttd4ioos", exportUrl:"https://assets.api.gamma.app/export/pdf/qoihr3sttd4ioos/37b593a16e524d8dcd542138f110b90a/IRD-Grenada-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/qoihr3sttd4ioos/7a85681d943c0b852ffa08b64051e23c/IRD-Grenada-Explained-Your-Client-in-9-Cards.pptx", folderId:"13GpIf64NsniH4bFlHNvgOSvMuaqed409"},
  "lucelec": {client:"LUCELEC", gammaUrl:"https://gamma.app/docs/zftbqzlcvm4d8yb", exportUrl:"https://assets.api.gamma.app/export/pdf/zftbqzlcvm4d8yb/ae29ac5033e265b51f88533803ca83b0/LUCELEC-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/zftbqzlcvm4d8yb/89a5f0ad2bf8e794b417d6384d1c9d02/LUCELEC-Explained-Your-Client-in-9-Cards.pptx", folderId:"1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd"},
  "acb": {client:"ACB Caribbean", gammaUrl:"https://gamma.app/docs/0ak3elrclbo5nb9", exportUrl:"https://assets.api.gamma.app/export/pdf/0ak3elrclbo5nb9/2636410282b0010163a00cd31aca7df8/ACB-Caribbean-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/0ak3elrclbo5nb9/bbf7b0673a120618fe35db5ac71a3368/ACB-Caribbean-Explained-Your-Client-in-9-Cards.pptx", folderId:"1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd"},
  "cub": {client:"CUB", gammaUrl:"https://gamma.app/docs/esj91ph94orgjdm", exportUrl:"https://assets.api.gamma.app/export/pdf/esj91ph94orgjdm/904a09eb1fe90d40ca545e48f6233c61/Caribbean-Union-Bank-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/esj91ph94orgjdm/01376de1532bf2e44b11a6ae1219af3c/Caribbean-Union-Bank-Explained-Your-Client-in-9-Cards.pptx", folderId:"1GV_iceJuq0Blu62ZT-Sw3PVBqC82TFTx"},
  "nis_grenada": {client:"NIS Grenada", gammaUrl:"https://gamma.app/docs/tsrpbdcim793uxx", exportUrl:"https://assets.api.gamma.app/export/pdf/tsrpbdcim793uxx/4d0f3b42f5ff0e65e94f0bec35d6e1e6/NIS-Grenada-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/tsrpbdcim793uxx/60d02487f1ffad3e595599f26e9284b8/NIS-Grenada-Explained-Your-Client-in-9-Cards.pptx", folderId:"1nJzrlDUoWL8t62c-XSTk8Gu6aiwpBRfd"},
  "ird_anguilla": {client:"IRD Anguilla", gammaUrl:"https://gamma.app/docs/jsxglvc0bprsi5u", exportUrl:"https://assets.api.gamma.app/export/pdf/jsxglvc0bprsi5u/6bad9600ca8744f1d581e3c2383a3251/IRD-Anguilla-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/jsxglvc0bprsi5u/ba28dd652a7547da64e19103173220ab/IRD-Anguilla-Explained-Your-Client-in-9-Cards.pptx", folderId:"1ri7TP-b-nW_AbQJBVWWWy3eWg-9mRvY-"},
  "nawasa": {client:"NAWASA", gammaUrl:"https://gamma.app/docs/3lcua5uyqp75uyn", exportUrl:"https://assets.api.gamma.app/export/pdf/3lcua5uyqp75uyn/f1e297074f32df7dee8004af85611b18/NAWASA-Explained-Your-Client-in-9-Cards.pdf", pptxUrl:"https://assets.api.gamma.app/export/pptx/3lcua5uyqp75uyn/3ca4944b9e0f5556e5e8db17f7f7c1f9/NAWASA-Explained-Your-Client-in-9-Cards.pptx", folderId:"1Yy3bFfX8uJNDbYsUothPlRHTDHBlzncJ"},
};
var COHORT_DECKS = {
  "SKN": [
    "scaspa",
    "sagicor"
  ],
  "SVG": [
    "nawasa",
    "ird_grenada"
  ],
  "Anguilla & Montserrat": [
    "ird_anguilla"
  ],
  "Dominica": [
    "cub"
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
          .setName(d.client + ' — Explained (teen edition)' + fmt[1]);
        folder.createFile(blob);
        Logger.log('%s: %s saved to Drive folder', slug, fmt[1]);
      } catch (e) {
        Logger.log('%s: %s save FAILED — %s', slug, fmt[1], (e.message || '').slice(0, 90));
      }
    });
  });

  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) return;
    var slugs = COHORT_DECKS[cohort] || [];
    if (!slugs.length) return;
    var topicId = null;
    ((Classroom.Courses.Topics.list(course.id).topic) || []).forEach(function (t) {
      if (t.name === 'Your Studio & Client') topicId = t.topicId;
    });
    var names = slugs.map(function (s) { return EXPLAINER_DECKS[s].client; });
    var links = slugs.map(function (s) {
      var d = EXPLAINER_DECKS[s];
      return { link: { url: d.gammaUrl, title: d.client + ' — Explained (teen edition)' } };
    });
    var matTitle = (names.length > 1 ? 'Your clients, explained — ' : 'Your client, explained — ')
      + names.join(' & ') + ' (teen edition)';
    var matDesc = 'The client brief, retold in plain language with an analogy you can pitch with. '
      + (names.length > 1
          ? 'Read YOUR pod\'s client — check the pod announcement in the Stream if unsure. '
          : '')
      + 'Read it before the Day 3 client interview. The PDF copy also lives in your Studio folder.';
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
