// routes/orders.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        po.order_id,
        s.company_name AS supplier_name,
        s.phone        AS supplier_phone,
        po.order_date,
        po.expected_delivery,
        po.actual_delivery,
        po.status,
        po.notes,
        SUM(poi.quantity * poi.unit_price) AS total_value
      FROM purchase_orders po
      JOIN suppliers           s   ON po.supplier_id = s.supplier_id
      JOIN purchase_order_items poi ON po.order_id   = poi.order_id
      GROUP BY po.order_id
      ORDER BY po.order_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — create new order
router.post('/', async (req, res) => {
  const { supplier_id, expected_delivery, notes, items } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(`
      INSERT INTO purchase_orders (supplier_id, expected_delivery, notes)
      VALUES (?, ?, ?)
    `, [supplier_id, expected_delivery, notes]);

    const orderId = result.insertId;

    for (const item of items) {
      await conn.query(`
        INSERT INTO purchase_order_items 
          (order_id, medicine_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.medicine_id, item.quantity, item.unit_price]);
    }

    await conn.commit();
    res.status(201).json({ 
      message: 'Purchase order created', 
      order_id: orderId 
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PUT /api/orders/:id/deliver — mark as delivered
router.put('/:id/deliver', async (req, res) => {
  try {
    await db.query(`
      UPDATE purchase_orders
      SET status = 'Delivered', actual_delivery = CURDATE()
      WHERE order_id = ?
    `, [req.params.id]);

    res.json({ message: 'Order marked as delivered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;