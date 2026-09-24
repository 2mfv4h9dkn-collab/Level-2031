/* Level 2031 V8 — Real-Life Data Engine + Life RPG foundation */
const KEY='level2031';
const SCHEMA=8;
const TIERS={easy:50,medium:150,hard:400,epic:1000};
const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`;
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const nowISO=()=>new Date().toISOString();
const money=n=>'$'+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:0});
const num=n=>Number(n||0);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=x=>JSON.parse(JSON.stringify(x));
const pct=(v,t)=>Math.min(100,Math.max(0,num(t)?num(v)/num(t)*100:0));
const baseState={
 schemaVersion:SCHEMA, profile:{name:'',city:'',startDate:today(),bio:''}, theme:'dark',
 xp:0,credits:0,level:1,streak:0,lastDay:'',
 goals:{investmentsTarget:500000,emergencyTarget:50000,hvacIncomeTarget:250000,tradingWeeklyTarget:2000,companyRevenueTarget:5000000,homeTarget:1,rentalTarget:1,travelTarget:2,fitnessWeightTarget:150},
 stats:{investments:0,emergency:0,netWorth:0,hvacIncome:0,hvacInstalls:0,hvacSales:0,tradingProfit:0,workouts:0,bibleChapters:0,books:0,trips:0},
 daily:{date:'',time:'',missions:[],bonus:[],status:'yellow',morning:false,evening:false,coreBonus:false,epicBonus:false},
 finance:{accounts:[],assets:[],liabilities:[],transactions:[],netWorthHistory:[],checkIns:[]},
 hvac:{jobs:[],payments:[],milestones:[],companyRevenue:[]},
 trading:{trades:[],weeklyTarget:2000}, fitness:{workouts:[],runs:[],measurements:[],meals:[],sleep:[]},
 faith:{entries:[],milestones:[]}, development:{entries:[],skills:[]}, relationships:{entries:[],importantDates:[]},
 travel:{entries:[],bucketList:[]}, vehicles:[], lifeLog:[], goalsHistory:[], xpLedger:[], creditLedger:[], achievements:[], inventory:[], world:{upgrades:[],rooms:[]}, audit:[], settings:{notifications:false}
};
function merge(raw){
 const r=raw&&typeof raw==='object'?raw:{};const s=clone(baseState);
 Object.keys(s).forEach(k=>{if(r[k]!==undefined)s[k]=r[k]});
 // V7 used vehicles as object; V8 uses array.
 if(!Array.isArray(s.vehicles))s.vehicles=[];
 ['goals','stats','daily','profile','settings','world'].forEach(k=>s[k]={...baseState[k],...(r[k]||{})});
 ['finance','hvac','trading','fitness','faith','development','relationships','travel'].forEach(k=>s[k]={...baseState[k],...(r[k]||{})});
 ['accounts','assets','liabilities','transactions','netWorthHistory','checkIns'].forEach(k=>s.finance[k]=Array.isArray(s.finance[k])?s.finance[k]:[]);
 s.schemaVersion=SCHEMA;return s;
}
let s;try{s=merge(JSON.parse(localStorage.getItem(KEY)||'null'))}catch(e){s=clone(baseState)}
function save(){localStorage.setItem(KEY,JSON.stringify(s))}
function audit(action,data={}){s.audit.push({id:uid(),at:nowISO(),action,data});if(s.audit.length>2000)s.audit=s.audit.slice(-2000)}
function toast(t){const e=document.querySelector('.toast');if(!e)return;e.textContent=t;e.style.display='block';clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.style.display='none',2400)}
function levelFor(x){return Math.floor(Math.sqrt(Math.max(0,num(x))/250))+1}
function xpFloor(l){return 250*(l-1)*(l-1)}
function xpPct(){const l=levelFor(s.xp),floor=xpFloor(l),ceil=250*l*l;return Math.max(0,Math.min(100,(s.xp-floor)/(ceil-floor)*100))}
function ledger(type,amount,reason,meta={}){const item={id:uid(),date:today(),amount:num(amount),reason,meta};(type==='xp'?s.xpLedger:s.creditLedger).push(item)}
function awardXP(amount,reason,meta={}){amount=Math.max(0,Math.round(num(amount)));if(!amount)return;s.xp+=amount;ledger('xp',amount,reason,meta);const old=s.level;s.level=levelFor(s.xp);if(s.level>old){achievement(`Level ${s.level}`,'rare',amount,`Reached level ${s.level}`);toast(`LEVEL UP • ${s.level}`)};save()}
function awardCredits(amount,reason,meta={}){amount=Math.max(0,Math.round(num(amount)));if(!amount)return;s.credits+=amount;ledger('credits',amount,reason,meta);save()}
function achievement(name,rarity='common',xp=0,detail=''){const key=name.toLowerCase().replace(/[^a-z0-9]+/g,'-');if(s.achievements.some(a=>a.key===key))return;s.achievements.push({id:uid(),key,name,rarity,date:today(),xp,detail});if(xp)awardXP(xp,`Achievement: ${name}`,{achievement:name});awardCredits(25,`Achievement: ${name}`,{achievement:name});audit('achievement',{name,rarity});}
function netWorth(){const a=s.finance.accounts.reduce((x,y)=>x+num(y.balance),0),b=s.finance.assets.reduce((x,y)=>x+num(y.value),0),d=s.finance.liabilities.reduce((x,y)=>x+num(y.balance),0);return a+b-d}
function recalc(){
 s.stats.investments=s.finance.accounts.filter(x=>x.type==='investment').reduce((a,x)=>a+num(x.balance),0);
 s.stats.emergency=s.finance.accounts.filter(x=>x.type==='emergency').reduce((a,x)=>a+num(x.balance),0);
 s.stats.netWorth=netWorth();s.stats.hvacIncome=s.hvac.payments.reduce((a,x)=>a+num(x.amount),0);
 s.stats.hvacInstalls=s.hvac.jobs.filter(x=>x.type==='install').length;s.stats.hvacSales=s.hvac.jobs.filter(x=>x.type==='sale').length;
 s.stats.tradingProfit=s.trading.trades.reduce((a,x)=>a+num(x.pnl),0);s.stats.workouts=s.fitness.workouts.length;
 s.stats.bibleChapters=s.faith.entries.filter(x=>x.kind==='bible').reduce((a,x)=>a+num(x.amount),0);
 s.stats.books=s.development.entries.filter(x=>x.kind==='book').length;s.stats.trips=s.travel.entries.length;
 const last=s.finance.netWorthHistory.at(-1);if(!last||last.date!==today()){s.finance.netWorthHistory.push({date:today(),value:s.stats.netWorth});}
}
function add(arr,obj){arr.push({...obj,id:uid(),createdAt:nowISO()});audit('add',obj);save();render(currentView)}
function promptForm(title,fields,callback){const vals={};for(const f of fields){const v=prompt(`${f.label}${f.hint?` (${f.hint})`:''}`,f.default??'');if(v===null)return;vals[f.key]=v}callback(vals)}
function localTime(){return new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}
function daysBetween(a,b){return Math.floor((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)}
function missionCatalog(time){const all=[
 {id:'bible',t:'Read 1 chapter of the Bible',m:15,x:75,cat:'Faith'},
 {id:'run',t:'Run or walk for 15 minutes',m:15,x:75,cat:'Fitness'},
 {id:'priorities',t:'Review today’s top 3 priorities',m:10,x:50,cat:'Planning'},
 {id:'finance',t:'Review your financial dashboard',m:15,x:75,cat:'Finance'},
 {id:'hvac-study',t:'Study HVAC technical material',m:30,x:150,cat:'HVAC'},
 {id:'trade-review',t:'Review trading journal and risk plan',m:15,x:75,cat:'Trading'},
 {id:'development',t:'Practice a personal-development skill',m:30,x:150,cat:'Growth'},
 {id:'gym',t:'Complete a focused gym session',m:60,x:400,cat:'Fitness'},
 {id:'relationships',t:'Make intentional time for relationships',m:30,x:150,cat:'Relationships'}];
 const n={'15 min':2,'30 min':3,'1 hr':4,'2 hrs':6,'3+ hrs':7}[time]||3;return all.slice(0,n).map(m=>({...m,key:`${m.id}-${today()}`,done:false,progress:0,required:m.m}));
}
function ensureDaily(){const d=today();if(s.daily.date!==d){if(s.daily.date){const done=s.daily.missions.filter(m=>m.done).length,total=s.daily.missions.length;const st=total&&done===total?'green':done?'yellow':'red';if(st==='red')s.streak=0;else s.streak+=1;s.daily.status=st;if(st!=='red'&&s.streak>0){if([3,7,14,30,50,100,250,365,500,1000].includes(s.streak))achievement(`${s.streak}-Day Streak`,s.streak>=100?'legendary':s.streak>=30?'epic':'rare',s.streak>=1000?2500:s.streak>=365?1000:s.streak>=100?500:s.streak>=30?250:100,`Maintained the universal life streak for ${s.streak} days.`)}}s.daily={date:d,time:'',missions:[],bonus:[],status:'yellow',morning:false,evening:false,coreBonus:false,epicBonus:false};audit('new_day',{date:d});save()}}
function setTime(t){ensureDaily();s.daily.time=t;s.daily.missions=missionCatalog(t);s.daily.bonus=[];s.daily.status='yellow';save();render('missions');toast(`Mission load: ${t}`)}
function completeMission(i,partial=null){ensureDaily();const m=s.daily.missions[i];if(!m||m.done)return;const p=partial===null?100:Math.max(0,Math.min(100,num(partial)));if(p<100){const inc=Math.round(m.x*p/100);if(inc)awardXP(inc,`Partial mission: ${m.t}`,{mission:m.id,percent:p});m.progress=p;save();render('missions');toast(`${p}% complete • +${inc} XP`);return}m.done=true;m.progress=100;awardXP(m.x,`Mission: ${m.t}`,{mission:m.id});awardCredits(10,`Mission: ${m.t}`,{mission:m.id});if(m.id==='bible')addSilent(s.faith.entries,{date:today(),kind:'bible',amount:1,note:'Mission'});if(m.id==='run'||m.id==='gym')addSilent(s.fitness.workouts,{date:today(),kind:m.id,duration:m.m,note:'Mission'});checkDailyBonuses();audit('mission_complete',{id:m.id});save();render('missions');toast(`Mission complete • +${m.x} XP • +10 credits`)}
function addSilent(arr,obj){arr.push({...obj,id:uid(),createdAt:nowISO()})}
function checkDailyBonuses(){const ms=s.daily.missions,done=ms.length&&ms.every(m=>m.done);if(done&&!s.daily.coreBonus){s.daily.coreBonus=true;awardXP(100,'Core Day bonus');awardCredits(25,'Core Day bonus');achievement('Core Day','uncommon',100,'Completed every Core Mission.')}if(done&&s.daily.bonus.length===0){s.daily.bonus=[{id:'bonus-life',t:'Log one meaningful real-world accomplishment',m:15,x:75,cat:'Life',done:false,progress:0},{id:'bonus-review',t:'Write a 5-minute end-of-day reflection',m:15,x:75,cat:'Life',done:false,progress:0}]}}
function completeBonus(i){const m=s.daily.bonus[i];if(!m||m.done)return;m.done=true;m.progress=100;awardXP(m.x,`Bonus mission: ${m.t}`);awardCredits(10,`Bonus mission: ${m.t}`);if(s.daily.bonus.every(x=>x.done)&&!s.daily.epicBonus){s.daily.epicBonus=true;awardXP(1000,'Epic Day');awardCredits(100,'Epic Day');achievement('Epic Day','epic',1000,'Completed every Core and Bonus Mission.');}save();render('missions')}
function missionStatus(){const m=s.daily.missions;if(!m.length)return'not-set';const d=m.filter(x=>x.done).length;return d===m.length?'green':d===0?'red':'yellow'}
function goal(label,target,actual,detail){return `<div class="card goal"><div class="row"><b>${esc(label)}</b><span class="label">${esc(detail||'')}</span></div><div class="statline"><i style="width:${pct(actual,target)}%"></i></div><div class="row smallrow"><span>${money(actual)}</span><span>${money(target)}</span></div></div>`}
function home(){recalc();const st=missionStatus();return `<div class="hero"><div class="future">SEPTEMBER 2031 • FUTURE WORLD</div><h1>Now build it.</h1><p>Your real life is the game. Every verified action updates the systems behind your character, finances, skills and future world.</p><div class="heroStats"><span class="pill">LEVEL ${levelFor(s.xp)}</span><span class="pill ${st}">${st==='not-set'?'MISSIONS NOT SET':st.toUpperCase()+' DAY'}</span><span class="pill">${s.streak} DAY STREAK</span><span class="pill">${s.credits.toLocaleString()} CREDITS</span></div></div>
<div class="grid"><div class="card"><div class="label">TOTAL XP</div><div class="big gold">${s.xp.toLocaleString()}</div><div class="xpbar"><div class="xpfill" style="width:${xpPct()}%"></div></div><small>${Math.round(xpPct())}% to next level</small></div><div class="card"><div class="label">NET WORTH</div><div class="big">${money(s.stats.netWorth)}</div><small>Calculated from tracked assets and liabilities</small></div><div class="card"><div class="label">INVESTMENTS</div><div class="big">${money(s.stats.investments)}</div><small>Goal ${money(s.goals.investmentsTarget)}</small></div><div class="card"><div class="label">EMERGENCY FUND</div><div class="big">${money(s.stats.emergency)}</div><small>Goal ${money(s.goals.emergencyTarget)}</small></div></div>
<div class="section"><div class="row"><h2>2031 Targets</h2><button class="btn ghost" onclick="render('goals')">Open goals</button></div>${goal('Control AC & Heat',s.goals.companyRevenueTarget,s.hvac.companyRevenue.reduce((a,x)=>a+num(x.amount),0),'Company revenue')}${goal('Personal HVAC',s.goals.hvacIncomeTarget,s.stats.hvacIncome,'After-tax income entries')}${goal('Investments',s.goals.investmentsTarget,s.stats.investments,'Long-term invested balance')}${goal('Emergency Fund',s.goals.emergencyTarget,s.stats.emergency,'Separate cash reserve')}</div>
<div class="section"><div class="row"><h2>Quick actions</h2></div><div class="grid"><button class="card action" onclick="render('finance')">💰 Finance</button><button class="card action" onclick="render('hvac')">🔧 HVAC</button><button class="card action" onclick="render('trading')">📈 Trading</button><button class="card action" onclick="render('fitness')">🏋️ Fitness</button><button class="card action" onclick="render('faith')">✝️ Faith</button><button class="card action" onclick="render('development')">📚 Skills</button></div></div>`}
function missions(){ensureDaily();const st=missionStatus();return `<div class="section"><div class="row"><div><div class="label">TODAY</div><h1>Missions</h1></div><span class="pill ${st}">${st.toUpperCase()}</span></div><p class="label">Morning check-in controls how much time the day has available. Unfinished missions reset at midnight.</p><div class="timegrid">${['15 min','30 min','1 hr','2 hrs','3+ hrs'].map(t=>`<button class="time ${s.daily.time===t?'selected':''}" onclick="setTime('${t}')">${t}</button>`).join('')}</div>${s.daily.time?`<div class="card"><b>Morning check-in</b><p class="label">Available time: ${esc(s.daily.time)} • ${s.daily.missions.length} Core Missions</p></div>`:''}<div class="section">${s.daily.missions.length?s.daily.missions.map((m,i)=>`<div class="mission ${m.done?'done':''}"><button class="check" onclick="completeMission(${i})">${m.done?'✓':''}</button><div style="flex:1"><b>${esc(m.t)}</b><small>${esc(m.cat)} • ${m.m} min • ${m.x} XP${m.progress&&m.progress<100?` • ${m.progress}%`:''}</small></div>${!m.done?`<button class="mini" onclick="partialPrompt(${i})">Partial</button>`:''}</div>`).join(''):'<div class="empty">Choose your available time to generate today’s missions.</div>'}</div>${s.daily.bonus.length?`<div class="section"><h2>Bonus Missions</h2>${s.daily.bonus.map((m,i)=>`<div class="mission ${m.done?'done':''}"><button class="check" onclick="completeBonus(${i})">${m.done?'✓':''}</button><div><b>${esc(m.t)}</b><small>${m.m} min • ${m.x} XP</small></div></div>`).join('')}</div>`:''}<div class="section grid"><button class="card action" onclick="checkin('morning')">${s.daily.morning?'✓':'☀️'} Morning check-in</button><button class="card action" onclick="checkin('evening')">${s.daily.evening?'✓':'🌙'} Evening debrief</button></div></div>`}
function partialPrompt(i){const v=prompt('Percent completed (1–99):','50');if(v!==null)completeMission(i,num(v))}
function checkin(kind){s.daily[kind]=true;audit('checkin',{kind,date:today()});save();toast(kind==='morning'?'Morning check-in complete':'Evening debrief complete');render('missions')}
function stats(){recalc();const recent=s.finance.netWorthHistory.slice(-7).reverse();return `<div class="section"><div class="label">LIFETIME</div><h1>Stats</h1><div class="grid"><div class="card"><div class="label">XP</div><div class="big gold">${s.xp.toLocaleString()}</div></div><div class="card"><div class="label">CREDITS</div><div class="big">${s.credits.toLocaleString()}</div></div><div class="card"><div class="label">HVAC INSTALLS</div><div class="big">${s.stats.hvacInstalls}</div></div><div class="card"><div class="label">HVAC SALES</div><div class="big">${s.stats.hvacSales}</div></div><div class="card"><div class="label">TRADING P/L</div><div class="big">${money(s.stats.tradingProfit)}</div></div><div class="card"><div class="label">WORKOUTS</div><div class="big">${s.stats.workouts}</div></div><div class="card"><div class="label">BIBLE CHAPTERS</div><div class="big">${s.stats.bibleChapters}</div></div><div class="card"><div class="label">TRIPS</div><div class="big">${s.stats.trips}</div></div></div><div class="section"><h2>Net Worth History</h2><div class="list">${recent.map(x=>`<div class="card row"><span>${x.date}</span><b>${money(x.value)}</b></div>`).join('')||'<div class="empty">Add financial data to start the history.</div>'}</div></div><div class="section"><h2>System Activity</h2><div class="card"><div class="label">${s.audit.length.toLocaleString()} recorded events • ${s.xpLedger.length.toLocaleString()} XP entries • ${s.creditLedger.length.toLocaleString()} credit entries</div></div></div></div>`}
function goals(){return `<div class="section"><div class="label">CAMPAIGN</div><h1>2031 Goals</h1><p class="label">These are the current targets. The original vision remains preserved in your source goals; this screen tracks measurable progress.</p>${goal('Investments',s.goals.investmentsTarget,s.stats.investments,'$500k invested')}${goal('Emergency Fund',s.goals.emergencyTarget,s.stats.emergency,'$50k separate cash')}${goal('Personal HVAC Income',s.goals.hvacIncomeTarget,s.stats.hvacIncome,'$250k after-tax')}${goal('Trading',s.goals.tradingWeeklyTarget,s.stats.tradingProfit,'Target shown against cumulative trading P/L')}${goal('Company Revenue',s.goals.companyRevenueTarget,s.hvac.companyRevenue.reduce((a,x)=>a+num(x.amount),0),'Verified company revenue entries')}${goal('Travel',s.goals.travelTarget,s.stats.trips,'Trips logged')}${goal('Rental Portfolio',s.goals.rentalTarget,s.finance.assets.filter(x=>x.category==='real-estate'&&x.rental).length,'Rental properties')}</div>`}
function finance(){recalc();return `<div class="section"><div class="row"><div><div class="label">MONEY</div><h1>Finance</h1></div><button class="btn" onclick="addFinance()">+ Add</button></div><div class="grid"><div class="card"><div class="label">NET WORTH</div><div class="big">${money(s.stats.netWorth)}</div></div><div class="card"><div class="label">CASH / ACCOUNTS</div><div class="big">${money(s.finance.accounts.reduce((a,x)=>a+num(x.balance),0))}</div></div><div class="card"><div class="label">ASSETS</div><div class="big">${money(s.finance.assets.reduce((a,x)=>a+num(x.value),0))}</div></div><div class="card"><div class="label">LIABILITIES</div><div class="big">${money(s.finance.liabilities.reduce((a,x)=>a+num(x.balance),0))}</div></div></div><div class="section"><div class="row"><h2>Accounts</h2><button class="mini" onclick="addAccount()">Add account</button></div>${listRows(s.finance.accounts,x=>`<b>${esc(x.name)}</b><span>${money(x.balance)} • ${esc(x.type)}</span>`,()=>{})}</div><div class="section"><div class="row"><h2>Assets</h2><button class="mini" onclick="addAsset()">Add asset</button></div>${listRows(s.finance.assets,x=>`<b>${esc(x.name)}</b><span>${money(x.value)}</span>`,()=>{})}</div><div class="section"><div class="row"><h2>Liabilities</h2><button class="mini" onclick="addLiability()">Add debt</button></div>${listRows(s.finance.liabilities,x=>`<b>${esc(x.name)}</b><span>${money(x.balance)} • ${x.rate||0}%</span>`,()=>{})}</div><div class="section"><div class="card action" onclick="financialCheckin()">📅 ${financialCheckinText()}</div></div></div>`}
function listRows(arr,renderFn,unused){return arr.length?`<div class="list">${arr.slice().reverse().map(x=>`<div class="card row">${renderFn(x)}</div>`).join('')}</div>`:'<div class="empty">Nothing entered yet.</div>'}
function addFinance(){const c=prompt('Add what? accounts / asset / debt','accounts');if(c==='accounts')addAccount();else if(c==='asset')addAsset();else if(c==='debt')addLiability()}
function addAccount(){promptForm('Account',[{key:'name',label:'Account name'},{key:'balance',label:'Current balance',default:'0'},{key:'type',label:'Type: checking / savings / investment / emergency',default:'checking'}],v=>add(s.finance.accounts,{name:v.name,balance:num(v.balance),type:v.type}))}
function addAsset(){promptForm('Asset',[{key:'name',label:'Asset name'},{key:'value',label:'Current value',default:'0'},{key:'category',label:'Category: vehicle / real-estate / other',default:'other'},{key:'rental',label:'Rental property? yes/no',default:'no'}],v=>add(s.finance.assets,{name:v.name,value:num(v.value),category:v.category,rental:v.rental.toLowerCase()==='yes'}))}
function addLiability(){promptForm('Debt',[{key:'name',label:'Debt name'},{key:'balance',label:'Current balance',default:'0'},{key:'rate',label:'Interest rate %',default:'0'}],v=>add(s.finance.liabilities,{name:v.name,balance:num(v.balance),rate:num(v.rate)}))}
function financialCheckinText(){const last=s.finance.checkIns.at(-1);if(!last)return'Complete your first financial check-in';const days=daysBetween(last.date,today());return days>=14?`Financial check-in due • last ${last.date}`:`Financial check-in complete • next due in ${14-days} days`}
function financialCheckin(){s.finance.checkIns.push({date:today(),netWorth:netWorth()});audit('financial_checkin',{date:today()});save();toast('Financial check-in recorded');render('finance')}
function hvac(){const income=s.stats.hvacIncome;return `<div class="section"><div class="row"><div><div class="label">CONTROL AC & HEAT</div><h1>HVAC</h1></div><button class="btn" onclick="addHVACJob()">+ Job</button></div><div class="grid"><div class="card"><div class="label">PERSONAL INCOME</div><div class="big">${money(income)}</div><small>Goal ${money(s.goals.hvacIncomeTarget)}</small></div><div class="card"><div class="label">SALES</div><div class="big">${s.stats.hvacSales}</div></div><div class="card"><div class="label">INSTALLS</div><div class="big">${s.stats.hvacInstalls}</div></div><div class="card"><div class="label">COMPANY REVENUE LOGGED</div><div class="big">${money(s.hvac.companyRevenue.reduce((a,x)=>a+num(x.amount),0))}</div></div></div><div class="section"><div class="row"><h2>Income Payments</h2><button class="mini" onclick="addHVACPayment()">+ Payment</button></div>${listRows(s.hvac.payments,x=>`<b>${x.date||''}</b><span>${money(x.amount)} • ${esc(x.kind||'HVAC')}</span>`,()=>{})}</div><div class="section"><div class="row"><h2>Jobs</h2><span class="label">Sales and installs are separate</span></div>${listRows(s.hvac.jobs,x=>`<b>${esc(x.date||'')} • ${esc(x.type||'job')}</b><span>${esc(x.description||'')}</span>`,()=>{})}</div><div class="section"><div class="row"><h2>Company Revenue</h2><button class="mini" onclick="addRevenue()">+ Verified revenue</button></div>${listRows(s.hvac.companyRevenue,x=>`<b>${x.date||''}</b><span>${money(x.amount)}</span>`,()=>{})}</div></div>`}
function addHVACJob(){promptForm('HVAC Job',[{key:'type',label:'Type: sale / install',default:'install'},{key:'date',label:'Date',default:today()},{key:'description',label:'Description'}],v=>add(s.hvac.jobs,{type:v.type,date:v.date,description:v.description}))}
function addHVACPayment(){promptForm('HVAC Payment',[{key:'amount',label:'Payment amount',default:'0'},{key:'date',label:'Date',default:today()},{key:'kind',label:'Kind: base / install / commission / other',default:'other'}],v=>add(s.hvac.payments,{amount:num(v.amount),date:v.date,kind:v.kind}))}
function addRevenue(){promptForm('Company Revenue',[{key:'amount',label:'Verified company revenue',default:'0'},{key:'date',label:'Date',default:today()}],v=>add(s.hvac.companyRevenue,{amount:num(v.amount),date:v.date}))}
function trading(){const wins=s.trading.trades.filter(x=>num(x.pnl)>0).length,loss=s.trading.trades.filter(x=>num(x.pnl)<0).length;return `<div class="section"><div class="row"><div><div class="label">MARKETS</div><h1>Trading</h1></div><button class="btn" onclick="addTrade()">+ Trade</button></div><div class="grid"><div class="card"><div class="label">TOTAL P/L</div><div class="big">${money(s.stats.tradingProfit)}</div></div><div class="card"><div class="label">TRADES</div><div class="big">${s.trading.trades.length}</div></div><div class="card"><div class="label">WINS</div><div class="big">${wins}</div></div><div class="card"><div class="label">LOSSES</div><div class="big">${loss}</div></div></div><div class="section"><h2>Journal</h2>${listRows(s.trading.trades,x=>`<b>${esc(x.date||'')} • ${esc(x.instrument||'')}</b><span class="${num(x.pnl)>=0?'positive':'negative'}">${money(x.pnl)} • ${esc(x.setup||'')}</span>`,()=>{})}</div></div>`}
function addTrade(){promptForm('Trade',[{key:'date',label:'Date',default:today()},{key:'instrument',label:'Instrument',default:'MNQ'},{key:'pnl',label:'P/L',default:'0'},{key:'risk',label:'Risk amount',default:'0'},{key:'setup',label:'Setup / reason'}],v=>{add(s.trading.trades,{date:v.date,instrument:v.instrument,pnl:num(v.pnl),risk:num(v.risk),setup:v.setup});if(num(v.pnl)>0){awardXP(25,'Profitable trade',{pnl:num(v.pnl)});awardCredits(5,'Profitable trade')}})}
function fitness(){return `<div class="section"><div class="row"><div><div class="label">BODY & PERFORMANCE</div><h1>Fitness</h1></div><button class="btn" onclick="addWorkout()">+ Workout</button></div><div class="grid"><div class="card"><div class="label">WORKOUTS</div><div class="big">${s.stats.workouts}</div></div><div class="card"><div class="label">RUNS</div><div class="big">${s.fitness.runs.length}</div></div><div class="card"><div class="label">CURRENT WEIGHT</div><div class="big">${s.fitness.measurements.at(-1)?.weight?`${s.fitness.measurements.at(-1).weight} lb`:'—'}</div></div><div class="card"><div class="label">TARGET</div><div class="big">${s.goals.fitnessWeightTarget} lb</div></div></div><div class="section"><button class="card action" onclick="addMeasurement()">⚖️ Add body measurement</button> <button class="card action" onclick="addRun()">🏃 Add run</button></div><div class="section"><h2>Workout History</h2>${listRows(s.fitness.workouts,x=>`<b>${x.date||''} • ${esc(x.kind||'Workout')}</b><span>${x.duration||0} min</span>`,()=>{})}</div></div>`}
function addWorkout(){promptForm('Workout',[{key:'date',label:'Date',default:today()},{key:'kind',label:'Workout type',default:'Gym'},{key:'duration',label:'Minutes',default:'60'},{key:'note',label:'Notes'}],v=>{add(s.fitness.workouts,{date:v.date,kind:v.kind,duration:num(v.duration),note:v.note});awardXP(num(v.duration)>=60?400:num(v.duration)>=30?150:50,'Fitness action');awardCredits(10,'Fitness action')})}
function addRun(){promptForm('Run',[{key:'date',label:'Date',default:today()},{key:'distance',label:'Miles',default:'1'},{key:'minutes',label:'Minutes',default:'10'}],v=>{add(s.fitness.runs,{date:v.date,distance:num(v.distance),minutes:num(v.minutes)});awardXP(50,'Run logged');awardCredits(10,'Run logged')})}
function addMeasurement(){promptForm('Measurement',[{key:'date',label:'Date',default:today()},{key:'weight',label:'Weight lb',default:''},{key:'bodyFat',label:'Body fat % (optional)',default:''}],v=>add(s.fitness.measurements,{date:v.date,weight:num(v.weight),bodyFat:num(v.bodyFat)}))}
function faith(){return `<div class="section"><div class="row"><div><div class="label">FAITH</div><h1>Faith</h1></div><button class="btn" onclick="addFaith()">+ Entry</button></div><div class="grid"><div class="card"><div class="label">BIBLE CHAPTERS</div><div class="big">${s.stats.bibleChapters}</div></div><div class="card"><div class="label">ENTRIES</div><div class="big">${s.faith.entries.length}</div></div></div><div class="section">${listRows(s.faith.entries,x=>`<b>${x.date||''} • ${esc(x.kind||'faith')}</b><span>${esc(x.amount?x.amount+' units':x.note||'')}</span>`,()=>{})}</div></div>`}
function addFaith(){promptForm('Faith entry',[{key:'date',label:'Date',default:today()},{key:'kind',label:'Kind: bible / prayer / church / study / scripture',default:'bible'},{key:'amount',label:'Amount (chapters/units)',default:'1'},{key:'note',label:'Notes'}],v=>{add(s.faith.entries,{date:v.date,kind:v.kind,amount:num(v.amount),note:v.note});awardXP(v.kind==='bible'?50:25,'Faith action');awardCredits(10,'Faith action')})}
function development(){return `<div class="section"><div class="row"><div><div class="label">SKILLS</div><h1>Personal Development</h1></div><button class="btn" onclick="addDevelopment()">+ Entry</button></div><div class="section"><h2>Skill Tree</h2><div class="grid">${['HVAC','Trading','Business','Communication','Public Speaking','Discipline'].map(x=>`<div class="card"><b>${x}</b><div class="statline"><i style="width:${skillPct(x)}%"></i></div><small>${skillPct(x)}% tracked progress</small></div>`).join('')}</div></div><div class="section"><h2>History</h2>${listRows(s.development.entries,x=>`<b>${x.date||''} • ${esc(x.kind||'Learning')}</b><span>${esc(x.title||x.note||'')}</span>`,()=>{})}</div></div>`}
function skillPct(name){const n=s.development.entries.filter(x=>x.skill===name).length;return Math.min(100,n*10)}
function addDevelopment(){promptForm('Development entry',[{key:'date',label:'Date',default:today()},{key:'kind',label:'Kind: book / HVAC / trading / speaking / skill',default:'skill'},{key:'skill',label:'Skill area',default:'Business'},{key:'title',label:'Title / accomplishment'}],v=>{add(s.development.entries,v);awardXP(v.kind==='book'?100:50,'Personal development');awardCredits(10,'Personal development')})}
function relationships(){return `<div class="section"><div class="row"><div><div class="label">PEOPLE</div><h1>Relationships</h1></div><button class="btn" onclick="addRelationship()">+ Memory</button></div><p class="label">Track time, memories and important dates without turning people into scores.</p>${listRows(s.relationships.entries,x=>`<b>${x.date||''} • ${esc(x.person||'')}</b><span>${esc(x.note||'')}</span>`,()=>{})}</div>`}
function addRelationship(){promptForm('Relationship memory',[{key:'date',label:'Date',default:today()},{key:'person',label:'Person / relationship'},{key:'note',label:'Memory or time together'}],v=>add(s.relationships.entries,v))}
function travel(){return `<div class="section"><div class="row"><div><div class="label">EXPLORATION</div><h1>Travel</h1></div><button class="btn" onclick="addTrip()">+ Trip</button></div><div class="card"><div class="label">TRIPS LOGGED</div><div class="big">${s.stats.trips}</div><small>2031 target: ${s.goals.travelTarget} / year</small></div><div class="section"><h2>Bucket List</h2><button class="card action" onclick="addBucket()">＋ Add destination</button>${s.travel.bucketList.map(x=>`<div class="card row"><b>${esc(x)}</b><span>Bucket list</span></div>`).join('')}<h2 class="spaced">Trip History</h2>${listRows(s.travel.entries,x=>`<b>${esc(x.destination||'')} • ${x.start||''}</b><span>${esc(x.notes||'')}</span>`,()=>{})}</div></div>`}
function addTrip(){promptForm('Trip',[{key:'destination',label:'Destination'},{key:'start',label:'Start date',default:today()},{key:'end',label:'End date'},{key:'cost',label:'Total cost',default:'0'},{key:'notes',label:'Notes'}],v=>add(s.travel.entries,{...v,cost:num(v.cost)}))}
function addBucket(){const v=prompt('Destination','');if(v){s.travel.bucketList.push(v);save();render('travel')}}
function vehicles(){return `<div class="section"><div class="row"><div><div class="label">GARAGE</div><h1>Vehicles</h1></div><button class="btn" onclick="addVehicle()">+ Vehicle</button></div>${s.vehicles.length?s.vehicles.map((v,i)=>`<div class="card"><div class="row"><div><b>${esc(v.name)}</b><div class="label">${esc(v.status||'Owned')}</div></div><b>${money(v.value)}</b></div><p class="label">Mileage: ${esc(v.mileage||'—')} • Loan: ${money(v.loan)}</p><p>${esc(v.notes||'')}</p></div>`).join(''):'<div class="empty">Your garage is empty. Add your current vehicles and future projects.</div>'}</div>`}
function addVehicle(){promptForm('Vehicle',[{key:'name',label:'Vehicle name'},{key:'status',label:'Status: owned / project / future',default:'owned'},{key:'value',label:'Current value',default:'0'},{key:'loan',label:'Remaining loan',default:'0'},{key:'mileage',label:'Mileage'},{key:'notes',label:'Build / maintenance notes'}],v=>{s.vehicles.push({...v,value:num(v.value),loan:num(v.loan),id:uid()});save();render('vehicles')})}
function achievements(){return `<div class="section"><div class="label">COLLECTION</div><h1>Achievements</h1><div class="grid">${['common','uncommon','rare','epic','legendary','secret'].map(r=>`<div class="card"><div class="label">${r.toUpperCase()}</div><div class="big">${s.achievements.filter(a=>a.rarity===r).length}</div></div>`).join('')}</div><div class="section list">${s.achievements.slice().reverse().map(a=>`<div class="card"><div class="row"><b>🏆 ${esc(a.name)}</b><span class="pill">${esc(a.rarity)}</span></div><small>${a.date} • ${esc(a.detail||'')}</small></div>`).join('')||'<div class="empty">Your first achievement is waiting.</div>'}</div></div>`}
function log(){return `<div class="section"><div class="row"><div><div class="label">MEMORIES</div><h1>Life Log</h1></div><button class="btn" onclick="addLog()">+ Entry</button></div>${s.lifeLog.slice().reverse().map(x=>`<div class="card"><div class="row"><b>${esc(x.title||'Life event')}</b><span class="label">${x.date}</span></div><p>${esc(x.note||'')}</p></div>`).join('')||'<div class="empty">Record meaningful things that happen outside the mission system.</div>'}</div>`}
function addLog(){promptForm('Life Log',[{key:'date',label:'Date',default:today()},{key:'title',label:'Title'},{key:'note',label:'What happened?'}],v=>{s.lifeLog.push({...v,id:uid(),createdAt:nowISO()});audit('life_event',v);save();render('log')})}
function world(){const upgrades=['Future Home','Garage','Office','Pool','Workshop','Property'];return `<div class="section"><div class="label">RPG WORLD</div><h1>Your World</h1><p class="label">Major real-life milestones will eventually appear here as permanent visual upgrades.</p><div class="grid">${upgrades.map(x=>`<div class="card"><div class="label">LOCKED / TRACKING</div><div class="big">${x}</div><small>World integration coming after the data engine.</small></div>`).join('')}</div></div>`}
function more(){return `<div class="section"><div class="label">SYSTEM</div><h1>More</h1><div class="grid"><button class="card action" onclick="render('finance')">💰 Finance</button><button class="card action" onclick="render('hvac')">🔧 HVAC</button><button class="card action" onclick="render('trading')">📈 Trading</button><button class="card action" onclick="render('fitness')">🏋️ Fitness</button><button class="card action" onclick="render('faith')">✝️ Faith</button><button class="card action" onclick="render('development')">📚 Development</button><button class="card action" onclick="render('relationships')">❤️ Relationships</button><button class="card action" onclick="render('travel')">✈️ Travel</button><button class="card action" onclick="render('vehicles')">🚘 Garage</button><button class="card action" onclick="render('world')">🌎 World</button><button class="card action" onclick="render('achievements')">🏆 Achievements</button></div><div class="section grid"><button class="card action" onclick="backup()">⬇ Backup</button><button class="card action" onclick="restore()">⬆ Restore</button><button class="card action" onclick="toggleTheme()">◐ Theme</button><button class="card action" onclick="resetApp()">Reset local save</button></div><div class="card"><b>V8 Real-Life Data Engine</b><p class="label">Schema ${SCHEMA} • Local-first • Private by default</p></div></div>`}
function backup(){recalc();const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`level2031-backup-${today()}.json`;a.click();URL.revokeObjectURL(a.href);toast('Backup exported')}
function restore(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{s=merge(JSON.parse(r.result));recalc();audit('restore',{file:f.name});save();render('home');toast('Backup restored')}catch(e){alert('Invalid Level 2031 backup.')}};r.readAsText(f)};input.click()}
function resetApp(){if(confirm('This deletes the local Level 2031 save. Export a backup first. Continue?')){localStorage.removeItem(KEY);location.reload()}}
function world(){return window.Level2031RPG&&window.Level2031RPG.getMarkup?window.Level2031RPG.getMarkup():`<div class="section"><h1>World</h1><p>Loading world…</p></div>`} function toggleTheme(){s.theme=s.theme==='light'?'dark':'light';save();render(currentView)}
let currentView='home';
function render(view='home'){currentView=view;ensureDaily();recalc();document.body.className=s.theme==='light'?'light':'';const views={home,missions,stats,goals,finance,hvac,trading,fitness,faith,development,relationships,travel,vehicles,achievements,world,log,world,more};const content=(views[view]||home)();const nav=[['home','⌂','Home'],['missions','⚔','Missions'],['stats','◈','Stats'],['log','✦','Life Log'],['world','🌎','World'],['more','☰','More']];document.getElementById('app').innerHTML=`<div class="shell"><header class="top"><div><div class="brand">LEVEL 2031</div><div class="level">${today()} • ${localTime()} • LEVEL ${levelFor(s.xp)}</div></div><button class="themeBtn" onclick="toggleTheme()">${s.theme==='dark'?'☼':'☾'}</button></header><main class="content">${content}</main><div class="toast"></div><nav class="nav"><div class="navin">${nav.map(([v,i,t])=>`<button class="${view===v?'active':''}" onclick="render('${v}')"><span>${i}</span>${t}</button>`).join('')}</div></nav></div>`}
ensureDaily();recalc();save();render('home');


/* ===== LEVEL 2031 V9 — VISUAL RPG / WORLD LAYER ===== */
(function initVisualRPG(){
  const RPG_KEY = "level2031_rpg_v9";
  const defaultRPG = {
    world: {
      activeRoom: "exterior",
      weather: "clear",
      construction: {},
      discovered: ["exterior","garage","office","kitchen"],
      vehicles: {
        sierra: {name:"2016 GMC Sierra", unlocked:true, visible:true},
        corvette: {name:"2019 Corvette", unlocked:true, visible:true},
        c10: {name:"C10 Project", unlocked:false, visible:false},
        r8: {name:"Audi R8", unlocked:false, visible:false}
      }
    },
    character: {
      name:"Ferris",
      skin:"realistic",
      outfit:"Everyday",
      hair:"Default",
      build:"Athletic",
      accessories:[]
    },
    inventory: [],
    achievements: [],
    worldXP: 0
  };

  function loadRPG(){
    try {
      const saved = JSON.parse(localStorage.getItem(RPG_KEY) || "null");
      return Object.assign({}, defaultRPG, saved || {});
    } catch(e){ return JSON.parse(JSON.stringify(defaultRPG)); }
  }
  function saveRPG(s){ localStorage.setItem(RPG_KEY, JSON.stringify(s)); }

  const rpg = loadRPG();

  const rooms = {
    exterior:{title:"Home Exterior", subtitle:"Your future home base", icon:"🏡",
      desc:"The permanent home base of Level 2031. Major real-life milestones will gradually transform this space."},
    garage:{title:"Garage", subtitle:"The collection", icon:"🚘",
      desc:"Your vehicles, tools, projects and future workshop live here."},
    office:{title:"Office", subtitle:"Command Center", icon:"🖥️",
      desc:"Your financial and business command center. Future versions will place live stats directly into the room."},
    kitchen:{title:"Kitchen", subtitle:"Daily life", icon:"🍳",
      desc:"A future home space representing family, meals and everyday life."},
    gym:{title:"Home Gym", subtitle:"Discipline", icon:"🏋️",
      desc:"A future fitness space unlocked as your training system grows."},
    pool:{title:"Pool Area", subtitle:"Lifestyle", icon:"🏊",
      desc:"A major lifestyle upgrade tied to world progression."}
  };

  function getRPGMarkup(){
    const room = rooms[rpg.world.activeRoom] || rooms.exterior;
    const vehicles = Object.values(rpg.world.vehicles).filter(v=>v.visible);
    return `
      <section class="rpg-world">
        <div class="rpg-topbar">
          <div>
            <div class="rpg-kicker">LEVEL 2031 • WORLD</div>
            <h2>${room.icon} ${room.title}</h2>
            <p>${room.subtitle}</p>
          </div>
          <div class="rpg-world-clock" id="rpgWorldClock">--:--</div>
        </div>

        <div class="rpg-scene" data-room="${rpg.world.activeRoom}">
          <div class="rpg-sky"></div>
          <div class="rpg-ground"></div>
          <div class="rpg-house">
            <div class="rpg-house-roof"></div>
            <div class="rpg-house-body">
              <div class="rpg-window"></div><div class="rpg-window"></div>
              <div class="rpg-door"></div>
              <div class="rpg-garage-door"></div>
            </div>
          </div>
          <div class="rpg-avatar">
            <div class="rpg-avatar-head"></div>
            <div class="rpg-avatar-body"></div>
          </div>
          ${rpg.world.activeRoom === "garage" ? `
            <div class="rpg-vehicle-row">
              ${vehicles.map(v=>`<div class="rpg-vehicle ${v.name.includes("Corvette")?"corvette":v.name.includes("Sierra")?"sierra":"project"}"><span>${v.name}</span></div>`).join("")}
            </div>` : ""}
          <div class="rpg-scene-label">${room.desc}</div>
        </div>

        <div class="rpg-room-nav">
          ${Object.entries(rooms).map(([id,x])=>`
            <button class="rpg-room-btn ${id===rpg.world.activeRoom?"active":""}" data-rpg-room="${id}">
              <span>${x.icon}</span>${x.title.replace("Home ","")}
            </button>`).join("")}
        </div>

        <div class="rpg-panels">
          <div class="rpg-panel">
            <div class="rpg-panel-title">CHARACTER</div>
            <div class="rpg-character-card">
              <div class="rpg-mini-avatar"><div class="rpg-avatar-head"></div><div class="rpg-avatar-body"></div></div>
              <div>
                <strong>${rpg.character.name}</strong>
                <div>${rpg.character.outfit} • ${rpg.character.build}</div>
                <button class="rpg-action" id="rpgCustomize">Customize</button>
              </div>
            </div>
          </div>

          <div class="rpg-panel">
            <div class="rpg-panel-title">GARAGE COLLECTION</div>
            <div class="rpg-collection">
              ${Object.values(rpg.world.vehicles).map(v=>`
                <div class="rpg-collection-item ${v.unlocked?"unlocked":"locked"}">
                  <span>${v.unlocked?"🚘":"🔒"}</span>${v.name}
                </div>`).join("")}
            </div>
          </div>

          <div class="rpg-panel">
            <div class="rpg-panel-title">WORLD PROGRESS</div>
            <div class="rpg-progress"><span style="width:${Math.min(100, 12 + rpg.worldXP/100)}%"></span></div>
            <small>${Math.round(Math.min(100,12+rpg.worldXP/100))}% of the world discovered</small>
          </div>
        </div>
      </section>`;
  }

  function mountRPG(){
    let host = document.getElementById("rpgWorldHost");
    if(!host){
      host = document.createElement("div");
      host.id = "rpgWorldHost";
      const main = document.querySelector("main") || document.body;
      main.appendChild(host);
    }
    host.innerHTML = getRPGMarkup();
    host.querySelectorAll("[data-rpg-room]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        rpg.world.activeRoom = btn.dataset.rpgRoom;
        rpg.world.discovered.push(rpg.world.activeRoom);
        rpg.world.discovered = [...new Set(rpg.world.discovered)];
        saveRPG(rpg);
        mountRPG();
      });
    });
    const custom = host.querySelector("#rpgCustomize");
    if(custom) custom.addEventListener("click", customizeCharacter);

    const clock = host.querySelector("#rpgWorldClock");
    if(clock){
      const tick=()=>{ clock.textContent = new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}); };
      tick(); setInterval(tick,30000);
    }
  }

  function customizeCharacter(){
    const outfit = prompt("Choose outfit: Everyday, Work, Gym, Formal, Travel", rpg.character.outfit);
    if(outfit) rpg.character.outfit = outfit;
    const build = prompt("Choose build: Athletic, Lean, Strong, Casual", rpg.character.build);
    if(build) rpg.character.build = build;
    saveRPG(rpg); mountRPG();
  }

  window.Level2031RPG = {
    state:rpg,
    mount:mountRPG,
    getMarkup:getRPGMarkup,
    addWorldXP:(amount)=>{rpg.worldXP += Math.max(0, Number(amount)||0); saveRPG(rpg); mountRPG();}
  };

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountRPG);
  else mountRPG();
})();


/* V10 HARDENED WORLD SCREEN */
(function hardenWorldScreen(){
  const WORLD_KEY = "level2031_v10_world";
  const defaultWorld = {
    activeRoom:"exterior",
    weather:"clear",
    discovered:["exterior"],
    worldXP:0,
    character:{name:"Ferris", outfit:"Everyday", build:"Athletic"},
    vehicles:{
      sierra:{name:"2016 GMC Sierra", unlocked:true},
      corvette:{name:"2019 Corvette", unlocked:true},
      c10:{name:"C10 Project", unlocked:false},
      r8:{name:"Audi R8", unlocked:false}
    }
  };
  let state;
  try { state = Object.assign({}, defaultWorld, JSON.parse(localStorage.getItem(WORLD_KEY)||"null")||{}); }
  catch(e){ state = JSON.parse(JSON.stringify(defaultWorld)); }
  function save(){ localStorage.setItem(WORLD_KEY, JSON.stringify(state)); }

  const roomMap = {
    exterior:["🏡","Home Exterior","Your future home base"],
    garage:["🚘","Garage","The collection"],
    office:["🖥️","Office","Business & financial command center"],
    kitchen:["🍳","Kitchen","Daily life"],
    gym:["🏋️","Home Gym","Training & discipline"],
    pool:["🏊","Pool Area","Lifestyle & recreation"]
  };

  function esc(v){
    return String(v).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function markup(){
    const r = roomMap[state.activeRoom] || roomMap.exterior;
    const unlocked = Object.values(state.vehicles).filter(v=>v.unlocked);
    return `<div class="v10-world-screen">
      <div class="v10-world-header">
        <div><div class="v10-eyebrow">LEVEL 2031 • WORLD</div><h1>${r[0]} ${r[1]}</h1><p>${r[2]}</p></div>
        <div class="v10-clock" data-v10-clock></div>
      </div>
      <div class="v10-scene" data-room="${esc(state.activeRoom)}">
        <div class="v10-sky"></div><div class="v10-ground"></div>
        <div class="v10-house"><div class="v10-roof"></div><div class="v10-housebody">
          <i class="v10-window w1"></i><i class="v10-window w2"></i><i class="v10-door"></i><i class="v10-garage"></i>
        </div></div>
        <div class="v10-avatar"><i></i><b></b></div>
        ${state.activeRoom==="garage" ? `<div class="v10-cars">${unlocked.map(v=>`<div class="v10-car"><span>${esc(v.name)}</span></div>`).join("")}</div>`:""}
        <div class="v10-caption">Tap a room to explore. Major real-life milestones will eventually change this world.</div>
      </div>
      <div class="v10-roomgrid">${Object.entries(roomMap).map(([id,x])=>`<button class="v10-room ${id===state.activeRoom?"active":""}" data-v10-room="${id}">${x[0]}<small>${x[1].replace("Home ","")}</small></button>`).join("")}</div>
      <div class="v10-grid">
        <article class="v10-card"><label>CHARACTER</label><strong>${esc(state.character.name)}</strong><span>${esc(state.character.outfit)} • ${esc(state.character.build)}</span><button data-v10-customize>Customize</button></article>
        <article class="v10-card"><label>GARAGE</label><div class="v10-chips">${Object.values(state.vehicles).map(v=>`<span class="${v.unlocked?"":"locked"}">${v.unlocked?"🚘":"🔒"} ${esc(v.name)}</span>`).join("")}</div></article>
        <article class="v10-card"><label>WORLD DISCOVERY</label><strong>${Math.round(Math.min(100,10+state.discovered.length*10))}%</strong><div class="v10-bar"><i style="width:${Math.min(100,10+state.discovered.length*10)}%"></i></div></article>
      </div>
    </div>`;
  }

  function mount(){
    const host = document.getElementById("worldScreenHost");
    if(!host) return;
    host.innerHTML = markup();
    host.querySelectorAll("[data-v10-room]").forEach(b=>b.onclick=()=>{
      state.activeRoom=b.dataset.v10Room;
      if(!state.discovered.includes(state.activeRoom)) state.discovered.push(state.activeRoom);
      save(); mount();
    });
    const c=host.querySelector("[data-v10-customize]");
    if(c) c.onclick=()=>{
      const outfit=prompt("Outfit: Everyday, Work, Gym, Formal, Travel",state.character.outfit);
      if(outfit) state.character.outfit=outfit;
      const build=prompt("Build: Athletic, Lean, Strong, Casual",state.character.build);
      if(build) state.character.build=build;
      save(); mount();
    };
    const clock=host.querySelector("[data-v10-clock]");
    const tick=()=>{ if(clock) clock.textContent=new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}); };
    tick();
    if(window.__v10ClockTimer) clearInterval(window.__v10ClockTimer);
    window.__v10ClockTimer=setInterval(tick,30000);
  }
  window.Level2031WorldV10={state,mount,save};
  window.addEventListener("level2031:world",mount);
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount);
  else mount();
})();