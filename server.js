const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'public')));

// Timer state — lives on the server so any client can join mid-session
let state = {
  currentIdx: 0,
  secsLeft: 7 * 60,   // first item is 7 min
  running: false,
  totalElapsed: 0,
  lastTick: null,
};

// Server-side tick so the timer keeps running even if the host tab is in the background
let tickInterval = null;

function startTick() {
  if (tickInterval) return;
  tickInterval = setInterval(() => {
    if (!state.running) return;

    const AGENDA = getAgenda();
    state.secsLeft--;
    state.totalElapsed++;

    // Auto-advance content → Q&A
    if (
      state.secsLeft < 0 &&
      AGENDA[state.currentIdx].type === 'content' &&
      state.currentIdx + 1 < AGENDA.length &&
      AGENDA[state.currentIdx + 1].type === 'qa'
    ) {
      state.currentIdx++;
      state.secsLeft = AGENDA[state.currentIdx].mins * 60;
    }

    broadcast({ type: 'state', ...state });
  }, 1000);
}

startTick();

function getAgenda() {
  return [
    { name: "Carbon market update",     presenter: "@Carla Woydt",                  mins: 7,  type: "content" },
    { name: "Carbon market update",     presenter: "Q&A",                           mins: 5,  type: "qa"      },
    { name: "General company update",   presenter: "Company Leadership",             mins: 7,  type: "content" },
    { name: "General company update",   presenter: "Q&A",                           mins: 5,  type: "qa"      },
    { name: "eNPS results & takeaways", presenter: "@Mona Simons",                  mins: 20, type: "content" },
    { name: "New quotation feature",    presenter: "@Kaique Paes",                  mins: 7,  type: "content" },
    { name: "New quotation feature",    presenter: "Q&A",                           mins: 2,  type: "qa"      },
    { name: "Risk dashboard",           presenter: "@Noé Lopez",                    mins: 7,  type: "content" },
    { name: "Risk dashboard",           presenter: "Q&A",                           mins: 2,  type: "qa"      },
    { name: "Supply dashboard",         presenter: "@Kilian Balks",                 mins: 7,  type: "content" },
    { name: "Supply dashboard",         presenter: "Q&A",                           mins: 2,  type: "qa"      },
    { name: "New joiners",              presenter: "managers / @Charlotte Schneid", mins: 4,  type: "content" },
  ];
}

function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(data);
  });
}

wss.on('connection', (ws) => {
  // Send current state immediately to new client
  ws.send(JSON.stringify({ type: 'init', state, agenda: getAgenda() }));

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    const AGENDA = getAgenda();

    if (msg.cmd === 'play') {
      state.running = true;
      broadcast({ type: 'state', ...state });
    } else if (msg.cmd === 'pause') {
      state.running = false;
      broadcast({ type: 'state', ...state });
    } else if (msg.cmd === 'next') {
      if (state.currentIdx < AGENDA.length - 1) {
        state.currentIdx++;
        state.secsLeft = AGENDA[state.currentIdx].mins * 60;
        broadcast({ type: 'state', ...state });
      }
    } else if (msg.cmd === 'reset') {
      state = { currentIdx: 0, secsLeft: AGENDA[0].mins * 60, running: false, totalElapsed: 0 };
      broadcast({ type: 'state', ...state });
    } else if (msg.cmd === 'jump') {
      state.currentIdx = msg.idx;
      state.secsLeft = AGENDA[msg.idx].mins * 60;
      broadcast({ type: 'state', ...state });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Timer server running on port ${PORT}`));
