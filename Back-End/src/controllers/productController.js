const pool = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT id, user_id, sku, category, name, description, 
             buy_price AS buyPrice, sell_price AS sellPrice, 
             stock, min_stock AS minStock, unit, created_at 
      FROM products 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    const [products] = await pool.query(query, [userId]);
    res.status(200).json({ data: products });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const query = `
      SELECT id, user_id, sku, category, name, description, 
             buy_price AS buyPrice, sell_price AS sellPrice, 
             stock, min_stock AS minStock, unit, created_at 
      FROM products 
      WHERE id = ? AND user_id = ?
    `;
    const [products] = await pool.query(query, [id, userId]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(products[0]);
  } catch (error) {
    console.error('Get Product By Id Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sku, category, name, description, buyPrice, sellPrice, stock, minStock, unit } = req.body;

    if (!name || sellPrice === undefined || !sku) {
      return res.status(400).json({ message: 'SKU, Name, and Sell Price are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO products (user_id, sku, category, name, description, buy_price, sell_price, stock, min_stock, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, sku, category || 'Semua', name, description || '', buyPrice || 0, sellPrice, stock || 0, minStock || 10, unit || 'Pcs']
    );

    res.status(201).json({
      message: 'Product created successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { sku, category, name, description, buyPrice, sellPrice, stock, minStock, unit } = req.body;

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    await pool.query(
      'UPDATE products SET sku = ?, category = ?, name = ?, description = ?, buy_price = ?, sell_price = ?, stock = ?, min_stock = ?, unit = ? WHERE id = ?',
      [sku, category || 'Semua', name, description || '', buyPrice || 0, sellPrice, stock || 0, minStock || 10, unit || 'Pcs', id]
    );

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
