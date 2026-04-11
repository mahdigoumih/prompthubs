
/* ═══════════════════════════════════════════
   CONFIG — replace with your Google Client ID
   Get it free at: console.cloud.google.com
   APIs & Services → Credentials → OAuth 2.0
═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let prompts=[], filterCat='All', sortBy='popular', searchQ='';
let myVotes=new Set(), copyCounts={}, currentUser=null, dark=false;
let viewMode='library', authMode='signup', detReport='';
let currentDashTab='prompts';

/* ═══════════════════════════════════════════
   STORAGE (localStorage — works everywhere)
═══════════════════════════════════════════ */
const K={db:'ph5:db',votes:'ph5:votes',copies:'ph5:copies',session:'ph5:session',users:'ph5:users',heroDismissed:'ph5:hero'};
const LS={
  get(k){const v=localStorage.getItem(k);if(v===null)return null;return v;},
  set(k,v){localStorage.setItem(k,v);},
  del(k){localStorage.removeItem(k);}
};
function lsGet(k){try{const v=LS.get(k);return v?JSON.parse(v):null;}catch(e){return null;}}
function lsSet(k,v){LS.set(k,JSON.stringify(v));}

/* ═══════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════ */
const CATS=[
  {id:'All',icon:'✦'},{id:'Writing',icon:'✍️'},{id:'Coding',icon:'💻'},
  {id:'Marketing',icon:'📢'},{id:'Business',icon:'💼'},{id:'Image Generation',icon:'🎨'},
  {id:'Education',icon:'📚'},{id:'Productivity',icon:'⚡'},{id:'Data & Analytics',icon:'📊'},
  {id:'HR & Recruiting',icon:'👥'},{id:'Sales',icon:'🤝'},{id:'Customer Support',icon:'💬'},
  {id:'SEO',icon:'🔍'},{id:'Other',icon:'🧩'},
];
const CAT_ICO=Object.fromEntries(CATS.map(c=>[c.id,c.icon]));

/* ═══════════════════════════════════════════
   SEED PROMPTS
═══════════════════════════════════════════ */
const SEED=[
  {id:'w1',cat:'Writing',title:'High-Converting Sales Copy',desc:'Persuasive copy using proven direct response frameworks that actually convert.',prompt:'You are an expert direct response copywriter with 20+ years experience.\n\nProduct/Service: [PRODUCT]\nTarget audience: [AUDIENCE]\nMain pain point: [PAIN]\nKey benefit: [BENEFIT]\nOffer details: [PRICE AND OFFER]\n\nDeliver:\n1. 3 headline variations (curiosity / benefit / bold claim)\n2. Empathy-driven opening\n3. Problem agitation\n4. Solution presentation\n5. 5-7 benefit bullets\n6. Social proof placeholder\n7. Risk-reversal guarantee\n8. Urgency-driven CTA\n\nTone: Confident, trustworthy. Zero hype.',tags:['copywriting','sales','conversion'],tools:['ChatGPT','Claude'],upvotes:312,featured:true,ts:Date.now()-12*86400000,author:'PromptHub'},
  {id:'w2',cat:'Writing',title:'SEO Long-Form Blog Post',desc:'Google-optimized article from a keyword with H-tags, meta, and FAQ.',prompt:'You are an expert SEO content writer.\n\nPrimary keyword: [TARGET KEYWORD]\nContent angle: [UNIQUE ANGLE]\nTarget audience: [WHO READS THIS]\nTarget length: [800/1200/1800 words]\n\nStructure:\n- SEO title (60 chars max)\n- Meta description (155 chars)\n- Hook introduction\n- 4-6 H2 sections with H3 subsections\n- FAQ section (3 questions)\n- Conclusion with CTA\n\nSEO: 1-2% keyword density, short paragraphs.',tags:['SEO','blog','content'],tools:['ChatGPT','Claude'],upvotes:245,featured:true,ts:Date.now()-11*86400000,author:'PromptHub'},
  {id:'w3',cat:'Writing',title:'Cold Email Sequence (3 Emails)',desc:'3-email B2B sequence engineered for replies, not spam folders.',prompt:'You are a B2B outreach expert with 30%+ reply rates.\n\nYour offer: [COMPANY AND WHAT YOU OFFER]\nTarget prospect: [JOB TITLE, COMPANY SIZE]\nProblem solved: [SPECIFIC PAIN POINT]\nProof point: [RESULT FOR SIMILAR CLIENT]\n\nEmail 1 (Day 0) — The Opener: 80 words max, 1 yes/no CTA\nEmail 2 (Day 3) — Value Bump: useful insight, 60 words\nEmail 3 (Day 7) — The Break-up: humor + permission, 40 words\n\nTone: Peer-to-peer. Never salesy.',tags:['cold email','B2B','outreach'],tools:['ChatGPT','Claude'],upvotes:287,featured:true,ts:Date.now()-10*86400000,author:'PromptHub'},
  {id:'c1',cat:'Coding',title:'Senior Code Reviewer',desc:'Thorough review covering security, performance, readability and best practices.',prompt:'You are a senior software engineer with 15+ years experience. Review this code critically:\n\n```\n[PASTE YOUR CODE HERE]\n```\n\nLanguage/Framework: [LANGUAGE]\nContext: [WHAT THIS CODE DOES]\nMain concern: [WHAT TO FOCUS ON]\n\nStructured review:\n1. CRITICAL — Security vulnerabilities, data loss risks, bugs\n2. PERFORMANCE — N+1 queries, memory leaks, unnecessary complexity\n3. CODE QUALITY — Readability, naming, DRY violations\n4. BEST PRACTICES — Design patterns, error handling, edge cases\n5. IMPROVED VERSION — Rewrite problematic sections with explanations\n6. QUICK WINS — 3 things I can fix in the next 10 minutes\n\nBe direct. For every issue, explain WHY it\'s a problem, not just what it is.',tags:['code review','security','performance'],tools:['ChatGPT','Claude'],upvotes:356,featured:true,ts:Date.now()-8*86400000,author:'PromptHub'},
  {id:'c2',cat:'Coding',title:'Bug Debugger & Root Cause Finder',desc:'Systematic root cause analysis, fix, and prevention for any bug.',prompt:'You are an expert debugger.\n\nError: ```[PASTE ERROR]```\nCode: ```[PASTE CODE]```\nLanguage: [LANGUAGE]\nExpected: [WHAT SHOULD HAPPEN]\nActual: [WHAT IS HAPPENING]\n\n1. Root cause (not just the symptom)\n2. Plain English explanation WHY this happens\n3. Fixed code with comments\n4. Prevention strategy',tags:['debugging','bug fix'],tools:['ChatGPT','Claude'],upvotes:298,featured:true,ts:Date.now()-7*86400000,author:'PromptHub'},
  {id:'c3',cat:'Coding',title:'System Architecture Designer',desc:'Scalable architecture from requirements to full tech stack with justifications.',prompt:'You are a solutions architect.\n\nProject: [WHAT YOU\'RE BUILDING]\nScale: [USERS/REQUESTS PER DAY]\nBudget: [STARTUP/MID/ENTERPRISE]\nTeam: [SOLO/SMALL/LARGE]\nPriorities: [PERFORMANCE/COST/SIMPLICITY]\n\nDeliver:\n1. Architecture overview (ASCII diagram)\n2. Tech stack with justification for each choice\n3. Database design\n4. Security considerations\n5. Scaling roadmap (10x → 100x)\n6. What to build first for MVP',tags:['architecture','system design','backend'],tools:['ChatGPT','Claude'],upvotes:267,featured:true,ts:Date.now()-6*86400000,author:'PromptHub'},
  {id:'m1',cat:'Marketing',title:'Facebook & Instagram Ads (3 Variations)',desc:'3 ad variations with hooks, copy, and A/B testing strategy.',prompt:'You are a performance marketer with $50M+ ad spend.\n\nProduct: [PRODUCT]\nAudience: [AGE, INTERESTS, PAIN POINTS]\nObjective: [AWARENESS/LEADS/CONVERSIONS]\nHook: [WHAT MAKES IT IRRESISTIBLE]\n\n3 variations:\nA — Emotional | B — Social proof | C — Pattern interrupt\n\nFor each: Hook (10 words) + Body (150 words AIDA) + CTA',tags:['Facebook Ads','paid social'],tools:['ChatGPT','Claude'],upvotes:224,featured:true,ts:Date.now()-4*86400000,author:'PromptHub'},
  {id:'b1',cat:'Business',title:'Investor Pitch Deck Script',desc:'10-slide narrative built around what VCs actually need to hear.',prompt:'You are a pitch coach who helped raise $500M+.\n\nCompany: [NAME] | One-liner: [WHAT YOU DO]\nProblem: [THE PROBLEM] | Solution: [YOUR SOLUTION]\nBusiness model: [HOW YOU MAKE MONEY]\nTraction: [YOUR BEST METRICS]\nFunding ask: [AMOUNT + USE]\n\n10-slide narrative with compelling headline + speaker notes for each slide.',tags:['pitch deck','fundraising','startup'],tools:['ChatGPT','Claude'],upvotes:342,featured:true,ts:Date.now()-2*86400000,author:'PromptHub'},
  {id:'e1',cat:'Education',title:'Explain Anything at 4 Levels',desc:'Any concept explained from ELI5 to expert — clear, accurate, engaging.',prompt:'You are the world\'s best explainer.\n\nConcept: [WHAT YOU WANT TO UNDERSTAND]\nMy knowledge: [BEGINNER/SOME/INTERMEDIATE]\n\n🟢 Level 1 — ELI5 (50 words, everyday objects only)\n🟡 Level 2 — High School (150 words)\n🟠 Level 3 — College Educated (300 words, analogies)\n🔴 Level 4 — Expert (500 words, full depth, edge cases)\n\nFinish with:\n✦ One-sentence definition for a job interview\n✦ 3 follow-up questions to go deeper',tags:['learning','explanation'],tools:['ChatGPT','Claude','Gemini'],upvotes:345,featured:true,ts:Date.now()-8*3600000,author:'PromptHub'},
  {id:'p1',cat:'Productivity',title:'Perfect Day Planner',desc:'Time-blocking with energy management, priority matrix, and a shutdown ritual.',prompt:'You are a world-class productivity coach.\n\nDate: [TODAY] | Most important task: [MIT]\nAll tasks: [LIST] | Fixed commitments: [MEETINGS + TIMES]\nEnergy pattern: [MORNING/NIGHT OWL] | Hours: [START-END]\n\nCreate:\n1. Priority matrix (Do Now / Schedule / Delegate / Drop)\n2. Time-blocked schedule with rationale\n3. Energy management (when to do what type of work)\n4. 10-minute shutdown ritual\n5. ONE thing to drop from today',tags:['planning','time management'],tools:['ChatGPT','Claude'],upvotes:289,featured:true,ts:Date.now()-4*3600000,author:'PromptHub'},
  {id:'sl1',cat:'Sales',title:'Discovery Call Script',desc:'45-minute structure that uncovers pain, qualifies budget, advances deals.',prompt:'You are a top B2B sales consultant.\n\nProduct: [WHAT YOU SELL] | ICP: [COMPANY + BUYER]\nDeal size: [RANGE] | Top 3 pains: [LIST]\n\n45-min structure:\nOpening (5min): Rapport + Agenda\nDiscovery (20min): 5 situation + 5 problem + 4 implication + 3 need-payoff questions\nQualification (10min): Budget + Timeline + Decision process\nNext Steps (10min): Close for next meeting + 3 objection handlers',tags:['sales','B2B'],tools:['ChatGPT','Claude'],upvotes:276,featured:true,ts:Date.now()-20*60000,author:'PromptHub'},
  {id:'seo1',cat:'SEO',title:'Complete Keyword Research Strategy',desc:'Full keyword cluster map with intent classification and 90-day content roadmap.',prompt:'You are an SEO strategist.\n\nBusiness: [DESCRIPTION] | Niche: [NICHE]\nGeographic target: [LOCAL/NATIONAL/GLOBAL]\nContent capacity: [X pieces/month]\n\nDeliver:\n1. 20 seed keywords grouped by topic\n2. Keyword cluster map (3-5 clusters)\n3. Intent classification (Info/Commercial/Transactional)\n4. Priority scoring matrix\n5. 12-piece content calendar\n6. Quick wins (rank in 90 days)\n7. Internal linking strategy',tags:['SEO','keyword research'],tools:['ChatGPT','Claude'],upvotes:212,ts:Date.now()-5*60000,author:'PromptHub'},
  {id:'i1',cat:'Image Generation',title:'Cinematic Portrait Photography',desc:'Stunning portrait prompts for Midjourney, DALL·E, and Stable Diffusion.',prompt:'Generate a cinematic portrait prompt.\n\nSubject: [DESCRIBE PERSON]\nMood: [CONTEMPLATIVE/POWERFUL/MELANCHOLIC/JOYFUL]\nSetting: [LOCATION]\nTime: [GOLDEN HOUR/BLUE HOUR/NIGHT]\nLighting: [REMBRANDT/SPLIT/RIM/BUTTERFLY]\nPalette: [WARM/COOL/MUTED/HIGH CONTRAST]\nStyle: [PHOTOGRAPHER REFERENCE]\n\nGenerated prompt:\n[Subject], [mood], [setting], [lighting], dramatic shadows, [palette], Phase One medium format, 85mm f/1.4, film grain, [style] photography, ultra-detailed, 8K --ar 2:3 --style raw',tags:['portrait','Midjourney'],tools:['Midjourney','DALL·E'],upvotes:178,ts:Date.now()-0.5*86400000,author:'PromptHub'},
];

