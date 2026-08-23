const db = require('../lib/db.js');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function authUser(req) {
  const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null;
  if (!token) return null;
  return db.getSession(token);
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(404).json({ code: 404, msg: '方法不允许' });
  }

  const user = await authUser(req);
  if (!user) return res.status(401).json({ code: 401, msg: '请先登录' });

  const body = req.body || {};
  const { postId, content } = body;
  if (!postId) return res.json({ code: 1, msg: '缺少 postId' });
  if (!db.checkRate("comment:"+user.username)) return res.json({ code: 1, msg: "评论太快，请稍后再试" });
      if (!content || !content.trim()) return res.json({ code: 1, msg: '评论内容不能为空' });
  if (content.length > 500) return res.json({ code: 1, msg: '评论不超过 500 字' });

  const pid = Number(postId);
  const posts = await db.getPosts();
  const post = posts.find(p => p.id === pid);
  if (!post) return res.status(404).json({ code: 404, msg: '帖子不存在' });

  const comments = await db.getComments();
  const floor = comments.filter(c => c.postId === pid).length + 1;
  const newComment = {
    id: await db.getNextCommentId(),
    postId: pid,
    floor,
    author: user.username,
    content: content.trim(),
    createdAt: Date.now()
  };
  await db.setNextCommentId(newComment.id + 1);
  await db.addComment(newComment);
  return res.json({ code: 0, msg: '评论成功', data: newComment });
};
