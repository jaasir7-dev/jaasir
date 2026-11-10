/* =====================================================================
   Jaasir-OS · terminal, sound and window manager
   EDIT ME — everything the terminal says about you lives in `ME`.
   ===================================================================== */
const ME = {
  name: "Jaasir",
  tagline: "ICT undergrad · cybersecurity grad · coding instructor",
  about: [
    "Hey, I'm Muhammad Jaasir, a Year 2 Information & Communication",
    "Technology undergraduate at the Singapore University of Social",
    "Sciences (SUSS), with a minor in Criminology.",
    "",
    "I've always been fascinated by how technology shapes our world.",
    "My studies sit alongside hands-on experience in software development,",
    "network protocols and hardware infrastructure.",
    "",
    "As a Desktop Engineer in Singapore's public education sector I built",
    "practical skills in IT troubleshooting, system maintenance and managing",
    "end-user devices. Tech retail sharpened how I communicate, so I can turn",
    "complex technical ideas into plain answers. These days I teach kids",
    "Python as a Coding Instructor.",
    "",
    "Adaptable, collaborative, and always up for a good problem."
  ],
  education: [
    { where: "Singapore University of Social Sciences (SUSS)", what: "BSc Information & Communication Technology, minor in Criminology", when: "Jul 2025 – Aug 2029 (expected)" },
    { where: "Temasek Polytechnic", what: "Diploma in Cybersecurity & Digital Forensics · GPA 3.50 / 4.00", when: "Apr 2020 – Apr 2023" },
    { where: "Bowen Secondary School", what: "GCE O-Level · 4 distinctions", when: "Jan 2016 – Dec 2019" }
  ],
  experience: [
    { role: "Coding Instructor", where: "Lyza Education", when: "Jun 2026 – present", points: [
        "Teach Python to children through interactive, project-based lessons",
        "Build computational thinking and guide students through debugging",
        "Keep lessons engaging for learners at different skill levels" ] },
    { role: "Desktop Engineer", where: "NCS Group", when: "May 2022 – Sep 2022", points: [
        "Delivered the MOE Standard ICT Operating Environment (SSOE) to schools",
        "Managed 500+ student and staff devices with 100% uptime for learning apps",
        "Sped up workstation delivery by 20% through OS imaging and provisioning",
        "Resolved 95%+ of hardware and connectivity tickets onsite, within SLA" ] },
    { role: "Retail Associate", where: "Challenger Technologies", when: "Mar 2021 – Mar 2022", points: [
        "Exceeded monthly sales targets with technical advice on notebooks and gadgets",
        "Achieved high sign-up rates for the ValueClub membership programme",
        "Handled inventory and POS with 100% accuracy in cash and stock levels" ] }
  ],
  skills: {
    "languages": ["Python", "JavaScript", "PHP", "SQL", "HTML", "CSS"],
    "frameworks": ["ReactJS"],
    "data": ["MongoDB", "SQL", "JSON"],
    "tools": ["Git", "GitHub"],
    "security": ["Kali Linux", "Digital forensics"],
    "it support": ["OS imaging", "Hardware provisioning", "Troubleshooting"],
    "teaching": ["Python for kids", "Scratch", "CodeLab"]
  },
  awards: [
    { name: "NSF of the Year", when: "2025" },
    { name: "Best Trooper Award", when: "2025" }
  ],
  certs: [
    { name: "AWS Academy Graduate – Cloud Foundations", when: "2022" },
    { name: "AWS Academy Graduate – Cloud Security Foundations", when: "2022" }
  ],
  projects: [
    { name: "jaasir-os", desc: "This 8-bit terminal portfolio with built-in games. Vanilla HTML/CSS/JS, sound made with the Web Audio API.", url: "https://github.com/jaasir7-dev/jaasir" }
    // Add more: { name: "project-name", desc: "What it does and what you built it with.", url: "https://github.com/..." },
  ],
  links: {                         // leave a value empty ("") to hide it
    github:   "https://github.com/jaasir7-dev",
    linkedin: "https://www.linkedin.com/in/muhammad-jaasir-280303205/",
    email:    ""
  },
  avatar: "avatar.png"
};

