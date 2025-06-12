document.getElementById('submitMarker').onclick = () => {
  const name = document.getElementById('markerName').value.trim();
  const desc = document.getElementById('markerDesc').value.trim();
  const form = document.querySelector('.form-popup');

  // Fehlermeldung anzeigen, wenn Name fehlt
  if (!name) {
    showMessage('Bitte Name eingeben.', 'error', form);
    return;
  }

  // Buttons deaktivieren während das senden läuft
  toggleFormButtons(false, form);

  fetch('/api/submitmarkers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description: desc, x: parseFloat(x), y: parseFloat(y) })
  })
  .then(res => {
    if (!res.ok) throw new Error('Fehler beim Senden');
    return res.json();
  })
  .then(() => {
    showMessage('Dein Marker-Vorschlag wurde gesendet. Danke!', 'success', form);
    // Nach kurzer Zeit Formular schließen
    setTimeout(() => form.remove(), 3000);
  })
  .catch(err => {
    showMessage('Fehler: ' + err.message, 'error', form);
    toggleFormButtons(true, form);
  });
};

// Hilfsfunktion zum Anzeigen einer Nachricht im Formular
function showMessage(text, type, container) {
  let msg = container.querySelector('.form-message');
  if (!msg) {
    msg = document.createElement('div');
    msg.className = 'form-message';
    msg.style.marginTop = '8px';
    container.appendChild(msg);
  }
  msg.textContent = text;
  msg.style.color = type === 'error' ? 'red' : 'green';
}

// Hilfsfunktion um Buttons aktiv/inaktiv zu schalten
function toggleFormButtons(enabled, container) {
  container.querySelectorAll('button').forEach(btn => {
    btn.disabled = !enabled;
  });
}
