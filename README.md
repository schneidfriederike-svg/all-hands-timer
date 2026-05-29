# All-Hands Timer — Glitch Setup

## Einmalige Einrichtung (~5 Minuten)

### 1. Glitch-Account erstellen
→ https://glitch.com → "Sign up" (kostenlos, kein Kreditkarte)

### 2. Neues Projekt anlegen
→ "New project" → "glitch-hello-express" auswählen

### 3. Dateien ersetzen
Im Glitch-Editor links die Dateien öffnen und Inhalt ersetzen:

**package.json** → Inhalt von `package.json` reinkopieren

**server.js** → Inhalt von `server.js` reinkopieren

**public/index.html** → Inhalt von `public/index.html` reinkopieren

**public/controller.html** → Inhalt von `public/controller.html` reinkopieren

(Falls `public/` Ordner nicht existiert: "New file" → `public/index.html`)

### 4. Fertig!
Glitch startet den Server automatisch.
Deine URL: `https://PROJEKTNAME.glitch.me`

---

## Benutzung am All-Hands Tag

| Gerät | URL | Zweck |
|-------|-----|-------|
| Laptop (Präsentation) | `https://PROJEKTNAME.glitch.me` | Timer-Ansicht |
| Handy | `https://PROJEKTNAME.glitch.me/controller` | Next / Pause |

**Hinweis:** Glitch schläft nach 5 Minuten Inaktivität (Free Plan).
Einfach die Seite kurz vor dem Meeting aufrufen — dann ist er wach.

---

## Agenda anpassen

In `server.js` die `getAgenda()` Funktion bearbeiten:
```js
{ name: "Dein Thema", presenter: "@Name", mins: 10, type: "content" },
{ name: "Dein Thema", presenter: "Q&A",   mins: 3,  type: "qa" },
```
