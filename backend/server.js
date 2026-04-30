const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'trackyowork.db');

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

let db;

async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time TEXT NOT NULL,
      end_time TEXT,
      total_duration INTEGER DEFAULT 0,
      distraction_time INTEGER DEFAULT 0,
      focus_score REAL DEFAULT 0,
      longest_focus_streak INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS distractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL
    );
  `);
  persist();
}

function persist() {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function getOne(sql, params = []) {
  return getAll(sql, params)[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  persist();
  return db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0];
}

app.post('/api/sessions/start', (req, res) => {
  const id = run('INSERT INTO sessions (start_time) VALUES (?)', [new Date().toISOString()]);
  res.json(getOne('SELECT * FROM sessions WHERE id = ?', [id]));
});

app.put('/api/sessions/:id/end', (req, res) => {
  const { id } = req.params;
  const { total_duration, distraction_time, focus_score, longest_focus_streak } = req.body;
  run('UPDATE sessions SET end_time=?,total_duration=?,distraction_time=?,focus_score=?,longest_focus_streak=? WHERE id=?',
    [new Date().toISOString(), total_duration, distraction_time, focus_score, longest_focus_streak, id]);
  res.json(getOne('SELECT * FROM sessions WHERE id = ?', [id]));
});

app.get('/api/sessions', (req, res) => {
  const limit = req.query.tier === 'paid' ? 10000 : 5;
  res.json(getAll('SELECT * FROM sessions WHERE end_time IS NOT NULL ORDER BY created_at DESC LIMIT ?', [limit]));
});

app.get('/api/sessions/:id', (req, res) => {
  const session = getOne('SELECT * FROM sessions WHERE id = ?', [req.params.id]);
  if (!session) return res.status(404).json({ error: 'Not found' });
  res.json({ ...session, distractions: getAll('SELECT * FROM distractions WHERE session_id = ?', [req.params.id]) });
});

app.delete('/api/sessions/:id', (req, res) => {
  run('DELETE FROM distractions WHERE session_id = ?', [req.params.id]);
  run('DELETE FROM sessions WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/distractions', (req, res) => {
  const { session_id, type } = req.body;
  if (!session_id || !type) return res.status(400).json({ error: 'session_id and type required' });
  const id = run('INSERT INTO distractions (session_id, timestamp, type) VALUES (?,?,?)', [session_id, new Date().toISOString(), type]);
  res.json({ id, session_id, type, timestamp: new Date().toISOString() });
});

app.get('/api/dashboard/weekly', (req, res) => {
  const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();
  const stats = getOne(`SELECT COUNT(*) as total_sessions, COALESCE(SUM(total_duration),0) as total_focus_seconds, COALESCE(AVG(focus_score),0) as avg_focus_score, COALESCE(MAX(focus_score),0) as best_focus_score, COALESCE(MAX(longest_focus_streak),0) as longest_streak FROM sessions WHERE end_time IS NOT NULL AND created_at >= ?`, [weekAgo]);
  const dailyData = getAll(`SELECT date(created_at) as day, COUNT(*) as sessions, COALESCE(SUM(total_duration),0) as focus_seconds, COALESCE(AVG(focus_score),0) as avg_score FROM sessions WHERE end_time IS NOT NULL AND created_at >= ? GROUP BY date(created_at) ORDER BY day ASC`, [weekAgo]);
  res.json({ stats, dailyData });
});

app.get('/api/export/csv', (req, res) => {
  const rows = getAll('SELECT * FROM sessions WHERE end_time IS NOT NULL ORDER BY created_at DESC');
  const csv = 'ID,Start,End,Duration(s),Distraction(s),Score,Streak(s)\n' +
    rows.map(s => `${s.id},${s.start_time},${s.end_time},${s.total_duration},${s.distraction_time},${Number(s.focus_score).toFixed(1)},${s.longest_focus_streak}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="trackyowork.csv"');
  res.send(csv);
});

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

initDB().then(() => app.listen(PORT, () => console.log(`trackyowork API → http://localhost:${PORT}`)));
