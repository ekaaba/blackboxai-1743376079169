const express = require('express');
const router = express.Router();
const db = require('../database');
const jwt = require('jsonwebtoken');

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all applications (admin only)
router.get('/applications', verifyAdmin, (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM applications';
  const params = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  db.all(query, params, (err, applications) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(applications.map(app => ({
      ...app,
      documents: JSON.parse(app.documents || '[]'),
      referenceNumber: `ID-${app.id}-${app.created_at.toString().slice(-6)}`
    })));
  });
});

// Approve application
router.post('/approve/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  db.run(
    'UPDATE applications SET status = "approved" WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Log admin action
      db.run(
        'INSERT INTO audit_logs (user_id, action) VALUES (?, ?)',
        [userId, `Approved application ${id}`],
        (err) => {
          if (err) {
            console.error('Failed to log admin action:', err);
          }
        }
      );

      res.json({ message: 'Application approved successfully' });
    }
  );
});

// Reject application
router.post('/reject/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const { userId } = req.user;

  if (!reason) {
    return res.status(400).json({ error: 'Rejection reason is required' });
  }

  db.run(
    'UPDATE applications SET status = "rejected" WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Log admin action
      db.run(
        'INSERT INTO audit_logs (user_id, action) VALUES (?, ?)',
        [userId, `Rejected application ${id}: ${reason}`],
        (err) => {
          if (err) {
            console.error('Failed to log admin action:', err);
          }
        }
      );

      res.json({ message: 'Application rejected successfully' });
    }
  );
});

// Add new admin
router.post('/add-admin', verifyAdmin, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (user) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash password and create admin user
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.run(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, "admin")',
        [email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ message: 'Admin account created successfully' });
        }
      );
    });
  });
});

module.exports = router;