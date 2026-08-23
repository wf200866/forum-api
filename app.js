/* 驭鬼者论坛 v12.0 - 完整功能版 */
const LS = {
  THEME:'mrfs_theme', FAVS:'mrfs_favs', MSGS:'mrfs_msgs',
  TOKEN:'forum_token', USER:'forum_user'
};

const LIB = {
  '鬼':{icon:'☠',cls:'r',t:'核心存在',d:'没有意识与理智，遵循固定规律行动。'},
  '驭鬼者':{icon:'☯',cls:'p',t:'人类对抗鬼的中坚',d:'能与鬼融合、驾驭鬼的力量。'},
  '鬼湖事件':{icon:'≈',cls:'o',t:'民国时期重大事件'},
  '组织势力':{icon:'⌖',cls:'pu',t:'国际/国内势力'}
};

let state = {tab:'forum', filter:'最新', viewing:0, composeType:'post', sub:''};

const seedMsgs = [
  {id:'m1',icon:'⚡',cls:'o',title:'系统通知',body:'欢迎来到驭鬼者论坛！',time:'刚刚',read:false}
];

function $(s,el){return (el||document).querySelector(s)}
function $$(s,el){return [...(el||document).querySelectorAll(s)]}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c]))}

function toast(m,t){
  var el=$('#toast');if(!el)return;
  el.textContent=m;el.classList.add('on');
  clearTimeout(el._t);
  el._t=setTimeout(function(){el.classList.remove('on')},t||1600);
}

var apiBase = 'https://forum-api-nodep1.vercel.app';

// ---- Token 管理 ----
function getToken(){return localStorage.getItem(LS.TOKEN)||''}
function setToken(t){t?localStorage.setItem(LS.TOKEN,t):localStorage.removeItem(LS.TOKEN)}
function setUser(u){if(u)localStorage.setItem(LS.USER,JSON.stringify(u));else localStorage.removeItem(LS.USER)}
function getUser(){try{return JSON.parse(localStorage.getItem(LS.USER))}catch(e){return null}}
function authHeaders(){var t=getToken();return t?{Authorization:'Bearer '+t}:{}}
function isLoggedIn(){return!!getToken()}
function logoutUser(){setToken('');setUser(null);toast('已退出');render()}

// ---- API 请求 ----
function apiFetch(endpoint,opts){
  opts=opts||{};
  var h=opts.headers||{};
  h['Content-Type']='application/json';
  var a=authHeaders();if(a.Authorization)h.Authorization=a.Authorization;
  opts.headers=h;
  return fetch(apiBase+endpoint,opts).then(function(r){return r.json()});
}

async function getPosts(cat,keyword){
  var p='';if(cat&&cat!=='全部')p+='&category='+encodeURIComponent(cat);
  if(keyword)p+='&keyword='+encodeURIComponent(keyword);
  try{var r=await apiFetch('/api/posts?'+p.slice(1));if(r.code===0)return r.data.list}catch(e){}
  return [];
}
async function createPost(data){
  try{var r=await apiFetch('/api/posts',{method:'POST',body:JSON.stringify(data)});if(r.code===0)return r.data}catch(e){}
  return null;
}
async function getPost(id){
  try{var r=await apiFetch('/api/post?id='+id);if(r.code===0)return r.data}catch(e){}
  return null;
}
async function getComments(postId){
  try{var r=await apiFetch('/api/comments?postId='+postId);if(r.code===0)return r.data.list}catch(e){}
  return [];
}
async function addComment(postId,content){
  try{var r=await apiFetch('/api/comment',{method:'POST',body:JSON.stringify({postId:postId,content:content})});if(r.code===0)return r.data}catch(e){}
  return null;
}
async function loginUser(username,password){
  try{var r=await apiFetch('/api/login',{method:'POST',body:JSON.stringify({username:username,password:password})});if(r.code===0){setToken(r.data.token);setUser(r.data.user);return r.data.user}return null}catch(e){}
  return null;
}
async function registerUser(username,password){
  try{var r=await apiFetch('/api/register',{method:'POST',body:JSON.stringify({username:username,password:password})});if(r.code===0){setToken(r.data.token);setUser(r.data.user);return r.data.user}return null}catch(e){}
  return null;
}
async function getMe(){
  try{var r=await apiFetch('/api/me');if(r.code===0)return r.data}catch(e){}
  return null;
}

