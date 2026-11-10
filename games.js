/* =====================================================================
   Jaasir-OS · games (Dino Run + Tech Trivia)
   Uses `APPS`, `sfx`, `tone` and `$` from script.js.
   ===================================================================== */

/* ============================== DINO RUN ============================ */
(function(){
  const cv = $("dino"), g = cv.getContext("2d"), W = 600, H = 200, GROUND = 168;
  const DINO = [
    ".........######.",
    "........########",
    "........##.#####",
    "........########",
    "........#####...",
    "........#######.",
    "#.......####....",
    "##....######....",
    "###..########...",
    "#############.#.",
    ".###########....",
    "..#########.....",
    "...#######......"
  ];
  const LEGS = [
    ["....##.##.......", "....#...#.......", "....##..##......"],
    ["....##..#.......", "....#...##......", "....##.........."],
    ["....#..##.......", "....##..#.......", "........##......"]
  ];
  const CACTUS = ["..##...", "..##...", "#.##...", "#.##.#.", "#.##.#.", "####.#.", "..####.", "..##...", "..##...", "..##..."];
  const S = 3;
  let raf = 0, last = 0, state = "idle", t = 0, speed = 0, dist = 0, score = 0, hi = 0, flash = 0;
  let dino, obs, hills, gap;
  try { hi = +localStorage.getItem("jos-dino-hi") || 0; } catch (e) {}

  function sprite(rows, x, y, s, col){
    g.fillStyle = col;
    for (let r = 0; r < rows.length; r++) for (let k = 0; k < rows[r].length; k++)
      if (rows[r][k] === "#") g.fillRect(Math.round(x) + k * s, Math.round(y) + r * s, s, s);
  }
  function reset(){
    dino = { x: 44, y: GROUND - 16 * S, vy: 0, air: false };
    obs = []; speed = 250; dist = 0; score = 0; gap = 300; t = 0;
    hills = Array.from({ length: 9 }, (_, i) => ({ x: i * 80, w: 34 + (i * 37) % 30, h: 26 + (i * 53) % 50 }));
  }
  function jump(){
    if (state === "idle" || state === "dead"){ if (state === "dead") reset(); state = "run"; sfx.open(); return; }
    if (!dino.air){ dino.vy = -620; dino.air = true; sfx.jump(); }
  }
  function step(dt){
    t += dt;
    if (state !== "run") return;
    speed = Math.min(540, speed + 9 * dt);
    dist += speed * dt;
    const s = Math.floor(dist / 12);
    if (s !== score && s % 100 === 0) sfx.good();
    score = s;
    // dino
    dino.vy += 1800 * dt; dino.y += dino.vy * dt;
    const floor = GROUND - 16 * S;
    if (dino.y >= floor){ dino.y = floor; dino.vy = 0; dino.air = false; }
    // obstacles
    obs.forEach(o => { o.x -= speed * dt; });
    obs = obs.filter(o => o.x + o.w > -10);
    const lastX = obs.length ? obs[obs.length - 1].x : -Infinity;
    if (lastX < W - gap){
      const big = Math.random() < 0.35, twin = !big && Math.random() < 0.3, sc = big ? 4 : 3;
      obs.push({ x: W + 10, sc, twin, w: (twin ? 15 : 7) * sc, h: 10 * sc });
      gap = 210 + Math.random() * 230 + speed * 0.28;
    }
    hills.forEach(h => { h.x -= speed * 0.18 * dt; if (h.x + h.w < 0) h.x += 720; });
    // collision (slightly forgiving hit boxes)
    const dx = dino.x + 10, dy = dino.y + 6, dw = 16 * S - 22, dh = 16 * S - 10;
    for (const o of obs){
      if (dx < o.x + o.w - 5 && dx + dw > o.x + 5 && dy + dh > GROUND - o.h + 4){
        state = "dead"; flash = 0.25; sfx.error();
        if (score > hi){ hi = score; try { localStorage.setItem("jos-dino-hi", String(hi)); } catch (e) {} }
        break;
      }
    }
  }
  function text(str, x, y, size, col, align){
    g.font = size + 'px "Press Start 2P", monospace'; g.textAlign = align || "left";
    g.fillStyle = "#120a10"; g.fillText(str, x + 2, y + 2); g.fillStyle = col; g.fillText(str, x, y);
  }
  function draw(){
    // sky bands
    ["#4a2f5a", "#6b3f6e", "#935473", "#c0707c", "#dd9a86"].forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * 34, W, 34); });
    // sun
    g.fillStyle = "#f3d9b8"; g.fillRect(468, 34, 40, 56); g.fillRect(460, 42, 56, 40);
    // skyline
    g.fillStyle = "#5b3560"; hills.forEach(h => g.fillRect(Math.round(h.x), GROUND - h.h, h.w, h.h));
    // ground
    g.fillStyle = "#241720"; g.fillRect(0, GROUND, W, H - GROUND);
    g.fillStyle = "#d9967b"; g.fillRect(0, GROUND, W, 3);
    g.fillStyle = "#6c7c8a";
    for (let i = 0; i < 14; i++){ const x = ((i * 53 - dist) % 742 + 742) % 742 - 20; g.fillRect(Math.round(x), GROUND + 10 + (i % 3) * 7, 10 + (i % 4) * 4, 2); }
    // cacti
    obs.forEach(o => { sprite(CACTUS, o.x, GROUND - o.h, o.sc, "#2e4a3f"); if (o.twin) sprite(CACTUS, o.x + 8 * o.sc, GROUND - o.h, o.sc, "#2e4a3f"); });
    // dino
    const col = state === "dead" ? "#d98aa0" : "#e6bd9c";
    const leg = dino.air || state !== "run" ? 0 : 1 + (Math.floor(t * 10) % 2);
    sprite(DINO, dino.x, dino.y, S, col); sprite(LEGS[leg], dino.x, dino.y + 13 * S, S, col);
    g.fillStyle = "#120a10"; g.fillRect(dino.x + 10 * S, Math.round(dino.y) + 2 * S, S, S);
    // HUD
    text(String(score).padStart(5, "0"), W - 14, 24, 12, "#e3d2c6", "right");
    text("HI " + String(hi).padStart(5, "0"), 14, 24, 10, "#e6bd9c");
    if (state === "idle"){
      text("DINO RUN", W / 2, 78, 20, "#e6bd9c", "center");
      if (Math.floor(t * 2) % 2 === 0) text("PRESS SPACE OR TAP", W / 2, 108, 10, "#e3d2c6", "center");
    } else if (state === "dead"){
      text("GAME OVER", W / 2, 78, 20, "#d98aa0", "center");
      text("SPACE / TAP TO RETRY", W / 2, 108, 10, "#e3d2c6", "center");
    }
    if (flash > 0){ g.fillStyle = "rgba(255,255,255," + (flash * 2) + ")"; g.fillRect(0, 0, W, H); }
  }
  function loop(now){
    const dt = Math.min(0.033, (now - last) / 1000 || 0); last = now;
    if (flash > 0) flash -= dt;
    step(dt); draw();
    raf = requestAnimationFrame(loop);
  }
  cv.addEventListener("pointerdown", e => { e.preventDefault(); initAudio(); jump(); });
  APPS.dino = {
    start(){ g.imageSmoothingEnabled = false; reset(); state = "idle"; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
    stop(){ cancelAnimationFrame(raf); raf = 0; },
    key(e){ if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW" || e.key === "Enter"){ e.preventDefault(); if (!e.repeat) jump(); } }
  };
})();

