import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL || process.env.DATABASE_URL,
  ssl: false
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initDatabase() {
  // Create users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'regional',
      allowed_langs TEXT[] DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create i18n_overrides table
  await query(`
    CREATE TABLE IF NOT EXISTS i18n_overrides (
      id SERIAL PRIMARY KEY,
      lang VARCHAR(10) NOT NULL,
      key_path VARCHAR(255) NOT NULL,
      value TEXT NOT NULL,
      updated_by INTEGER REFERENCES users(id),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(lang, key_path)
    )
  `);

  // Create default admin user if not exists (admin/admin)
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin', 10);

  await query(`
    INSERT INTO users (username, password_hash, role, allowed_langs)
    VALUES ('admin', $1, 'admin', ARRAY['en', 'fi', 'no', 'dk'])
    ON CONFLICT (username) DO NOTHING
  `, [hashedPassword]);

  return { success: true, message: 'Database initialized' };
}

export async function getUser(username) {
  const result = await query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

export async function getI18nOverrides(lang) {
  const result = await query(
    'SELECT key_path, value FROM i18n_overrides WHERE lang = $1',
    [lang]
  );
  return result.rows;
}

export async function setI18nOverride(lang, keyPath, value, userId) {
  await query(`
    INSERT INTO i18n_overrides (lang, key_path, value, updated_by, updated_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    ON CONFLICT (lang, key_path)
    DO UPDATE SET value = $3, updated_by = $4, updated_at = CURRENT_TIMESTAMP
  `, [lang, keyPath, value, userId]);
}

export async function deleteI18nOverride(lang, keyPath) {
  await query(
    'DELETE FROM i18n_overrides WHERE lang = $1 AND key_path = $2',
    [lang, keyPath]
  );
}

export default { query, initDatabase, getUser, getI18nOverrides, setI18nOverride, deleteI18nOverride };