function fmtTime(ts){
  if(!ts)return '刚刚';
  var d=Date.now()-ts,s=Math.floor(d/1000),m=Math.floor(s/60),h=Math.floor(m/60),dd=Math.floor(h/24);
  if(s<60)return'刚刚';if(m<60)return m+'分钟前';if(h<24)return h+'小时前';
  if(dd<2)return'昨天';if(dd<7)return dd+'天前';return new Date(ts).toLocaleDateString();
}

// ---- 渲染 ----
async function render(){
  var fab=$('#bFab');
  if(fab)fab.style.display=(state.tab==='forum'&&!state.viewing&&!state.sub)?'flex':'none';
  $$('.bnav-it').forEach(function(b){b.classList.remove('on')});
  if(!state.sub)$$('.bnav-it').forEach(function(b){b.classList.toggle('on',b.dataset.t===state.tab)});
  var titles={forum:'驭鬼者',lib:'资料库',fav:'收藏',msg:'消息',me:'我'};
  var bigs={forum:'论坛',lib:'资料',fav:'收藏',msg:'消息',me:'我'};
  var subT={settings:'设置',about:'关于'};
  var ttl=$('#tbTitle');if(ttl)ttl.textContent=state.sub?subT[state.sub]:titles[state.tab];
  var bt=$('#bigTitle');if(bt)bt.textContent=state.sub?subT[state.sub]:bigs[state.tab];
  var bk=$('#bBack');if(bk)bk.style.visibility=(state.viewing||state.sub)?'visible':'hidden';
  var m=$('#main');if(!m)return;m.classList.remove('fade','slideIn');
  if(state.viewing){m.innerHTML=await renderDetail(state.viewing)}
  else if(state.sub==='settings'){m.innerHTML=renderSettings()}
  else if(state.sub==='about'){m.innerHTML=renderAbout()}
  else if(state.tab==='forum'){m.innerHTML=await renderForum()}
  else if(state.tab==='lib'){m.innerHTML=renderLib()}
  else if(state.tab==='fav'){m.innerHTML=renderFav()}
  else if(state.tab==='msg'){m.innerHTML=renderMsg()}
  else{m.innerHTML=renderMe()}
  void m.offsetWidth;m.classList.add(state.viewing||state.sub?'slideIn':'fade');
}

async function renderForum(){
  var posts=await getPosts();
  var filters=['最新','热门','精华'];
  var html='<div class="search"><span class="ic">&#8981;</span><input placeholder="搜索帖子…"></div>';
  html+='<div class="seg">'+filters.map(function(f){return'<div class="seg-it '+(state.filter===f?'on':'')+'" data-f="'+f+'">'+f+'</div>'}).join('')+'</div>';
  html+='<div class="notice"><span class="ic">&#9888;</span><span><b>公告：</b>请勿模仿灵异行为，厉鬼均为虚构。</span></div>';
  if(posts.length){
    html+=posts.map(function(p){
      return'<div class="card" data-pid="'+p.id+'"><div class="card-h"><div class="ava sm">'+esc(p.author?p.author[0]:'?')+'</div><div class="card-meta"><div class="card-name">'+esc(p.author||'匿名')+'</div><div class="card-time">'+fmtTime(p.createdAt)+'</div></div></div><div class="card-title">'+esc(p.title)+'</div><div class="card-body">'+esc(p.content||'')+'</div><div class="card-tags"><span class="tag">'+esc(p.category||'未知')+'</span></div><div class="card-foot"><span>&#9825; '+(p.likes||0)+'</span><span>&#128172; '+(p.commentCount||0)+'</span><span style="margin-left:auto">查看 ›</span></div></div>';
    }).join('');
  }else{
    html+='<div class="empty"><div class="ic">&#8989;</div><h4>暂无帖子</h4><p>点右下角按钮成为第一个发帖的驭鬼者</p></div>';
  }
  return html;
}

