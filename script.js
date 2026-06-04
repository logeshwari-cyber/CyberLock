// ═══════════════════════════════════════════════════════════
//   PassGuard — Password Strength Analyzer
//   Complete JavaScript Logic
// ═══════════════════════════════════════════════════════════

// ── Matrix Rain Animation ────────────────────────────────────
const canvas = document.getElementById('matrix-canvas');
const ctx2 = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOP';
const cols = Math.floor(canvas.width / 20);
const drops = Array(cols).fill(1);
function drawMatrix() {
  ctx2.fillStyle = 'rgba(2,8,23,0.05)';
  ctx2.fillRect(0, 0, canvas.width, canvas.height);
  ctx2.fillStyle = '#00f5ff';
  ctx2.font = '14px Share Tech Mono';
  drops.forEach((y, i) => {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx2.fillText(char, i * 20, y * 20);
    if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  });
}
setInterval(drawMatrix, 60);
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ── Floating Particles ────────────────────────────────────────
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${Math.random()*4+2}px;
      height:${Math.random()*4+2}px;
      background:rgba(0,245,255,${Math.random()*0.4+0.1});
      border-radius:50%;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation:float-particle ${Math.random()*10+8}s linear infinite;
      animation-delay:${Math.random()*5}s;
    `;
    container.appendChild(p);
  }
}
createParticles();

// ── Section Navigation ────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  const link = document.querySelector(`[href="#${id}"]`);
  if (link) link.classList.add('active');
  if (id === 'history') renderHistory();
  window.scrollTo(0, 0);
}

// ── Toast Notification ────────────────────────────────────────
function showToast(msg, type = 'info', dur = 3000) {
  let c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add('hiding');
    setTimeout(() => t.remove(), 300);
  }, dur);
}

// ── Password Visibility Toggle ────────────────────────────────
function toggleVisibility() {
  const input = document.getElementById('password-input');
  const btn   = document.getElementById('toggle-btn');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁️';
}

function clearPassword() {
  const input = document.getElementById('password-input');
  input.value = '';
  onPasswordInput('');
  document.getElementById('result-content').style.display = 'none';
  document.getElementById('no-result').style.display = 'block';
  document.getElementById('breach-result').textContent = '';
}

// ── Live Input Handler ────────────────────────────────────────
function onPasswordInput(val) {
  const fill  = document.getElementById('live-fill');
  const label = document.getElementById('live-label');
  if (!val) {
    fill.style.width = '0%';
    fill.style.background = '';
    label.textContent = 'Enter password to analyze';
    return;
  }
  const result = analyzePasswordData(val);
  const pct = result.score;
  fill.style.width = pct + '%';
  fill.style.background = result.color;
  label.textContent = result.rating;
  label.style.color  = result.color;
}

// ── Core Analysis Engine ──────────────────────────────────────
function analyzePasswordData(pwd) {
  const len      = pwd.length;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNum   = /[0-9]/.test(pwd);
  const hasSpec  = /[^A-Za-z0-9]/.test(pwd);
  const hasSpace = /\s/.test(pwd);

  // Character pool size
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNum)   poolSize += 10;
  if (hasSpec)  poolSize += 32;

  // Entropy in bits
  const entropy = poolSize > 0 ? Math.floor(len * Math.log2(poolSize)) : 0;

  // Score out of 100
  let score = 0;
  if (len >= 8)  score += 10;
  if (len >= 12) score += 15;
  if (len >= 16) score += 10;
  if (len >= 20) score += 5;
  if (hasUpper)  score += 15;
  if (hasLower)  score += 15;
  if (hasNum)    score += 15;
  if (hasSpec)   score += 15;
  // Penalties
  if (/(.)\1{2,}/.test(pwd)) score -= 10;       // repeated chars
  if (/^[a-zA-Z]+$/.test(pwd)) score -= 5;       // letters only
  if (/^[0-9]+$/.test(pwd)) score -= 15;          // numbers only
  if (isCommon(pwd)) score -= 30;
  if (len < 6)  score = Math.min(score, 15);
  score = Math.max(0, Math.min(100, score));

  // Rating
  let rating, color, ratingDesc;
  if (score < 20)      { rating='VERY WEAK';  color='#ef4444'; ratingDesc='Extremely vulnerable. Change immediately!'; }
  else if (score < 40) { rating='WEAK';       color='#f97316'; ratingDesc='Poor security. Easy to crack.'; }
  else if (score < 60) { rating='FAIR';       color='#fbbf24'; ratingDesc='Moderate security. Could be improved.'; }
  else if (score < 80) { rating='STRONG';     color='#22c55e'; ratingDesc='Good security. Well protected.'; }
  else                 { rating='EXCELLENT';  color='#00f5ff'; ratingDesc='Outstanding security! Very hard to crack.'; }

  // Crack times
  const crackTimes = calculateCrackTime(entropy);

  // Suggestions
  const suggestions = [];
  if (len < 12)      suggestions.push({ type:'warn', text:'Use at least 12 characters for better security' });
  if (!hasUpper)     suggestions.push({ type:'warn', text:'Add uppercase letters (A-Z)' });
  if (!hasLower)     suggestions.push({ type:'warn', text:'Add lowercase letters (a-z)' });
  if (!hasNum)       suggestions.push({ type:'warn', text:'Add numbers (0-9)' });
  if (!hasSpec)      suggestions.push({ type:'warn', text:'Add special characters (!@#$%^&*)' });
  if (/(.)\1{2,}/.test(pwd)) suggestions.push({ type:'warn', text:'Avoid repeating the same character' });
  if (isCommon(pwd)) suggestions.push({ type:'danger', text:'This is a commonly used password — change it!' });
  if (score >= 80)   suggestions.push({ type:'pass', text:'Great password! Store it safely in a password manager.' });
  if (suggestions.length === 0) suggestions.push({ type:'pass', text:'Strong password! Well done.' });

  return {
    len, hasUpper, hasLower, hasNum, hasSpec, hasSpace,
    poolSize, entropy, score, rating, color, ratingDesc,
    crackTimes, suggestions,
    upperCount:  (pwd.match(/[A-Z]/g)||[]).length,
    lowerCount:  (pwd.match(/[a-z]/g)||[]).length,
    numCount:    (pwd.match(/[0-9]/g)||[]).length,
    specCount:   (pwd.match(/[^A-Za-z0-9]/g)||[]).length,
  };
}

// ── Crack Time Calculator ─────────────────────────────────────
function calculateCrackTime(entropy) {
  // Attempts per second per method
  const methods = {
    offline: 1e10,   // 10 billion/s (standard PC)
    online:  1e3,    // 1000/s (rate-limited)
    gpu:     1e13,   // 10 trillion/s (GPU cluster)
  };
  function formatTime(seconds) {
    if (seconds < 1)           return 'Instantly';
    if (seconds < 60)          return `${Math.round(seconds)} seconds`;
    if (seconds < 3600)        return `${Math.round(seconds/60)} minutes`;
    if (seconds < 86400)       return `${Math.round(seconds/3600)} hours`;
    if (seconds < 2592000)     return `${Math.round(seconds/86400)} days`;
    if (seconds < 31536000)    return `${Math.round(seconds/2592000)} months`;
    if (seconds < 3153600000)  return `${Math.round(seconds/31536000)} years`;
    if (seconds < 3.15e13)     return `${(seconds/3153600000).toFixed(1)} thousand years`;
    if (seconds < 3.15e16)     return `${(seconds/3.15e13).toFixed(1)} million years`;
    return 'Practically forever';
  }
  const totalCombinations = Math.pow(2, entropy);
  const avgAttempts = totalCombinations / 2;
  return {
    offline: formatTime(avgAttempts / methods.offline),
    online:  formatTime(avgAttempts / methods.online),
    gpu:     formatTime(avgAttempts / methods.gpu),
  };
}

// ── Common Password Check ─────────────────────────────────────
const COMMON_PASSWORDS = [
  'password','123456','password123','12345678','qwerty','abc123','111111',
  'letmein','monkey','dragon','master','sunshine','princess','welcome',
  'shadow','superman','michael','football','iloveyou','admin','login',
  '000000','654321','1234567','123123','1234567890','pass','hello',
  'charlie','donald','password1','qwerty123','admin123','root','toor',
];
function isCommon(pwd) {
  return COMMON_PASSWORDS.includes(pwd.toLowerCase());
}

// ── Main Analyze Function ─────────────────────────────────────
function analyzePassword() {
  const pwd = document.getElementById('password-input').value;
  if (!pwd) { showToast('⚠️ Please enter a password first!', 'warning'); return; }

  const btn = document.getElementById('analyze-btn');
  btn.innerHTML = '<span>⏳</span><span>ANALYZING...</span>';

  setTimeout(() => {
    const r = analyzePasswordData(pwd);
    renderResults(r, pwd);
    btn.innerHTML = '<span class="btn-icon">⚡</span><span>ANALYZE PASSWORD</span><span class="btn-arrow">→</span>';
    showToast(`✅ Analysis complete — ${r.rating}`, r.score >= 60 ? 'success' : 'warning');
  }, 400);
}

// ── Render Results ────────────────────────────────────────────
function renderResults(r, pwd) {
  document.getElementById('no-result').style.display = 'none';
  document.getElementById('result-content').style.display = 'block';

  // Rating circle
  const circle = document.getElementById('rating-circle');
  circle.className = 'rating-circle';
  circle.style.borderColor = r.color;
  circle.style.color = r.color;
  circle.style.boxShadow = `0 0 20px ${r.color}40`;
  document.getElementById('rating-score').textContent = r.score;
  document.getElementById('rating-label').textContent  = r.rating;
  document.getElementById('rating-title').textContent  = `${r.rating} PASSWORD`;
  document.getElementById('rating-title').style.color  = r.color;
  document.getElementById('rating-desc').textContent   = r.ratingDesc;

  // Strength bar
  document.getElementById('strength-fill').style.width      = r.score + '%';
  document.getElementById('strength-fill').style.background = r.color;
  document.getElementById('strength-pct').textContent       = r.score + '%';
  document.getElementById('strength-pct').style.color       = r.color;

  // Stats
  const setStatItem = (id, valId, badgeId, val, badge, passed) => {
    const item = document.getElementById(id);
    item.className = 'stat-item ' + (passed ? 'pass' : 'fail');
    document.getElementById(valId).textContent  = val;
    document.getElementById(badgeId).textContent = badge;
  };

  setStatItem('stat-length',  'sv-length',  'sb-length',  `${r.len} chars`,             r.len >= 12 ? '✅' : '⚠️', r.len >= 12);
  setStatItem('stat-upper',   'sv-upper',   'sb-upper',   r.hasUpper ? `${r.upperCount} found`:'None', r.hasUpper?'✅':'❌', r.hasUpper);
  setStatItem('stat-lower',   'sv-lower',   'sb-lower',   r.hasLower ? `${r.lowerCount} found`:'None', r.hasLower?'✅':'❌', r.hasLower);
  setStatItem('stat-numbers', 'sv-numbers', 'sb-numbers', r.hasNum   ? `${r.numCount} found` :'None', r.hasNum  ?'✅':'❌', r.hasNum);
  setStatItem('stat-special', 'sv-special', 'sb-special', r.hasSpec  ? `${r.specCount} found`:'None', r.hasSpec ?'✅':'❌', r.hasSpec);
  setStatItem('stat-entropy', 'sv-entropy', 'sb-entropy', `${r.entropy} bits`,           r.entropy>=50?'✅':'⚠️', r.entropy>=50);

  // Crack times
  document.getElementById('ct-offline').textContent = r.crackTimes.offline;
  document.getElementById('ct-online').textContent  = r.crackTimes.online;
  document.getElementById('ct-gpu').textContent     = r.crackTimes.gpu;

  // Color crack times
  const colorCrack = (id, txt) => {
    const el = document.getElementById(id);
    if (txt.includes('Instantly') || txt.includes('seconds') || txt.includes('minutes'))
      el.style.color = '#ef4444';
    else if (txt.includes('hours') || txt.includes('days'))
      el.style.color = '#f97316';
    else if (txt.includes('months') || txt.includes('years'))
      el.style.color = '#fbbf24';
    else el.style.color = '#22c55e';
  };
  colorCrack('ct-offline', r.crackTimes.offline);
  colorCrack('ct-online',  r.crackTimes.online);
  colorCrack('ct-gpu',     r.crackTimes.gpu);

  // Suggestions
  const icons = { pass:'✅', warn:'⚠️', danger:'🚨' };
  const colors= { pass:'var(--green)', warn:'var(--yellow)', danger:'var(--red)' };
  document.getElementById('suggestions-list').innerHTML = r.suggestions.map(s => `
    <div class="sug-item">
      <span class="sug-icon">${icons[s.type]}</span>
      <span style="color:${colors[s.type]}">${s.text}</span>
    </div>
  `).join('');
}

// ── Breach Checker ────────────────────────────────────────────
function checkBreach() {
  const pwd = document.getElementById('password-input').value;
  const result = document.getElementById('breach-result');
  if (!pwd) { showToast('Enter a password first!', 'warning'); return; }

  result.textContent = '🔍 Checking...';
  result.style.color = 'var(--text2)';

  setTimeout(() => {
    // Simulate breach check against common breached passwords
    const breachedList = [
      'password','123456','password123','qwerty','abc123','111111',
      'letmein','monkey','dragon','sunshine','iloveyou','admin','welcome',
      'login','master','123456789','12345678','1234567890',
    ];
    const isBreached = breachedList.includes(pwd.toLowerCase()) ||
      (pwd.length < 6) || /^(.)\1+$/.test(pwd);

    if (isBreached) {
      result.innerHTML = '🚨 <strong>FOUND IN BREACH DATABASE!</strong><br><small>This password has appeared in known data breaches. Change it immediately!</small>';
      result.style.color = 'var(--red)';
    } else {
      result.innerHTML = '✅ <strong>NOT FOUND IN BREACH DATABASE</strong><br><small>This password was not found in our local breach database. For a full check, visit haveibeenpwned.com</small>';
      result.style.color = 'var(--green)';
    }
  }, 800);
}

// ── Password Generator ────────────────────────────────────────
const CHARSETS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

function generatePassword() {
  const len     = parseInt(document.getElementById('len-slider').value);
  const useUpper = document.getElementById('cb-upper').checked;
  const useLower = document.getElementById('cb-lower').checked;
  const useNums  = document.getElementById('cb-numbers').checked;
  const useSyms  = document.getElementById('cb-symbols').checked;

  let charset = '';
  const required = [];
  if (useUpper)  { charset += CHARSETS.upper;   required.push(CHARSETS.upper[Math.floor(Math.random()*26)]); }
  if (useLower)  { charset += CHARSETS.lower;   required.push(CHARSETS.lower[Math.floor(Math.random()*26)]); }
  if (useNums)   { charset += CHARSETS.numbers; required.push(CHARSETS.numbers[Math.floor(Math.random()*10)]); }
  if (useSyms)   { charset += CHARSETS.symbols; required.push(CHARSETS.symbols[Math.floor(Math.random()*CHARSETS.symbols.length)]); }

  if (!charset) { showToast('Select at least one character set!', 'warning'); return; }

  // Use crypto API for true randomness
  const array = new Uint32Array(len);
  window.crypto.getRandomValues(array);

  let pwd = required.join('');
  for (let i = required.length; i < len; i++) {
    pwd += charset[array[i] % charset.length];
  }

  // Shuffle
  pwd = pwd.split('').sort(() => Math.random()-0.5).join('');

  document.getElementById('gen-output').textContent = pwd;

  // Show strength
  const r = analyzePasswordData(pwd);
  const wrap = document.getElementById('gen-strength-wrap');
  wrap.style.display = 'flex';
  document.getElementById('gen-strength-fill').style.width = r.score + '%';
  document.getElementById('gen-strength-fill').style.background = r.color;
  document.getElementById('gen-strength-label').textContent = r.rating;
  document.getElementById('gen-strength-label').style.color = r.color;

  showToast('🔑 Secure password generated!', 'success');
}

function copyGenerated() {
  const pwd = document.getElementById('gen-output').textContent;
  if (pwd === 'Click Generate to create a password') { showToast('Generate a password first!', 'warning'); return; }
  navigator.clipboard.writeText(pwd).then(() => showToast('📋 Copied to clipboard!', 'success'));
}

function analyzeGenerated() {
  const pwd = document.getElementById('gen-output').textContent;
  if (pwd === 'Click Generate to create a password') { showToast('Generate a password first!', 'warning'); return; }
  document.getElementById('password-input').value = pwd;
  onPasswordInput(pwd);
  showSection('analyzer');
  setTimeout(() => analyzePassword(), 200);
}

function updateLenDisplay(val) {
  document.getElementById('len-display').textContent = val;
}

function applyPreset(type) {
  const presets = {
    pin:       { len:6,  upper:false, lower:false, nums:true,  syms:false },
    memorable: { len:12, upper:true,  lower:true,  nums:true,  syms:false },
    secure:    { len:16, upper:true,  lower:true,  nums:true,  syms:true  },
    ultra:     { len:32, upper:true,  lower:true,  nums:true,  syms:true  },
  };
  const p = presets[type];
  if (!p) return;
  document.getElementById('len-slider').value           = p.len;
  document.getElementById('len-display').textContent    = p.len;
  document.getElementById('cb-upper').checked   = p.upper;
  document.getElementById('cb-lower').checked   = p.lower;
  document.getElementById('cb-numbers').checked = p.nums;
  document.getElementById('cb-symbols').checked = p.syms;
  generatePassword();
}

// ── Passphrase Generator ──────────────────────────────────────
const WORDS = [
  'Cyber','Shield','Vault','Falcon','Storm','Dragon','Phoenix','Tiger',
  'Cobra','Eagle','Thunder','Shadow','Blaze','Frost','Neon','Quantum',
  'Pixel','Vector','Solar','Lunar','Atomic','Sonic','Hyper','Alpha',
  'Bravo','Delta','Echo','Foxtrot','Ghost','Helix','Iron','Jade',
  'Karma','Laser','Magnet','Nova','Omega','Prism','Quartz','Raven',
  'Steel','Titan','Ultra','Vivid','Wizard','Xenon','Yacht','Zenith',
];
const NUMS = ['0','1','2','3','4','5','6','7','8','9'];
const SYMS = ['!','@','#','$','%','&','*'];

function generatePhrase() {
  const count = parseInt(document.getElementById('word-slider').value);
  const parts = [];
  for (let i = 0; i < count; i++) {
    parts.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  const num = NUMS[Math.floor(Math.random()*NUMS.length)];
  const sym = SYMS[Math.floor(Math.random()*SYMS.length)];
  const phrase = parts.join(sym) + num;
  document.getElementById('phrase-output').textContent = phrase;
  showToast('🧠 Passphrase generated!', 'success');
}

function copyPhrase() {
  const ph = document.getElementById('phrase-output').textContent;
  if (ph === 'Click Generate Phrase') { showToast('Generate a phrase first!', 'warning'); return; }
  navigator.clipboard.writeText(ph).then(() => showToast('📋 Copied!', 'success'));
}

function updateWordDisplay(val) {
  document.getElementById('word-display').textContent = val;
}

// ── History (LocalStorage) ────────────────────────────────────
function saveToHistory() {
  const pwd = document.getElementById('password-input').value;
  if (!pwd) { showToast('Analyze a password first!', 'warning'); return; }

  const r = analyzePasswordData(pwd);
  const history = JSON.parse(localStorage.getItem('psa_history') || '[]');

  history.unshift({
    id:     Date.now(),
    pwd:    maskPassword(pwd),
    rating: r.rating,
    score:  r.score,
    color:  r.color,
    date:   new Date().toLocaleString(),
  });

  // Keep max 20
  if (history.length > 20) history.pop();
  localStorage.setItem('psa_history', JSON.stringify(history));
  showToast('💾 Saved to history!', 'success');
}

function maskPassword(pwd) {
  if (pwd.length <= 4) return '****';
  return pwd[0] + '*'.repeat(pwd.length - 2) + pwd[pwd.length-1];
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('psa_history') || '[]');
  const list  = document.getElementById('history-list');
  const count = document.getElementById('history-count');
  count.textContent = `${history.length} record${history.length !== 1 ? 's' : ''}`;

  if (history.length === 0) {
    list.innerHTML = `<div class="empty-history"><div style="font-size:48px;margin-bottom:12px">📭</div><div style="color:var(--text2)">No history yet — analyze a password first!</div></div>`;
    return;
  }

  list.innerHTML = history.map(item => `
    <div class="history-item" id="hi-${item.id}">
      <span style="font-size:20px">${item.score >= 80 ? '🟢' : item.score >= 60 ? '🟡' : item.score >= 40 ? '🟠' : '🔴'}</span>
      <span class="hi-password">${item.pwd}</span>
      <span class="hi-rating" style="color:${item.color};border:1px solid ${item.color};padding:3px 10px;border-radius:20px;font-size:11px;font-family:var(--font-h)">${item.rating}</span>
      <span style="font-family:var(--font-h);font-size:14px;color:${item.color}">${item.score}/100</span>
      <span class="hi-date">${item.date}</span>
      <button class="hi-del" onclick="deleteHistory(${item.id})">🗑️</button>
    </div>
  `).join('');
}

function deleteHistory(id) {
  let history = JSON.parse(localStorage.getItem('psa_history') || '[]');
  history = history.filter(h => h.id !== id);
  localStorage.setItem('psa_history', JSON.stringify(history));
  renderHistory();
  showToast('🗑️ Deleted', 'info');
}

function clearHistory() {
  if (!confirm('Clear all history?')) return;
  localStorage.removeItem('psa_history');
  renderHistory();
  showToast('🗑️ History cleared', 'info');
}

// ── Add CSS animation for particles ──────────────────────────
const style = document.createElement('style');
style.textContent = `
  @keyframes float-particle {
    0%   { transform: translateY(0) translateX(0); opacity:0; }
    10%  { opacity:1; }
    90%  { opacity:0.5; }
    100% { transform: translateY(-100vh) translateX(${Math.random()*100-50}px); opacity:0; }
  }
`;
document.head.appendChild(style);

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Animate hero lock when typing
  const input = document.getElementById('password-input');
  if (input) {
    input.addEventListener('input', function() {
      const lock = document.getElementById('hero-lock');
      if (lock) lock.textContent = this.value.length > 0 ? '🔓' : '🔒';
    });
  }

  // Keyboard shortcut: Enter = analyze
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('analyzer').classList.contains('active')) {
      analyzePassword();
    }
  });
});
