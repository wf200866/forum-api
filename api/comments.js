const db = require('../lib/db.js');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const postId = Number(req.query.postId);
  const posts = await db.getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return res.status(404).json({ code: 404, msg: '帖子不存在' });

  const list = (await db.getComments())
    .filter(c => c.postId === postId)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((c, i) => ({ ...c, floor: i + 1 }));

  return res.json({ code: 0, msg: 'ok', data: { list, total: list.length } });
};
