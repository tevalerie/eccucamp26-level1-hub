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
  'SKN': [],                      // e.g. ['facilitator@example.com']
  'SVG': [],
  'Anguilla & Montserrat': [],
  'Dominica': []
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
  {n:1,  wk:1, title:'Deconstruct — Bot Probe & First Python',
    desc:'The Bot is the GPS. The Human is the Driver. Probe the two bench bots, map what works and fails, write your first Python in Trinket.',
    extra:[
      {t:'Miss Khalifa AI — chat live', u:'https://misskhalifa.eccugenai.app/chat'},
      {t:'Ancestra & The Guardian — chat live', u:'https://ancestra.eccugenai.app/'},
      {t:'Bot-Demo Question Kit', u:'https://drive.google.com/drive/folders/1r2xhTW2GwdOrDQyJlM1YdOFlLxl688l_'}
    ]},
  {n:2,  wk:1, title:'Design — The Wardrobe (Persona & Wireframes)',
    desc:'Dicts, TONES, register switching. Persona work plus first wireframes in Google Stitch. Cert block begins on freeCodeCamp.'},
  {n:3,  wk:1, title:'Prototype — Functions & the Client Interview',
    desc:'Functions as reusable skills. Build the challenge bot and meet your client brief.'},
  {n:4,  wk:1, title:'Refine — Map & Rulebook (Plain Language + Territory)',
    desc:'Dict-of-dicts territories, loops over requirements, translate() lookups.'},
  {n:5,  wk:1, title:'Integrate — A.R.T. Classifier & First Agent',
    desc:'A.R.T. classifier, escalation logic, and the first agent: perceive · reason · act. Week 1 mini-pitch.'},
  {n:6,  wk:2, title:'Data — Axis 1 · Authority (Pandas Dashboard)',
    desc:'Data frames and the first Streamlit dashboard: your bot learns to know things.'},
  {n:7,  wk:2, title:'Prompt — Axis 2 · Register (Advanced Prompt Engineering)',
    desc:'The centrepiece: Prompt-vs-Context Split · Few-Shot (with PII hygiene) · Persona Anchoring. Google AI Studio all day.'},
  {n:8,  wk:2, title:'GenAI API — Axis 3 · Territory (Mid-Point Client Check-in)',
    desc:'Gemini API wired into wk2_bot.py behind safe_call(). Security review of the API integration. Client check-in.'},
  {n:9,  wk:2, title:'QA & Security — Adversarial Testing',
    desc:'Crash-test day: adversarial rounds, edge cases, bug_log.csv. Break it before the client does.'},
  {n:10, wk:2, title:'Docs — KPI & Handover Foundations',
    desc:'README discipline, KPI code, and the documentation package that Week 4 will finish.'},
  {n:11, wk:3, title:'Sense — Vision & PII',
    desc:'Gemini Vision reads documents; Pillow powers the redact_pii pipeline. Care-first handling of personal data.'},
  {n:12, wk:3, title:'Speak — Voice & Accessibility',
    desc:'gTTS first, neural voices where quality demands. No robotic voices. safe_call_voice wiring.'},
  {n:13, wk:3, title:'Show — Guides & the RAG Upgrade',
    desc:'Day 4’s rulebook was the toy version. RAG is how it scales: sentence-transformers + Chroma DB.'},
  {n:14, wk:3, title:'Decide — State Machine, Guardrails Wall & Distress Safeguard',
    desc:'Planning notes stay visible, reasoning stays safe. The six-check Guardrails Wall: Safety · Privacy · Accuracy · Fairness · Transparency · Accountability.'},
  {n:15, wk:3, title:'Demonstrate — Internal Showcase',
    desc:'DemoDash polish, self-reflection on one showcase response, and the ten-techniques recap.'},
  {n:16, wk:4, title:'Refine — Kanban Triage & Pitch Prep Begins',
    desc:'Day 1 named it. This week is the loop with receipts. 5-Beat pitch prep; pod roles lock in.'},
  {n:17, wk:4, title:'Confirm — Confirmation Register & Advanced PE',
    desc:'Verified vs pending. Client-facing claim ledger with signatures. Adversarial rotation and the Cross-Pod Crash Test.'},
  {n:18, wk:4, title:'Harden — Accessibility, Resilience & Deploy',
    desc:'try/except, the safe_call multi-provider fallback chain, and one-click deploy to Streamlit Community Cloud. Your bot gets a real URL.'},
  {n:19, wk:4, title:'Document & Certify — Handover Package & Mock Pitch',
    desc:'python-docx builds the client handover. Mock 5-beat pitch with a hard 5-minute SLA and one hard question.'},
  {n:20, wk:4, title:'PREMIERE — Cabinet Pitch, Awards & Graduation',
    desc:'Ship-or-Wait was decided. Final pitch, portfolio complete, showcase to the region.'}
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

function pad2(n) { return (n < 10 ? '0' : '') + n; }
