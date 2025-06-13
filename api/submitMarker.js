export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { name, description, x, y, color = "red" } = req.body;

  if (!name || !description || !x || !y) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: 'Webhook URL not configured' });
  }

  const jsonBlock = `\`\`\`json
{
  "name": "${name}",
  "coords": [${x}, ${y}],
  "description": "${description}",
  "color": "${color}"
}
\`\`\``;

  const content = `📍 **Neuer Marker-Vorschlag**\n${jsonBlock}`;

  try {
    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      return res.status(500).json({ error: 'Discord API error', detail: text });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Fetch error', detail: err.message });
  }
}
