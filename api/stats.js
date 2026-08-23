const db = require('../lib/db.js');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const [users, posts, comments] = await Promise.all([
    db.getUsers(),
    db.getPosts(),
    db.getComments()
  ]);

  return res.json({
    code: 0,
    msg: 'ok',
    data: {
      posts: posts.length,
      comments: comments.length,
      users: users.length
    }
  });
};