/* ============================== sound ============================== */
let ctx = null, muted = false, lastBlip = 0;
try { muted = localStorage.getItem("jos-muted") === "1"; } catch (e) {}
function initAudio(){
  try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === "suspended") ctx.resume(); } catch (e) { ctx = null; }
}
function tone(freq, dur, type = "square", vol = 0.035, when = 0){
  if (!ctx || muted) return;
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + when;
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
}
const sfx = {
  key(){ tone(520 + Math.random() * 240, 0.035, "square", 0.03); },
  blip(){ const n = performance.now(); if (n - lastBlip < 38) return; lastBlip = n; tone(700 + Math.random() * 500, 0.025, "square", 0.022); },
  enter(){ tone(392, 0.06); tone(587, 0.08, "square", 0.035, 0.06); },
  error(){ tone(140, 0.16, "sawtooth", 0.05); tone(105, 0.2, "sawtooth", 0.05, 0.1); },
  boot(){ [262, 330, 392, 523, 659, 784].forEach((f, i) => tone(f, 0.11, "square", 0.04, i * 0.085)); },
  fetch(){ [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.07, "triangle", 0.06, i * 0.06)); },
  open(){ tone(330, 0.05); tone(494, 0.07, "square", 0.035, 0.05); },
  close(){ tone(494, 0.05); tone(330, 0.07, "square", 0.035, 0.05); },
  jump(){ tone(520, 0.05); tone(780, 0.09, "square", 0.035, 0.04); },
  good(){ tone(659, 0.08); tone(988, 0.14, "square", 0.035, 0.08); }
};

/* ========================== window manager ========================= */
const $ = id => document.getElementById(id);
const APPS = {};              // games.js registers { start, stop, key } per app here
let current = "terminal";
function openApp(name){
  if (current && APPS[current] && APPS[current].stop) APPS[current].stop();
  current = name;
  document.querySelectorAll(".win").forEach(w => { w.hidden = w.dataset.app !== name; });
  $("home").hidden = !!name;
  if (document.activeElement && document.activeElement !== cmd) document.activeElement.blur();
  document.querySelectorAll("#dock button").forEach(b => b.setAttribute("aria-current", String(b.dataset.app === name)));
  if (name === "terminal"){ scrollEnd(); if (matchMedia("(pointer:fine)").matches) focusCmd(); } else cmd.blur();
  if (name && APPS[name] && APPS[name].start) APPS[name].start();
}
$("dock").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  initAudio(); sfx.open(); openApp(b.dataset.app);
});
document.addEventListener("click", e => { if (e.target.closest("[data-close]")){ sfx.close(); openApp(null); } });
window.addEventListener("keydown", e => {
  if (!booted) return;
  if (e.key === "Escape" && current){ sfx.close(); openApp(null); return; }
  if (current && APPS[current] && APPS[current].key) APPS[current].key(e);
});

/* ============================= terminal ============================ */
const out = $("out"), scr = $("screen"), cmd = $("cmd"), typed = $("typed"), term = $("win-terminal");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const c = (cls, t) => ({ t, c: cls });
const link = (t, href) => ({ t, href });
const bare = u => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const scrollEnd = () => { scr.scrollTop = scr.scrollHeight; };
let busy = false, skip = false, hist = [], hIdx = 0, queue = Promise.resolve();

async function type(lines, target = out){
  for (const line of lines){
    const div = document.createElement("div"); div.className = "line"; target.appendChild(div);
    const segs = Array.isArray(line) ? line : [line];
    for (const s of segs){
      const seg = typeof s === "string" ? { t: s } : s;
      const node = document.createElement(seg.href ? "a" : "span");
      if (seg.href){ node.href = seg.href; if (/^https?:/.test(seg.href)){ node.target = "_blank"; node.rel = "noopener"; } }
      if (seg.c) node.className = seg.c;
      div.appendChild(node);
      for (let i = 0; i < seg.t.length; i += 2){
        if (skip || reduced){ node.textContent = seg.t; break; }
        node.textContent += seg.t.slice(i, i + 2);
        sfx.blip(); scrollEnd(); await sleep(12);
      }
    }
    scrollEnd();
    if (!skip && !reduced) await sleep(26);
  }
}

