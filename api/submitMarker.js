export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://mianthlatil.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight-Anfrage beantworten
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: 'Webhook URL nicht konfiguriert' });
  }

  const { name, description, coords } = req.body;

  if (!name || !description || !coords || coords.length !== 2) {
    return res.status(400).json({ error: 'Ungültige Daten' });
  }

  const message = {
    content: `📍 **Neuer Marker-Vorschlag**\n\n**Name:** ${name}\n**Beschreibung:** ${description}\n**Koordinaten:** X: ${coords[0]}, Y: ${coords[1]}`
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Fehler beim Senden an Discord' });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fehler beim Discord-Webhook:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}
