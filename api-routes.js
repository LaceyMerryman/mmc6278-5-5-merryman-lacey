const router = require('express').Router()
const db = require('./db')

// All inventory routes
router.route('/inventory')
  .get(async (req, res) => {
    try {
      const [items] = await db.query('SELECT * FROM inventory')
      res.json(items)
    } catch (err) {
      console.error(err)
      res.status(500).send('Server error')
    }
  })
  .post(async (req, res) => {
    try {
      const { name, image, description, quantity, price } = req.body
      await db.query(
        `INSERT INTO inventory (name, image, description, quantity, price) VALUES (?, ?, ?, ?, ?)`,
        [name, image, description, quantity, price]
      )
      res.status(204).end()
    } catch (err) {
      console.error(err)
      res.status(500).send('Server error')
    }
  })

// Single inventory item routes
router.route('/inventory/:id')
  .get(async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM inventory WHERE id = ?', [req.params.id])
      if (rows.length === 0) return res.status(404).send('Item not found')
      res.json(rows[0])
    } catch(err) {
      console.error(err)
      res.status(500).send('Server error')
    }
  })
  .put(async (req, res) => {
    try {
      const { name, image, description, quantity, price } = req.body
      const [{ affectedRows }] = await db.query(
        `UPDATE inventory
         SET name = ?, image = ?, description = ?, quantity = ?, price = ?
         WHERE id = ?`,
        [name, image, description, quantity, price, req.params.id]
      )
      if (affectedRows === 0) return res.status(404).send('Item not found')
      res.status(204).end()
    } catch (err) {
      console.error(err)
      res.status(500).send('Server error')
    }
  })
  .delete(async (req, res) => {
    try {
      const [{ affectedRows }] = await db.query('DELETE FROM inventory WHERE id = ?', [req.params.id])
      if (affectedRows === 0) return res.status(404).send('Item not found')
      res.status(204).end()
    } catch (err) {
      console.error(err)
      res.status(500).send('Server error')
    }
  })

module.exports = router