function echo(text){
  const div = document.createElement("div"); div.className = "line ps1";
  div.innerHTML = '<span class="u">visitor</span> <span class="p">~/jaasir</span> <span class="g">&gt;</span> ';
  const s = document.createElement("span"); s.style.color = "var(--ink)"; s.textContent = text; div.appendChild(s);
  out.appendChild(div);
}

function run(raw){
  if (busy) skip = true;
  queue = queue.then(async () => {
    busy = true; skip = false; term.classList.add("busy");
    try { await exec(raw); } finally { busy = false; term.classList.remove("busy"); scrollEnd(); }
  });
  return queue;
}

const FILES = { "about.txt": "about", "skills.txt": "skills", "experience.txt": "experience", "education.txt": "education",
  "awards.txt": "awards", "contact.txt": "contact", "projects": "projects", "resume.pdf": "cv", "games": "games" };
const launch = (app, msg) => async () => { await type([c("dim", msg)]); await sleep(reduced ? 0 : 350); sfx.open(); openApp(app); };
const dated = list => list.map(a => [c("salmon", "  ▸ "), a.name, c("dim", "  (" + a.when + ")")]);

const COMMANDS = {
  help: { d: "list available commands", f: () => type([
      c("peach", "AVAILABLE COMMANDS"), "",
      ...Object.entries(COMMANDS).filter(([, v]) => v.d).map(([k, v]) => [c("salmon", "  " + k.padEnd(12)), c("dim", v.d)]),
      "", c("dim", "tips: [Tab] autocompletes · [↑][↓] history · [Enter] skips the typing · [Esc] closes a window")
    ]) },
  about: { d: "who I am", f: () => type([c("peach", "ABOUT"), "", ...ME.about]) },
  experience: { d: "where I've worked", f: () => type([
      c("peach", "EXPERIENCE"), "",
      ...ME.experience.flatMap(e => [
        [c("salmon", "▸ " + e.role), " @ ", c("teal", e.where)], c("dim", "  " + e.when),
        ...e.points.map(p => "  - " + p), ""
      ])
    ]) },
  education: { d: "where I've studied", f: () => type([
      c("peach", "EDUCATION"), "",
      ...ME.education.flatMap(e => [[c("salmon", "▸ "), c("teal", e.where)], "  " + e.what, c("dim", "  " + e.when), ""])
    ]) },
  skills: { d: "tech I work with", f: () => type([
      c("peach", "SKILLS"), "",
      ...Object.entries(ME.skills).map(([k, v]) => [c("teal", "  " + k.padEnd(12)), v.join(", ")])
    ]) },
  awards: { d: "awards and certifications", f: () => type([
      c("peach", "AWARDS"), "", ...dated(ME.awards), "", c("peach", "CERTIFICATIONS"), "", ...dated(ME.certs)
    ]) },
  projects: { d: "things I've built", f: () => type([
      c("peach", "PROJECTS"), "",
      ...ME.projects.flatMap(p => [[c("salmon", "▸ " + p.name)], "  " + p.desc, ...(p.url ? [["  ", link(bare(p.url), p.url)]] : []), ""]),
      c("dim", "more on the way...")
    ]) },
  contact: { d: "how to reach me", f: () => {
      const L = ME.links, rows = [];
      if (L.linkedin) rows.push([c("teal", "  linkedin  "), link(bare(L.linkedin), L.linkedin)]);
      if (L.github) rows.push([c("teal", "  github    "), link(bare(L.github), L.github)]);
      if (L.email) rows.push([c("teal", "  email     "), link(L.email, "mailto:" + L.email)]);
      return type([c("peach", "CONTACT"), "", ...rows, "", c("dim", "full details are on my CV: type `cv`")]);
    } },
  neofetch: { d: "system info, with a pixel portrait", f: neofetch },
  cv: { d: "open my CV", f: launch("cv", "opening Jaasir_Resume.pdf ...") },
  games: { d: "take a break: dino | trivia", f: () => type([
      c("peach", "GAMES"), "",
      [c("salmon", "  dino      "), c("dim", "endless runner. jump the cacti.")],
      [c("salmon", "  trivia    "), c("dim", "10 quick tech questions.")]
    ]) },
  dino: { d: "", f: launch("dino", "loading dino.exe ...") },
  trivia: { d: "", f: launch("trivia", "loading trivia.exe ...") },
  ls: { d: "list files", f: () => type([[c("teal", "projects/  games/  "), "about.txt  experience.txt  education.txt  skills.txt  awards.txt  contact.txt  resume.pdf"]]) },
  cat: { d: "read a file, e.g. cat about.txt", f: (a) => {
      const k = FILES[(a[0] || "").replace(/\/$/, "").toLowerCase()];
      if (!a[0]) return fail("cat: which file? try `ls`");
      if (!k) return fail("cat: " + a[0] + ": no such file");
      return COMMANDS[k].f([]);
    } },
  cd: { d: "", f: (a) => { const k = (a[0] || "").replace(/\/$/, ""); return k === "projects" || k === "games" ? COMMANDS[k].f([]) : type([c("dim", "nowhere else to go. it's cosy here.")]); } },
  resume: { d: "", f: launch("cv", "opening Jaasir_Resume.pdf ...") },
  certs: { d: "", f: () => COMMANDS.awards.f() },
  whoami: { d: "", f: () => type(["visitor", c("dim", "...but you're looking for " + ME.name + ". try `about`.")]) },
  date: { d: "", f: () => type([new Date().toString()]) },
  echo: { d: "", f: (a) => type([a.join(" ")]) },
  history: { d: "", f: () => type(hist.map((h, i) => [c("dim", String(i + 1).padStart(3) + "  "), h])) },
  sound: { d: "sound on | off", f: (a) => {
      if (a[0] === "on" || a[0] === "off") setMuted(a[0] === "off");
      return type([["sound effects: ", c(muted ? "rose" : "ok", muted ? "OFF" : "ON")]]);
    } },
  sudo: { d: "", f: () => { sfx.error(); return type([c("rose", "visitor is not in the sudoers file. This incident will be reported.")]); } },
  clear: { d: "clear the screen", f: () => { out.innerHTML = ""; } },
  exit: { d: "close the terminal", f: launch(null, "logout") }
};

