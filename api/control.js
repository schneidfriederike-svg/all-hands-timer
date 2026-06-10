const { kv } = require('@vercel/kv');
const AGENDA = require('./_agenda');

function defaultState() {
  return { currentIdx: 0, secsLeft: AGENDA[0].mins * 60, running: false, totalElapsed: 0 };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let state = await kv.get('timer-state');
  if (!state) state = defaultState();

  const { cmd, idx } = req.body;

  if (cmd === 'play') {
    state.running = true;
  } else if (cmd === 'pause') {
    state.running = false;
  } else if (cmd === 'next') {
    if (state.currentIdx < AGENDA.length - 1) {
      state.currentIdx++;
      state.secsLeft = AGENDA[state.currentIdx].mins * 60;
    }
  } else if (cmd === 'reset') {
    state = defaultState();
  } else if (cmd === 'jump') {
    state.currentIdx = idx;
    state.secsLeft = AGENDA[idx].mins * 60;
  }

  await kv.set('timer-state', state);
  return res.json(state);
};
