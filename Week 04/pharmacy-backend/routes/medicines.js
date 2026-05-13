// routes/medicines.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET /api/medicines — all medicines with stock and status
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.medicine_id,
        m.name,
        m.dosage_form,
        m.strength,
        m.unit_price,
        m.expiry_date,
        m.batch_no,
        c.name  AS category,
        mf.name AS manufacturer,
        sup.company_name AS supplier,
        sup.phone AS supplier_phone,
        s.quantity AS stock_qty,
        s.low_stock_threshold,
        CASE
          WHEN m.expiry_date < CURDATE()               THEN 'Expired'
          WHEN s.quantity = 0                           THEN 'Out of Stock'
          WHEN s.quantity < s.low_stock_threshold       THEN 'Low Stock'
          ELSE                                               'In Stock'
        END AS status
      FROM medicines m
      JOIN categories    c   ON m.category_id     = c.category_id
      JOIN manufacturers mf  ON m.manufacturer_id = mf.manufacturer_id
      JOIN suppliers     sup ON m.supplier_id     = sup.supplier_id
      JOIN stock         s   ON m.medicine_id     = s.medicine_id
      ORDER BY m.name ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/medicines/:id — single medicine
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, c.name AS category, mf.name AS manufacturer,
             sup.company_name AS supplier, s.quantity, s.low_stock_threshold
      FROM medicines m
      JOIN categories    c   ON m.category_id     = c.category_id
      JOIN manufacturers mf  ON m.manufacturer_id = mf.manufacturer_id
      JOIN suppliers     sup ON m.supplier_id     = sup.supplier_id
      JOIN stock         s   ON m.medicine_id     = s.medicine_id
      WHERE m.medicine_id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Medicine not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/medicines — add new medicine
router.post('/', async (req, res) => {
  const { 
    category_id, manufacturer_id, supplier_id, name,
    dosage_form, strength, unit_price, expiry_date, 
    batch_no, description, stock_quantity, low_stock_threshold 
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(`
      INSERT INTO medicines 
        (category_id, manufacturer_id, supplier_id, name, dosage_form, 
         strength, unit_price, expiry_date, batch_no, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [category_id, manufacturer_id, supplier_id, name, dosage_form,
        strength, unit_price, expiry_date, batch_no, description]);

    await conn.query(`
      INSERT INTO stock (medicine_id, quantity, low_stock_threshold)
      VALUES (?, ?, ?)
    `, [result.insertId, stock_quantity || 0, low_stock_threshold || 20]);

    await conn.commit();
    res.status(201).json({ 
      message: 'Medicine added successfully', 
      medicine_id: result.insertId 
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PUT /api/medicines/:id — update medicine
router.put('/:id', async (req, res) => {
  const { name, dosage_form, strength, unit_price, 
          expiry_date, batch_no, description } = req.body;
  try {
    await db.query(`
      UPDATE medicines 
      SET name=?, dosage_form=?, strength=?, unit_price=?, 
          expiry_date=?, batch_no=?, description=?
      WHERE medicine_id=?
    `, [name, dosage_form, strength, unit_price, 
        expiry_date, batch_no, description, req.params.id]);

    res.json({ message: 'Medicine updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/medicines/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM medicines WHERE medicine_id = ?', 
      [req.params.id]
    );
    res.json({ message: 'Medicine deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;