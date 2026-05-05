/**
 * DATA & CONSTANTS
 * Defining the flavors, colors, and SVG shapes for the cans.
 */
const FLAVORS = [
    { id: 'mint',     name: 'Cool Mint',       c: '#5fbf7a', accent: '#2f7a45', dark: '#0e3a1c' },
    { id: 'berry',    name: 'Berry Burst',     c: '#9a5dd6', accent: '#5e2e95', dark: '#2a0e4a' },
    { id: 'citrus',   name: 'Citrus Zest',     c: '#f4c33b', accent: '#b8841d', dark: '#5a3e08' },
    { id: 'peach',    name: 'Peach Glow',      c: '#ffb589', accent: '#cc7244', dark: '#5a2a14' },
    { id: 'frost',    name: 'Cool Frost',      c: '#9bd3ee', accent: '#3e8db8', dark: '#0e3a52' },
    { id: 'grape',    name: 'Grape Chill',     c: '#5d3aa8', accent: '#3a2078', dark: '#190a3a' },
    { id: 'mango',    name: 'Mango Tango',     c: '#ff9a3c', accent: '#c8651a', dark: '#5a2a08' },
    { id: 'straw',    name: 'Strawberry Ice',  c: '#f25775', accent: '#a8284a', dark: '#4a0a1e' },
    { id: 'spear',    name: 'Spearmint',       c: '#3fbfb0', accent: '#1f7a72', dark: '#063a36' },
    { id: 'violet',   name: 'Lush Violet',     c: '#c47ae0', accent: '#7a3aa0', dark: '#3a0a52' },
    { id: 'tropics',  name: 'Lush Tropics',    c: '#ff7c66', accent: '#c84a35', dark: '#5a1408' },
    { id: 'wmelon',   name: 'Watermelon Wave', c: '#ee4856', accent: '#a82030', dark: '#4a060e' },
];

const GLYPHS = {
    mint: "M50 18 C30 28, 18 50, 30 72 C40 60, 50 56, 60 60 C56 50, 60 36, 76 28 C64 22, 56 22, 50 18 Z",
    straw: "M50 30 C30 30, 22 48, 32 68 C40 82, 50 86, 50 86 C50 86, 60 82, 68 68 C78 48, 70 30, 50 30 Z",
    citrus: "M50 52 M50 20 A32 32 0 1 0 50 84 A32 32 0 1 0 50 20 Z",
    frost: "M50 14 L50 86 M22 50 L78 50 M30 30 L70 70 M30 70 L70 30",
    grape: "M50 42 Q 60 30, 72 32 M55 38 Q 64 26, 78 24",
    mango: "M28 50 C28 32, 50 22, 70 30 C80 36, 78 56, 64 70 C50 82, 32 78, 28 64 Z"
};

/**
 * GAME STATE
 * Tracks the current view, round difficulty, and scores.
 */
let state = {
    view: 'home',
    difficulty: 'easy',
    score: 0,
    timeLeft: 20,
    target: null,
    activeSet: [],
    hitId: null,
    easyTimeTaken: 0,
    hardTimeTaken: 0,
    isCountingDown: false,
    countdownValue: 5
};

let gameTimer = null;
let targetSwitcher = null;

/**
 * SPEECH SYNTHESIS
 * Function to announce the flavor name out loud.
 */
function announce(name) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(name);
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
    }, 50);
}

/**
 * UI HELPERS
 * Code for visual effects like confetti and the soda can components.
 */
function getConfettiHTML() {
    const colors = ['#ff5b3a', '#ffc83a', '#5fbf7a', '#9a5dd6', '#9bd3ee'];
    let html = '<div style="position: absolute; inset: 0; pointer-events: none; z-index: 100;">';
    for (let i = 0; i < 40; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 3;
        html += `<div class="confetti-piece" style="background:${color}; left:${left}%; animation-duration:${duration}s; animation-delay:${delay}s"></div>`;
    }
    html += '</div>';
    return html;
}