/* ═══════════════════════════════════════════
   UTILS
═══════════════════════════════════════════ */
function toast(icon,msg,action,onAction,dur=3000){
  const w=document.getElementById('toasts'),t=document.createElement('div');
  t.className='toast';
  t.innerHTML=`<span>${icon}</span><span style="flex:1">${msg}</span>${action?`<span class="toast-action">${action}</span>`:''}`;
  if(action&&onAction)t.querySelector('.toast-action').onclick=onAction;
  w.appendChild(t);
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),220);},dur);
}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function hashStr(s){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return h.toString(36);}
function ago(ts){
  const s=Math.floor((Date.now()-ts)/1000);
  if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+'m ago';
  if(s<86400)return Math.floor(s/3600)+'h ago';
  const d=Math.floor(s/86400);if(d===1)return'yesterday';if(d<7)return d+'d ago';
  return new Date(ts).toLocaleDateString('en',{month:'short',day:'numeric'});
}
function parseJWT(token){
  try{const b=token.split('.')[1];const d=atob(b.replace(/-/g,'+').replace(/_/g,'/'));return JSON.parse(d);}
  catch(e){return null;}
}
function avatarHTML(user,size=28,cls=''){
  if(user.picture){return `<img src="${esc(user.picture)}" alt="${esc(user.username)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;${cls}">`;}
  return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--a2));display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:${Math.floor(size*.35)}px;font-weight:800;${cls}">${(user.username||'?').slice(0,2).toUpperCase()}</span>`;
}

/* ═══════════════════════════════════════════
   API
═══════════════════════════════════════════ */
function callAI(system,text){
  return fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({system,messages:[{role:'user',content:text}]})});
}

/* ═══════════════════════════════════════════
   GOOGLE SIGN-IN — simple & reliable everywhere
   Strategy: always render the official Google button.
   It works on ALL devices (desktop + mobile) without
   any programmatic clicking or popup tricks.
═══════════════════════════════════════════ */
let _gsiDone=false;

function _initGSI(){
  if(_gsiDone)return;
  if(!window.google?.accounts?.id)return;
  const cid=localStorage.getItem('ph_google_client_id');
  if(!cid||cid==='YOUR_GOOGLE_CLIENT_ID')return;
  try{
    google.accounts.id.initialize({
      client_id:cid,
      callback:handleGoogleCredential,
      auto_select:false,
    });
    // Render official button — works on desktop AND mobile
    const containers=document.querySelectorAll('.g-signin-container');
    containers.forEach(c=>{
      c.innerHTML=''; // clear before re-render
      google.accounts.id.renderButton(c,{
        type:'standard',
        theme:document.documentElement.dataset.theme==='dark'?'filled_black':'outline',
        size:'large',
        text:'continue_with',
        shape:'rectangular',
        width:Math.min(c.offsetWidth||340,340),
      });
    });
    _gsiDone=true;
    // Hide the fallback button once official button is rendered
    const fb=document.getElementById('googleFallbackBtn');
    if(fb)fb.style.display='none';
  }catch(e){console.warn('GSI init:',e);}
}

// Try to init when GSI script loads (onload attr) and on page load
function _rerenderGSIButton(){
  if(!window.google?.accounts?.id||!_gsiDone)return;
  const containers=document.querySelectorAll('.g-signin-container');
  containers.forEach(c=>{
    c.innerHTML='';
    google.accounts.id.renderButton(c,{
      type:'standard',
      theme:document.documentElement.dataset.theme==='dark'?'filled_black':'outline',
      size:'large', text:'continue_with', shape:'rectangular',
      width:Math.min(c.offsetWidth||340,340),
    });
  });
}

function onGSILoad(){_initGSI();}
window.addEventListener('load',()=>{
  // Poll briefly in case GSI loaded before our script ran
  let t=0;const poll=()=>{if(window.google?.accounts?.id){_initGSI();}else if(t++<8)setTimeout(poll,400);};
  poll();
});

function signInWithGoogle(){
  const cid=localStorage.getItem('ph_google_client_id');
  if(!cid||cid==='YOUR_GOOGLE_CLIENT_ID'){showGoogleSetup();return;}
  if(!window.google?.accounts?.id){
    _initGSI();
    toast('⚠','Google loading… please try again in 2 seconds.');
    return;
  }
  if(!_gsiDone) _initGSI();
  // Try One Tap prompt (works on desktop + Chrome Android)
  try{
    google.accounts.id.prompt(n=>{
      if(n.isNotDisplayed()||n.isSkippedMoment()){
        // Prompt blocked (Safari iOS, Firefox) — click rendered button
        const btn=document.querySelector('.g-signin-container [role="button"],.g-signin-container iframe');
        if(btn) btn.click();
        else toast('⚠','Please allow pop-ups for this site, then try again.');
      }
    });
  }catch(e){
    const btn=document.querySelector('.g-signin-container [role="button"],.g-signin-container iframe');
    if(btn) btn.click();
    else toast('⚠','Google error — please refresh and try again.');
  }
}

function handleGoogleCredential(response){
  const payload=parseJWT(response.credential);
  if(!payload){toast('⚠','Google sign-in failed. Please try again.');return;}
  const username=(payload.email.split('@')[0]).replace(/[^a-z0-9_]/gi,'_').toLowerCase().slice(0,24);
  let users=lsGet(K.users)||{};
  const googleId='g_'+payload.sub;
  // Check if Google user exists
  let user=Object.values(users).find(u=>u.googleId===payload.sub);
  if(!user){
    // Create new user from Google
    const finalUsername=users[username]?username+'_'+uid().slice(-4):username;
    user={username:finalUsername,email:payload.email,picture:payload.picture,name:payload.name,googleId:payload.sub,joined:Date.now(),provider:'google'};
    users[user.username]=user;
    lsSet(K.users,users);
    toast('🎉',`Welcome to PromptHub, ${payload.name.split(' ')[0]}!`,'',null,5000);
    launchConfetti();
  } else {
    // Update picture in case it changed
    user.picture=payload.picture;
    users[user.username]=user;
    lsSet(K.users,users);
    toast('👋',`Welcome back, ${user.name||user.username}!`);
  }
  currentUser={...user};
  lsSet(K.session,currentUser);
  closeAuth();
  renderNavAuth();
  renderGrid();
}
function showGoogleSetup(){
  toast('ℹ️','Google Sign-In needs a Client ID — see instructions below','',null,5000);
  // Show a modal with setup instructions
  const el=document.createElement('div');
  el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(7px);z-index:700;display:flex;align-items:center;justify-content:center;padding:20px;';
  el.innerHTML=`<div style="background:var(--surface);border:1.5px solid var(--border);border-radius:20px;max-width:500px;width:100%;padding:28px;box-shadow:0 28px 80px rgba(0,0,0,.28);">
    <div style="font-size:1.1rem;font-weight:900;margin-bottom:6px;">🔑 Set up Google Sign-In</div>
    <div style="font-size:.8rem;color:var(--text2);line-height:1.7;margin-bottom:16px;">To enable Google Sign-In, you need a free Google Client ID:</div>
    <ol style="font-size:.79rem;color:var(--text2);line-height:2;padding-left:18px;margin-bottom:16px;">
      <li>Go to <a href="https://console.cloud.google.com" target="_blank" style="color:var(--a);">console.cloud.google.com</a></li>
      <li>Create a project → APIs & Services → Credentials</li>
      <li>Create OAuth 2.0 Client ID → Web application</li>
      <li>Add <strong>${window.location.origin}</strong> to Authorized JS Origins</li>
      <li>Copy your Client ID and paste it below</li>
    </ol>
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <input type="text" id="gcidInput" placeholder="Paste your Google Client ID here" style="flex:1;background:var(--inp);border:1.5px solid var(--border);color:var(--text);border-radius:var(--rs);padding:9px 12px;font-size:.8rem;font-family:inherit;outline:none;">
      <button onclick="saveGoogleClientId()" style="background:var(--a);color:#fff;border:none;border-radius:var(--rs);padding:9px 16px;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">Save & Enable</button>
    </div>
    <button onclick="this.closest('[style*=fixed]').remove()" style="width:100%;background:var(--sub);border:1.5px solid var(--border);color:var(--text2);border-radius:var(--rs);padding:9px;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;">Cancel — use email signup instead</button>
  </div>`;
  document.body.appendChild(el);
}
function saveGoogleClientId(){
  const cid=document.getElementById('gcidInput').value.trim();
  if(!cid){toast('⚠','Please paste your Client ID.');return;}
  localStorage.setItem('ph_google_client_id',cid);
  location.reload();
}