function fail(msg){ sfx.error(); return type([c("rose", msg)]); }

async function neofetch(){
  const wrap = document.createElement("div"); wrap.className = "fetch";
  const img = document.createElement("img"); img.src = ME.avatar; img.alt = "Pixel portrait of " + ME.name;
  const info = document.createElement("div"); info.className = "info";
  wrap.append(img, info); out.appendChild(wrap);
  sfx.fetch(); scrollEnd();
  const row = (k, v) => [c("b", k), ": " + v];
  await type([
    [c("b", "jaasir"), "@", c("b", "jaasir-os")],
    c("dim", "-----------------"),
    row("OS", "JaasirOS 8-bit x86_64"),
    row("Host", "SUSS · BSc ICT, Year 2"),
    row("Kernel", "Dip. Cybersecurity & Digital Forensics"),
    row("Role", "Coding Instructor @ Lyza Education"),
    row("Uptime", "since Jul 2025 (expected shutdown: Aug 2029)"),
    row("Shell", "python3"),
    row("Languages", "Python, JavaScript, PHP, SQL"),
    row("Stack", "ReactJS, MongoDB, Git"),
    row("Toolbox", "Kali Linux"),
    row("Awards", "NSF of the Year 2025"),
    row("Location", "Singapore")
  ], info);
  const sw = document.createElement("div"); sw.className = "swatches";
  ["#d9967b", "#6c7c8a", "#7fa6b3", "#d98aa0", "#e6bd9c", "#e3d2c6"].forEach(h => { const i = document.createElement("i"); i.style.background = h; sw.appendChild(i); });
  info.appendChild(sw);
}

async function exec(raw){
  const text = raw.trim();
  echo(raw);
  if (!text) return;
  hist.push(text); hIdx = hist.length;
  const [name, ...args] = text.split(/\s+/);
  const key = name.toLowerCase(), entry = COMMANDS[key];
  if (!entry) return fail(name + ": command not found. type `help` to see what works.");
  await entry.f(args);
  if (key !== "clear") await type([""]);
}