function getCanHTML(flavor, width = 150, tilt = 0, glow = false, isActive = false) {
    const f = flavor;
    const height = width * 2.4;
    const activeScale = isActive ? 'scale(0.92)' : 'scale(1)';

    return `
    <button
      onclick="handleCanTap('${f.id}')"
      style="width:${width}px; height:${height}px; background:transparent; padding:0; transform:rotate(${tilt}deg) ${activeScale}; position:relative; border:none; outline:none; cursor:pointer;"
    >
      <div style="position:absolute; left:${width*0.04}px; right:${width*0.04}px; top:0; height:${width*0.1}px; background:linear-gradient(180deg, #c8ccd1 0%, #e8ebee 30%, #8e9398 60%, #b3b8bd 100%); border-radius:${width*0.5}px / ${width*0.07}px"></div>
      <div style="position:absolute; left:0; right:0; top:${width*0.1}px; height:${width*0.05}px; background:linear-gradient(180deg, ${f.dark} 0%, ${f.accent} 100%); border-radius:50% / 100%"></div>
      <div style="position:absolute; left:0; right:0; top:${width*0.13}px; bottom:${width*0.04}px; background:linear-gradient(90deg, ${f.dark} 0%, ${f.accent} 12%, ${f.c} 35%, #ffffff 50%, ${f.c} 65%, ${f.accent} 88%, ${f.dark} 100%); border-radius:${width*0.06}px; overflow:hidden;">
        <div style="position:absolute; left:0; right:0; top:20%; bottom:14%; background:linear-gradient(180deg, ${f.accent} 0%, ${f.c} 18%, ${f.c} 82%, ${f.accent} 100%); display:flex; align-items:center; justify-content:center; flex-direction:column;">
          <div style="font-size:${width*0.065}px; font-weight:800; color:#fff; letter-spacing:0.18em">FLAVOR · TAP</div>
          <div style="margin:${width*0.02}px 0">
             <svg viewBox="0 0 100 100" style="width:${width*0.3}px; height:${width*0.3}px; fill:#fff; display:block;">
                <path d="${GLYPHS[f.id] || GLYPHS.mint}"/>
             </svg>
          </div>
          <div style="font-size:${width*0.13}px; font-weight:900; color:#fff; line-height:0.9; text-align:center; padding:0 ${width*0.04}px; font-style:italic; font-family:'Fraunces', serif;">${f.name.toUpperCase()}</div>
          <div style="font-size:${width*0.05}px; font-weight:700; color:#fff; opacity:0.7; letter-spacing:0.22em; margin-top:${width*0.02}px">SPARKLING · 355ML</div>
        </div>
      </div>
    </button>
    `;
}

/**
 * GAME ACTIONS
 * Controls for starting games, handling taps, and timers.
 */
function showInstructions() {
    state.view = 'instructions';
    render();
}

function pickUniqueTarget() {
    let next;
    do {
        next = state.activeSet[Math.floor(Math.random() * state.activeSet.length)];
    } while (next.id === state.target?.id);
    return next;
}

/**
 * Executes a 5-second countdown before the round starts.
 */
function runCountdown(callback) {
    state.isCountingDown = true;
    state.countdownValue = 5;
    render();

    const interval = setInterval(() => {
        state.countdownValue--;
        if (state.countdownValue < 0) {
            clearInterval(interval);
            setTimeout(() => {
                state.isCountingDown = false;
                callback();
                render();
            }, 800);
        }
        render();
    }, 1000);
}

function startGame() {
    const count = state.difficulty === 'easy' ? 9 : 12;
    state.activeSet = [...FLAVORS].sort(() => 0.5 - Math.random()).slice(0, count);
    state.score = 0;
    state.timeLeft = 20;
    state.view = 'play';
    state.target = null; // No target during countdown

    runCountdown(() => {
        state.target = pickUniqueTarget();
        announce(state.target.name);
        startTimers();
    });
}