/* ═══════════════════════════════════════════
   GITHUB SIGN-IN (simulated — needs backend for real OAuth)
═══════════════════════════════════════════ */
function signInWithGitHub(){
  toast('ℹ️','GitHub Sign-In: Enter your GitHub username below to link your account','',null,4000);
  // For a real implementation, you need a backend OAuth flow
  // This simulates it with a username prompt
  const el=document.createElement('div');
  el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(7px);z-index:700;display:flex;align-items:center;justify-content:center;padding:20px;';
  el.innerHTML=`<div style="background:var(--surface);border:1.5px solid var(--border);border-radius:20px;max-width:420px;width:100%;padding:28px;box-shadow:0 28px 80px rgba(0,0,0,.28);">
    <div style="text-align:center;margin-bottom:20px;">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" style="margin-bottom:10px;"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
      <div style="font-size:1rem;font-weight:800;">Continue with GitHub</div>
      <div style="font-size:.76rem;color:var(--text3);margin-top:4px;">Enter your GitHub username to create/link your account</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <input type="text" id="ghUsernameInput" placeholder="Your GitHub username" style="background:var(--inp);border:1.5px solid var(--border);color:var(--text);border-radius:var(--rs);padding:10px 13px;font-size:.85rem;font-family:inherit;outline:none;">
      <button onclick="doGitHubSignIn()" style="background:#24292e;color:#fff;border:none;border-radius:var(--rs);padding:11px;font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;">Sign in as GitHub user</button>
      <button onclick="this.closest('[style*=fixed]').remove()" style="background:var(--sub);border:1.5px solid var(--border);color:var(--text2);border-radius:var(--rs);padding:9px;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;">Cancel</button>
    </div>
  </div>`;
  document.body.appendChild(el);
}
async function doGitHubSignIn(){
  const username=document.getElementById('ghUsernameInput').value.trim().toLowerCase();
  if(!username||username.length<1){toast('⚠','Please enter a username.');return;}
  // Fetch GitHub avatar for a nice touch
  let picture=null;
  try{
    const r=await fetch(`https://api.github.com/users/${username}`);
    if(r.ok){const data=await r.json();picture=data.avatar_url;}
  }catch(e){}
  let users=lsGet(K.users)||{};
  const finalUsername=username.replace(/[^a-z0-9_-]/gi,'_').slice(0,24);
  let user=users[finalUsername];
  if(!user){
    user={username:finalUsername,email:'',picture,joined:Date.now(),provider:'github'};
    users[finalUsername]=user;
    lsSet(K.users,users);
    toast('🎉',`Welcome, @${finalUsername}!`,'',null,5000);
    launchConfetti();
  } else {
    if(picture)user.picture=picture;
    users[finalUsername]=user;
    lsSet(K.users,users);
    toast('👋',`Welcome back, @${finalUsername}!`);
  }
  currentUser={...user};
  lsSet(K.session,currentUser);
  document.querySelector('[style*="z-index:700"]')?.remove();
  closeAuth();
  renderNavAuth();
  renderGrid();
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
function init(){
  myVotes=new Set(lsGet(K.votes)||[]);
  copyCounts=lsGet(K.copies)||{};
  currentUser=lsGet(K.session);
  // Load or seed prompts
  const saved=lsGet(K.db);
  if(saved&&saved.length){
    prompts=saved;
    const ids=new Set(prompts.map(p=>p.id));
    const add=SEED.filter(s=>!ids.has(s.id));
    if(add.length){prompts=[...add,...prompts];lsSet(K.db,prompts);}
  }else{
    prompts=[...SEED];
    lsSet(K.db,prompts);
  }
  // Google GSI loads via onload callback on script tag
  // Render
  renderNavAuth();renderStatsAll();renderFilters();renderTicker();renderPOTD();renderGrid();renderSidebar();
  // Hero/banner
  const heroDismissed=LS.get(K.heroDismissed);
  if(!currentUser&&!heroDismissed)document.getElementById('heroSection').style.display='block';
  else if(!currentUser&&heroDismissed)document.getElementById('sbn').style.display='flex';
  // Hash routing
  handleHashRoute();
  window.addEventListener('hashchange',handleHashRoute);
}

function handleHashRoute(){
  const hash=window.location.hash;
  if(hash.startsWith('#p=')){
    const id=hash.slice(3);
    const p=prompts.find(x=>x.id===id);
    if(p)setTimeout(()=>openPM(id),200);
  } else if(hash.startsWith('#u=')){
    const username=hash.slice(3);
    setTimeout(()=>showProfile(username),100);
  }
}

function saveDB(){lsSet(K.db,prompts);}
function saveVotes(){lsSet(K.votes,[...myVotes]);}
function saveCopies(){lsSet(K.copies,copyCounts);}

/* ═══════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════ */
const PAGES=['libraryPage','dashPage','profilePage','detectorPage'];
function navigate(page,extra){
  viewMode=page;
  PAGES.forEach(id=>document.getElementById(id).style.display='none');
  // Sync mobile bottom nav
  const mnavMap={library:'home',detector:'detector',dashboard:'account',profile:'account'};
  updateMobileNav(mnavMap[page]||'home');
  document.getElementById('searchWrap').style.display=page==='library'?'':'none';
  document.getElementById('detNavBtn').classList.toggle('on',page==='detector');
  if(page==='library'){
    document.getElementById('libraryPage').style.display='block';
    try{window.history.pushState(null,'',window.location.pathname);}catch(e){}
  } else if(page==='dashboard'){
    if(!currentUser){openAuth('signup');return;}
    document.getElementById('dashPage').style.display='block';
    renderDashboard();
  } else if(page==='profile'){
    document.getElementById('profilePage').style.display='block';
    renderProfile(extra);
  } else if(page==='detector'){
    document.getElementById('detectorPage').style.display='block';
  }
}

/* ═══════════════════════════════════════════
   STATS
═══════════════════════════════════════════ */
function renderStatsAll(){
  const total=prompts.length;
  const votes=prompts.reduce((a,p)=>a+(p.upvotes||0),0);
  document.getElementById('hs1').textContent=total+'+';
  document.getElementById('hs2').textContent=votes.toLocaleString();
  document.getElementById('sTotal').textContent=total;
  document.getElementById('sVotes').textContent=votes.toLocaleString();
  document.getElementById('sMembers').textContent=Math.floor(total*4.2);
}

/* ═══════════════════════════════════════════
   TICKER
═══════════════════════════════════════════ */
function renderTicker(){
  const el=document.getElementById('tickerBar');
  const hot=[...prompts].sort((a,b)=>(b.upvotes||0)-(a.upvotes||0)).slice(0,10);
  el.innerHTML=hot.map(p=>`<button class="tpill" onclick="openPM('${p.id}')">${CAT_ICO[p.cat]||'🧩'} ${esc(p.title.slice(0,26))}${p.title.length>26?'…':''}<span class="tcount">▲${p.upvotes||0}</span></button>`).join('');
}

/* ═══════════════════════════════════════════
   FILTERS
═══════════════════════════════════════════ */
function renderFilters(){
  const el=document.getElementById('fbar');
  const counts={All:prompts.length};
  prompts.forEach(p=>{counts[p.cat]=(counts[p.cat]||0)+1;});
  el.innerHTML=CATS.filter(c=>c.id==='All'||counts[c.id]).map(c=>`
    <button class="cpill ${filterCat===c.id?'on':''}" onclick="setFilter('${c.id}')">
      ${c.icon} ${c.id}${c.id!=='All'?` <span style="opacity:.5;font-size:.62rem">${counts[c.id]}</span>`:''}
    </button>`).join('')+
  `<div class="fsep"></div>
   <button class="surprise-btn" onclick="surpriseMe()">🎲 Surprise Me</button>
   <select class="sortsel" onchange="setSort(this.value)">
     <option value="popular">🔥 Most Popular</option>
     <option value="newest">✨ Newest First</option>
     <option value="featured">⭐ Featured</option>
   </select>`;
}

/* ═══════════════════════════════════════════
   POTD
═══════════════════════════════════════════ */
function renderPOTD(){
  const featured=prompts.filter(p=>p.featured);
  if(!featured.length)return;
  const p=featured[Math.floor(Date.now()/86400000)%featured.length];
  document.getElementById('potdWrap').innerHTML=`
    <div class="potd" onclick="openPM('${p.id}')">
      <div class="potd-lbl">✦ Prompt of the Day</div>
      <div class="potd-title">${esc(p.title)}</div>
      <div class="potd-desc">${esc(p.desc)}</div>
      <div class="potd-row">
        <button class="potd-btn potd-prim" onclick="event.stopPropagation();doCopy('${p.id}',this)">📋 Copy Prompt</button>
        <button class="potd-btn potd-sec" onclick="event.stopPropagation();openPM('${p.id}')">View Full →</button>
        <button class="potd-btn potd-sec" onclick="event.stopPropagation();openShareModal('${p.id}')">🔗 Share</button>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════
   GRID
═══════════════════════════════════════════ */
function getFiltered(){
  let list=[...prompts];
  if(filterCat!=='All')list=list.filter(p=>p.cat===filterCat);
  if(searchQ){const q=searchQ.toLowerCase();list=list.filter(p=>p.title.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)||(p.tags||[]).join(' ').includes(q)||(p.cat||'').toLowerCase().includes(q));}
  if(sortBy==='popular')list.sort((a,b)=>(b.upvotes||0)-(a.upvotes||0));
  else if(sortBy==='newest')list.sort((a,b)=>(b.ts||0)-(a.ts||0));
  else list.sort((a,b)=>(b.featured?1:0)-(a.featured?1:0)||((b.upvotes||0)-(a.upvotes||0)));
  return list;
}
function cardHTML(p,showOwner=true){
  const voted=myVotes.has(p.id);
  const isOwner=showOwner&&currentUser&&currentUser.username===p.author;
  const isNew=p.ts&&Date.now()-p.ts<7*86400000;
  const copies=copyCounts[p.id]||0;
  const badges=[`<span class="badge b-cat">${CAT_ICO[p.cat]||'🧩'} ${esc(p.cat)}</span>`,p.featured?'<span class="badge b-feat">⭐ Featured</span>':'',isNew?'<span class="badge b-new">New</span>':'',(p.upvotes||0)>200?'<span class="badge b-hot">🔥 Hot</span>':'',isOwner?'<span class="badge b-mine">Mine</span>':''].filter(Boolean).join('');
  return `<div class="pcard" onclick="openPM('${p.id}')">
    <div class="card-head">
      <div class="card-badges">${badges}</div>
      <button class="upvbtn ${voted?'voted':''}" onclick="event.stopPropagation();doUpvote('${p.id}',this)">
        <span class="arr">${voted?'▲':'△'}</span><span class="cnt">${p.upvotes||0}</span>
      </button>
    </div>
    <div class="card-title">${esc(p.title)}</div>
    <div class="card-desc">${esc(p.desc)}</div>
    <div class="card-prev">${esc(p.prompt.slice(0,200))}${p.prompt.length>200?'…':''}</div>
    <div class="card-foot">
      <div class="card-tags">${(p.tags||[]).slice(0,3).map(t=>`<span class="ptag">${esc(t)}</span>`).join('')}</div>
      <div class="card-r">
        ${copies>0?`<span class="copy-count">📋 ${copies}</span>`:''}
        <button class="cpbtn" id="cpb-${p.id}" onclick="event.stopPropagation();doCopy('${p.id}',this)">📋 Copy</button>
      </div>
    </div>
  </div>`;
}
function renderGrid(){
  const list=getFiltered();
  const el=document.getElementById('grid');
  document.getElementById('gridLabel').textContent=filterCat==='All'?'All Prompts':filterCat;
  document.getElementById('gridCount').textContent=`${list.length} prompt${list.length!==1?'s':''}`;
  el.classList.remove('fe');void el.offsetWidth;el.classList.add('fe');
  if(!list.length){el.innerHTML=`<div class="empty"><div style="font-size:2.5rem;opacity:.2">🔍</div><div style="font-size:.9rem;font-weight:700;color:var(--text2)">No prompts found</div><button class="btn btn-p" onclick="guardedSubmit()" style="margin-top:6px;font-size:.76rem">+ Submit Prompt</button></div>`;return;}
  el.innerHTML=list.map(p=>cardHTML(p)).join('')+(!currentUser?`<div class="cta-card" onclick="openAuth('signup')"><div class="cta-icon">✦</div><div style="font-size:.88rem;font-weight:800;color:var(--text)">Share your best prompt</div><div style="font-size:.74rem;color:var(--text3);line-height:1.5;max-width:200px">Join the community. Free forever.</div><button class="btn btn-p" onclick="event.stopPropagation();openAuth('signup')" style="font-size:.75rem;padding:7px 16px">Sign up free →</button></div>`:'');
}

/* ═══════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════ */
function renderSidebar(){
  const map={};
  prompts.forEach(p=>{const a=p.author||'Anonymous';if(!map[a])map[a]={name:a,count:0,votes:0};map[a].count++;map[a].votes+=(p.upvotes||0);});
  const top=Object.values(map).sort((a,b)=>b.votes-a.votes).slice(0,6);
  const rk=['🥇','🥈','🥉','4','5','6'];const rkC=['g','s','b','','',''];
  const users=lsGet(K.users)||{};
  document.getElementById('leaderboard').innerHTML=top.map((u,i)=>{
    const userObj=users[u.name];
    const avHtml=userObj?.picture?`<div class="lb-av"><img src="${esc(userObj.picture)}" alt="${esc(u.name)}"></div>`:`<div class="lb-av">${u.name.slice(0,2).toUpperCase()}</div>`;
    return `<div class="lb-row" onclick="showProfile('${esc(u.name)}')">
      <div class="lb-rank ${rkC[i]}">${rk[i]}</div>
      ${avHtml}
      <div class="lb-inf"><div class="lb-name">@${esc(u.name)}</div><div class="lb-meta">${u.count} prompt${u.count>1?'s':''}</div></div>
      <div class="lb-score">▲${u.votes.toLocaleString()}</div>
    </div>`;}).join('');
  const recent=[...prompts].sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,5);
  document.getElementById('activity').innerHTML=recent.map(p=>`
    <div class="act-row">
      <div class="act-ic">${CAT_ICO[p.cat]||'🧩'}</div>
      <div class="act-tx"><strong onclick="showProfile('${esc(p.author||'')}')" style="cursor:pointer">@${esc(p.author||'anon')}</strong> added "${esc(p.title.slice(0,22))}"</div>
      <div class="act-time">${ago(p.ts||Date.now())}</div>
    </div>`).join('');
}

/* ═══════════════════════════════════════════
   COPY
═══════════════════════════════════════════ */
function doCopy(id,btnEl){
  const p=prompts.find(x=>x.id===id);if(!p)return;
  navigator.clipboard.writeText(p.prompt).then(()=>{
    copyCounts[id]=(copyCounts[id]||0)+1;saveCopies();
    if(btnEl){const orig=btnEl.innerHTML;btnEl.innerHTML='✓ Copied!';btnEl.classList.add('ok');setTimeout(()=>{btnEl.innerHTML=orig;btnEl.classList.remove('ok');},2200);}
    renderStatsAll();
    toast('📋',`"${p.title.slice(0,30)}" copied!`,'Share →',()=>openShareModal(id));
  }).catch(()=>toast('⚠','Copy failed — select text manually.'));
}

/* ═══════════════════════════════════════════
   SHARE
═══════════════════════════════════════════ */
function openShareModal(id){
  const p=prompts.find(x=>x.id===id);if(!p)return;
  document.getElementById('shareSubtitle').textContent=`"${p.title.slice(0,42)}"`;
  const url=`${window.location.origin}${window.location.pathname}#p=${id}`;
  const text=`Just found this AI prompt on PromptHub 🔥\n\n"${p.title}" — ${p.desc}\n\nFree to use 👇`;
  document.getElementById('shareBody').innerHTML=`
    <button class="sbtn sbtn-tw" onclick="window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(\`${text}\`)+'&url='+encodeURIComponent('${url}'),'_blank');closeShare()">
      <div class="sbtn-icon" style="background:rgba(255,255,255,.15);">𝕏</div><span>Share on X</span>
    </button>
    <button class="sbtn sbtn-wa" onclick="window.open('https://wa.me/?text='+encodeURIComponent(\`${text}\n${url}\`),'_blank');closeShare()">
      <div class="sbtn-icon" style="background:rgba(255,255,255,.15);">💬</div><span>Share on WhatsApp</span>
    </button>
    <button class="sbtn sbtn-li" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent('${url}'),'_blank');closeShare()">
      <div class="sbtn-icon" style="background:rgba(255,255,255,.15);">in</div><span>Share on LinkedIn</span>
    </button>
    <button class="sbtn sbtn-lk" onclick="navigator.clipboard.writeText('${url}').then(()=>{this.querySelector('span').textContent='✓ Copied!';setTimeout(()=>this.querySelector('span').textContent='Copy link',2000)})">
      <div class="sbtn-icon" style="background:var(--am);">🔗</div><span>Copy link</span>
    </button>
    <button class="sbtn" style="background:var(--bg);border:1.5px solid var(--border);" onclick="closeShare()">
      <div class="sbtn-icon">✕</div><span>Close</span>
    </button>`;
  document.getElementById('shareOverlay').classList.add('open');
}
function closeShare(){document.getElementById('shareOverlay').classList.remove('open');}

/* ═══════════════════════════════════════════
   PROMPT MODAL
═══════════════════════════════════════════ */
function openPM(id){
  const p=prompts.find(x=>x.id===id);if(!p)return;
  const voted=myVotes.has(p.id);
  const isOwner=currentUser&&currentUser.username===p.author;
  const isNew=p.ts&&Date.now()-p.ts<7*86400000;
  const related=prompts.filter(x=>x.id!==id&&x.cat===p.cat).sort((a,b)=>(b.upvotes||0)-(a.upvotes||0)).slice(0,3);
  document.getElementById('pmTitle').textContent=p.title;
  document.getElementById('pmBody').innerHTML=`
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <span class="badge b-cat">${CAT_ICO[p.cat]||'🧩'} ${esc(p.cat)}</span>
      ${p.featured?'<span class="badge b-feat">⭐ Featured</span>':''}
      ${isNew?'<span class="badge b-new">New</span>':''}
      <span style="font-size:.68rem;color:var(--text3);cursor:pointer;" onclick="closePM();showProfile('${esc(p.author||'')}')">👤 @${esc(p.author||'Anonymous')}</span>
      <span style="font-size:.68rem;color:var(--text3);">📅 ${ago(p.ts||Date.now())}</span>
      <span style="font-size:.68rem;color:var(--text3);">▲ ${p.upvotes||0}</span>
    </div>
    <p style="font-size:.82rem;color:var(--text2);line-height:1.65;">${esc(p.desc)}</p>
    ${p.tags?.length?`<div style="display:flex;gap:5px;flex-wrap:wrap;">${p.tags.map(t=>`<span class="ptag">${esc(t)}</span>`).join('')}</div>`:''}
    <div>
      <div class="mlbl" style="margin-bottom:7px;">Works with</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">${(p.tools||[]).map(t=>`<span class="tbadge">${esc(t)}</span>`).join('')}</div>
    </div>
    <div>
      <div class="mlbl" style="margin-bottom:7px;">Full Prompt — click to select all</div>
      <div class="pbox" onclick="selAll(this)">${esc(p.prompt)}</div>
    </div>
    <div class="macts">
      <button class="mac prim" onclick="doCopy('${p.id}',this)">📋 Copy Prompt</button>
      <button class="mac sec" onclick="doUpvote('${p.id}',this)">${voted?'▲ Upvoted ('+p.upvotes+')':'△ Upvote ('+p.upvotes+')'}</button>
      <button class="mac gpt" onclick="openInAI('${p.id}','chatgpt')">🤖 Open in ChatGPT</button>
      <button class="mac cla" onclick="openInAI('${p.id}','claude')">🧠 Open in Claude</button>
      <button class="mac gem" onclick="openInAI('${p.id}','gemini')">✨ Open in Gemini</button>
      <button class="mac shr" onclick="openShareModal('${p.id}')">🔗 Share this prompt</button>
      ${isOwner?`<button class="mac edt" onclick="openEdit('${p.id}')">✏️ Edit</button><button class="mac del" onclick="deleteP('${p.id}')">🗑 Delete</button>`:''}
    </div>
    ${related.length?`<div><div class="mlbl" style="margin-bottom:8px;">Related Prompts in ${esc(p.cat)}</div><div class="related-grid">${related.map(r=>`<div class="rel-item" onclick="openPM('${r.id}')"><span>${CAT_ICO[r.cat]||'🧩'}</span><span class="rel-title">${esc(r.title)}</span><span class="rel-cat">▲${r.upvotes||0}</span></div>`).join('')}</div></div>`:''}`;
  document.getElementById('pmOverlay').classList.add('open');
  try{window.history.pushState(null,'',`#p=${id}`);}catch(e){}
}
function closePM(){document.getElementById('pmOverlay').classList.remove('open');try{window.history.pushState(null,'',window.location.pathname);}catch(e){}}
function selAll(el){const s=window.getSelection(),r=document.createRange();r.selectNodeContents(el);s.removeAllRanges();s.addRange(r);}
function openInAI(id,tool){
  const p=prompts.find(x=>x.id===id);if(!p)return;
  const enc=encodeURIComponent(p.prompt.slice(0,2000));
  const urls={chatgpt:`https://chat.openai.com/?q=${enc}`,claude:`https://claude.ai/new?q=${enc}`,gemini:`https://gemini.google.com/app?q=${enc}`};
  window.open(urls[tool],'_blank');
  toast('🚀',`Opening in ${tool==='chatgpt'?'ChatGPT':tool==='claude'?'Claude':'Gemini'}…`);
}

/* ═══════════════════════════════════════════
   UPVOTE
═══════════════════════════════════════════ */
function doUpvote(id,btnEl){
  const p=prompts.find(x=>x.id===id);if(!p)return;
  if(!currentUser){toast('👋','Create a free account to upvote prompts!','Sign up →',()=>openAuth('signup'));return;}
  if(myVotes.has(id)){myVotes.delete(id);p.upvotes=Math.max(0,(p.upvotes||1)-1);}
  else{
    myVotes.add(id);p.upvotes=(p.upvotes||0)+1;
    if(btnEl){btnEl.style.transform='scale(1.3)';setTimeout(()=>btnEl.style.transform='',300);}
    toast('▲',`Upvoted "${p.title.slice(0,30)}"`);
  }
  saveDB();saveVotes();
  renderStatsAll();renderGrid();renderTicker();renderSidebar();
  if(document.getElementById('pmOverlay').classList.contains('open'))openPM(id);
}

/* ═══════════════════════════════════════════
   DELETE
═══════════════════════════════════════════ */
function deleteP(id){
  if(!currentUser)return;
  const p=prompts.find(x=>x.id===id);
  if(!p||p.author!==currentUser.username){toast('⚠','You can only delete your own prompts.');return;}
  if(!confirm(`Delete "${p.title}"? This cannot be undone.`))return;
  prompts=prompts.filter(x=>x.id!==id);
  saveDB();closePM();
  renderStatsAll();renderFilters();renderGrid();renderTicker();renderSidebar();
  if(viewMode==='dashboard')renderDashboard();
  toast('🗑','Prompt deleted.');
}

/* ═══════════════════════════════════════════
   SURPRISE
═══════════════════════════════════════════ */
function surpriseMe(){
  const list=filterCat==='All'?prompts:prompts.filter(p=>p.cat===filterCat);
  if(!list.length)return;
  openPM(list[Math.floor(Math.random()*list.length)].id);
  toast('🎲','Surprise prompt!');
}

/* ═══════════════════════════════════════════
   SUBMIT / EDIT
═══════════════════════════════════════════ */
function guardedSubmit(){
  if(!currentUser){openAuth('signup');return;}
  resetSP();
  document.getElementById('spanel').classList.add('open');
}
function closeSP(){document.getElementById('spanel').classList.remove('open');}
function resetSP(){
  document.getElementById('sfID').value='';
  document.getElementById('spTitle').textContent='✦ Submit a Prompt';
  document.getElementById('spBtnT').textContent='Share with the community →';
  ['sfT','sfD','sfP','sfTG'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('sfC').value='';document.getElementById('sfPC').textContent='0/3000';
  document.querySelectorAll('#sfTools .tt').forEach(t=>t.classList.toggle('on',t.dataset.t==='ChatGPT'||t.dataset.t==='Claude'));
}
function openEdit(id){
  const p=prompts.find(x=>x.id===id);
  if(!p||!currentUser||p.author!==currentUser.username)return;
  closePM();
  document.getElementById('sfID').value=id;
  document.getElementById('spTitle').textContent='✏️ Edit Prompt';
  document.getElementById('spBtnT').textContent='Save Changes →';
  document.getElementById('sfT').value=p.title;
  document.getElementById('sfD').value=p.desc;
  document.getElementById('sfP').value=p.prompt;
  document.getElementById('sfPC').textContent=p.prompt.length+'/3000';
  document.getElementById('sfC').value=p.cat;
  document.getElementById('sfTG').value=(p.tags||[]).join(', ');
  document.querySelectorAll('#sfTools .tt').forEach(t=>t.classList.toggle('on',(p.tools||[]).includes(t.dataset.t)));
  document.getElementById('spanel').classList.add('open');
}
function doSubmit(){
  const title=document.getElementById('sfT').value.trim();
  const desc=document.getElementById('sfD').value.trim();
  const prompt=document.getElementById('sfP').value.trim();
  const cat=document.getElementById('sfC').value;
  const editId=document.getElementById('sfID').value;
  if(!title||!desc||!prompt||!cat){toast('⚠','Please fill all required fields.');return;}
  const btn=document.getElementById('spBtn'),sp=document.getElementById('spSpin'),lb=document.getElementById('spBtnT');
  btn.disabled=true;sp.innerHTML='<span class="spin">⟳</span> ';lb.textContent='Saving…';
  const tags=document.getElementById('sfTG').value.split(',').map(t=>t.trim()).filter(Boolean);
  const tools=[...document.querySelectorAll('#sfTools .tt.on')].map(el=>el.dataset.t);
  if(editId){
    const idx=prompts.findIndex(p=>p.id===editId);
    if(idx>-1){prompts[idx]={...prompts[idx],title,desc,prompt,cat,tags,tools};saveDB();}
    closeSP();renderAll();if(viewMode==='dashboard')renderDashboard();
    toast('✅',`"${title}" updated!`);
  } else {
    const newP={id:uid(),cat,title,desc,prompt,tags,tools,author:currentUser.username,upvotes:0,featured:false,ts:Date.now()};
    prompts.unshift(newP);saveDB();closeSP();renderAll();
    if(viewMode==='dashboard')renderDashboard();
    toast('🎉',`"${title}" is live!`,'Share →',()=>openShareModal(newP.id));
    launchConfetti();
  }
  btn.disabled=false;sp.innerHTML='';lb.textContent='Share with the community →';
}
function renderAll(){renderStatsAll();renderFilters();renderGrid();renderTicker();renderSidebar();}

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
function renderDashboard(){
  const mine=prompts.filter(p=>p.author===currentUser?.username);
  const totalVotes=mine.reduce((a,p)=>a+(p.upvotes||0),0);
  const totalCopies=mine.reduce((a,p)=>a+(copyCounts[p.id]||0),0);
  const upvoted=prompts.filter(p=>myVotes.has(p.id));
  const avHTML=currentUser.picture?`<img src="${esc(currentUser.picture)}" alt="avatar">`:(currentUser.username||'?').slice(0,2).toUpperCase();
  document.getElementById('dashHeader').innerHTML=`
    <div class="dash-av-big">${avHTML}</div>
    <div class="dash-info">
      <div class="dash-name">${esc(currentUser.name||('@'+currentUser.username))}</div>
      <div class="dash-sub">${currentUser.email||''} ${currentUser.provider==='google'?'· Google account':currentUser.provider==='github'?'· GitHub account':''}</div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="potd-btn potd-prim" onclick="showProfile('${esc(currentUser.username)}')">👁 View Public Profile</button>
        <button class="potd-btn potd-sec" onclick="guardedSubmit()">+ New Prompt</button>
      </div>
    </div>
    <div class="dash-stats">
      <div class="ds"><strong>${mine.length}</strong><span>Prompts</span></div>
      <div class="ds"><strong>${totalVotes.toLocaleString()}</strong><span>Upvotes</span></div>
      <div class="ds"><strong>${totalCopies.toLocaleString()}</strong><span>Copies</span></div>
      <div class="ds"><strong>${upvoted.length}</strong><span>Liked</span></div>
    </div>`;
  showDashTab(currentDashTab);
}
function showDashTab(tab){
  currentDashTab=tab;
  ['prompts','upvoted','settings'].forEach(t=>{
    document.getElementById('dtab-'+t)?.classList.toggle('on',t===tab);
  });
  const mine=prompts.filter(p=>p.author===currentUser?.username);
  const upvoted=prompts.filter(p=>myVotes.has(p.id));
  const content=document.getElementById('dashContent');
  if(tab==='prompts'){
    if(!mine.length){
      content.innerHTML=`<div class="dash-empty"><div style="font-size:2rem">📭</div><div style="font-size:.88rem;font-weight:700;color:var(--text2)">No prompts yet</div><div style="font-size:.74rem;color:var(--text3)">Submit your first prompt!</div><button class="btn btn-p" onclick="guardedSubmit()" style="margin-top:8px;font-size:.76rem">+ Submit Prompt</button></div>`;
      return;
    }
    content.innerHTML=`<div class="dash-grid">${mine.sort((a,b)=>(b.ts||0)-(a.ts||0)).map(p=>`
      <div class="dcard">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span class="badge b-cat">${CAT_ICO[p.cat]||'🧩'} ${esc(p.cat)}</span>
          ${p.featured?'<span class="badge b-feat">⭐</span>':''}
        </div>
        <div class="dcard-title">${esc(p.title)}</div>
        <div class="dcard-desc">${esc(p.desc)}</div>
        <div class="dcard-foot">
          <div class="dcard-meta">▲${p.upvotes||0} · 📋${copyCounts[p.id]||0} · ${ago(p.ts||Date.now())}</div>
          <div class="dcard-actions">
            <button class="dact view" onclick="openPM('${p.id}')">View</button>
            <button class="dact edit" onclick="openEdit('${p.id}')">Edit</button>
            <button class="dact del" onclick="deleteP('${p.id}')">Delete</button>
          </div>
        </div>
      </div>`).join('')}</div>`;
  } else if(tab==='upvoted'){
    if(!upvoted.length){content.innerHTML=`<div class="dash-empty"><div style="font-size:2rem">▲</div><div style="font-size:.88rem;font-weight:700;color:var(--text2)">No upvoted prompts yet</div><div style="font-size:.74rem;color:var(--text3)">Browse prompts and upvote your favorites!</div><button class="btn btn-p" onclick="navigate('library')" style="margin-top:8px;font-size:.76rem">Browse Prompts →</button></div>`;return;}
    content.innerHTML=`<div class="dash-grid">${upvoted.map(p=>cardHTML(p,false)).join('')}</div>`;
  } else if(tab==='settings'){
    content.innerHTML=`
      <div class="dcard" style="max-width:480px;">
        <div style="font-size:.88rem;font-weight:800;margin-bottom:12px;">⚙️ Account Settings</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div class="af"><label>Display Name</label><input type="text" id="settName" value="${esc(currentUser.name||currentUser.username)}" placeholder="Your display name" style="background:var(--inp);border:1.5px solid var(--border);color:var(--text);border-radius:var(--rs);padding:9px 12px;font-size:.82rem;font-family:inherit;outline:none;width:100%;"></div>
          <div class="af"><label>Email</label><input type="email" id="settEmail" value="${esc(currentUser.email||'')}" placeholder="your@email.com" style="background:var(--inp);border:1.5px solid var(--border);color:var(--text);border-radius:var(--rs);padding:9px 12px;font-size:.82rem;font-family:inherit;outline:none;width:100%;"></div>
          <button onclick="saveSettings()" class="btn btn-p" style="font-size:.8rem;padding:9px;">Save Changes</button>
        </div>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
          <div style="font-size:.72rem;font-weight:700;color:var(--text2);margin-bottom:8px;">Google Client ID (for Google Sign-In)</div>
          <div style="display:flex;gap:8px;">
            <input type="text" id="settGcid" value="${esc(localStorage.getItem('ph_google_client_id')||'')}" placeholder="Paste your Google Client ID" style="flex:1;background:var(--inp);border:1.5px solid var(--border);color:var(--text);border-radius:var(--rs);padding:8px 10px;font-size:.75rem;font-family:inherit;outline:none;">
            <button onclick="saveGoogleClientIdFromSettings()" class="btn btn-p" style="font-size:.74rem;padding:8px 12px;">Save</button>
          </div>
          <div style="font-size:.66rem;color:var(--text3);margin-top:5px;">Get your free Client ID at <a href="https://console.cloud.google.com" target="_blank" style="color:var(--a)">console.cloud.google.com</a></div>
        </div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
          <button onclick="logout()" style="background:rgba(239,68,68,.07);border:1.5px solid rgba(239,68,68,.2);color:#dc2626;border-radius:var(--rs);padding:8px 16px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;">→ Log out</button>
        </div>
      </div>`;
  }
}
function saveSettings(){
  const name=document.getElementById('settName').value.trim();
  const email=document.getElementById('settEmail').value.trim();
  if(name)currentUser.name=name;
  if(email)currentUser.email=email;
  lsSet(K.session,currentUser);
  const users=lsGet(K.users)||{};
  if(users[currentUser.username]){users[currentUser.username]={...users[currentUser.username],...currentUser};lsSet(K.users,users);}
  renderDashboard();renderNavAuth();
  toast('✅','Settings saved!');
}
function saveGoogleClientIdFromSettings(){
  const cid=document.getElementById('settGcid').value.trim();
  localStorage.setItem('ph_google_client_id',cid);
  toast('✅','Google Client ID saved. Reload to enable Google Sign-In.');
}

/* ═══════════════════════════════════════════
   PUBLIC PROFILE PAGE
═══════════════════════════════════════════ */
function showProfile(username){
  if(!username||username==='Anonymous')return;
  navigate('profile',username);
  try{window.history.pushState(null,'',`#u=${username}`);}catch(e){}
}
function renderProfile(username){
  const users=lsGet(K.users)||{};
  const userObj=users[username];
  const mine=prompts.filter(p=>p.author===username);
  const totalVotes=mine.reduce((a,p)=>a+(p.upvotes||0),0);
  const totalCopies=mine.reduce((a,p)=>a+(copyCounts[p.id]||0),0);
  const isOwnProfile=currentUser&&currentUser.username===username;
  const avHTML=userObj?.picture?`<img src="${esc(userObj.picture)}" alt="${esc(username)}">`:(username||'?').slice(0,2).toUpperCase();
  document.getElementById('profileContent').innerHTML=`
    <div class="prof-header">
      <div class="prof-av">${avHTML}</div>
      <div class="prof-info">
        <div class="prof-name">${esc(userObj?.name||username)}</div>
        <div class="prof-handle">@${esc(username)} ${userObj?.provider==='google'?'<span style="font-size:.66rem;background:rgba(66,133,244,.1);color:#4285f4;border-radius:4px;padding:1px 6px;font-weight:700;">G</span>':userObj?.provider==='github'?'<span style="font-size:.66rem;background:var(--sub);border-radius:4px;padding:1px 6px;font-weight:700;">GH</span>':''}</div>
        <div class="prof-stats">
          <div class="pstat"><strong>${mine.length}</strong><span>Prompts</span></div>
          <div class="pstat"><strong>${totalVotes.toLocaleString()}</strong><span>Upvotes received</span></div>
          <div class="pstat"><strong>${totalCopies.toLocaleString()}</strong><span>Times copied</span></div>
        </div>
      </div>
      <div class="prof-actions">
        ${isOwnProfile?`<button class="btn btn-p" onclick="navigate('dashboard')">⚙️ My Dashboard</button>`:`<button class="btn btn-s" onclick="toast('📩','Messaging coming soon!')">💬 Message</button>`}
      </div>
    </div>
    <div>
      <div class="stitle" style="margin-bottom:16px;">${mine.length>0?`${mine.length} Prompt${mine.length>1?'s':''} by @${esc(username)}`:`@${esc(username)} hasn't submitted any prompts yet`}</div>
      ${mine.length>0?`<div class="prof-grid">${mine.sort((a,b)=>(b.upvotes||0)-(a.upvotes||0)).map(p=>cardHTML(p,false)).join('')}</div>`:
      `<div class="dash-empty"><div style="font-size:2rem">📭</div><div style="font-size:.88rem;font-weight:700;color:var(--text2)">No prompts submitted yet</div>${isOwnProfile?`<button class="btn btn-p" onclick="guardedSubmit()" style="margin-top:8px;font-size:.76rem">+ Submit Your First Prompt</button>`:''}</div>`}
    </div>`;
}

/* ═══════════════════════════════════════════
   AUTH
═══════════════════════════════════════════ */
function openAuth(mode='signup'){
  authMode=mode;switchAuth(mode);clearAE();
  document.getElementById('authOv').classList.add('open');
  setTimeout(()=>document.getElementById('aUser').focus(),80);
  // Re-render Google button now that container is visible and has correct width
  setTimeout(()=>{
    if(!_gsiDone) _initGSI();       // first time: init + render
    else _rerenderGSIButton();      // already init: just re-render at new size
  },150);
}
function closeAuth(){document.getElementById('authOv').classList.remove('open');}
function clearAE(){document.getElementById('aErr').style.display='none';document.getElementById('aSucc').style.display='none';}
function setAE(m){const e=document.getElementById('aErr');e.textContent=m;e.style.display='block';}
function switchAuth(mode){
  authMode=mode;
  document.getElementById('tSU').classList.toggle('on',mode==='signup');
  document.getElementById('tLI').classList.toggle('on',mode==='login');
  document.getElementById('aTitle').textContent=mode==='signup'?'Join PromptHub':'Welcome back';
  document.getElementById('aSub').textContent=mode==='signup'?'Create a free account to submit, upvote, and track prompts.':'Log in to your PromptHub account.';
  document.getElementById('aEF').style.display=mode==='signup'?'flex':'none';
  document.getElementById('aBtnT').textContent=mode==='signup'?'Create Free Account':'Log In';
  document.getElementById('aFt').innerHTML=mode==='signup'?'Already have an account? <a onclick="switchAuth(\'login\')">Log in</a>':'No account yet? <a onclick="switchAuth(\'signup\')">Sign up free</a>';
  clearAE();document.getElementById('aPass').value='';
}
function doAuth(){
  const username=document.getElementById('aUser').value.trim().toLowerCase();
  const password=document.getElementById('aPass').value;
  const email=document.getElementById('aEmail').value.trim();
  if(!username||username.length<3){setAE('Username must be at least 3 characters.');return;}
  if(!/^[a-z0-9_]+$/.test(username)){setAE('Letters, numbers, and _ only.');return;}
  if(!password||password.length<6){setAE('Password must be at least 6 characters.');return;}
  const btn=document.getElementById('aBtn'),sp=document.getElementById('aSpin');
  btn.disabled=true;sp.innerHTML='<span class="spin">⟳</span> ';
  try{
    let users=lsGet(K.users)||{};
    if(authMode==='signup'){
      if(users[username]){setAE('Username taken. Try another.');btn.disabled=false;sp.innerHTML='';return;}
      users[username]={username,email,pw:hashStr(password),joined:Date.now(),provider:'email'};
      lsSet(K.users,users);
      currentUser={username,email,joined:Date.now(),provider:'email'};
      lsSet(K.session,currentUser);
      closeAuth();renderNavAuth();renderGrid();launchConfetti();
      toast('🎉',`Welcome, @${username}!`,'Submit →',guardedSubmit,5000);
    } else {
      const u=users[username];
      if(!u){setAE('Account not found. Check username or sign up.');btn.disabled=false;sp.innerHTML='';return;}
      if(u.provider==='google'||u.provider==='github'){setAE(`This account uses ${u.provider==='google'?'Google':'GitHub'} sign-in. Use the button above.`);btn.disabled=false;sp.innerHTML='';return;}
      if(u.pw!==hashStr(password)){setAE('Wrong password. Try again.');btn.disabled=false;sp.innerHTML='';return;}
      currentUser={username:u.username,email:u.email||'',joined:u.joined,provider:'email'};
      lsSet(K.session,currentUser);
      closeAuth();renderNavAuth();renderGrid();
      toast('👋',`Welcome back, @${username}!`);
    }
  }catch(err){setAE('Something went wrong. Please try again.');}
  btn.disabled=false;sp.innerHTML='';
}
function logout(){
  currentUser=null;LS.del(K.session);closeAvMenu();navigate('library');
  renderNavAuth();renderGrid();updateMobileNavAvatar();
  toast('👋','Logged out. See you soon!');
}

/* ═══════════════════════════════════════════
   NAV AUTH
═══════════════════════════════════════════ */
function renderNavAuth(){
  const navAuth=document.getElementById('navAuth');
  const loginBtn=document.getElementById('loginNavBtn');
  const hero=document.getElementById('heroSection');
  const sbn=document.getElementById('sbn');
  if(currentUser){
    loginBtn.style.display='none';
    const avHTML=currentUser.picture?`<img src="${esc(currentUser.picture)}" alt="av">`:(currentUser.username||'?').slice(0,2).toUpperCase();
    navAuth.innerHTML=`<div class="av-w" id="avW">
      <div class="av" id="avBtn" onclick="toggleAvMenu()">${avHTML}</div>
      <div class="av-menu" id="avMenu">
        <div class="av-usr">
          <div class="av-usr-av">${avHTML}</div>
          <div><div class="av-usr-n">${esc(currentUser.name||('@'+currentUser.username))}</div>${currentUser.email?`<div class="av-usr-e">${esc(currentUser.email)}</div>`:''}</div>
        </div>
        <div class="av-it" onclick="navigate('dashboard')">📊 My Dashboard</div>
        <div class="av-it" onclick="showProfile('${esc(currentUser.username)}')">👤 Public Profile</div>
        <div class="av-it" onclick="guardedSubmit();closeAvMenu()">+ Submit Prompt</div>
        <div class="av-div"></div>
        <div class="av-it red" onclick="logout()">→ Log out</div>
      </div>
    </div>`;
    document.getElementById('submitAs').textContent=`@${currentUser.username}`;
    if(hero)hero.style.display='none';
    if(sbn)sbn.style.display='none';
  } else {
    loginBtn.style.display='flex';
    navAuth.innerHTML=`<button class="btn btn-p" onclick="openAuth('signup')" style="font-size:.75rem;">✦ Sign up free</button>`;
    document.getElementById('submitAs').textContent='Anonymous';
    const heroDismissed=LS.get(K.heroDismissed);
    if(!heroDismissed&&hero)hero.style.display='block';
    else if(heroDismissed&&sbn)sbn.style.display='flex';
  }
}
function toggleAvMenu(){document.getElementById('avMenu')?.classList.toggle('open');}
function closeAvMenu(){document.getElementById('avMenu')?.classList.remove('open');}
document.addEventListener('click',e=>{
  const menu=document.getElementById('avMenu');
  const btn=document.getElementById('avBtn');
  if(menu?.classList.contains('open')&&!btn?.contains(e.target)&&!menu.contains(e.target))menu.classList.remove('open');
});
function dismissHero(){
  document.getElementById('heroSection').style.display='none';
  document.getElementById('sbn').style.display='flex';
  LS.set(K.heroDismissed,'1');
}
function handleSearch(){searchQ=document.getElementById('searchInput').value;renderGrid();}
function setFilter(cat){filterCat=cat;searchQ='';document.getElementById('searchInput').value='';renderFilters();renderGrid();}
function setSort(s){sortBy=s;renderGrid();}

/* ═══════════════════════════════════════════
   AI DETECTOR
═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   TOKEN OPTIMIZER
═══════════════════════════════════════════ */
function countTokens(text){
  // ~4 chars per token (GPT-4/Claude approximation)
  return Math.ceil(text.trim().length/4);
}
function tokenCost(tokens,model='gpt4'){
  const rates={gpt4:0.03,claude:0.015,gemini:0.0025};
  return ((tokens/1000)*rates[model]).toFixed(4);
}
function onDetI(){
  const v=document.getElementById('detTA').value;
  const w=v.trim().split(/\s+/).filter(Boolean).length;
  const tok=countTokens(v);
  document.getElementById('detCC').textContent=`${v.length.toLocaleString()} / 8,000`;
  document.getElementById('detWC').textContent=`${w} words`;
  document.getElementById('detPF').style.width=Math.min(100,(v.length/8000)*100)+'%';
  const badge=document.getElementById('detTokBadge');
  if(v.trim()&&badge){
    badge.style.display='inline';
    badge.textContent=`~${tok.toLocaleString()} tokens`;
  }else if(badge){badge.style.display='none';}
  const costEl=document.getElementById('detCost');
  if(costEl&&tok>0)costEl.textContent=`≈ $${tokenCost(tok,'gpt4')} on GPT-4`;
  else if(costEl)costEl.textContent='';
}
function clearDet(){
  document.getElementById('detTA').value='';
  document.getElementById('detRes').innerHTML='';
  const b=document.getElementById('detTokBadge');if(b)b.style.display='none';
  onDetI();detReport='';
}
function pasteDet(){
  navigator.clipboard.readText()
    .then(t=>{document.getElementById('detTA').value=t;onDetI();})
    .catch(()=>toast('⚠','Tap inside the text box and use Ctrl+V / long-press → Paste.'));
}

const OPT_SYS=`You are an elite prompt engineer with 20+ years experience optimizing prompts for LLMs (GPT-4, Claude, Gemini).
Your job: analyze the given prompt and produce a shorter, cleaner, more effective version that achieves the SAME result with fewer tokens.

Rules:
- Remove filler words, redundancy, unnecessary politeness ("please", "kindly", "I would like you to")
- Replace verbose phrases with precise ones ("Give me a detailed and comprehensive explanation of" → "Explain")
- Remove obvious context that the model already knows
- Keep all real constraints, requirements, and specifics
- Never change the intent or remove meaningful requirements
- Preserve examples, variables [IN_BRACKETS], and format instructions

Respond ONLY with valid JSON (no markdown fences, no extra text):
{
  "optimized_prompt": "the full rewritten prompt",
  "original_tokens": 120,
  "optimized_tokens": 74,
  "reduction_pct": 38,
  "cost_saved_gpt4": "0.0014",
  "issues": [
    {"type": "filler|redundant|verbose|vague|missing_context", "original": "exact phrase from original", "fix": "what was done"}
  ],
  "quality_before": 58,
  "quality_after": 91,
  "tips": ["short actionable tip for writing better prompts"]
}
Give 3-6 issues and 3 tips. Be precise about token counts (count ~4 chars per token).`;

async function runDet(){
  const text=document.getElementById('detTA').value.trim();
  if(text.split(/\s+/).filter(Boolean).length<3){toast('⚠','Please paste a prompt of at least 3 words.');return;}
  const btn=document.getElementById('runDetBtn'),sp=document.getElementById('detSpin'),lb=document.getElementById('detBtnTxt');
  btn.disabled=true;sp.innerHTML='<span class="spin">⟳</span> ';lb.textContent='Optimizing…';
  document.getElementById('detRes').innerHTML='';
  try{
    const res=await callAI(OPT_SYS,`Optimize this prompt:\n\n${text}`);
    if(!res.ok)throw new Error(`HTTP ${res.status} — check your API key in Vercel`);
    const data=await res.json();
    const raw=(data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim();
    const result=JSON.parse(raw.replace(/^```json|^```|```$/gm,'').trim());
    renderOptResult(result,text);
    detReport=`TOKEN OPTIMIZER REPORT\n${'═'.repeat(40)}\nOriginal: ${result.original_tokens} tokens → Optimized: ${result.optimized_tokens} tokens (${result.reduction_pct}% reduction)\n\nOPTIMIZED PROMPT:\n${result.optimized_prompt}\n\nISSUES FIXED:\n${(result.issues||[]).map(i=>`• [${i.type}] "${i.original}" → ${i.fix}`).join('\n')}\n\nTIPS:\n${(result.tips||[]).map((t,i)=>`${i+1}. ${t}`).join('\n')}`;
  }catch(err){
    toast('⚠',`Optimization failed: ${err.message}`);
    console.error(err);
  }
  btn.disabled=false;sp.innerHTML='';lb.textContent='⚡ Optimize This Prompt';
}

