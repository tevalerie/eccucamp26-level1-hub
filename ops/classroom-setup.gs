/**
 * ECCU Generative AI & Python Summer Camp 2026 — Google Classroom bootstrap
 * ---------------------------------------------------------------------------
 * Creates one Classroom course per cohort, four week topics per course, and
 * twenty published course-work materials (one per camp day) with links to the
 * hub site, the week's Drive folder, skeleton code, and day-specific extras.
 *
 * HOW TO RUN (once, ~2 minutes):
 *   1. Sign in to the Google account that will OWN the classes.
 *   2. Open https://script.new  →  paste this whole file over the editor.
 *   3. Left sidebar → Services (+) → add "Google Classroom API" (Classroom).
 *   4. Pick setupAllCohorts in the toolbar dropdown → Run → authorize.
 *   5. Watch the execution log — it prints each course + join code.
 *
 * Re-running is safe-ish but NOT idempotent: it creates new courses each time.
 * Run once; tweak individual classes in the Classroom UI afterwards.
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
  // NOTE: 'Shaeed.Cabey@igmail.com' was supplied with domain 'igmail.com' —
  // if that invite fails in the log, correct to gmail.com and re-run invites.
  'SKN': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@igmail.com'],
  'SVG': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@igmail.com', 'kelvin.pompey@gmail.com'],
  'Anguilla & Montserrat': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@igmail.com', 'the.maxwell.22@gmail.com'],
  'Dominica': ['tvpyke@gmail.com', 'notefromgolda@gmail.com', 'nicolejohnson967@gmail.com', 'Shaeed.Cabey@igmail.com']
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

function setupAllCohorts() {
  COHORTS.forEach(function (cohort) {
    var course = Classroom.Courses.create({
      name: COURSE_NAME_PREFIX + cohort,
      section: SECTION,
      descriptionHeading: 'The Bot is the GPS. The Human is the Driver.',
      description: 'Four weeks · 20 days · Deconstruct → Design → Build → Pitch. Hub: ' + HUB,
      ownerId: 'me',
      courseState: 'ACTIVE'
    });
    Logger.log('COURSE  %s  →  id %s  ·  join code %s', course.name, course.id, course.enrollmentCode);

    // Week topics (created in reverse so Week 1 lands on top)
    var topicIds = {};
    [4, 3, 2, 1].forEach(function (w) {
      var topic = Classroom.Courses.Topics.create({ name: 'Week ' + w }, course.id);
      topicIds[w] = topic.topicId;
      Utilities.sleep(150);
    });

    // Day materials (reverse so Day 1 appears first within each topic)
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

    // Optional co-teacher invitations
    (CO_TEACHERS[cohort] || []).forEach(function (email) {
      try {
        Classroom.Invitations.create({ courseId: course.id, role: 'TEACHER', userId: email });
        Logger.log('  invited teacher: %s', email);
      } catch (e) {
        Logger.log('  FAILED inviting %s — %s', email, e.message);
      }
    });
  });
  Logger.log('Done. Join codes are above — share each with its territory.');
}

/**
 * Run AFTER setupAllCohorts. Prints a ready-to-send join message per cohort —
 * copy each block straight into WhatsApp / email.
 */
function printJoinMessages() {
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'] });
  (res.courses || []).forEach(function (c) {
    if (c.name.indexOf(COURSE_NAME_PREFIX) !== 0) return;
    var cohort = c.name.replace(COURSE_NAME_PREFIX, '');
    Logger.log('──────── %s ────────\n' +
      'Welcome to the ECCU GenAI & Python Summer Camp 2026 (%s)!\n' +
      '1. Go to https://classroom.google.com (sign in with your Google account)\n' +
      '2. Click the +  →  Join class\n' +
      '3. Enter this class code:  %s\n' +
      'All 20 days of materials are inside. See you in the Studio!\n' +
      'Camp hub: %s',
      cohort, cohort, c.enrollmentCode, HUB);
  });
}

function pad2(n) { return (n < 10 ? '0' : '') + n; }
