const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function query(sql) {
  const res = await client.query(sql);
  return res.rows;
}

async function main() {
  try {
    await client.connect();
    console.log('Connected to database');

    // 1. Tool counts
    const totalTools = await query(`SELECT COUNT(*) as count FROM tools`);
    const noDescTools = await query(`SELECT COUNT(*) as count FROM tools WHERE COALESCE(description, '') = '' OR LENGTH(COALESCE(description, '')) < 10`);
    const zeroViewTools = await query(`SELECT COUNT(*) as count FROM tools WHERE COALESCE("viewCount", 0) = 0`);
    const lowActiveTools = await query(`SELECT COUNT(*) as count FROM tools WHERE COALESCE("viewCount", 0) < 5`);
    
    console.log('TOOL_STATS:', JSON.stringify({
      total: Number(totalTools[0].count),
      noDesc: Number(noDescTools[0].count),
      zeroView: Number(zeroViewTools[0].count),
      lowActive: Number(lowActiveTools[0].count)
    }));

    // 2. News stats
    const totalNews = await query(`SELECT COUNT(*) as count FROM news`);
    const recentNews = await query(`SELECT COUNT(*) as count FROM news WHERE "createdAt" >= NOW() - INTERVAL '30 days'`);
    const latestNewsDate = await query(`SELECT MAX("createdAt") as max_date FROM news`);
    
    console.log('NEWS_STATS:', JSON.stringify({
      total: Number(totalNews[0].count),
      recent30d: Number(recentNews[0].count),
      latestDate: latestNewsDate[0].max_date
    }));

    // 3. User stats
    const totalUsers = await query(`SELECT COUNT(*) as count FROM users`);
    const adminUsers = await query(`SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'`);
    const recentUsers = await query(`SELECT COUNT(*) as count FROM users WHERE "createdAt" >= NOW() - INTERVAL '30 days'`);
    
    console.log('USER_STATS:', JSON.stringify({
      total: Number(totalUsers[0].count),
      admin: Number(adminUsers[0].count),
      recent30d: Number(recentUsers[0].count)
    }));

    // 4. Shares
    const totalShares = await query(`SELECT COUNT(*) as count FROM shares`);
    const recentShares = await query(`SELECT COUNT(*) as count FROM shares WHERE "createdAt" >= NOW() - INTERVAL '30 days'`);
    
    console.log('SHARE_STATS:', JSON.stringify({
      total: Number(totalShares[0].count),
      recent30d: Number(recentShares[0].count)
    }));

    // 5. Comments
    const totalComments = await query(`SELECT COUNT(*) as count FROM comments`);
    const recentComments = await query(`SELECT COUNT(*) as count FROM comments WHERE "createdAt" >= NOW() - INTERVAL '30 days'`);
    
    console.log('COMMENT_STATS:', JSON.stringify({
      total: Number(totalComments[0].count),
      recent30d: Number(recentComments[0].count)
    }));

    // 6. AI interactions
    const totalAI = await query(`SELECT COUNT(*) as count FROM ai_interactions`);
    const recentAI = await query(`SELECT COUNT(*) as count FROM ai_interactions WHERE "createdAt" >= NOW() - INTERVAL '30 days'`);
    
    console.log('AI_STATS:', JSON.stringify({
      total: Number(totalAI[0].count),
      recent30d: Number(recentAI[0].count)
    }));

    // 7. Verification logs
    const totalVerif = await query(`SELECT COUNT(*) as count FROM verification_logs`);
    const recentVerif = await query(`SELECT COUNT(*) as count FROM verification_logs WHERE "sentAt" >= NOW() - INTERVAL '30 days'`);
    
    console.log('VERIF_STATS:', JSON.stringify({
      total: Number(totalVerif[0].count),
      recent30d: Number(recentVerif[0].count)
    }));

    // 8. Low-active tools list (top 20)
    const lowTools = await query(`SELECT id, name, "viewCount", "createdAt" FROM tools WHERE COALESCE("viewCount", 0) < 5 ORDER BY "viewCount" ASC, "createdAt" DESC LIMIT 20`);
    console.log('LOW_TOOLS:', JSON.stringify(lowTools.map(t => ({id: t.id, name: t.name, views: t.viewCount}))));

    // 9. Categories distribution
    const catDist = await query(`SELECT c.name as category, COUNT(t.id) as tool_count FROM categories c LEFT JOIN tools t ON t."categoryId" = c.id GROUP BY c.id, c.name ORDER BY tool_count DESC`);
    console.log('CAT_DIST:', JSON.stringify(catDist));

    // 10. ToolTrendHistory (if exists)
    try {
      const trendCount = await query(`SELECT COUNT(*) as count FROM "ToolTrendHistory"`);
      console.log('TREND_STATS:', JSON.stringify({ total: Number(trendCount[0].count) }));
    } catch(e) {
      console.log('TREND_STATS:', JSON.stringify({ error: e.message }));
    }

    // 11. Friend links
    try {
      const flCount = await query(`SELECT COUNT(*) as count FROM "FriendLink"`);
      console.log('FL_STATS:', JSON.stringify({ total: Number(flCount[0].count) }));
    } catch(e) {
      console.log('FL_STATS:', JSON.stringify({ error: e.message }));
    }

    // 12. Announcements
    try {
      const annCount = await query(`SELECT COUNT(*) as count FROM announcements`);
      console.log('ANN_STATS:', JSON.stringify({ total: Number(annCount[0].count) }));
    } catch(e) {
      console.log('ANN_STATS:', JSON.stringify({ error: e.message }));
    }

    // 13. Tables list
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log('TABLES:', JSON.stringify(tables.map(t => t.table_name)));

    console.log('DONE');
  } catch(e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
  } finally {
    await client.end();
  }
}

main();