/* ============================ TECH TRIVIA =========================== */
(function(){
  // [question, correct answer, wrong, wrong, wrong]
  const POOL = [
    ["What does HTML stand for?", "HyperText Markup Language", "HighText Machine Language", "Hyperlink Tool Markup Language", "Home Text Mode Language"],
    ["Which port does HTTPS use by default?", "443", "80", "22", "8080"],
    ["In Python, which keyword defines a function?", "def", "func", "function", "define"],
    ["What does CPU stand for?", "Central Processing Unit", "Computer Power Unit", "Core Program Utility", "Central Program Unit"],
    ["Who created the Python language?", "Guido van Rossum", "Linus Torvalds", "Dennis Ritchie", "James Gosling"],
    ["Who created the Linux kernel?", "Linus Torvalds", "Bill Gates", "Steve Wozniak", "Guido van Rossum"],
    ["What is a phishing attack trying to do?", "Trick you into giving up sensitive info", "Overheat your CPU", "Speed up your Wi-Fi", "Encrypt your backups for you"],
    ["How many bits are in a byte?", "8", "4", "16", "10"],
    ["What is binary 1010 in decimal?", "10", "5", "12", "8"],
    ["What does SQL stand for?", "Structured Query Language", "Simple Question Language", "System Queue Logic", "Sequential Query List"],
    ["Which command lists files in a Linux terminal?", "ls", "dir -show", "list", "files"],
    ["What does RAM stand for?", "Random Access Memory", "Read And Move", "Rapid Action Memory", "Run All Modules"],
    ["In the CIA triad of security, what does the 'A' stand for?", "Availability", "Authentication", "Authorisation", "Anonymity"],
    ["Which system turns domain names into IP addresses?", "DNS", "DHCP", "FTP", "SMTP"],
    ["What is a firewall's main job?", "Filter network traffic using rules", "Cool down the server", "Store passwords", "Compress files"],
    ["Which Git command saves staged changes to history?", "git commit", "git save", "git push", "git stash"],
    ["What does 2FA stand for?", "Two-factor authentication", "Two-file access", "Second firewall application", "Two-fold authorisation"],
    ["Which Linux distro is built for penetration testing?", "Kali Linux", "Ubuntu Studio", "Linux Mint", "Fedora Silverblue"],
    ["On a web page, what is CSS mainly used for?", "Styling how the page looks", "Storing data", "Running the server", "Sending email"],
    ["What is hexadecimal FF in decimal?", "255", "256", "100", "15"],
    ["What does JSON stand for?", "JavaScript Object Notation", "Java Standard Output Network", "Joined Script Object Node", "JavaScript Online Notation"],
    ["Where is Jaasir studying for his ICT degree?", "SUSS", "NUS", "NTU", "SMU"],
    ["What language does Jaasir teach kids at Lyza Education?", "Python", "Java", "C++", "Ruby"],
    ["Jaasir's Temasek Polytechnic diploma is in...", "Cybersecurity & Digital Forensics", "Game Design", "Aerospace Engineering", "Accounting"]
  ];
  const N = 10, box = $("trivia");
  let qs = [], i = 0, score = 0, locked = false, timer = 0, screen = "start", buttons = [];
  const shuffle = a => { a = a.slice(); for (let k = a.length - 1; k > 0; k--){ const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  function start(){
    screen = "start"; clearTimeout(timer); box.innerHTML = "";
    const go = el("button", "go", "START");
    go.addEventListener("click", begin);
    box.append(el("h2", "", "TECH TRIVIA"), el("p", "", N + " quick questions on code, security and computers."), el("p", "dim", "Click an answer or press 1-4."), go);
  }
  function begin(){ initAudio(); sfx.open(); qs = shuffle(POOL).slice(0, N); i = 0; score = 0; ask(); }
  function ask(){
    screen = "ask"; locked = false; box.innerHTML = "";
    const [q, right, ...wrong] = qs[i];
    const meta = el("div", "meta"); meta.append(el("span", "", "Q " + (i + 1) + "/" + N), el("b", "", "SCORE " + score));
    const opts = el("div", "opts");
    buttons = shuffle([right, ...wrong]).map((txt, k) => {
      const b = el("button", "opt"); b.type = "button";
      b.append(el("span", "", (k + 1) + "."), document.createTextNode(txt));
      b.addEventListener("click", () => pick(b, txt === right, right));
      b.dataset.txt = txt; opts.appendChild(b); return b;
    });
    box.append(meta, el("p", "q", q), opts);
  }
  function pick(b, ok, right){
    if (locked) return; locked = true;
    buttons.forEach(x => { x.disabled = true; if (x.dataset.txt === right) x.classList.add("right"); });
    if (ok){ score++; sfx.good(); } else { b.classList.add("wrong"); sfx.error(); }
    timer = setTimeout(() => { i++; i < N ? ask() : end(); }, ok ? 800 : 1500);
  }
  function end(){
    screen = "end"; box.innerHTML = "";
    const rank = score === N ? "ROOT ACCESS GRANTED" : score >= 7 ? "SYSADMIN" : score >= 4 ? "POWER USER" : "NEW USER - TRY AGAIN";
    if (score >= 7) sfx.boot(); else sfx.enter();
    const go = el("button", "go", "PLAY AGAIN");
    go.addEventListener("click", begin);
    box.append(el("h2", "", "RESULT"), el("div", "big", score + "/" + N), el("p", "teal", rank), go);
  }
  APPS.trivia = {
    start, stop(){ clearTimeout(timer); },
    key(e){
      if (screen === "ask"){ const k = "1234".indexOf(e.key); if (k > -1 && buttons[k]) buttons[k].click(); }
      else if (e.key === "Enter" || e.key === " "){ e.preventDefault(); begin(); }
    }
  };
})();
