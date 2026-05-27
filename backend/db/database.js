const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "taskmanager.db");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let db;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#f59e0b',
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'todo' CHECK(status IN ('todo','in_progress','done')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
    due_date TEXT,
    tags TEXT DEFAULT '[]',
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS task_comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`;

// Persist db to disk after every write
const persist = () => {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
};

// Helper: run a SELECT and return all rows as objects
const query = (sql, params = []) => {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
};

// Helper: run INSERT/UPDATE/DELETE
const run = (sql, params = []) => {
  db.run(sql, params);
  persist();
};

const getOne = (sql, params = []) => {
  const rows = query(sql, params);
  return rows[0] || null;
};

const initDb = async () => {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(SCHEMA);
  persist();
  console.log("✅ Database initialised");
};

// Statements object — mirrors the better-sqlite3 API shape used in routes
const statements = {
  createUser: {
    run: (id, username, email, password, avatar_color) =>
      run(
        `INSERT INTO users (id,username,email,password,avatar_color) VALUES (?,?,?,?,?)`,
        [id, username, email, password, avatar_color]
      ),
  },
  getUserByEmail: {
    get: (email) => getOne(`SELECT * FROM users WHERE email=?`, [email]),
  },
  getUserByUsername: {
    get: (username) => getOne(`SELECT * FROM users WHERE username=?`, [username]),
  },
  getUserById: {
    get: (id) =>
      getOne(
        `SELECT id,username,email,avatar_color,created_at FROM users WHERE id=?`,
        [id]
      ),
  },

  createTask: {
    run: (id, title, description, status, priority, due_date, tags, user_id) =>
      run(
        `INSERT INTO tasks (id,title,description,status,priority,due_date,tags,user_id)
         VALUES (?,?,?,?,?,?,?,?)`,
        [id, title, description, status, priority, due_date, tags, user_id]
      ),
  },
  getTasksByUser: {
    all: (user_id) =>
      query(
        `SELECT * FROM tasks WHERE user_id=?
         ORDER BY CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
         created_at DESC`,
        [user_id]
      ),
  },
  getTaskById: {
    get: (id, user_id) =>
      getOne(`SELECT * FROM tasks WHERE id=? AND user_id=?`, [id, user_id]),
  },
  updateTask: {
    run: (title, description, status, priority, due_date, tags, id, user_id) =>
      run(
        `UPDATE tasks SET title=?,description=?,status=?,priority=?,due_date=?,tags=?,
         updated_at=datetime('now') WHERE id=? AND user_id=?`,
        [title, description, status, priority, due_date, tags, id, user_id]
      ),
  },
  deleteTask: {
    run: (id, user_id) =>
      run(`DELETE FROM tasks WHERE id=? AND user_id=?`, [id, user_id]),
  },
  getTaskStats: {
    get: (user_id) =>
      getOne(
        `SELECT COUNT(*) as total,
          SUM(CASE WHEN status='todo' THEN 1 ELSE 0 END) as todo,
          SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done,
          SUM(CASE WHEN priority='urgent' AND status!='done' THEN 1 ELSE 0 END) as urgent_pending
         FROM tasks WHERE user_id=?`,
        [user_id]
      ),
  },

  addComment: {
    run: (id, task_id, user_id, content) =>
      run(
        `INSERT INTO task_comments (id,task_id,user_id,content) VALUES (?,?,?,?)`,
        [id, task_id, user_id, content]
      ),
  },
  getComments: {
    all: (task_id) =>
      query(
        `SELECT tc.*,u.username,u.avatar_color FROM task_comments tc
         JOIN users u ON tc.user_id=u.id
         WHERE tc.task_id=? ORDER BY tc.created_at ASC`,
        [task_id]
      ),
  },
};

module.exports = { initDb, statements };
