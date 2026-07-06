const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

function readDb() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// GET all applications
app.get('/api/applications', (req, res) => {
  const db = readDb();
  res.json(db.applications);
});

// GET summary stats
app.get('/api/stats', (req, res) => {
  const db = readDb();
  const apps = db.applications;
  const byStatus = apps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const total = apps.length;
  const responded = apps.filter((a) => a.status !== 'Applied').length;
  const responseRate = total ? Math.round((responded / total) * 100) : 0;

  res.json({ total, byStatus, responseRate });
});

// POST create a new application
app.post('/api/applications', (req, res) => {
  const { company, role, location, status, dateApplied, notes } = req.body;

  if (!company || !role) {
    return res.status(400).json({ error: 'company and role are required' });
  }

  const db = readDb();
  const newApp = {
    id: generateId(),
    company,
    role,
    location: location || '',
    status: status || 'Applied',
    dateApplied: dateApplied || new Date().toISOString().slice(0, 10),
    notes: notes || '',
  };

  db.applications.push(newApp);
  writeDb(db);
  res.status(201).json(newApp);
});

// PUT update an application
app.put('/api/applications/:id', (req, res) => {
  const db = readDb();
  const idx = db.applications.findIndex((a) => a.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  db.applications[idx] = { ...db.applications[idx], ...req.body, id: req.params.id };
  writeDb(db);
  res.json(db.applications[idx]);
});

// DELETE an application
app.delete('/api/applications/:id', (req, res) => {
  const db = readDb();
  const idx = db.applications.findIndex((a) => a.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const [removed] = db.applications.splice(idx, 1);
  writeDb(db);
  res.json(removed);
});

app.listen(PORT, () => {
  console.log(`Job Application Tracker API running on http://localhost:${PORT}`);
});