function startNextRound() {
    state.difficulty = 'hard';
    startGame();
}

function showCertificate() {
    state.view = 'certificate';
    render();
}

function handleCanTap(flavorId) {
    if (state.view !== 'play' || state.isCountingDown) return;
    
    if (flavorId === state.target.id) {
        state.hitId = flavorId;
        state.score += 1;
        
        if (state.score >= 5) {
            stopTimers();
            if(state.difficulty === 'easy') state.easyTimeTaken = 20 - state.timeLeft;
            else state.hardTimeTaken = 20 - state.timeLeft;
            
            state.view = 'win';
            render();
        } else {
            resetTargetSwitcher();
            state.target = pickUniqueTarget();
            announce(state.target.name);
            render();
            setTimeout(() => {
                state.hitId = null;
                render();
            }, 120);
        }
    }
}

function startTimers() {
    stopTimers();
    gameTimer = setInterval(() => {
        state.timeLeft -= 1;
        if (state.timeLeft <= 0) {
            stopTimers();
            state.view = 'lose';
        }
        render();
    }, 1000);

    resetTargetSwitcher();
}

function resetTargetSwitcher() {
    if (targetSwitcher) clearInterval(targetSwitcher);
    const pace = state.difficulty === 'easy' ? 3000 : 2000;
    targetSwitcher = setInterval(() => {
        state.target = pickUniqueTarget();
        announce(state.target.name);
        render();
    }, pace);
}

function stopTimers() {
    clearInterval(gameTimer);
    clearInterval(targetSwitcher);
}

/**
 * RENDERER
 */
