const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MARKERS_PATH = path.join(__dirname, 'markers.json');
const SUGGESTIONS_PATH = path.join(__dirname, 'suggestions.json');

// Stelle statische Dateien bereit
app.use(express.static(__dirname));

// Hilfsfunktion: JSON laden
function loadJson(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}

// Hilfsfunktion: JSON speichern
function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Vorschlag abgeben (POST)
app.post('/api/suggest', (req, res) => {
  const { name, description, x, y } = req.body;
  if (!name || !description || isNaN(x) || isNaN(y)) {
    return res.status(400).json({ error: 'Ungültige Daten' });
  }

  const suggestions = loadJson(SUGGESTIONS_PATH);
  suggestions.push({ id: Date.now(), name, description, coords: [Number(x), Number(y)] });
  saveJson(SUGGESTIONS_PATH, suggestions);
  res.json({ message: 'Vorschlag eingereicht' });
});

// Admin: Vorschläge laden (GET)
app.get('/api/suggestions', (req, res) => {
  const suggestions = loadJson(SUGGESTIONS_PATH);
  res.json(suggestions);
});

// Admin: Vorschlag akzeptieren (POST)
app.post('/api/suggestions/accept', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID fehlt' });

  let suggestions = loadJson(SUGGESTIONS_PATH);
  const suggestionIndex = suggestions.findIndex(s => s.id == id);
  if (suggestionIndex === -1) return res.status(404).json({ error: 'Vorschlag nicht gefunden' });

  const suggestion = suggestions[suggestionIndex];

  // Marker in markers.json hinzufügen
  let markers = loadJson(MARKERS_PATH);
  markers.push({
    name: suggestion.name,
    description: suggestion.description,
    coords: suggestion.coords
  });
  saveJson(MARKERS_PATH, markers);

  // Vorschlag entfernen
  suggestions.splice(suggestionIndex, 1);
  saveJson(SUGGESTIONS_PATH, suggestions);

  res.json({ message: 'Vorschlag akzeptiert' });
});

// Admin: Vorschlag ablehnen (POST)
app.post('/api/suggestions/reject', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID fehlt' });

  let suggestions = loadJson(SUGGESTIONS_PATH);
  const suggestionIndex = suggestions.findIndex(s => s.id == id);
  if (suggestionIndex === -1) return res.status(404).json({ error: 'Vorschlag nicht gefunden' });

  // Vorschlag entfernen
  suggestions.splice(suggestionIndex, 1);
  saveJson(SUGGESTIONS_PATH, suggestions);

  res.json({ message: 'Vorschlag abgelehnt' });
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
