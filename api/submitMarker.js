export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { name, description, x, y, color = 'red' } = req.body;

  if (!name || !description || isNaN(x) || isNaN(y)) {
    return res.status(400).json({ error: 'Ungültige Eingabedaten' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: 'Webhook URL not configured' });
  }

  const jsonBlock = {
    name,
    coords: [Number(x), Number(y)],
    description,
    color,
  };

  const content = `📍 **Neuer Marker-Vorschlag**
\`\`\`json
${JSON.stringify(jsonBlock, null, 2)}
\`\`\``;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Senden an Discord', detail: err.message });
  }
}
