// routes/suppliers.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM suppliers ORDER BY company_name ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suppliers
router.post('/', async (req, res) => {
  const { company_name, contact_person, phone, 
          email, city, address } = req.body;
  try {
    const [result] = await db.query(`
      INSERT INTO suppliers 
        (company_name, contact_person, phone, email, city, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [company_name, contact_person, phone, email, city, address]);

    res.status(201).json({ 
      message: 'Supplier added', 
      supplier_id: result.insertId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', async (req, res) => {
  const { company_name, contact_person, phone, 
          email, city, address, is_active } = req.body;
  try {
    await db.query(`
      UPDATE suppliers 
      SET company_name=?, contact_person=?, phone=?, 
          email=?, city=?, address=?, is_active=?
      WHERE supplier_id=?
    `, [company_name, contact_person, phone, 
        email, city, address, is_active, req.params.id]);

    res.json({ message: 'Supplier updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM suppliers WHERE supplier_id = ?', 
      [req.params.id]
    );
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;