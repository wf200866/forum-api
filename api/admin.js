const db = require('../lib/db.js');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '';
  const user = await db.getSession(token);
  if (!user || !db.isAdmin(user.username)) {
    return res.status(403).json({ code: 403, msg: '仅管理员可操作' });
  }

  if (req.method === 'GET') {
    if (req.query.action === 'stats') {
      const [users, posts, comments] = await Promise.all([db.getUsers(), db.getPosts(), db.getComments()]);
      return res.json({ code: 0, data: { users: users.length, posts: posts.length, comments: comments.length, admin: user.username } });
    }
    if (req.query.action === 'users') {
      const users = await db.getUsers();
      return res.json({ code: 0, data: users.map(u => ({ id: u.id, username: u.username, bio: u.bio, posts: u.posts })) });
    }
    return res.json({ code: 1, msg: '未知操作' });
  }

  if (req.method === 'DELETE') {
    const postId = Number(req.query.postId);
    if (!postId) return res.json({ code: 1, msg: '缺少 postId' });
    const posts = await db.getPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx === -1) return res.status(404).json({ code: 404, msg: '帖子不存在' });
    posts.splice(idx, 1);
    await db.savePosts(posts);
    return res.json({ code: 0, msg: '已删除' });
  }

  return res.status(404).json({ code: 404, msg: '方法不允许' });
};
