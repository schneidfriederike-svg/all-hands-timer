const { kv } = require('@vercel/kv');
const AGENDA = require('./_agenda');

function defaultState() {
  return { currentIdx: 0, secsLeft: AGENDA[0].mins * 60, running: false, totalElapsed: 0 };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    let state = await kv.get('timer-state');
    if (!state) state = defaultState();
    return res.json({ state, agenda: AGENDA });
  }

  if (req.method === 'POST') {
    await kv.set('timer-state', req.body);
    return res.json({ ok: true });
  }

  res.status(405).end();
};
