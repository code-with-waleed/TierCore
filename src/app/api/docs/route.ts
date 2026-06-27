import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const routes = [
  {
    method: 'GET',
    path: '/api/leaderboard',
    description: 'Get global leaderboard',
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 50)' },
      { name: 'mode', type: 'string', required: false, description: 'Filter by game mode' },
      { name: 'region', type: 'string', required: false, description: 'Filter by region' },
      { name: 'search', type: 'string', required: false, description: 'Search by username' },
    ],
  },
  {
    method: 'GET',
    path: '/api/players',
    description: 'List all players',
    params: [],
  },
  {
    method: 'POST',
    path: '/api/players',
    description: 'Create a new player',
    params: [
      { name: 'username', type: 'string', required: true, description: 'Player username' },
    ],
  },
  {
    method: 'GET',
    path: '/api/players/:id',
    description: 'Get player profile with stats',
    params: [],
  },
  {
    method: 'GET',
    path: '/api/matches',
    description: 'List recent matches',
    params: [],
  },
  {
    method: 'POST',
    path: '/api/matches',
    description: 'Submit a new match result',
    params: [
      { name: 'player1Id', type: 'string', required: true, description: 'First player ID' },
      { name: 'player2Id', type: 'string', required: true, description: 'Second player ID' },
      { name: 'winner', type: 'string', required: true, description: '"player1", "player2", or "draw"' },
      { name: 'mode', type: 'string', required: false, description: 'Game mode (default: sword)' },
    ],
  },
  {
    method: 'POST',
    path: '/api/matches/:id',
    description: 'Approve or reject a match',
    params: [
      { name: 'action', type: 'string', required: true, description: '"approve" or "reject"' },
      { name: 'reason', type: 'string', required: false, description: 'Rejection reason' },
    ],
  },
  {
    method: 'GET',
    path: '/api/tiers',
    description: 'Get all tier configurations',
    params: [],
  },
  {
    method: 'GET',
    path: '/api/seasons',
    description: 'Get season information',
    params: [],
  },
]

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Docs | TierCore</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #0b0d11; color: #e8e8ec; }
    .container { max-width: 900px; margin: 0 auto; padding: 48px 24px; }
    h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
    h1 span { background: linear-gradient(135deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: #888899; margin-bottom: 40px; }
    .endpoint { background: #15171e; border: 1px solid #1e212a; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .endpoint-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .method { font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
    .method.get { background: #1a3a2a; color: #4ade80; }
    .method.post { background: #3a2a1a; color: #fbbf24; }
    .path { font-family: monospace; font-size: 0.9rem; color: #e8e8ec; }
    .desc { color: #888899; font-size: 0.875rem; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    th { text-align: left; padding: 6px 8px; color: #555566; font-weight: 600; border-bottom: 1px solid #1e212a; }
    td { padding: 6px 8px; border-bottom: 1px solid #1e212a; color: #888899; }
    .required { color: #f87171; font-size: 0.7rem; }
    .try-btn { margin-top: 12px; padding: 6px 14px; background: #FFD700; color: #000; border: none; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .try-btn:hover { background: #fbbf24; }
    .base-url { font-family: monospace; font-size: 0.85rem; color: #555566; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h1><span>TierCore</span> API</h1>
    <p class="subtitle">REST API for the competitive Minecraft PvP ranking platform</p>
    <div class="base-url">Base URL: <code>${API_BASE_URL}</code></div>

    ${routes.map(route => `
      <div class="endpoint">
        <div class="endpoint-header">
          <span class="method ${route.method.toLowerCase()}">${route.method}</span>
          <span class="path">${route.path}</span>
        </div>
        <div class="desc">${route.description}</div>
        ${route.params.length > 0 ? `
          <table>
            <thead><tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
            <tbody>
              ${route.params.map((p: any) => `
                <tr>
                  <td style="font-family: monospace; color: #e8e8ec;">${p.name}</td>
                  <td>${p.type}</td>
                  <td>${p.required ? '<span class="required">Required</span>' : 'Optional'}</td>
                  <td>${p.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<div style="color: #555566; font-size: 0.8rem;">No parameters</div>'}
        <button class="try-btn" onclick="alert('API endpoint: ${route.method} ${API_BASE_URL}${route.path}')">Try it</button>
      </div>
    `).join('')}

    <div style="margin-top: 48px; padding: 20px; background: #15171e; border: 1px solid #1e212a; border-radius: 12px;">
      <h2 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 12px;">Authentication</h2>
      <p style="color: #888899; font-size: 0.875rem; line-height: 1.7;">
        Most endpoints require authentication via API key. Include your key in the <code style="background: #1e212a; padding: 2px 6px; border-radius: 4px;">Authorization</code> header:<br>
        <code style="background: #1e212a; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 8px;">Authorization: Bearer YOUR_API_KEY</code>
      </p>
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
