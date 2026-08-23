/* 神秘复苏论坛 v11.0 - iOS风格增强版 */
const LS={
  POSTS:'mrfs_posts',
  REPLIES:'mrfs_replies',
  THEME:'mrfs_theme',
  COMPOSE_COUNT:'mrfs_compose_count',
  FAVS:'mrfs_favs',
  MSGS:'mrfs_msgs'
};
const ME={name:'杨间',id:'y@mrfs',avatar:'杨'};

const seedPosts=[
  {id:'p1',name:'王察灵',avatar:'王',time:'2小时前',
    title:'关于大昌市第七中学鬼童事件的几点分析',
    body:'从已公布的驭鬼者档案来看，那晚第七中学地下室的灵异事件并非简单的鬼童复苏，更像是某种规律的具象化……',
    tags:['鬼童','大昌市','第七中学'],likes:128,replies:[
      {n:'李军',t:'4楼·1小时前',b:'同意楼主，规律被打破后那只鬼的杀人方式从音杀转成了视线锁定。',likes:23},
      {n:'方镜',t:'5楼·40分钟前',b:'有内部渠道说地下室第四层其实是后建的，这事细思极恐。',likes:15}
    ]},
  {id:'p2',name:'方镜',avatar:'方',time:'5小时前',
    title:'【长文】鬼橱使用手册·第一章 规则汇总',
    body:'我用了三周时间整理了这篇鬼橱使用手册，涵盖开橱条件、交易原则、限制条款以及如何用最小的代价换取最大的收益。',
    tags:['鬼橱','指南','长文'],likes:342,replies:[
      {n:'柳三',t:'3楼·3小时前',b:'老哥这文收藏了！',likes:11}
    ]},
  {id:'p3',name:'柳三',avatar:'柳',time:'昨天 21:30',
    title:'民间组织灵隐会扩张速度异常，请各位谨慎',
    body:'过去三个月内灵隐会从十几个据点扩张到覆盖七省，新增了三个公开分部，并招募了大量民间驭鬼者。这速度让人不安。',
    tags:['灵隐会','组织','动态'],likes:87,replies:[]},
  {id:'p4',name:'杨间',avatar:'杨',time:'3天前',
    title:'关于鬼眼的几个使用技巧',
    body:'很多新驭鬼者会误用鬼眼去观察鬼的弱点，其实它的正确用法是凝视锁定。我整理了几条实战经验分享给大家。',
    tags:['鬼眼','技巧','驭鬼者'],likes:256,replies:[
      {n:'何月莲',t:'2楼·3天前',b:'眼睛会有刺痛感吗？',likes:8},
      {n:'杨间',t:'回复·3天前',b:'会的，开始会有，第一次不超过3秒。',likes:5}
    ]},
  {id:'p5',name:'李军',avatar:'李',time:'5天前',
    title:'【求证】凯撒大酒店的鬼真的无法被关押吗？',
    body:'我听老一辈驭鬼者说那间房的鬼从民国时期到现在没人能关住，进去过的驭鬼者无一例外都……',
    tags:['凯撒大酒店','求证'],likes:63,replies:[]}
];

const LIB={
  '鬼':{icon:'☠',cls:'r',t:'核心存在',d:'没有意识与理智，遵循固定规律行动，常规手段几乎无法杀死。每一次复苏都会带来大量伤亡。'},
  '驭鬼者':{icon:'☯',cls:'p',t:'人类对抗鬼的中坚',d:'能与鬼融合、驾驭鬼的力量。但被鬼侵蚀，面临失控。代表人物：杨间（驾驭鬼眼）。'},
  '鬼湖事件':{icon:'≈',cls:'o',t:'民国时期重大事件',d:'鬼湖源头事件导致民国时期近半驭鬼者消亡。是驭鬼者研究史的重要节点。'},
  '组织势力':{icon:'⌖',cls:'pu',t:'国际/国内势力',d:'国内有总部、各大区负责人；国外有教会、岛屿联盟等。同时存在不同驭鬼者路线分歧。'}
};

let state={tab:'forum',filter:'最新',viewing:0,composeType:'post',sub:''};