async function renderDetail(pid){
  var p=await getPost(pid);
  if(!p)return'<div class="empty">帖子不存在</div>';
  var reps=await getComments(pid);
  var html='<div class="det"><div class="det-h"><div class="ava">'+esc(p.author?p.author[0]:'?')+'</div><div class="card-meta"><div class="card-name">'+esc(p.author||'匿名')+'</div><div class="card-time">'+fmtTime(p.createdAt)+'</div></div></div><h2 class="det-tt">'+esc(p.title)+'</h2><div class="det-bd">'+esc(p.content||'')+'</div><div class="det-meta"><span>♡ '+(p.likes||0)+'</span><span>💬 '+reps.length+'</span><span style="margin-left:auto;display:flex;gap:14px"><span style="color:var(--blue);cursor:pointer" id="repToggle">回复</span></span></div>';
  html+='<div style="font-size:13px;color:var(--mu);font-weight:600;padding:14px 4px 8px">回复 '+reps.length+'</div>';
  if(reps.length){
    html+=reps.map(function(r){
      return'<div class="rep"><div class="rep-h"><div class="ava sm">'+esc(r.author?r.author[0]:'?')+'</div><div class="card-name" style="font-size:14px">'+esc(r.author)+'</div><span style="margin-left:auto;font-size:12px;color:var(--mu)">'+fmtTime(r.createdAt)+'</span></div><div class="rep-bd">'+esc(r.content)+'</div></div>';
    }).join('');
  }else{
    html+='<div class="empty" style="padding:30px 20px"><p>还没有回复</p></div>';
  }
  html+='</div>';
  return html;
}

function renderLib(){
  var html='<div class="search"><span class="ic">&#8981;</span><input placeholder="搜索资料…"></div><div class="group-t">世界观</div>';
  for(var k in LIB){
    var v=LIB[k];
    html+='<div class="card" style="cursor:default"><div style="display:flex;align-items:center;gap:12px;margin-bottom:8px"><div style="width:36px;height:36px;font-size:18px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--a),#8B0000)">'+v.icon+'</div><div><div style="font-size:17px;font-weight:600">'+k+'</div><div style="font-size:12px;color:var(--mu)">'+esc(v.t||'')+'</div></div></div><div style="font-size:14px;color:var(--tx2);line-height:1.6;padding-left:48px">'+esc(v.d||'')+'</div></div>';
  }
  html+='<div class="group-t">协议</div><div class="group"><div class="row-i" data-nav="rule"><div class="ic">&#9432;</div><div class="tt">社区规则</div><div class="chev">›</div></div></div>';
  return html;
}

function renderMe(){
  var u=getUser();
  var html='<div class="card" style="padding:0;overflow:hidden"><div class="prof"><div class="ava lg">'+(u?esc(u.username[0]):'?')+'</div><div class="prof-name">'+(u?esc(u.username):'未登录')+'</div>';
  if(u)html+='<div class="prof-id">'+(u.bio||'驭鬼者')+'</div>';
  html+='</div></div><div class="group">';
  if(isLoggedIn()){
    html+='<div class="row-i" id="logoutBtn"><div class="ic r">&#9003;</div><div class="tt">退出登录</div><div class="chev">›</div></div>';
  }else{
    html+='<div class="row-i" id="showLoginBtn"><div class="ic g">&#9998;</div><div class="tt">登录 / 注册</div><div class="chev">›</div></div>';
  }
  html+='<div class="row-i"><div class="ic g">&#9790;</div><div class="tt">深色模式</div><div class="sw '+(document.body.classList.contains('dark')?'on':'')+'" id="swTheme"></div></div>';
  html+='<div class="row-i" data-nav="settings"><div class="ic p">&#9881;</div><div class="tt">设置</div><div class="chev">›</div></div>';
  html+='</div><div style="text-align:center;color:var(--mu);font-size:12px;padding:20px 0 30px">驭鬼者论坛 v12.0</div>';
  return html;
}

