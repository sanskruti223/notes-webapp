const express = require('express');
const router = express.Router();
const db = require('../database');

// get all notes (with optional search)
router.get('/', (req, res) => {
  const { notes } = db.read();
  const search = req.query.search?.toLowerCase();

  let result = search
    ? notes.filter(n => n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search))
    : [...notes];

  result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json({ success: true, data: result });
});

// get one note
router.get('/:id', (req, res) => {
  const { notes } = db.read();
  const note = notes.find(n => n.id === parseInt(req.params.id));
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
  res.json({ success: true, data: note });
});

// create note
router.post('/', (req, res) => {
  const { title, content } = req.body;
  if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });

  const db_data = db.read();
  const now = new Date().toISOString();
  const note = { id: db_data.nextId, title: title.trim(), content: content || '', createdAt: now, updatedAt: now };

  db_data.notes.push(note);
  db_data.nextId++;
  db.write(db_data);
  res.status(201).json({ success: true, data: note });
});

// update note
router.put('/:id', (req, res) => {
  const { title, content } = req.body;
  if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });

  const db_data = db.read();
  const i = db_data.notes.findIndex(n => n.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ success: false, message: 'Note not found' });

  db_data.notes[i] = { ...db_data.notes[i], title: title.trim(), content: content || '', updatedAt: new Date().toISOString() };
  db.write(db_data);
  res.json({ success: true, data: db_data.notes[i] });
});

// delete note
router.delete('/:id', (req, res) => {
  const db_data = db.read();
  const i = db_data.notes.findIndex(n => n.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ success: false, message: 'Note not found' });

  db_data.notes.splice(i, 1);
  db.write(db_data);
  res.json({ success: true, message: 'Note deleted' });
});

module.exports = router;
