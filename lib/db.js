// 数据库层：Upstash Redis 优先，未配置环境变量时自动降级为内存模式（本地开发用）
// 对外暴露统一的异步数据访问方法，兼容原有 api/*.js 的调用习惯

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let redis = null;
if (hasRedis) {
  try {
    const { Redis } = require('@upstash/redis');
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (e) {
    console.warn('[db] Upstash Redis 初始化失败，降级为内存模式:', e.message);
    redis = null;
  }
}

const MODE = redis ? 'redis' : 'memory';
console.log('[db] 运行模式:', MODE);

// 简易哈希（bcryptjs 优先，缺失时明文兜底）
let bcrypt = null;
function hashSync(pw) {
  try {
    bcrypt = bcrypt || require('bcryptjs');
    return bcrypt.hashSync(pw, 8);
  } catch (e) {
    return pw;
  }
}
function compareSync(pw, hash) {
  try {
    bcrypt = bcrypt || require('bcryptjs');
    return bcrypt.compareSync(pw, hash);
  } catch (e) {
    return pw === hash;
  }
}

// ---------- 内存兜底 ----------
let _mem = null;
function mem() {
  if (_mem) return _mem;
  const now = Date.now();
  _mem = {
    users: [
      { id: 1, username: '杨间',         password: hashSync('123456'), avatar: '杨', bio: '驾驭鬼眼，活下来的人',     posts: 0 },
      { id: 2, username: '守夜人',        password: hashSync('123456'), avatar: '守', bio: '总部编外，洞察规律者',     posts: 0 },
      { id: 3, username: '鬼差猎人',      password: hashSync('123456'), avatar: '鬼', bio: '追查S级鬼差下落的独行者',  posts: 0 },
      { id: 4, username: '敲门鬼目击者',  password: hashSync('123456'), avatar: '门', bio: '三更敲门，勿应',           posts: 0 }
    ],
    posts: [
      { id: 100, title: '三大铁律，驭鬼者生存的根基', summary: '鬼无法被杀死；能对付鬼的只有鬼；黄金能隔离鬼。', content: '在神秘复苏的世界里，有三条铁律：\n一、鬼无法被杀死。\n二、能对付鬼的，只有鬼。\n三、黄金能隔离鬼。', category: '驭鬼心得', author: '杨间', authorId: 1, createdAt: now - 1000*60*60*2, views: 0, likes: 0 },
      { id: 101, title: '关于"敲门鬼"的情报', summary: '每敲一次门，就有一人消失。', content: '敲门鬼的规律是【敲门】。\n1. 不要应声。\n2. 远离门。\n3. 往黄金跑。', category: '鬼事实录', author: '鬼差猎人', authorId: 3, createdAt: now - 1000*60*60*5, views: 0, likes: 0 },
      { id: 102, title: '关于"驭鬼"最容易死人的误区', summary: '驭鬼不是驯服，是互蚀。', content: '驭鬼不是驾驭，是"同生共死"。每用一次厉鬼的力量，它就复苏一分。', category: '规律情报', author: '守夜人', authorId: 2, createdAt: now - 1000*60*60*12, views: 0, likes: 0 }
    ],
    comments: [],
    sessions: new Map(),
    nextPostId: 103,
    nextCommentId: 1002
  };
  return _mem;
}

// ---------- Redis 种子初始化 ----------
const SEED_KEY = 'forum:seeded';
async function ensureSeed() {
  if (!redis) return;
  const done = await redis.get(SEED_KEY);
  if (done) return;
  const now = Date.now();
  const seedUsers = [
    { id: 1, username: '杨间',         password: hashSync('123456'), avatar: '杨', bio: '驾驭鬼眼，活下来的人',     posts: 0 },
    { id: 2, username: '守夜人',        password: hashSync('123456'), avatar: '守', bio: '总部编外，洞察规律者',     posts: 0 },
    { id: 3, username: '鬼差猎人',      password: hashSync('123456'), avatar: '鬼', bio: '追查S级鬼差下落的独行者',  posts: 0 },
    { id: 4, username: '敲门鬼目击者',  password: hashSync('123456'), avatar: '门', bio: '三更敲门，勿应',           posts: 0 }
  ];
  const seedPosts = [
    { id: 100, title: '三大铁律，驭鬼者生存的根基', summary: '鬼无法被杀死；能对付鬼的只有鬼；黄金能隔离鬼。', content: '在神秘复苏的世界里，有三条铁律：\n一、鬼无法被杀死。\n二、能对付鬼的，只有鬼。\n三、黄金能隔离鬼。', category: '驭鬼心得', author: '杨间', authorId: 1, createdAt: now - 1000*60*60*2, views: 0, likes: 0 },
    { id: 101, title: '关于"敲门鬼"的情报', summary: '每敲一次门，就有一人消失。', content: '敲门鬼的规律是【敲门】。\n1. 不要应声。\n2. 远离门。\n3. 往黄金跑。', category: '鬼事实录', author: '鬼差猎人', authorId: 3, createdAt: now - 1000*60*60*5, views: 0, likes: 0 },
    { id: 102, title: '关于"驭鬼"最容易死人的误区', summary: '驭鬼不是驯服，是互蚀。', content: '驭鬼不是驾驭，是"同生共死"。每用一次厉鬼的力量，它就复苏一分。', category: '规律情报', author: '守夜人', authorId: 2, createdAt: now - 1000*60*60*12, views: 0, likes: 0 }
  ];
  const seedComments = [];
  pipe.set('forum:users', seedUsers);
  pipe.set('forum:posts', seedPosts);
  pipe.set('forum:comments', seedComments);
  pipe.set('forum:nextPostId', 103);
  pipe.set('forum:nextCommentId', 1002);
  pipe.set(SEED_KEY, 1);
  await pipe.exec();
}

// ---------- 统一数据访问层（全部 async） ----------
const db = {
  mode: MODE,
  hashSync,
  compareSync,

  async getUsers() {
    if (redis) { await ensureSeed(); return (await redis.get('forum:users')) || []; }
    return mem().users;
  },
  async saveUsers(list) {
    if (redis) { await redis.set('forum:users', list); return; }
    mem().users = list;
  },
  async findUserByName(username) {
    const users = await this.getUsers();
    return users.find(u => u.username === username) || null;
  },
  async findUserById(id) {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  },
  async addUser(user) {
    const users = await this.getUsers();
    users.push(user);
    await this.saveUsers(users);
    return user;
  },

  async getPosts() {
    if (redis) { await ensureSeed(); return (await redis.get('forum:posts')) || []; }
    return mem().posts;
  },
  async savePosts(list) {
    if (redis) { await redis.set('forum:posts', list); return; }
    mem().posts = list;
  },
  async findPost(id) {
    const posts = await this.getPosts();
    return posts.find(p => p.id === id) || null;
  },
  async addPost(post) {
    const posts = await this.getPosts();
    posts.push(post);
    await this.savePosts(posts);
    return post;
  },
  async getNextPostId() {
    if (redis) { await ensureSeed(); return Number(await redis.get('forum:nextPostId')) || 100; }
    return mem().nextPostId;
  },
  async setNextPostId(v) {
    if (redis) { await redis.set('forum:nextPostId', v); return; }
    mem().nextPostId = v;
  },

  async getComments() {
    if (redis) { await ensureSeed(); return (await redis.get('forum:comments')) || []; }
    return mem().comments;
  },
  async saveComments(list) {
    if (redis) { await redis.set('forum:comments', list); return; }
    mem().comments = list;
  },
  async addComment(c) {
    const list = await this.getComments();
    list.push(c);
    await this.saveComments(list);
    return c;
  },
  async getNextCommentId() {
    if (redis) { await ensureSeed(); return Number(await redis.get('forum:nextCommentId')) || 1000; }
    return mem().nextCommentId;
  },
  async setNextCommentId(v) {
    if (redis) { await redis.set('forum:nextCommentId', v); return; }
    mem().nextCommentId = v;
  },

  async setSession(token, user, ttlSeconds = 7 * 24 * 3600) {
    if (redis) { await redis.set('forum:sess:' + token, user, { ex: ttlSeconds }); return; }
    mem().sessions.set(token, user);
  },
  async getSession(token) {
    if (redis) { return await redis.get('forum:sess:' + token) || null; }
    return mem().sessions.get(token) || null;
  }
};

module.exports = db;

// ---------- 管理员权限 ----------
db.isAdmin = function (username) {
  return username === '杨间';
};