function renderFav(){return'<div class="empty"><div class="ic">&#9825;</div><h4>收藏功能</h4><p>开发中</p></div>'}
function renderMsg(){return'<div class="empty"><div class="ic">&#9993;</div><h4>消息中心</h4><p>开发中</p></div>'}
function renderSettings(){return'<div class="group-t">通用</div><div class="group"><div class="row-i"><div class="ic g">&#9790;</div><div class="tt">深色模式</div><div class="sw '+(document.body.classList.contains('dark')?'on':'')+'" id="swTheme"></div></div><div class="row-i" data-nav="about"><div class="ic">&#9432;</div><div class="tt">关于</div><div class="chev">›</div></div></div><div style="padding:20px;text-align:center;color:var(--mu);font-size:12px">v12.0</div>'}
function renderAbout(){return'<div class="card" style="padding:30px;text-align:center;cursor:default"><div class="ava lg" style="margin:0 auto 16px">驭</div><div style="font-size:22px;font-weight:700">驭鬼者论坛</div><div style="font-size:13px;color:var(--mu);margin-top:4px">v12.0</div></div>'}

// ---- 弹窗 ----
function showLoginSheet(){
  var sb=$('#sheetBody');if(!sb)return;
  sb.innerHTML='<div class="sheet-h"><div class="sheet-tt">登录</div></div><div class="sheet-b"><div class="field"><label>用户名</label><input class="input" id="loginName" placeholder="驭鬼者代号"></div><div class="field"><label>密码</label><input class="input" type="password" id="loginPass" placeholder="密钥"></div><div class="btn row"><div class="btn ghost" id="toRegister">注册</div><div class="btn red" id="loginBtn">登录</div></div></div>';
  $('#cCancel').onclick=hideCompose;
  $('#loginBtn').onclick=async function(){
    var u=$('#loginName').value.trim(),p=$('#loginPass').value;
    if(!u||!p){toast('请填写完整');return}
    var user=await loginUser(u,p);
    if(user){toast('登录成功');hideCompose();render()}
    else{toast('登录失败')}
  };
  $('#toRegister').onclick=function(){showRegisterSheet()};
  $('#mask').classList.add('on');$('#sheet').classList.add('on');
}

function showRegisterSheet(){
  var sb=$('#sheetBody');if(!sb)return;
  sb.innerHTML='<div class="sheet-h"><div class="sheet-tt">注册</div></div><div class="sheet-b"><div class="field"><label>用户名</label><input class="input" id="regName" placeholder="2-12字"></div><div class="field"><label>密码</label><input class="input" type="password" id="regPass" placeholder="至少4位"></div><div class="btn row"><div class="btn ghost" id="toLogin">返回登录</div><div class="btn red" id="regBtn">注册</div></div></div>';
  $('#cCancel').onclick=hideCompose;
  $('#regBtn').onclick=async function(){
    var u=$('#regName').value.trim(),p=$('#regPass').value;
    if(!u||u.length<2){toast('用户名2-12字');return}
    if(!p||p.length<4){toast('密码至少4位');return}
    var user=await registerUser(u,p);
    if(user){toast('注册成功');hideCompose();render()}
    else{toast('注册失败，可能已被占用')}
  };
  $('#toLogin').onclick=function(){showLoginSheet()};
  $('#mask').classList.add('on');$('#sheet').classList.add('on');
}