function render() {
    const root = document.getElementById('root');
    const { view, difficulty, score, timeLeft, target, activeSet, hitId, easyTimeTaken, hardTimeTaken, isCountingDown, countdownValue } = state;

    /**
     * --- PAGE: HOME ---
     */
    if (view === 'home') {
        const previewIds = ['mint','straw','citrus','frost','grape'];
        const previewCans = previewIds.map(id => FLAVORS.find(f => f.id === id));
        
        root.innerHTML = `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; padding:120px 80px 100px; z-index:10;">
          <div style="padding:10px 24px; border:2px solid rgba(26,18,8,0.15); border-radius:100px;display:flex; gap:6px; margin-bottom:64px;">
            <span style="color:#ff5b3a; font-weight:800; font-size:28px; letter-spacing:0.4em;">TAP</span>            
            <span style="color:#ff5b3a; font-weight:800; font-size:28px; letter-spacing:0.4em; padding-left:8px;">THE FLAVOR</span>
          </div>
          <h1 style="font-family:'Fraunces', serif; font-weight:900; font-style:italic; font-size:280px; color:#1a1208; line-height:0.85; margin:0; text-align:center;">
            Flavor<br/><span style="color:#ff5b3a;">Tap</span>
          </h1>

          <div style="font-size:32px; margin-top:100px; opacity:0.7; max-width:720px; line-height:1.3; text-align:center; color:#1a1208;">
              Listen up. Tap fast. Get five right before the clock runs out.
          </div>
          <div style="display:flex; justify-content:center; margin:80px auto 120px; gap:14px;">
            ${previewCans.map((f, i) => getCanHTML(f, 160, [-8, 4, -3, 6, -5][i])).join('')}
          </div>
          <div style="width:100%; margin-top:auto; text-align:center;">
            <button onclick="showInstructions()" style="width:100%; padding:48px 0; background:#ff5b3a; color:#fff; border-radius:100px; font-size:88px; font-weight:900; font-style:italic; font-family:'Fraunces', serif; box-shadow:0 12px 0 #1a1208; border:none; outline:none; cursor:pointer;">Tap to Play</button>
          </div>
        </div>`;
    }

    /**
     * --- PAGE: INSTRUCTIONS ---
     */
    if (view === 'instructions') {
        root.innerHTML = `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; padding:120px 80px 100px; z-index:10;">
          <div style="padding:10px 24px; border:2px solid rgba(26,18,8,0.15); border-radius:100px; color:#ff5b3a; font-weight:800; font-size:28px; letter-spacing:0.4em; margin-bottom:64px;">TWO ROUNDS</div>
          <h1 style="font-family:'Fraunces', serif; font-weight:900; font-style:italic; font-size:180px; color:#1a1208; line-height:0.9; margin:0; text-align:center;">
            Easy,<br/>then <span style="color:#ff5b3a;">Hard.</span>
          </h1>

          <div style="font-size:32px; margin-top:60px; opacity:0.7; max-width:720px; line-height:1.4; text-align:center; color:#1a1208;">
              Clear eight cans in round one. Then twelve cans, faster, in round two.
          </div>

          <div style="width: 100%; height: 1px; background: rgba(26,18,8,0.1); margin: 20px 0;"></div>

          <div style="display:flex; width:100%; justify-content:space-between; text-align:center; padding: 0 40px;">
            <div>
               <div style="font-size:22px; letter-spacing:0.3em; font-weight:800; opacity:0.5; margin-bottom:10px;">ROUNDS</div>
               <div style="font-size:110px; font-weight:900; font-family:'Fraunces', serif; font-style:italic;">2</div>
            </div>
            <div style="width: 1px; background: rgba(26,18,8,0.1);"></div>
            <div>
               <div style="font-size:22px; letter-spacing:0.3em; font-weight:800; opacity:0.5; margin-bottom:10px;">TARGET</div>
               <div style="font-size:110px; font-weight:900; font-family:'Fraunces', serif; font-style:italic;">5<span style="color:#ccc; margin-left:10px;">/5</span></div>
            </div>
            <div style="width: 1px; background: rgba(26,18,8,0.1);"></div>
            <div>
               <div style="font-size:22px; letter-spacing:0.3em; font-weight:800; opacity:0.5; margin-bottom:10px;">CLOCK</div>
               <div style="font-size:110px; font-weight:900; font-family:'Fraunces', serif; font-style:italic;">20<span style="font-size:40px;">s</span></div>
            </div>
          </div>

          <div style="width: 100%; height: 1px; background: rgba(26,18,8,0.1); margin: 20px 0;"></div>

          <div style="width: 100%; text-align:center;">
             <div style="font-size:24px; letter-spacing:0.3em; font-weight:800; opacity:0.5; margin-top:50px; margin-bottom:30px;">HOW TO PLAY</div>
             <div style="display:flex; flex-direction:column; gap:40px; align-items:flex-start; padding: 0 60px;">
                <div style="display:flex; gap:30px; align-items:flex-start; text-align:left;">
                   <div style="font-size:110px; font-weight:900; font-family:'Fraunces', serif; color:#ff5b3a; font-style:italic; line-height:0.8;">1</div>
                   <div>
                      <div style="font-size:60px; font-weight:900; font-family:'Fraunces', serif; font-style:italic;">Listen.</div>
                      <div style="font-size:28px; opacity:0.6; margin-top:10px;">A flavor name will be called out: by voice, on screen, in coral.</div>
                   </div>
                </div>
                <div style="display:flex; gap:30px; align-items:flex-start; text-align:left;">
                   <div style="font-size:110px; font-weight:900; font-family:'Fraunces', serif; color:#ff5b3a; font-style:italic; line-height:0.8;">2</div>
                   <div>
                      <div style="font-size:60px; font-weight:900; font-family:'Fraunces', serif; font-style:italic;">Look.</div>
                      <div style="font-size:28px; opacity:0.6; margin-top:10px;">Scan the cans. Each one is a different flavor.</div>
                   </div>
                </div>
                <div style="display:flex; gap:30px; align-items:flex-start; text-align:left;">
                   <div style="font-size:110px; font-weight:900; font-family:'Fraunces', serif; color:#ff5b3a; font-style:italic; line-height:0.8;">3</div>
                   <div>
                      <div style="font-size:60px; font-weight:900; font-family:'Fraunces', serif; font-style:italic;">Tap.</div>
                      <div style="font-size:28px; opacity:0.6; margin-top:10px;">Tap the matching can. Get five right before time runs out.</div>
                   </div>
                </div>
             </div>
          </div>

          <div style="width:100%; margin-top:auto; text-align:center;">
            <button onclick="startGame()" style="width:100%; padding:48px 0; background:#ff5b3a; color:#fff; border-radius:100px; font-size:88px; font-weight:900; font-style:italic; font-family:'Fraunces', serif; box-shadow:0 12px 0 #1a1208; border:none; outline:none; cursor:pointer;">Start</button>
          </div>
        </div>`;
    }

    /**
     * --- PAGE: GAMEPLAY ---
     */
    if (view === 'play') {
        root.innerHTML = `
        <div style="flex:1; display:flex; flex-direction:column; z-index:10; padding:60px 60px 40px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="margin-left:40px;">
              <div style="font-size:24px; font-weight:800; opacity:0.5; letter-spacing:0.3em;">SCORE</div>
              <div style="font-size:130px; font-weight:900; font-family:'Fraunces', serif; font-style:italic; line-height:1;">${score} <span style="font-size:50px; opacity:0.3;">/ 5</span></div>
            </div>
            
            <div style="align-self:center; margin-top:20px;">
                <div style="padding:10px 24px; border:2px solid rgba(26,18,8,0.15); border-radius:100px; font-size:24px; font-weight:800; letter-spacing:0.1em; color:#1a1208; opacity:0.8;">${difficulty === 'easy' ? 'ROUND 1' : 'ROUND 2'}</div>
            </div>

            <div style="text-align:right; margin-right:40px;">
              <div style="font-size:24px; font-weight:800; opacity:0.5; letter-spacing:0.3em;">TIME</div>
              <div style="font-size:130px; font-weight:900; font-style:italic; font-family:'Fraunces', serif; line-height:1;">${timeLeft}s</div>
            </div>
          </div>
          <div style="height:220px; display:flex; flex-direction:column; justify-content:center; text-align:center;">
            ${isCountingDown ? `
              <div style="font-size:24px; opacity:0.4; letter-spacing:0.3em; font-weight:600;">GET READY...</div>
              <div style="font-size:140px; font-weight:900; color:#ff5b3a; font-style:italic; font-family:'Fraunces', serif;">
                ${countdownValue > 0 ? countdownValue : 'GO!'}
              </div>
            ` : `
              <div style="font-size:24px; opacity:0.4; letter-spacing:0.3em; font-weight:600;">LISTENING FOR...</div>
              <div style="font-size:100px; font-weight:900; color:#ff5b3a; font-style:italic; font-family:'Fraunces', serif;">"${target?.name.toUpperCase()}"</div>
            `}
          </div>
          <div style="flex:1; display:grid; grid-template-columns:repeat(3, 1fr); gap:${difficulty === 'easy' ? 40 : 20}px; align-content:center; justify-items:center;">
            ${activeSet.map(f => getCanHTML(f, difficulty === 'easy' ? 190 : 140, 0, target?.id === f.id, hitId === f.id)).join('')}
          </div>
        </div>`;
    }

    /**
     * --- PAGE: ROUND RESULT ---
     */
    if (view === 'win' || view === 'lose') {
        const isWin = view === 'win';
        root.innerHTML = `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; padding:100px 60px; z-index:10; text-align:center;">
          ${isWin ? getConfettiHTML() : ''}
          

          <div style="padding:10px 24px; border:2px solid rgba(26,18,8,0.15); border-radius:100px; font-size:32px; font-weight:800; color:${isWin ? '#ff5b3a' : '#1a1208'}; letter-spacing:0.3em; margin-bottom:48px;">${isWin ? '5 / 5 CORRECT' : 'TIME IS UP'}</div>
          <h1 style="font-family:'Fraunces', serif; font-weight:900; font-style:italic; font-size:180px; color:#1a1208; line-height:0.9; margin:0;">${isWin ? 'Nailed' : 'Almost'}<br/><span style="color:#ff5b3a;">${isWin ? 'all five.' : 'got it.'}</span></h1>
          
          ${isWin ? `
              <div style="display:flex; justify-content:center; align-items:flex-end; gap:-60px; margin:80px 0;">
                 ${getCanHTML(FLAVORS.find(f => f.id === 'citrus'), 200, -12)}
                 ${getCanHTML(FLAVORS.find(f => f.id === 'straw'), 240, 0)}
                 ${getCanHTML(FLAVORS.find(f => f.id === 'tropics'), 200, 12)}
              </div>

              <div style="background:#1a1208; color:#fff; padding:10px 30px; border-radius:100px; font-size:24px; font-weight:800; display:flex; align-items:center; gap:12px; margin-bottom: 50px;">
                <div style="width:12px; height:12px; background:#5fbf7a; border-radius:50%;"></div>
                ${difficulty === 'easy' ? 'ROUND 1 CLEARED' : 'ROUND 2 CLEARED'}
              </div>

              <div>
                 <div style="font-size:24px; font-weight:800; opacity:0.4; letter-spacing:0.2em;">FINISHED IN</div>
                 <div style="font-size:140px; font-weight:900; font-style:italic; font-family:'Fraunces', serif;">${difficulty === 'easy' ? easyTimeTaken : hardTimeTaken}<span style="font-size:60px;">s</span></div>
              </div>
          ` : `
              <div style="margin:60px 0;">
                <div style="font-size:32px; font-weight:700; opacity:0.5; letter-spacing:0.2em; margin-bottom:20px;">YOU GOT</div>
                <div style="font-size:180px; font-weight:900; font-style:italic; font-family:'Fraunces', serif; color:#1a1208; line-height:1;">${score}<span style="color:#aaa; margin-left:10px;">/ 5</span></div>
                <div style="font-size:32px; opacity:0.7; margin-top:40px; max-width:600px;">You’re getting closer. Trust your ears this time.</div>
                <div style="margin-top:60px; display:flex; justify-content:center;">${getCanHTML(FLAVORS.find(f => f.id === 'grape'), 240, 10)}</div>
              </div>
          `}
          
          <div style="margin-top:auto; width:100%;">
             <button onclick="${isWin ? (difficulty === 'easy' ? 'startNextRound()' : 'showCertificate()') : 'goToHome()'}" style="width:100%; padding:48px 0; background:#ff5b3a; color:#fff; border-radius:100px; font-size:88px; font-weight:900; font-style:italic; font-family:'Fraunces', serif; box-shadow:0 12px 0 #1a1208; border:none; outline:none; cursor:pointer;">
                ${isWin ? 'Continue <span style="margin-left: 20px;">&rarr;</span>' : 'Try Again'}
             </button>
          </div>
        </div>`;
    }

    /**
     * --- PAGE: FINAL CERTIFICATE ---
     */
    if (view === 'certificate') {
        const totalTime = easyTimeTaken + hardTimeTaken;
        root.innerHTML = `
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; padding:120px 60px; z-index:10; text-align:center;">
          ${getConfettiHTML()}
          <div style="padding:10px 24px; border:2px solid rgba(26,18,8,0.15); border-radius:100px; color:#ff5b3a; font-weight:800; font-size:28px; letter-spacing:0.4em; margin-bottom:60px;">CONGRATULATIONS</div>
          <h1 style="font-family:'Fraunces', serif; font-weight:900; font-style:italic; font-size:140px; color:#1a1208; line-height:0.9; margin:0;">
             You're a<br/><span style="color:#ff5b3a;">Master Tapper.</span>
          </h1>

          <div style="margin-top:80px; width:100%; border:3px solid #1a1208; border-radius:40px; padding:60px 40px; position:relative; background: #fffaf5;">
            <div style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); width:30px; height:30px; background:#ff5b3a; border-radius:50%; border:3px solid #1a1208;"></div>
            <div style="position:absolute; bottom:-15px; left:50%; transform:translateX(-50%); width:30px; height:30px; background:#ff5b3a; border-radius:50%; border:3px solid #1a1208;"></div>
            
            <div style="font-size:22px; font-weight:800; color:#ff5b3a; letter-spacing:0.3em; margin-bottom:30px;">CERTIFIED · TAPPER · NO. 001</div>
            
            <div style="font-size:180px; font-weight:900; font-family:'Fraunces', serif; font-style:italic; color:#1a1208; line-height:1;">10<span style="color:#ccc;">/10</span></div>
            
            <div style="font-size:26px; opacity:0.7; max-width:540px; margin:40px auto; line-height:1.4;">
               Both rounds, all ten cans, in <strong>${totalTime}s</strong>. The crowd is on its feet.
            </div>

            <div style="height:1px; background:rgba(26,18,8,0.1); margin:40px 0;"></div>

            <div style="display:flex; justify-content:center; gap:100px;">
               <div>
                  <div style="font-size:20px; font-weight:800; opacity:0.5; letter-spacing:0.2em; margin-bottom:10px;">EASY</div>
                  <div style="font-size:68px; font-weight:900; font-family:'Fraunces', serif; font-style:italic;">5/5</div>
                  <div style="font-size:24px; opacity:0.6; font-weight:700;">${easyTimeTaken}s</div>
               </div>
               <div style="width:1px; background:rgba(26,18,8,0.1);"></div>
               <div>
                  <div style="font-size:20px; font-weight:800; color:#ff5b3a; letter-spacing:0.2em; margin-bottom:10px;">HARD</div>
                  <div style="font-size:68px; font-weight:900; color:#ff5b3a; font-family:'Fraunces', serif; font-style:italic;">5/5</div>
                  <div style="font-size:24px; color:#ff5b3a; opacity:0.8; font-weight:700;">${hardTimeTaken}s</div>
               </div>
            </div>
            
            <div style="position:absolute; bottom:40px; right:40px; text-align:right;">
                <div style="font-size:14px; font-weight:800; opacity:0.3;">
                    ID: #FT-${state.certificateId}
                </div>
                <div style="font-size:14px; font-weight:800; opacity:0.3;">
                    ${new Date().toLocaleDateString()}
                </div>
            </div>
          </div>

          <div style="margin-top:auto; width:100%;">
             <button onclick="goToHome()" style="width:100%; padding:48px 0; background:#ff5b3a; color:#fff; border-radius:100px; font-size:88px; font-weight:900; font-style:italic; font-family:'Fraunces', serif; box-shadow:0 12px 0 #1a1208; border:none; outline:none; cursor:pointer;">Play Again</button>
          </div>
        </div>`;
    }
}

/**
 * NAVIGATION / INITIALIZATION
 */
function goToHome() {
    stopTimers();
    state.view = 'home';
    state.difficulty = 'easy';
    state.easyTimeTaken = 0;
    state.hardTimeTaken = 0;
    render();
}

function handleResize() {
    const viewport = document.getElementById('game-viewport');
    const targetWidth = 1080;
    const targetHeight = 1920;
    
    const scaleX = window.innerWidth / targetWidth;
    const scaleY = window.innerHeight / targetHeight;
    const scale = Math.min(scaleX, scaleY);
    
    viewport.style.transform = `scale(${scale})`;
}

function showCertificate() {
    // Generates a random 4-digit number between 1000 and 9999
    state.certificateId = Math.floor(1000 + Math.random() * 9000);
    state.view = 'certificate';
    render();
}

window.addEventListener('resize', handleResize);
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

// Bootup
handleResize();
render();