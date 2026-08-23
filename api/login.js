const db = require('../lib/db.js');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function makeToken() {
  return 'tk_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(404).json({ code: 404, msg: '方法不允许' });
  }

  const body = req.body || {};
  const { username, password } = body;
  if (!username || !password) return res.json({ code: 1, msg: '账号与密钥不能为空' });

  const user = await db.findUserByName(username);
  if (!user || !db.compareSync(password, user.password)) {
    return res.json({ code: 1, msg: '身份核验失败' });
  }

  const token = makeToken();
  const sessionUser = { id: user.id, username: user.username, avatar: user.avatar, bio: user.bio };
  await db.setSession(token, sessionUser); // 默认 7 天过期

  return res.json({
    code: 0,
    msg: '登录成功',
    data: {
      token,
      user: { id: user.id, username: user.username, avatar: user.avatar, bio: user.bio, posts: user.posts }
    }
  });
};
