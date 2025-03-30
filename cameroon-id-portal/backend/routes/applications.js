const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Submit new application
router.post('/submit', upload.array('documents', 3), (req, res) => {
  try {
    const { full_name, date_of_birth, user_id } = req.body;
    const documents = req.files ? req.files.map(file => file.path) : [];

    // Validate input
    if (!full_name || !date_of_birth || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save application
    db.run(
      'INSERT INTO applications (user_id, full_name, date_of_birth, documents) VALUES (?, ?, ?, ?)',
      [user_id, full_name, date_of_birth, JSON.stringify(documents)],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Generate reference number
        const referenceNumber = `ID-${this.lastID}-${Date.now().toString().slice(-6)}`;

        res.status(201).json({ 
          referenceNumber,
          message: 'Application submitted successfully'
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check application status
router.post('/status', (req, res) => {
  try {
    const { referenceNumber } = req.body;

    if (!referenceNumber) {
      return res.status(400).json({ error: 'Reference number is required' });
    }

    // Extract ID from reference (ID-123-456789)
    const id = referenceNumber.split('-')[1];

    db.get(
      'SELECT * FROM applications WHERE id = ?',
      [id],
      (err, application) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!application) {
          return res.status(404).json({ error: 'Application not found' });
        }

        res.json({
          status: application.status,
          fullName: application.full_name,
          dateSubmitted: application.created_at,
          documents: JSON.parse(application.documents || '[]'),
          referenceNumber: `ID-${application.id}-${application.created_at.toString().slice(-6)}`
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;