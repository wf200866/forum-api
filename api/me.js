const db = require('../lib/db.js');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '';
  const user = await db.getSession(token);
  if (!user) return res.status(401).json({ code: 401, msg: '请先登录' });

  const u = await db.findUserById(user.id);
  if (!u) return res.status(404).json({ code: 404, msg: '用户不存在' });

  const posts = await db.getPosts();
  const comments = await db.getComments();
  const myPosts = posts.filter(p => p.authorId === u.id).length;
  const myComments = comments.filter(c => c.author === u.username).length;

  return res.json({
    code: 0,
    msg: 'ok',
    data: {
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      bio: u.bio,
      stats: { posts: myPosts, comments: myComments }
    }
  });
};