function showCompose(type,pid){
  if(!isLoggedIn()){toast('请先登录');showLoginSheet();return}
  state.composeType=type;
  var sb=$('#sheetBody');if(!sb)return;
  if(type==='post'){
    sb.innerHTML='<div class="sheet-h"><div class="sheet-tt">发布新帖</div></div><div class="sheet-b"><div class="field"><label>标题</label><input class="input" id="cTitle" maxlength="40" placeholder="标题"></div><div class="field"><label>正文</label><textarea class="textarea" id="cBody" placeholder="内容"></textarea></div><div class="field"><label>分类</label><select class="input" id="cCategory"><option>驭鬼心得</option><option>鬼事实录</option><option>规律情报</option><option>求援求助</option></select></div></div><div class="btn row"><div class="btn ghost" id="cCancel2">取消</div><div class="btn red" id="cSubmit">发布</div></div>';
    $('#cCancel').onclick=$('#cCancel2').onclick=hideCompose;
    $('#cSubmit').onclick=async function(){
      var t=$('#cTitle').value.trim(),b=$('#cBody').value.trim(),cat=$('#cCategory').value;
      if(!t){toast('请填写标题');return}
      var np=await createPost({title:t,content:b||'(无正文)',category:cat});
      if(np){toast('发布成功')}else{toast('发布失败')}
      hideCompose();render();
    };
  }else{
    sb.innerHTML='<div class="sheet-h"><div class="sheet-tt">回复</div></div><div class="sheet-b"><div class="field"><label>回复</label><textarea class="textarea" id="rBody" placeholder="说点什么…"></textarea></div></div><div class="btn row"><div class="btn ghost" id="cCancel2">取消</div><div class="btn red" id="rSubmit">回复</div></div>';
    $('#cCancel').onclick=$('#cCancel2').onclick=hideCompose;
    $('#rSubmit').onclick=async function(){
      var b=$('#rBody').value.trim();
      if(!b){toast('请输入内容');return}
      var ok=await addComment(pid,b);
      if(ok){toast('回复成功')}else{toast('回复失败')}
      hideCompose();render();
    };
  }
  $('#mask').classList.add('on');$('#sheet').classList.add('on');
}
function hideCompose(){
  $('#mask').classList.remove('on');$('#sheet').classList.remove('on');
}

function toggleTheme(){
  var d=document.body.classList.toggle('dark');
  localStorage.setItem(LS.THEME,d?'1':'0');
  var bt=$('#bTheme');if(bt)bt.textContent=d?'\u2600':'\u263E';
  render();
}
function initTheme(){
  var d=localStorage.getItem(LS.THEME)==='1';
  if(d)document.body.classList.add('dark');
  var bt=$('#bTheme');if(bt)bt.textContent=d?'\u2600':'\u263E';
}

// ---- 事件绑定 ----
document.addEventListener('click',function(e){
  var t=e.target.closest('.bnav-it');if(t){go(t.dataset.t);return}
  t=e.target.closest('#bBack');if(t){back();return}
  t=e.target.closest('#bTheme');if(t){toggleTheme();return}
  t=e.target.closest('#bFab');if(t){showCompose('post');return}
  t=e.target.closest('#mask');if(t){hideCompose();return}
  t=e.target.closest('#swTheme');if(t){toggleTheme();return}
  t=e.target.closest('#showLoginBtn');if(t){showLoginSheet();return}
  t=e.target.closest('#logoutBtn');if(t){logoutUser();return}
  t=e.target.closest('.seg-it');if(t){state.filter=t.dataset.f;render();return}
  t=e.target.closest('[data-pid]');if(t){detail(t.dataset.pid);return}
  t=e.target.closest('#repToggle');if(t&&state.viewing){showCompose('reply',state.viewing);return}
  t=e.target.closest('[data-nav]');if(t){
    var n=t.dataset.nav;
    if(n==='fav'){state.tab='fav';state.viewing=0;render()}
    else if(n==='msg'){state.tab='msg';state.viewing=0;render()}
    else if(n==='settings'){state.sub='settings';state.viewing=0;render()}
    else if(n==='about'){state.sub='about';state.viewing=0;render()}
    else if(n==='rule'){toast('请遵守社区规则')}
    return;
  }
});

function go(tab){state.tab=tab;state.viewing=0;render()}
function detail(pid){state.viewing=pid;render();window.scrollTo(0,0)}
function back(){
  if(state.sub){state.sub='';state.viewing=0;render()}
  else if(state.viewing){state.viewing=0;render()}
  else if(state.tab!=='forum'){state.tab='forum';state.viewing=0;render()}
}

window.addEventListener('DOMContentLoaded',function(){initTheme();render()});
