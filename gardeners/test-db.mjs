import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgresql://members_user:members_pass@localhost:7435/members_db?schema=public',
});

try {
  const result = await pool.query('SELECT * FROM "user" LIMIT 1');
  console.log('SUCCESS:', result.rows);
} catch (err) {
  console.error('RAW PG ERROR:', err);
} finally {
  await pool.end();
}