const seedMsgs=[
  {id:'m1',icon:'⚡',cls:'o',title:'系统通知',body:'欢迎来到驭鬼者论坛！请先阅读社区规则。',time:'3分钟前',read:false},
  {id:'m2',icon:'♡',cls:'r',title:'王察灵 回复了你',body:'"关于大昌市第七中学…"：同意楼主，规律被打破后那只鬼…',time:'1小时前',read:false},
  {id:'m3',icon:'★',cls:'y',title:'你的帖子被加精',body:'《关于鬼眼的几个使用技巧》已被管理员标记为精华帖。',time:'3天前',read:true}
];

function $(s,el=document){return el.querySelector(s)}
function $$(s,el=document){return [...el.querySelectorAll(s)]}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c]))}
function toast(m,t=1600){
  const el=$('#toast');el.textContent=m;el.classList.add('on');
  clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),t);
}
let apiBase = 'https://wd-nine-chi.vercel.app';

function apiFetch(endpoint, opts={}){
  return fetch(apiBase + endpoint, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers }
  }).then(r=>r.json());
}

async function getPosts(){
  try {
    const res = await apiFetch('/api/posts');
    if (res.code === 0) return res.data.list;
  } catch(e){}
  return seedPosts.slice();
}

async function createPost(post){
  try {
    const res = await apiFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(post)
    });
    if (res.code === 0) return res.data;
  } catch(e){}
  return null;
}

async function getPost(id){
  try {
    const res = await apiFetch(`/api/post?id=${id}`);
    if (res.code === 0) return res.data;
  } catch(e){}
  return null;
}

async function getComments(postId){
  try {
    const res = await apiFetch(`/api/comments?postId=${postId}`);
    if (res.code === 0) return res.data.list;
  } catch(e){}
  return [];
}

async function addComment(postId, content){
  try {
    const res = await apiFetch('/api/comment', {
      method: 'POST',
      body: JSON.stringify({ postId, content })
    });
    if (res.code === 0) return res.data;
  } catch(e){}
  return null;
}

function getReplies(pid){ return [] }
function setReplies(pid,a){}
function getComposeCount(){ return 0 }
function incComposeCount(){ return 0 }

/* ============== 渲染 ============== */
async function render(){
  const fab=$('#bFab');
  fab.style.display=(state.tab==='forum' && !state.viewing && !state.sub)?'flex':'none';
  const isSub=!!state.sub;

  $$('.bnav-it').forEach(b=>b.classList.remove('on'));
  if(!isSub)$$('.bnav-it').forEach(b=>b.classList.toggle('on',b.dataset.t===state.tab));
  const titles={forum:'驭鬼者',lib:'资料库',fav:'收藏',msg:'消息',me:'我'};
  const bigs={forum:'论坛',lib:'资料',fav:'收藏',msg:'消息',me:'我'};
  const subT={settings:'设置',about:'关于'};
  $('#tbTitle').textContent=isSub?subT[state.sub]:titles[state.tab];
  $('#bigTitle').textContent=isSub?subT[state.sub]:bigs[state.tab];

  $('#bBack').style.visibility=(state.viewing||state.sub)?'visible':'hidden';

  const m=$('#main');m.classList.remove('fade','slideIn');
  
  if(state.viewing){
    m.innerHTML = await renderDetail(state.viewing);
  } else if(state.sub==='settings'){
    m.innerHTML=renderSettings();
  } else if(state.sub==='about'){
    m.innerHTML=renderAbout();
  } else if(state.tab==='forum'){
    m.innerHTML=await renderForum();
  } else if(state.tab==='lib'){
    m.innerHTML=renderLib();
  } else if(state.tab==='fav'){
    m.innerHTML=await renderFav();
  } else if(state.tab==='msg'){
    m.innerHTML=renderMsg();
  } else {
    m.innerHTML=renderMe();
  }
  void m.offsetWidth;
  m.classList.add(state.viewing||state.sub?'slideIn':'fade');
}

