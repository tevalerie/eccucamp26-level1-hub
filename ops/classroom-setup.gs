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
  'SVG': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@gmail.com', 'kelvin.pompey@gmail.com'],
  'Anguilla & Montserrat': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@gmail.com', 'the.maxwell.22@gmail.com'],
  'Dominica': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@gmail.com']
};

// AI Studio workspace folders (Drive) + client discovery briefs, per cohort.
// Posted as a pinned 'Your Studio & Client' material in each class.
var STUDIO_LINKS = {
  'SKN': [
    {t:'Sub-Studio A — SCASPA · pod folders', u:'https://drive.google.com/drive/folders/1oBT6L7HoQ7X9xSj31ZGFqHHkvPG47iob'},
    {t:'SCASPA — client discovery brief', u:'https://drive.google.com/file/d/1NDJSnjdaxLjPntbu0tZEj6J-a-KUgsVw/view'},
    {t:'Sub-Studio B — Sagicor Finance · pod folders', u:'https://drive.google.com/drive/folders/18I4bkWXZWTrjgpT9IpuJ6l_UimvkHMku'},
    {t:'Sagicor Finance — client discovery brief', u:'https://drive.google.com/file/d/1He5d-bxyKRadWJLWk7fic1wZxb6bF9u4/view'}
  ],
  'SVG': [
    {t:'Sub-Studio A — NAWASA · pod folders', u:'https://drive.google.com/drive/folders/1Yy3bFfX8uJNDbYsUothPlRHTDHBlzncJ'},
    {t:'NAWASA — client discovery brief', u:'https://drive.google.com/file/d/155nWhXp0APLqlce2Fop7nzSG0NKCE7yn/view'},
    {t:'Sub-Studio B — IRD Grenada · pod folders', u:'https://drive.google.com/drive/folders/13GpIf64NsniH4bFlHNvgOSvMuaqed409'},
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

var WEEK_FOLDERS = {
  1: 'https://drive.google.com/drive/folders/1hGfzv9xLoGpqOQwdjODA9s1pYRydiCNF',
  2: 'https://drive.google.com/drive/folders/102qKO6degcEyI_ewwkm3Aj5lIUzAzIPD',
  3: 'https://drive.google.com/drive/folders/1zzxHKtG3xJlv9-8PA99LI3EJ-p9e6jL4',
  4: 'https://drive.google.com/drive/folders/19qmUa2xEuuUxVhYt-TJwGVve71D_Yo-Y'
};

var SKELETONS = {
  1: 'https://drive.google.com/drive/folders/1xsLT-_WykPkKMEZETmmM1AU7eEvjs67Y',
  2: 'https://drive.google.com/drive/folders/1Juu-pLKqAVMIMlF3jRoeNu16Ej1F7dFb',
  3: 'https://drive.google.com/drive/folders/1bd35cfooFYJxn-N2Ink0JxJocqj5p-fH',
  4: 'https://drive.google.com/drive/folders/1OppBXPw2kqGgv0RZMufxeMYTFiVfsaVX'
};

var DEEPNOTE = 'https://deepnote.com/workspace/2026-GENAI-34873e1f-ad18-4ecb-a7b3-41af1b9e6c12/project/GEN-AI-NoteBook-905d918f-9083-4b41-a913-406bd9c53b88/notebook/Certification-Notes-ab83a0f8a1fd44599f29941d4373cf1a';
var COLAB_FALLBACK = 'https://drive.google.com/drive/folders/1cj2u5d__YZDOhU4vrn1RWj_ssWTPKJrE';

// One entry per camp day. `extra` links are appended after the standard set.
var DAYS = [
  {n:1, wk:1, title:"Deconstruct \u2014 Inside the Bot: Deconstruct Before You Construct",
    desc:"Six components. One central rule. First lines of Python. Vision-Cast opens the day; pods probe the two bench bots.",
    extra:[
      {t:'Miss Khalifa AI — chat live', u:'https://misskhalifa.eccugenai.app/chat'},
      {t:'Ancestra & The Guardian — chat live', u:'https://ancestra.eccugenai.app/'},
      {t:'Bot-Demo Question Kit', u:'https://drive.google.com/drive/folders/1r2xhTW2GwdOrDQyJlM1YdOFlLxl688l_'},
      {t:'Day 1 Energiser Kahoot', u:'https://create.kahoot.it/details/5442bdf3-6db6-4970-bed3-581bf080b245'}
    ]},
  {n:2, wk:1, title:"Design \u2014 Designing for People Before Programming",
    desc:"Persona \u2192 Empathy Map \u2192 Wardrobe. First conditionals in code.",
    extra:[
      {t:'Day 2 Notebook — Deepnote', u:'https://deepnote.com/workspace/2026-GEN-AI-CAMP-74429897-e60c-42c1-ace8-95e21e316d45/project/GEN-AI-WEEK-1-bd0f5f6e-7e59-4084-af2c-be18d22b537a/notebook/DAY2-ef87950d4b1243cfa28a0578773231ae'}
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
  'Dominica': ['dominica', 'dom ', 'dom&']
};

function populateAllCohorts() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  var courses = res.courses || [];
  if (!courses.length) { Logger.log('No ACTIVE classes found — do STEP A first.'); return; }

  COHORTS.forEach(function (cohort) {
    var course = findCourse(courses, cohort);
    if (!course) { Logger.log('SKIP %s — no class name matched its keywords.', cohort); return; }
    Logger.log('COURSE  %s  →  "%s"  (id %s · join code %s)', cohort, course.name, course.id, course.enrollmentCode);

    // guard: already populated?
    var existing = Classroom.Courses.Topics.list(course.id);
    var names = ((existing && existing.topic) || []).map(function (t) { return t.name; });
    if (names.indexOf('Week 1') !== -1) { Logger.log('  already populated — skipping.'); return; }

    // section + description
    Classroom.Courses.patch({
      section: SECTION,
      descriptionHeading: 'The Bot is the GPS. The Human is the Driver.',
      description: 'Four weeks · 20 days · Deconstruct → Design → Build → Pitch. Hub: ' + HUB
    }, course.id, { updateMask: 'section,descriptionHeading,description' });

    // week topics (reverse so Week 1 lands on top)
    var topicIds = {};
    [4, 3, 2, 1].forEach(function (w) {
      var topic = Classroom.Courses.Topics.create({ name: 'Week ' + w }, course.id);
      topicIds[w] = topic.topicId;
      Utilities.sleep(150);
    });

    // day materials (reverse so Day 1 appears first within each topic)
    DAYS.slice().reverse().forEach(function (d) {
      var links = [
        { link: { url: HUB + '/#curriculum', title: 'Camp hub — curriculum' } },
        { link: { url: WEEK_FOLDERS[d.wk],  title: 'Week ' + d.wk + ' — all materials (Drive)' } },
        { link: { url: SKELETONS[d.wk],     title: 'Week ' + d.wk + ' — skeleton code' } },
        { link: { url: DEEPNOTE,            title: 'Deepnote — camp notebook' } },
        { link: { url: COLAB_FALLBACK,      title: 'Google Colab version (if Deepnote misbehaves)' } }
      ];
      (d.extra || []).forEach(function (x) { links.push({ link: { url: x.u, title: x.t } }); });
      Classroom.Courses.CourseWorkMaterials.create({
        title: 'Day ' + pad2(d.n) + ' · ' + d.title,
        description: d.desc,
        materials: links,
        topicId: topicIds[d.wk],
        state: 'PUBLISHED'
      }, course.id);
      Utilities.sleep(200);
    });

    // 'Your Studio & Client' — created last so it sits above Week 1 in Classwork
    var studioTopic = Classroom.Courses.Topics.create({ name: 'Your Studio & Client' }, course.id);
    var studioLinks = (STUDIO_LINKS[cohort] || []).map(function (x) { return { link: { url: x.u, title: x.t } }; });
    studioLinks.push({ link: { url: HUB + '/#clients', title: 'The Client Board — all ten briefs' } });
    Classroom.Courses.CourseWorkMaterials.create({
      title: 'Your AI Studio workspace & client brief',
      description: 'Save every Google AI Studio prompt into YOUR pod folder — that folder is your studio. Read your client\'s discovery brief before the Day 3 client interview. Roles rotate Mondays; the pod folder stays.',
      materials: studioLinks,
      topicId: studioTopic.topicId,
      state: 'PUBLISHED'
    }, course.id);
    Utilities.sleep(200);

    // co-teacher invitations
    (CO_TEACHERS[cohort] || []).forEach(function (email) {
      try {
        Classroom.Invitations.create({ courseId: course.id, role: 'TEACHER', userId: email });
        Logger.log('  invited teacher: %s', email);
      } catch (e) {
        Logger.log('  FAILED inviting %s — %s', email, e.message);
      }
    });
  });
  Logger.log('Done. Now run printJoinMessages for the send-ready blocks.');
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
