// routes/dashboard.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET /api/dashboard/stats
// Powers the 4 stat cards on dashboard
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_medicines }]] = await db.query(
      'SELECT COUNT(*) AS total_medicines FROM medicines'
    );
    const [[{ expired_medicines }]] = await db.query(
      'SELECT COUNT(*) AS expired_medicines FROM medicines WHERE expiry_date < CURDATE()'
    );
    const [[{ low_stock_items }]] = await db.query(
      'SELECT COUNT(*) AS low_stock_items FROM stock WHERE quantity < low_stock_threshold'
    );
    const [[{ pending_orders }]] = await db.query(
      "SELECT COUNT(*) AS pending_orders FROM purchase_orders WHERE status = 'Pending'"
    );
    const [[{ total_patients }]] = await db.query(
      'SELECT COUNT(*) AS total_patients FROM patients'
    );
    const [[{ dispensed_today }]] = await db.query(
      'SELECT COUNT(*) AS dispensed_today FROM dispense_records WHERE DATE(dispensed_at) = CURDATE()'
    );

    res.json({
      total_medicines,
      expired_medicines,
      low_stock_items,
      pending_orders,
      total_patients,
      dispensed_today
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/stock-levels
// Powers the bar chart
router.get('/stock-levels', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.medicine_id,
        m.name        AS name,
        m.expiry_date,
        s.quantity    AS qty,
        s.low_stock_threshold,
        CASE
          WHEN m.expiry_date < CURDATE()            THEN 'Expired'
          WHEN s.quantity = 0                        THEN 'Out of Stock'
          WHEN s.quantity < s.low_stock_threshold    THEN 'Low Stock'
          ELSE                                            'In Stock'
        END AS status
      FROM medicines m
      JOIN stock s ON m.medicine_id = s.medicine_id
      ORDER BY s.quantity DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Stock levels error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/recent-dispenses
// Powers the recent dispense table
router.get('/recent-dispenses', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        dr.dispense_id,
        p.name  AS patient_name,
        d.name  AS doctor_name,
        m.name  AS medicine_name,
        dr.quantity,
        dr.dispensed_at,
        dr.dispensed_by
      FROM dispense_records dr
      JOIN prescriptions rx ON dr.prescription_id = rx.prescription_id
      JOIN patients      p  ON rx.patient_id      = p.patient_id
      JOIN doctors       d  ON rx.doctor_id       = d.doctor_id
      JOIN medicines     m  ON dr.medicine_id     = m.medicine_id
      ORDER BY dr.dispensed_at DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/expiry-alerts
// Powers the expiry alert panel
router.get('/expiry-alerts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.name,
        m.expiry_date,
        s.quantity AS stock_qty,
        DATEDIFF(m.expiry_date, CURDATE()) AS days_remaining,
        CASE
          WHEN m.expiry_date < CURDATE() THEN 'EXPIRED'
          WHEN DATEDIFF(m.expiry_date, CURDATE()) <= 7 THEN 'EXPIRING_7'
          WHEN DATEDIFF(m.expiry_date, CURDATE()) <= 30 THEN 'EXPIRING_30'
        END AS urgency
      FROM medicines m
      JOIN stock s ON m.medicine_id = s.medicine_id
      WHERE m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY m.expiry_date ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;