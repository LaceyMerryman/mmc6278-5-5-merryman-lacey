const router = require('express').Router();
const db = require('./db');

// GET all inventory items
router.get('/inventory', async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM inventory');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST a new inventory item
router.post('/inventory', async (req, res) => {
  try {
    const { name, image, description, quantity, price } = req.body;
    await db.query(
      'INSERT INTO inventory (name, image, description, quantity, price) VALUES (?, ?, ?, ?, ?)',
      [name, image, description, quantity, price]
    );
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET single inventory item by id
router.get('/inventory/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inventory WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).send('Item not found');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PUT update an inventory item
router.put('/inventory/:id', async (req, res) => {
  try {
    const { name, image, description, quantity, price } = req.body;
    const [{ affectedRows }] = await db.query(
      `UPDATE inventory
       SET name = ?, image = ?, description = ?, quantity = ?, price = ?
       WHERE id = ?`,
      [name, image, description, quantity, price, req.params.id]
    );
    if (affectedRows === 0) return res.status(404).send('Item not found');
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE an inventory item
router.delete('/inventory/:id', async (req, res) => {
  try {
    const [{ affectedRows }] = await db.query(
      'DELETE FROM inventory WHERE id = ?',
      [req.params.id]
    );
    if (affectedRows === 0) return res.status(404).send('Item not found');
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET all cart items and total
router.get('/cart', async (req, res) => {
  try {
    const [cartItems] = await db.query(
  `SELECT
     cart.id,
     cart.inventory_id AS inventoryId,
     cart.quantity,
     inventory.price,
     inventory.name,
     inventory.image,
     inventory.quantity AS inventoryQuantity
   FROM cart
   INNER JOIN inventory ON cart.inventory_id = inventory.id
   ORDER BY cart.id`
  );

    const [[{ total }]] = await db.query(
      `SELECT SUM(cart.quantity * inventory.price) AS total
       FROM cart
       INNER JOIN inventory ON cart.inventory_id = inventory.id`
    );

    res.json({ cartItems, total: total || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST add item to cart
router.post('/cart', async (req, res) => {
  try {
    const { inventoryId, quantity } = req.body;

    const [[item]] = await db.query(
      `SELECT
         inventory.id,
         inventory.quantity AS inventoryQuantity,
         cart.id AS cartId
       FROM inventory
       LEFT JOIN cart ON cart.inventory_id = inventory.id
       WHERE inventory.id = ?`,
      [inventoryId]
    );

    if (!item) return res.status(404).send('Item not found');

    const { cartId, inventoryQuantity } = item;

    if (quantity > inventoryQuantity) return res.status(409).send('Not enough inventory');

    if (cartId) {
      await db.query(
        `UPDATE cart SET quantity = quantity + ? WHERE inventory_id = ?`,
        [quantity, inventoryId]
      );
    } else {
      await db.query(
        `INSERT INTO cart (inventory_id, quantity) VALUES (?, ?)`,
        [inventoryId, quantity]
      );
    }

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE all cart items (empty cart)
router.delete('/cart', async (req, res) => {
  try {
    await db.query('DELETE FROM cart');
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PUT update a cart item quantity
router.put('/cart/:cartId', async (req, res) => {
  try {
    const { quantity } = req.body;

    const [[cartItem]] = await db.query(
      `SELECT inventory.quantity AS inventoryQuantity
       FROM cart
       INNER JOIN inventory ON cart.inventory_id = inventory.id
       WHERE cart.id = ?`,
      [req.params.cartId]
    );

    if (!cartItem) return res.status(404).send('Cart item not found');

    const { inventoryQuantity } = cartItem;

    if (quantity > inventoryQuantity) return res.status(409).send('Not enough inventory');

    if (quantity > 0) {
      await db.query(
        `UPDATE cart SET quantity = ? WHERE id = ?`,
        [quantity, req.params.cartId]
      );
    } else {
      await db.query(
        `DELETE FROM cart WHERE id = ?`,
        [req.params.cartId]
      );
    }

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE a specific cart item
router.delete('/cart/:cartId', async (req, res) => {
  try {
    const [{ affectedRows }] = await db.query(
      `DELETE FROM cart WHERE id = ?`,
      [req.params.cartId]
    );

    if (affectedRows === 0) return res.status(404).send('Cart item not found');

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
