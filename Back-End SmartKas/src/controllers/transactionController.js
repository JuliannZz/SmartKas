const pool = require('../config/db');

exports.createTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { items, total, paymentMethod, cashAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    await connection.beginTransaction();

    const [txResult] = await connection.query(
      'INSERT INTO transactions (user_id, total_amount, payment_method, cash_amount) VALUES (?, ?, ?, ?)',
      [userId, total || 0, paymentMethod || 'cash', cashAmount || 0]
    );

    const transactionId = txResult.insertId;

    for (const item of items) {
      const [products] = await connection.query('SELECT * FROM products WHERE id = ? AND user_id = ? FOR UPDATE', [item.productId, userId]);
      
      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: `Product ID ${item.productId} not found` });
      }

      const product = products[0];

      if (product.stock < item.qty) {
        await connection.rollback();
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.productId]);

      await connection.query(
        'INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [transactionId, item.productId, item.qty, item.price]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Transaction completed successfully',
      id: transactionId,
      total
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create Transaction Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT t.id, t.total_amount, t.payment_method, t.transaction_date,
             COUNT(ti.id) as total_items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.user_id = ?
      GROUP BY t.id
      ORDER BY t.transaction_date DESC
    `;
    const [transactions] = await pool.query(query, [userId]);
    res.status(200).json({ data: transactions });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