/* ============================== input ============================== */
const render = () => { typed.textContent = cmd.value; scrollEnd(); };
const focusCmd = () => cmd.focus({ preventScroll: true });
scr.addEventListener("click", () => { if (!String(getSelection())) focusCmd(); });
cmd.addEventListener("input", () => { sfx.key(); render(); });
cmd.addEventListener("keydown", e => {
  if (busy){ if (e.key === "Enter"){ skip = true; e.preventDefault(); } return; }
  if (e.key === "Enter"){
    e.preventDefault(); sfx.enter();
    const v = cmd.value; cmd.value = ""; render(); run(v);
  } else if (e.key === "ArrowUp" || e.key === "ArrowDown"){
    e.preventDefault(); if (!hist.length) return;
    hIdx = Math.max(0, Math.min(hist.length, hIdx + (e.key === "ArrowUp" ? -1 : 1)));
    cmd.value = hist[hIdx] || ""; sfx.key(); render();
  } else if (e.key === "Tab"){
    e.preventDefault();
    const v = cmd.value.toLowerCase(); if (!v) return;
    const parts = v.split(/\s+/);
    const pool = parts.length > 1 ? Object.keys(FILES) : Object.keys(COMMANDS);
    const hits = pool.filter(k => k.startsWith(parts[parts.length - 1]));
    if (hits.length === 1){ parts[parts.length - 1] = hits[0]; cmd.value = parts.join(" "); sfx.key(); render(); }
    else if (hits.length > 1){ sfx.key(); echo(cmd.value); type([c("dim", hits.join("  "))]).then(scrollEnd); }
  } else if (e.key === "l" && e.ctrlKey){
    e.preventDefault(); out.innerHTML = "";
  } else if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Home"){
    e.preventDefault(); // cursor stays at the end, like a very old terminal
  }
});

$("chips").addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  initAudio();
  if (busy){ skip = true; await queue; }
  const word = b.textContent; cmd.value = "";
  for (const ch of word){ cmd.value += ch; sfx.key(); render(); await sleep(reduced ? 0 : 45); }
  await sleep(reduced ? 0 : 120); sfx.enter();
  cmd.value = ""; render(); run(word);
  if (matchMedia("(pointer:fine)").matches) focusCmd();
});

function setMuted(m){
  muted = m; try { localStorage.setItem("jos-muted", m ? "1" : "0"); } catch (e) {}
  const b = $("snd"); b.textContent = m ? "SFX OFF" : "SFX ON"; b.setAttribute("aria-pressed", String(!m));
}
$("snd").addEventListener("click", () => { initAudio(); setMuted(!muted); sfx.enter(); focusCmd(); });
setMuted(muted);

/* =============================== boot ============================== */
let booted = false;
async function boot(e){
  if (booted) return;
  if (e) e.preventDefault();
  $("boot").classList.add("off");
  initAudio(); sfx.boot();
  if (matchMedia("(pointer:fine)").matches) focusCmd();
  busy = true; term.classList.add("busy");
  setTimeout(() => { booted = true; }, 0);
  await type([c("dim", "booting jaasir-os ..."), [c("ok", "[ OK ] "), "loaded portfolio.sys"], [c("ok", "[ OK ] "), "mounted /home/jaasir"], ""]);
  const h = document.createElement("div"); h.className = "banner"; h.textContent = ME.name.toUpperCase(); out.appendChild(h);
  await type([
    c("teal", ME.tagline), "",
    ["Welcome, visitor. Type ", c("salmon", "help"), " to see what you can ask, or try ", c("salmon", "about"), "."],
    ["Want a break? Close this window with ", c("salmon", "X"), " and pick a game from the dock."], ""
  ]);
  busy = false; skip = false; term.classList.remove("busy");
}
$("boot").addEventListener("click", boot);
window.addEventListener("keydown", e => { if (!booted && !e.metaKey && !e.ctrlKey && !e.altKey) boot(e); });