async function renderForum(){
  const posts = await getPosts();
  const filters=['最新','热门','精华'];
  return `
    <div class="search"><span class="ic">&#8981;</span>
      <input placeholder="搜索帖子、驭鬼者、事件…">
    </div>
    <div class="seg">
      ${filters.map(f=>`<div class="seg-it ${state.filter===f?'on':''}" data-f="${f}">${f}</div>`).join('')}
    </div>
    <div class="notice"><span class="ic">&#9888;</span>
      <span><b>社区公告：</b>请勿模仿任何书中灵异行为，厉鬼均为虚构。如遇真实灵异事件请立即联系当地驭鬼者总部。</span>
    </div>
    ${posts.length?posts.map(p=>`
      <div class="card" data-pid="${p.id}">
        <div class="card-h">
          <div class="ava sm">${esc(p.author?p.author[0]:'?')}</div>
          <div class="card-meta">
            <div class="card-name">${esc(p.author||'匿名')}</div>
            <div class="card-time">${formatTime(p.createdAt)}</div>
          </div>
        </div>
        <div class="card-title">${esc(p.title)}</div>
        <div class="card-body">${esc(p.content)}</div>
        ${p.tags&&p.tags.length?`<div class="card-tags">${p.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>`:''}
        <div class="card-foot">
          <span><span class="ic">&#9825;</span>${p.likes||0}</span>
          <span><span class="ic">&#128172;</span>${p.commentCount||0}</span>
          <span style="margin-left:auto">查看 ›</span>
        </div>
      </div>
    `).join(''):`<div class="empty"><div class="ic">&#8989;</div><h4>暂无帖子</h4><p>点右下角按钮成为第一个发帖的驭鬼者</p></div>`}
  `;
}

function formatTime(timestamp) {
  if (!timestamp) return '刚刚';
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 2) return '昨天';
  if (days < 7) return `${days}天前`;
  return new Date(timestamp).toLocaleDateString();
}

async function renderDetail(pid){
  const p = await getPost(pid);
  if(!p)return '<div class="empty">帖子不存在</div>';
  const reps = await getComments(pid);
  return `
    <div class="det">
      <div class="det-h">
        <div class="ava">${esc(p.author?p.author[0]:'?')}</div>
        <div class="card-meta">
          <div class="card-name">${esc(p.author||'匿名')}</div>
          <div class="card-time">${formatTime(p.createdAt)}</div>
        </div>
      </div>
      <h2 class="det-tt">${esc(p.title)}</h2>
      <div class="det-bd">${esc(p.content)}</div>
      ${p.tags&&p.tags.length?`<div class="card-tags" style="margin:10px 4px">${p.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>`:''}
      <div class="det-meta">
        <span>♡ ${p.likes||0}</span>
        <span>💬 ${reps.length}</span>
        <span style="margin-left:auto;display:flex;gap:14px">
          <span style="color:var(--mu);cursor:pointer" id="favToggle">♡ 收藏</span>
          <span style="color:var(--blue);cursor:pointer" id="repToggle">回复</span>
        </span>
      </div>

      <div style="font-size:13px;color:var(--mu);font-weight:600;padding:14px 4px 8px;letter-spacing:-.08px;text-transform:uppercase">回复 ${reps.length}</div>
      ${reps.length?reps.map((r,i)=>`
        <div class="rep">
          <div class="rep-h">
            <div class="ava sm">${esc(r.author?r.author[0]:'?')}</div>
            <div class="card-name" style="font-size:14px">${esc(r.author)}</div>
            <span style="margin-left:auto;font-size:12px;color:var(--mu)">${formatTime(r.createdAt)}</span>
          </div>
          <div class="rep-bd">${esc(r.content)}</div>
          <div class="rep-f">
            <span>${formatTime(r.createdAt)}</span>
            <span class="like" data-idx="${i}"><span class="ic">&#9825;</span><span>${r.likes||0}</span></span>
          </div>
        </div>
      `).join(''):`<div class="empty" style="padding:30px 20px"><p>还没有回复，第一个说点什么吧</p></div>`}
    </div>
  `;
}

function renderLib(){
  let html=`
    <div class="search"><span class="ic">&#8981;</span>
      <input placeholder="搜索资料…">
    </div>
    <div class="group-t">世界观</div>
  `;
  for(const k in LIB){
    const v=LIB[k];
    html+=`
      <div class="card" style="cursor:default">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <div style="width:36px;height:36px;font-size:18px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--a),#8B0000)">${v.icon}</div>
          <div>
            <div style="font-size:17px;font-weight:600">${k}</div>
            <div style="font-size:12px;color:var(--mu)">${esc(v.t)}</div>
          </div>
        </div>
        <div style="font-size:14px;color:var(--tx2);line-height:1.6;padding-left:48px">${esc(v.d)}</div>
      </div>
    `;
  }
  html+=`
    <div class="group-t">原著名场面</div>
    <div class="group">
      <div class="row-i" data-nav="scene"><div class="ic r">&#9889;</div><div class="tt">第七中学·鬼童之夜</div><div class="chev">›</div></div>
      <div class="row-i" data-nav="scene"><div class="ic o">&#8776;</div><div class="tt">鬼湖源头·民国浩劫</div><div class="chev">›</div></div>
      <div class="row-i" data-nav="scene"><div class="ic p">&#9819;</div><div class="tt">大昌市·杨间崛起</div><div class="chev">›</div></div>
      <div class="row-i" data-nav="scene"><div class="ic pu">&#8982;</div><div class="tt">灵异论坛·现代驭鬼者联盟</div><div class="chev">›</div></div>
    </div>
    <div class="group-t">协议</div>
    <div class="group">
      <div class="row-i" data-nav="rule"><div class="ic">&#9432;</div><div class="tt">社区规则<div class="sub">请务必阅读</div></div><div class="chev">›</div></div>
      <div class="row-i" data-nav="contact"><div class="ic">&#9993;</div><div class="tt">联系总部</div><div class="chev">›</div></div>
    </div>
  `;
  return html;
}

function renderMe(){
  const c=getComposeCount();
  const me = ME;
  return `
    <div class="card" style="padding:0;overflow:hidden">
      <div class="prof">
        <div class="ava lg">${me.avatar}</div>
        <div class="prof-name">${me.name}</div>
        <div class="prof-id">驭鬼者编号 · ${me.id}</div>
        <div class="prof-stats">
          <div><b>${c}</b><span>发布</span></div>
          <div><b>在线</b><span>帖子</span></div>
          <div><b>0</b><span>回复</span></div>
        </div>
      </div>
    </div>

    <div class="group">
      <div class="row-i">
        <div class="ic g">&#9790;</div>
        <div class="tt">深色模式</div>
        <div class="sw ${document.body.classList.contains('dark')?'on':''}" id="swTheme"></div>
      </div>
      <div class="row-i" data-nav="settings"><div class="ic p">&#9881;</div><div class="tt">设置<div class="sub">通用、关于、偏好</div></div><div class="chev">›</div></div>
      <div class="row-i" id="clearData"><div class="ic o">&#9003;</div><div class="tt">清除本地数据</div><div class="chev">›</div></div>
    </div>

    <div class="group-t">更多</div>
    <div class="group">
      <div class="row-i" data-nav="fav"><div class="ic r">&#9825;</div><div class="tt">我的收藏</div><div class="chev">›</div></div>
      <div class="row-i" data-nav="msg"><div class="ic t">&#9993;</div><div class="tt">消息中心</div><div class="chev">›</div></div>
    </div>

    <div style="text-align:center;color:var(--mu);font-size:12px;padding:20px 0 30px">
      神秘复苏论坛 v11.0<br>Designed with iOS Human Interface
    </div>
  `;
}

function getFavs(){
  try{return JSON.parse(localStorage.getItem(LS.FAVS))||[]}catch(e){return[]}
}
function setFavs(a){localStorage.setItem(LS.FAVS,JSON.stringify(a))}
function getMsgs(){
  let arr;
  try{arr=JSON.parse(localStorage.getItem(LS.MSGS))||[]}catch(e){arr=[]}
  if(!arr.length){arr=seedMsgs.slice();localStorage.setItem(LS.MSGS,JSON.stringify(arr))}
  return arr;
}
function setMsgs(a){localStorage.setItem(LS.MSGS,JSON.stringify(a))}
function toggleFav(pid){
  const favs=getFavs();
  const i=favs.indexOf(pid);
  if(i>=0){favs.splice(i,1);toast('已取消收藏')}
  else{favs.push(pid);toast('已收藏')}
  setFavs(favs);
}

async function renderFav(){
  const posts = await getPosts();
  if(!posts.length)return `
    <div class="empty"><div class="ic">&#9825;</div><h4>还没有收藏</h4><p>在帖子详情页点击右下角收藏按钮，即可在此查看</p></div>`;
  return posts.map(p=>`
    <div class="card" data-pid="${p.id}">
      <div class="card-h">
        <div class="ava sm">${esc(p.author?p.author[0]:'?')}</div>
        <div class="card-meta">
          <div class="card-name">${esc(p.author||'匿名')}</div>
          <div class="card-time">${formatTime(p.createdAt)}</div>
        </div>
      </div>
      <div class="card-title">${esc(p.title)}</div>
      <div class="card-body">${esc(p.content)}</div>
      ${p.tags&&p.tags.length?`<div class="card-tags">${p.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>`:''}
      <div class="card-foot">
        <span><span class="ic">&#9825;</span>${p.likes||0}</span>
        <span style="margin-left:auto;color:var(--a)">已收藏 &#10003;</span>
      </div>
    </div>
  `).join('');
}

function renderMsg(){
  const msgs=getMsgs();
  const unread=msgs.filter(m=>!m.read).length;
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:13px;color:var(--mu);font-weight:500">${unread?`${unread} 条未读`:'全部已读'}</span>
      <span style="font-size:13px;color:var(--blue);cursor:pointer" id="markAll">全部标为已读</span>
    </div>
    ${msgs.length?msgs.map(m=>`
      <div class="card" style="cursor:default;${!m.read?'border-left:3px solid var(--a);':''}">
        <div class="card-h">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${m.cls==='o'?'var(--orange)':m.cls==='r'?'var(--a)':'var(--yellow)'},#555);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${m.icon}</div>
          <div class="card-meta">
            <div class="card-name" style="${!m.read?'font-weight:700;':''}">${esc(m.title)}</div>
            <div class="card-time">${esc(m.time)}</div>
          </div>
          ${!m.read?'<span style="width:8px;height:8px;border-radius:50%;background:var(--a);flex-shrink:0"></span>':''}
        </div>
        <div style="font-size:14px;color:var(--tx2);line-height:1.5;padding-left:46px">${esc(m.body)}</div>
      </div>
    `).join(''):`<div class="empty"><div class="ic">&#9993;</div><h4>暂无消息</h4><p>系统通知和回复提醒会显示在这里</p></div>`}
  `;
}

function renderSettings(){
  return `
    <div class="group-t">通用</div>
    <div class="group">
      <div class="row-i">
        <div class="ic g">&#9790;</div>
        <div class="tt">深色模式</div>
        <div class="sw ${document.body.classList.contains('dark')?'on':''}" id="swTheme"></div>
      </div>
      <div class="row-i" data-nav="about"><div class="ic">&#9432;</div><div class="tt">关于<div class="sub">v11.0 · iOS风格</div></div><div class="chev">›</div></div>
      <div class="row-i" id="clearData"><div class="ic o">&#9003;</div><div class="tt">清除本地数据</div><div class="chev">›</div></div>
    </div>
    <div class="group-t">偏好</div>
    <div class="group">
      <div class="row-i"><div class="ic t">&#9881;</div><div class="tt">通知设置</div><div class="chev">›</div></div>
      <div class="row-i"><div class="ic p">&#9939;</div><div class="tt">隐私设置</div><div class="chev">›</div></div>
    </div>
    <div style="text-align:center;color:var(--mu);font-size:12px;padding:20px 0 30px">
      神秘复苏论坛 v11.0<br>Designed with iOS Human Interface
    </div>
  `;
}

function renderAbout(){
  return `
    <div class="card" style="padding:30px;text-align:center;cursor:default">
      <div class="ava lg" style="margin:0 auto 16px">驭</div>
      <div style="font-size:22px;font-weight:700;letter-spacing:-.01em">神秘复苏论坛</div>
      <div style="font-size:13px;color:var(--mu);margin-top:4px">v11.0 · iOS风格</div>
      <div style="font-size:12px;color:var(--mu);margin-top:6px;line-height:1.6">
        驭鬼者聚集地<br>
        基于《神秘复苏》世界观<br>
        纯前端离线WebView APP
      </div>
    </div>
    <div class="group">
      <div class="row-i"><div class="ic">&#9432;</div><div class="tt">版本号</div><div class="sub">v11.0</div></div>
      <div class="row-i"><div class="ic r">&#9829;</div><div class="tt">原著</div><div class="sub">《神秘复苏》</div></div>
      <div class="row-i"><div class="ic o">&#9881;</div><div class="tt">开发模式</div><div class="sub">离线WebView</div></div>
    </div>
    <div style="text-align:center;color:var(--mu);font-size:12px;padding:20px 0 30px">
      设计灵感来自 iOS Human Interface
    </div>
  `;
}

function getRepliesAll(){
  let c=0;
  for(const p of getPosts())c+=getReplies(p.id).length;
  return c;
}

/* ============== 操作 ============== */
function go(tab){state.tab=tab;state.viewing=null;render()}
function detail(pid){state.viewing=pid;render();window.scrollTo(0,0)}
function back(){
  if(state.sub){state.sub='';state.viewing=0;render()}
  else if(state.viewing){state.viewing=null;render()}
  else if(state.tab!=='forum'){state.tab='forum';state.viewing=0;render()}
}
function showCompose(type,pid){
  state.composeType=type;
  const sb=$('#sheetBody');
  if(type==='post'){
    sb.innerHTML=`
      <div class="sheet-h"><div class="sheet-tt">发布新帖</div><div class="sheet-c" id="cCancel">取消</div></div>
      <div class="sheet-b">
        <div class="field"><label>标题</label><input class="input" id="cTitle" maxlength="40" placeholder="一句话说出你的主题…"></div>
        <div class="field"><label>正文</label><textarea class="textarea" id="cBody" placeholder="详细描述…"></div>
        <div class="field"><label>标签 (逗号分隔)</label><input class="input" id="cTags" placeholder="鬼眼, 技巧"></div>
      </div>
      <div class="btn row"><div class="btn ghost" id="cCancel2">取消</div><div class="btn red" id="cSubmit">发布</div></div>
    `;
    $('#cCancel').onclick=$('#cCancel2').onclick=hideCompose;
    $('#cSubmit').onclick=async()=>{
      const t=$('#cTitle').value.trim(), b=$('#cBody').value.trim(), tg=$('#cTags').value.trim();
      if(!t){toast('请填写标题');return}
      const newPost = await createPost({
        title: t,
        content: b || '(无正文)',
        category: '鬼事实录'
      });
      if(newPost){
        toast('发布成功');
      }else{
        toast('发布失败，请检查网络');
      }
      hideCompose();render();
    };
  }else{
    sb.innerHTML=`
      <div class="sheet-h"><div class="sheet-tt">发表回复</div><div class="sheet-c" id="cCancel">取消</div></div>
      <div class="sheet-b">
        <div class="field"><label>回复</label><textarea class="textarea" id="rBody" placeholder="说点什么…"></div>
      </div>
      <div class="btn row"><div class="btn ghost" id="cCancel2">取消</div><div class="btn red" id="rSubmit">回复</div></div>
    `;
    $('#cCancel').onclick=$('#cCancel2').onclick=hideCompose;
    $('#rSubmit').onclick=async()=>{
      const b=$('#rBody').value.trim();
      if(!b){toast('请输入内容');return}
      const ok = await addComment(pid, b);
      if(ok){
        toast('回复成功');
      }else{
        toast('回复失败，请检查网络');
      }
      hideCompose();render();
    };
  }
  $('#mask').classList.add('on');
  $('#sheet').classList.add('on');
}
function hideCompose(){
  $('#mask').classList.remove('on');
  $('#sheet').classList.remove('on');
}
function toggleTheme(){
  const d=document.body.classList.toggle('dark');
  localStorage.setItem(LS.THEME,d?'1':'0');
  $('#bTheme').textContent=d?'\u2600':'\u263E';
  if(state.tab==='me')render();
}
function initTheme(){
  const d=localStorage.getItem(LS.THEME)==='1';
  if(d)document.body.classList.add('dark');
  $('#bTheme').textContent=d?'\u2600':'\u263E';
}

/* ============== 事件绑定 ============== */
document.addEventListener('click',e=>{
  if(e.target.closest('.bnav-it'))go(e.target.closest('.bnav-it').dataset.t);
  else if(e.target.closest('#bBack'))back();
  else if(e.target.closest('#bTheme'))toggleTheme();
  else if(e.target.closest('#bFab'))showCompose('post');
  else if(e.target.closest('#mask'))hideCompose();
  else if(e.target.closest('#swTheme'))toggleTheme();
  else if(e.target.closest('#clearData')){
    if(confirm('确定清除所有本地数据？')){
      localStorage.clear();toast('已清除');render();
    }
  }
  else if(e.target.closest('.seg-it')){
    state.filter=e.target.closest('.seg-it').dataset.f;render();
  }
  else if(e.target.closest('[data-pid]')&&!e.target.closest('.like')){
    detail(e.target.closest('[data-pid]').dataset.pid);
  }
  else if(e.target.closest('#favToggle')){
    toggleFav(state.viewing);
    render();
  }
  else if(e.target.closest('#markAll')){
    setMsgs(getMsgs().map(m=>({...m,read:true})));
    toast('已全部标记为已读');
    render();
  }
  else if(e.target.closest('#repToggle'))showCompose('reply',state.viewing);
  else if(e.target.closest('[data-nav]')){
    const nav=e.target.closest('[data-nav]').dataset.nav;
    if(nav==='fav'){state.tab='fav';state.viewing=0;render();}
    else if(nav==='msg'){state.tab='msg';state.viewing=0;render();}
    else if(nav==='settings'){state.sub='settings';state.viewing=0;render();}
    else if(nav==='about'){state.sub='about';state.viewing=0;render();}
    else if(nav==='scene')toast('原著场景展示（开发中）');
    else if(nav==='rule')toast('请遵守社区规则，勿模仿灵异行为');
    else if(nav==='contact')toast('联系总部：请私信管理员');
  }
  else if(e.target.closest('.like')){
    const el=e.target.closest('.like');
    const i=+el.dataset.idx;
    const p=getPosts().find(x=>x.id===state.viewing);
    if(!p)return;
    const all=[...(p.replies||[]),...getReplies(state.viewing)];
    if(all[i]){
      all[i].likes=(all[i].likes||0)+1;
      const built=(p.replies||[]).length;
      if(i<built)p.replies=all.slice(0,built);
      else setReplies(state.viewing,all.slice(built));
      setPosts(getPosts().map(x=>x.id===p.id?p:x));
      el.classList.add('on');
      el.querySelector('span:last-child').textContent=all[i].likes;
      toast('已点赞');
    }
  }
});

document.addEventListener('keydown',e=>{
  if(e.key==='Enter' && e.target.closest('.search')){
    const val=e.target.value.trim().toLowerCase();
    if(!val)return;
    const posts=getPosts().filter(p=>p.title.toLowerCase().includes(val)||p.body.toLowerCase().includes(val)||(p.tags||[]).some(t=>t.toLowerCase().includes(val)));
    if(!posts.length){toast('未找到相关帖子');return}
    const m=$('#main');
    m.classList.remove('fade');
    m.innerHTML=posts.map(p=>`
      <div class="card" data-pid="${p.id}">
        <div class="card-h">
          <div class="ava sm">${esc(p.avatar||p.name[0])}</div>
          <div class="card-meta"><div class="card-name">${esc(p.name)}</div><div class="card-time">${esc(p.time)}</div></div>
        </div>
        <div class="card-title">${esc(p.title)}</div>
        <div class="card-body">${esc(p.body)}</div>
        ${p.tags&&p.tags.length?`<div class="card-tags">${p.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>`:''}
        <div class="card-foot"><span>&#9825; ${p.likes||0}</span><span>&#128172; ${(p.replies?p.replies.length:0)+getReplies(p.id).length}</span></div>
      </div>
    `).join('');
    void m.offsetWidth;m.classList.add('fade');
  }
});
document.addEventListener('DOMContentLoaded',()=>{
  initTheme();
  render();
});