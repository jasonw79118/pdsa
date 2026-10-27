/** Public-site smoke checks: static rendering, navigation, live links and theme. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const events = {};
const values = new Map();
const store = new Map();
function element(selector) {
  if (!values.has(selector)) values.set(selector, {
    innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},
    setAttribute(){},querySelectorAll(){return []},insertAdjacentHTML(_where,html){this.innerHTML+=html},checkValidity(){return !!this.valid},reportValidity(){return false},reset(){this.didReset=true},addEventListener(name,fn){events[`element:${selector}:${name}`]=fn},
  });
  return values.get(selector);
}
function click(selector,payload={}){events.click({preventDefault(){},target:{closest:wanted=>wanted===selector?{dataset:payload}:null}})}
const context = {
  document:{documentElement:{dataset:{}},title:'',querySelector:element,querySelectorAll:()=>[],addEventListener:(name,fn)=>{events[name]=fn}},
  window:{scrollTo(){}},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},
  setTimeout:()=>1,clearTimeout:()=>{},Date,JSON,Number,String,Object,Array,Math,Intl,console,
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public-site.js'),'utf8'),context,{filename:'public-site.js'});
const main=element('#main');
assert.match(main.innerHTML,/BUILD SKILLS/,'PDSA homepage renders');
assert.match(main.innerHTML,/foundational player development/i);
assert.doesNotMatch(main.innerHTML,/recreational/i);
assert.match(main.innerHTML,/Palo Duro Soccer Association/i);
const indexHtml=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert.match(indexHtml,/href="https:\/\/techform-canyon\.example"[^>]*>Techform website/,'future-site placeholder link is ready to replace');
assert.equal((indexHtml.match(/<details class="nav-dropdown">/g)||[]).length,2,'header groups secondary links into two menus');
assert.match(indexHtml,/class="nav-register" data-page="registration">Register/,'registration remains a primary header action');
assert.match(indexHtml,/class="nav-login" data-page="login">Family Login/,'family login is a first-class page');
assert.doesNotMatch(main.innerHTML,/Techform/i,'homepage keeps its focus on PDSA');
assert.match(element('#theme-toggle').innerHTML,/Dark/);

events.click({preventDefault(){},target:{closest:selector=>selector==='[data-page]'?{dataset:{page:'about'}}:null}});
  assert.match(main.innerHTML,/Our mission/);
  assert.match(main.innerHTML,/foundational youth soccer development/i);
assert.match(main.innerHTML,/\$70 per player/);
assert.match(main.innerHTML,/visit the official PDSA page/);
assert.equal(element('#main').innerHTML,main.innerHTML);

events.click({preventDefault(){},target:{closest:selector=>selector==='[data-page]'?{dataset:{page:'schedule'}}:null}});
assert.match(main.innerHTML,/one family calendar/i);
assert.match(main.innerHTML,/no live fixtures/i);
assert.doesNotMatch(main.innerHTML,/Purple Hawks|Canyon Stars/,'no sample or current rosters are embedded');

events.click({preventDefault(){},target:{closest:selector=>selector==='[data-page]'?{dataset:{page:'registration'}}:null}});
assert.match(main.innerHTML,/PDSA FAMILY REGISTRATION/);
assert.match(main.innerHTML,/Preview account setup/);
assert.doesNotMatch(main.innerHTML,/Crossbar/i,'registration preview does not route to the legacy provider');

events.click({preventDefault(){},target:{closest:selector=>selector==='[data-page]'?{dataset:{page:'login'}}:null}});
assert.match(main.innerHTML,/PDSA FAMILY ACCOUNT/);
assert.match(main.innerHTML,/Sign in to PDSA/);
assert.match(main.innerHTML,/data-auth-form/);
assert.match(main.innerHTML,/Parent\/Guardian Name/);
assert.match(main.innerHTML,/data-auth-submit/);
assert.match(main.innerHTML,/Authentication is connected/);
assert.doesNotMatch(main.innerHTML,/input[^>]*disabled/i,'family login fields are active');
assert.match(indexHtml,/type="module" src="\/src\/family-auth\.js"/,'Vite loads the Neon Auth client module');
const authSource=fs.readFileSync(path.join(__dirname,'../src/family-auth.js'),'utf8');
assert.match(authSource,/createAuthClient\(authUrl\)/);
assert.match(authSource,/authClient\.signUp\.email/);
assert.match(authSource,/authClient\.signIn\.email/);
assert.match(authSource,/authClient\.getSession\(\)/);
assert.match(authSource,/authClient\.signOut\(\)/);
assert.match(authSource,/syncUi\(\);\s*restoreSession\(\)/,'login form renders before the initial session request completes');
assert.match(authSource,/Session check timed out/,'a stalled session request produces a recoverable state');
assert.doesNotMatch(authSource,/localStorage|sessionStorage|console\.(log|error)/,'credentials and auth data are not persisted or logged by app code');
assert.doesNotMatch(main.innerHTML,/Crossbar|palodurosoccer\.com\/(login|signup)/i,'login screen does not route into the legacy process');

const pageChecks={board:/president\.pdsoccer@gmail\.com/,rules:/10 miles/,appeals:/discipline and appeals committee/,forms:/Injury Report Form/,location:/514 West 4th Avenue/,coaches:/planned PDSA platform/,parents:/playing time/,sponsors:/501\(c\)\(3\)/,referees:/\$15–\$30 per game/};
for(const [page,pattern] of Object.entries(pageChecks)){
  events.click({preventDefault(){},target:{closest:selector=>selector==='[data-page]'?{dataset:{page}}:null}});
  assert.match(main.innerHTML,pattern,`${page} page content renders`);
  assert.match(main.innerHTML,/visit the official PDSA page/);
}
events.click({preventDefault(){},target:{closest:selector=>selector==='[data-page]'?{dataset:{page:'teams'}}:null}});
assert.match(main.innerHTML,/private rosters are never embedded/);
assert.match(main.innerHTML,/Preview team home/);
assert.doesNotMatch(main.innerHTML,/U10 Competitive|palodurosoccer\.com\/division\//,'no legacy team roster links are offered');

click('[data-page]',{page:'family-portal'});
assert.match(main.innerHTML,/FAMILY PORTAL PREVIEW/);
assert.match(main.innerHTML,/Your season at a glance/);
assert.match(main.innerHTML,/Your authorized schedule will appear here/);
click('[data-portal-section]',{portalSection:'Schedule'});
assert.match(main.innerHTML,/games \+ practices/i);
assert.match(main.innerHTML,/Your team calendar will appear here/);
click('[data-portal-section]',{portalSection:'Account'});
assert.match(main.innerHTML,/Children in your family/);
assert.match(main.innerHTML,/data-family-children/);
assert.doesNotMatch(main.innerHTML,/Crossbar|palodurosoccer\.com\/(login|signup|register)/i,'family portal does not route into legacy account/registration flows');

click('[data-page]',{page:'registration-preview'});
assert.match(main.innerHTML,/STEP 1 OF 6/);
assert.match(main.innerHTML,/registration and payment are not connected/i);
click('[data-registration-step]',{registrationStep:'next'});
assert.match(main.innerHTML,/STEP 2 OF 6/);
for(let i=0;i<4;i++)click('[data-registration-step]',{registrationStep:'next'});
assert.match(main.innerHTML,/STEP 6 OF 6/);
assert.match(main.innerHTML,/Preview the family form/);
click('[data-page]',{page:'registration-form'});
assert.match(main.innerHTML,/FICTIONAL DATA ONLY/);
assert.doesNotMatch(main.innerHTML,/Crossbar|palodurosoccer\.com\/(login|signup|register)/i,'registration preview does not depend on the legacy flow');
for(const field of ['players[0][name]','players[0][date_of_birth]','players[0][gender]','players[0][position]','guardian[name]','alternate[name]','players[0][emergency_name]','players[0][allergies]'])assert.ok(main.innerHTML.includes(`name="${field}"`),`registration field exists: ${field}`);
for(const position of ['Forward','Middle / Midfield','Defender','Goalie / Goalkeeper','Unknown / No preference'])assert.ok(main.innerHTML.includes(position),`position option exists: ${position}`);
assert.match(main.innerHTML,/nothing is sent or saved/i);
assert.doesNotMatch(main.innerHTML,/card number|credit card|payment card/i,'form does not collect card data');
click('[data-add-player]');
assert.match(element('#player-list').innerHTML,/name="players\[1\]\[name\]"/,'families can preview adding another player');
assert.match(element('#player-list').innerHTML,/name="players\[1\]\[emergency_name\]"/,'each additional player gets their own emergency contact');
element('#pdsa-registration-form').valid=true;
click('[data-preview-submit]');
assert.match(element('#form-preview-status').textContent,/Nothing was sent or saved/);
assert.equal(element('#pdsa-registration-form').didReset,true,'preview form clears after its local-only check');
assert.doesNotMatch(JSON.stringify(JSON.parse(store.get('pdsa-public-site-v1'))),/Sample Player|guardian\[name\]/,'registration details are not persisted');

events['element:#theme-toggle:click']();
assert.equal(context.document.documentElement.dataset.theme,'dark');
assert.match(element('#theme-toggle').innerHTML,/Light/);
assert.equal(JSON.parse(store.get('pdsa-public-site-v1')).theme,'dark');
console.log('PASS: PDSA public pages; Neon Auth login/signup UI; unified family hub and inactive registration preview; no legacy account links or credential persistence; theme persistence.');
