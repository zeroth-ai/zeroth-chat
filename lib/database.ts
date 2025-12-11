import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'chat.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT CHECK(role IN ('user', 'assistant')),
    content TEXT,
    image_base64 TEXT,
    meta_tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Helper to convert database rows to our format
const rowToMessage = (row: any) => ({
  id: row.id,
  role: row.role as 'user' | 'assistant',
  content: row.content,
  image_base64: row.image_base64 || undefined,
  meta_tags: row.meta_tags ? JSON.parse(row.meta_tags) : undefined,
  created_at: row.created_at
});

export const database = {
  // Insert a new message
  insertMessage: (
    role: 'user' | 'assistant', 
    content: string, 
    image_base64?: string, 
    meta_tags?: any
  ) => {
    const stmt = db.prepare(`
      INSERT INTO messages (role, content, image_base64, meta_tags) 
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      role, 
      content, 
      image_base64 || null, 
      meta_tags ? JSON.stringify(meta_tags) : null
    );
    
    return result.lastInsertRowid;
  },
  
  // Get all messages in chronological order
  getAllMessages: () => {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      ORDER BY created_at ASC
    `);
    return stmt.all().map(rowToMessage);
  },
  
  // Get recent messages (last N)
  getRecentMessages: (limit: number = 10) => {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit).reverse().map(rowToMessage);
  },
  
  // Clear all messages (optional)
  clearMessages: () => {
    db.exec('DELETE FROM messages');
  },
  
  // Get database info
  getStats: () => {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT DATE(created_at)) as days_active,
        SUM(LENGTH(content)) as total_chars
      FROM messages
    `);
    return stmt.get();
  }
};