function renderOptResult(r,original){
  const el=document.getElementById('detRes');
  const saved=r.reduction_pct||0;
  const gradColor=saved>=40?'linear-gradient(135deg,#059669,#064e3b)':saved>=20?'linear-gradient(135deg,#4f46e5,#3d35c2)':'linear-gradient(135deg,#d97706,#78350f)';
  const savedEmoji=saved>=40?'🚀':saved>=20?'⚡':'✓';
  const qBefore=Math.max(0,Math.min(100,r.quality_before||0));
  const qAfter=Math.max(0,Math.min(100,r.quality_after||0));
  const typeColors={filler:'#ef4444',redundant:'#f59e0b',verbose:'#8b5cf6',vague:'#0ea5e9',missing_context:'#10b981'};
  const typeLabels={filler:'Filler word',redundant:'Redundant',verbose:'Verbose',vague:'Too vague',missing_context:'Missing context'};

  el.innerHTML=`
  <!-- SCORE CARD -->
  <div style="background:${gradColor};border-radius:var(--r);padding:22px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:14px;box-shadow:0 8px 32px rgba(0,0,0,.15);">
    <div style="text-align:center;flex-shrink:0;">
      <div style="font-size:3rem;font-weight:900;color:#fff;line-height:1;letter-spacing:-2px;">${saved}%</div>
      <div style="font-size:.65rem;font-weight:700;color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;">Tokens saved</div>
    </div>
    <div style="width:1px;height:60px;background:rgba(255,255,255,.2);flex-shrink:0;"></div>
    <div style="display:flex;gap:20px;flex:1;min-width:200px;">
      <div style="text-align:center;">
        <div style="font-size:1.4rem;font-weight:900;color:rgba(255,255,255,.6);line-height:1;">${r.original_tokens||countTokens(original)}</div>
        <div style="font-size:.62rem;font-weight:600;color:rgba(255,255,255,.5);margin-top:2px;">Original tokens</div>
      </div>
      <div style="font-size:1.4rem;color:rgba(255,255,255,.4);font-weight:300;line-height:1.6;">→</div>
      <div style="text-align:center;">
        <div style="font-size:1.4rem;font-weight:900;color:#fff;line-height:1;">${r.optimized_tokens||countTokens(r.optimized_prompt||'')}</div>
        <div style="font-size:.62rem;font-weight:600;color:rgba(255,255,255,.65);margin-top:2px;">Optimized tokens</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
      <div style="background:rgba(255,255,255,.15);border-radius:8px;padding:6px 12px;text-align:center;">
        <div style="font-size:.6rem;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;">GPT-4 savings</div>
        <div style="font-size:.88rem;font-weight:800;color:#fff;">$${r.cost_saved_gpt4||'0.00'}/1K calls</div>
      </div>
      <div style="font-size:1rem;">${savedEmoji} ${saved>=40?'Excellent optimization!':saved>=20?'Good improvement!':'Minor cleanup'}</div>
    </div>
  </div>

  <!-- QUALITY SCORES -->
  <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r);padding:18px;margin-bottom:14px;">
    <div class="mlbl" style="margin-bottom:14px;">Prompt Quality Score</div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:.78rem;font-weight:600;color:var(--text2);">Before optimization</span>
          <span style="font-size:.78rem;font-weight:800;color:${qBefore<60?'#ef4444':qBefore<80?'#f59e0b':'#10b981'};">${qBefore}/100</span>
        </div>
        <div style="height:8px;background:var(--border);border-radius:10px;overflow:hidden;">
          <div style="height:100%;width:${qBefore}%;background:${qBefore<60?'#ef4444':qBefore<80?'#f59e0b':'#10b981'};border-radius:10px;transition:width 1s ease;"></div>
        </div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:.78rem;font-weight:600;color:var(--text2);">After optimization</span>
          <span style="font-size:.78rem;font-weight:800;color:${qAfter<60?'#ef4444':qAfter<80?'#f59e0b':'#10b981'};">${qAfter}/100</span>
        </div>
        <div style="height:8px;background:var(--border);border-radius:10px;overflow:hidden;">
          <div style="height:100%;width:${qAfter}%;background:${qAfter<60?'#ef4444':qAfter<80?'#f59e0b':'#10b981'};border-radius:10px;transition:width 1s ease;"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- OPTIMIZED PROMPT -->
  <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r);padding:18px;margin-bottom:14px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
      <div class="mlbl">✅ Optimized Prompt</div>
      <div style="display:flex;gap:6px;">
        <button onclick="copyOpt()" style="background:var(--a);color:#fff;border:none;border-radius:7px;padding:6px 14px;font-size:.74rem;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;" id="copyOptBtn">📋 Copy</button>
        <button onclick="useOpt()" style="background:var(--bg);border:1.5px solid var(--border);color:var(--text2);border-radius:7px;padding:6px 12px;font-size:.74rem;font-weight:700;cursor:pointer;font-family:inherit;">↩ Use & Submit</button>
      </div>
    </div>
    <div id="optPromptBox" style="background:var(--bg);border:1.5px solid var(--ab);border-radius:var(--rs);padding:16px;font-size:.82rem;line-height:1.85;color:var(--text);white-space:pre-wrap;word-break:break-word;cursor:text;font-family:'SF Mono','Fira Code',monospace;">${esc(r.optimized_prompt||'')}</div>
  </div>

  <!-- ISSUES FOUND -->
  ${(r.issues||[]).length?`
  <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r);padding:18px;margin-bottom:14px;">
    <div class="mlbl" style="margin-bottom:14px;">Issues Found & Fixed (${(r.issues||[]).length})</div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${(r.issues||[]).map(issue=>{
        const col=typeColors[issue.type]||'#8890b5';
        const lbl=typeLabels[issue.type]||issue.type;
        return `<div style="display:flex;gap:10px;padding:10px 12px;background:var(--bg);border:1px solid var(--border);border-left:3px solid ${col};border-radius:8px;">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="font-size:.58rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:${col};background:${col}18;border-radius:4px;padding:1px 6px;">${lbl}</span>
            </div>
            <div style="font-size:.76rem;color:var(--text2);margin-bottom:3px;"><span style="text-decoration:line-through;color:var(--text3);">"${esc(issue.original||'')}"</span></div>
            <div style="font-size:.76rem;color:var(--text2);">→ ${esc(issue.fix||'')}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`:''}

  <!-- TIPS -->
  <div style="background:linear-gradient(135deg,var(--am),var(--ag));border:1.5px solid var(--ab);border-radius:var(--r);padding:18px;margin-bottom:14px;">
    <div class="mlbl" style="margin-bottom:12px;">💡 Tips to Write Better Prompts</div>
    ${(r.tips||[]).map((t,i)=>`<div style="display:flex;gap:10px;font-size:.8rem;color:var(--text2);line-height:1.6;margin-bottom:8px;">
      <span style="width:22px;height:22px;background:var(--a);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.62rem;font-weight:800;flex-shrink:0;margin-top:1px;">${i+1}</span>
      <span>${esc(t)}</span>
    </div>`).join('')}
  </div>

  <!-- COPY REPORT BUTTON -->
  <button onclick="if(detReport)navigator.clipboard.writeText(detReport).then(()=>toast('📋','Full report copied!'))" style="width:100%;background:var(--surface);border:1.5px solid var(--border);color:var(--text2);border-radius:var(--rs);padding:10px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:20px;">📄 Copy Full Report</button>`;

  el.classList.remove('fe');void el.offsetWidth;el.classList.add('fe');
  setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),80);
}

function copyOpt(){
  const box=document.getElementById('optPromptBox');
  const btn=document.getElementById('copyOptBtn');
  if(!box)return;
  navigator.clipboard.writeText(box.textContent).then(()=>{
    btn.textContent='✓ Copied!';
    setTimeout(()=>btn.innerHTML='📋 Copy',2000);
    toast('📋','Optimized prompt copied!');
  });
}
function useOpt(){
  const box=document.getElementById('optPromptBox');
  if(!box)return;
  navigate('library');
  setTimeout(()=>{
    guardedSubmit();
    setTimeout(()=>{
      const sfP=document.getElementById('sfP');
      if(sfP){sfP.value=box.textContent;sfP.dispatchEvent(new Event('input'));}
    },300);
  },100);
  toast('✅','Optimized prompt loaded in submit form!');
}

/* ═══════════════════════════════════════════
   CONFETTI
═══════════════════════════════════════════ */
function launchConfetti(){
  const canvas=document.getElementById('confetti-canvas');
  canvas.style.display='block';canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  const ctx=canvas.getContext('2d');
  const colors=['#5046e4','#7c6fff','#10b981','#f59e0b','#ec4899','#06b6d4'];
  const parts=Array.from({length:120},()=>({x:Math.random()*canvas.width,y:-10,vx:(Math.random()-.5)*6,vy:Math.random()*5+3,r:Math.random()*6+3,color:colors[Math.floor(Math.random()*colors.length)],rot:Math.random()*360,vr:(Math.random()-.5)*8,shape:Math.random()>.5?'rect':'circle',alpha:1}));
  let frame=0;
  function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.rot+=p.vr;if(frame>80)p.alpha=Math.max(0,p.alpha-.02);ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.color;if(p.shape==='rect')ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);else{ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();}ctx.restore();});frame++;if(frame<140)requestAnimationFrame(draw);else{ctx.clearRect(0,0,canvas.width,canvas.height);canvas.style.display='none';}}
  requestAnimationFrame(draw);
}

/* ═══════════════════════════════════════════
   THEME
═══════════════════════════════════════════ */
function toggleTheme(){
  dark=!dark;
  document.documentElement.setAttribute('data-theme',dark?'dark':'light');
  document.getElementById('themeBtn').textContent=dark?'☀️':'🌙';
  localStorage.setItem('ph5:dark',dark?'1':'0');
}
if(localStorage.getItem('ph5:dark')==='1'){
  dark=true;document.documentElement.setAttribute('data-theme','dark');document.getElementById('themeBtn').textContent='☀️';
}

/* ═══════════════════════════════════════════
   KEYBOARD SHORTCUTS
═══════════════════════════════════════════ */
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'){if(e.key==='Escape')e.target.blur();return;}
  if(e.key==='Escape'){closePM();closeAuth();closeSP();closeShare();closeAvMenu();}
  if(e.key==='/'&&viewMode==='library'){e.preventDefault();document.getElementById('searchInput').focus();}
  if((e.key==='r'||e.key==='R')&&!e.ctrlKey&&!e.metaKey)surpriseMe();
  if((e.key==='d'||e.key==='D')&&!e.ctrlKey&&!e.metaKey)navigate('detector');
});

/* ═══════════════════════════════════════════
   MOBILE NAV HELPERS
═══════════════════════════════════════════ */
function updateMobileNav(active){
  ['home','search','detector','account'].forEach(id=>{
    const el=document.getElementById('mnav-'+id);
    if(el)el.classList.toggle('on',id===active);
  });
}
function handleMobileAccount(){
  if(currentUser){
    // Toggle avatar menu on desktop, go to dashboard on mobile
    if(window.innerWidth<768){navigate('dashboard');updateMobileNav('account');}
    else toggleAvMenu();
  }else{
    openAuth('signup');
  }
}
function updateMobileNavAvatar(){
  const ico=document.getElementById('mnavAvIco');
  const lbl=document.getElementById('mnavAccLabel');
  if(!ico)return;
  if(currentUser){
    if(currentUser.picture){
      ico.innerHTML=`<img src="${esc(currentUser.picture)}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">`;
    }else{
      ico.textContent='👤';
    }
    if(lbl)lbl.textContent=(currentUser.username||'Me').slice(0,6);
  }else{
    ico.textContent='👤';
    if(lbl)lbl.textContent='Account';
  }
}

/* ═══════════════════════════════════════════
   START
═══════════════════════════════════════════ */
init();
