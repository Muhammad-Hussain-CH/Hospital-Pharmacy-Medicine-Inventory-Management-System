// routes/dispense.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET /api/dispense — full dispense history
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        dr.dispense_id,
        p.name   AS patient_name,
        p.phone  AS patient_phone,
        d.name   AS doctor_name,
        m.name   AS medicine_name,
        m.dosage_form,
        dr.quantity,
        dr.dispensed_at,
        dr.dispensed_by,
        dr.notes
      FROM dispense_records dr
      JOIN prescriptions rx ON dr.prescription_id = rx.prescription_id
      JOIN patients      p  ON rx.patient_id      = p.patient_id
      JOIN doctors       d  ON rx.doctor_id       = d.doctor_id
      JOIN medicines     m  ON dr.medicine_id     = m.medicine_id
      ORDER BY dr.dispensed_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dispense — dispense a medicine
router.post('/', async (req, res) => {
  const { 
    patient_name, patient_phone, doctor_id, 
    medicine_id, quantity, dispensed_by, notes 
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check stock availability
    const [[stock]] = await conn.query(
      'SELECT quantity FROM stock WHERE medicine_id = ?', 
      [medicine_id]
    );
    if (!stock || stock.quantity < quantity) {
      await conn.rollback();
      return res.status(400).json({ 
        error: 'Insufficient stock' 
      });
    }

    // Add patient if not exists
    let patientId;
    const [existing] = await conn.query(
      'SELECT patient_id FROM patients WHERE name = ? AND phone = ?',
      [patient_name, patient_phone || '0000-0000000']
    );
    if (existing.length) {
      patientId = existing[0].patient_id;
    } else {
      const [p] = await conn.query(
        'INSERT INTO patients (name, phone) VALUES (?, ?)',
        [patient_name, patient_phone || '0000-0000000']
      );
      patientId = p.insertId;
    }

    // Create prescription
    const [rx] = await conn.query(
      'INSERT INTO prescriptions (patient_id, doctor_id) VALUES (?, ?)',
      [patientId, doctor_id]
    );

    // Create prescription item
    await conn.query(
      'INSERT INTO prescription_items (prescription_id, medicine_id, quantity) VALUES (?, ?, ?)',
      [rx.insertId, medicine_id, quantity]
    );

    // Create dispense record
    await conn.query(`
      INSERT INTO dispense_records 
        (prescription_id, medicine_id, quantity, dispensed_by, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [rx.insertId, medicine_id, quantity, dispensed_by, notes]);

    // Reduce stock
    await conn.query(
      'UPDATE stock SET quantity = quantity - ? WHERE medicine_id = ?',
      [quantity, medicine_id]
    );

    // Log stock transaction
    await conn.query(`
      INSERT INTO stock_transactions 
        (medicine_id, type, quantity, reason, created_by)
      VALUES (?, 'OUT', ?, 'Medicine dispensed', ?)
    `, [medicine_id, quantity, dispensed_by]);

    await conn.commit();
    res.status(201).json({ message: 'Medicine dispensed successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;