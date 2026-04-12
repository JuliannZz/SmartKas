const pool = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const date = new Date();
    const currentMonth = date.getMonth() + 1; 
    const currentYear = date.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const [revResult] = await pool.query(`
      SELECT 
        SUM(ti.price * ti.quantity) as total_sales,
        SUM(p.buy_price * ti.quantity) as total_expense
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      WHERE t.user_id = ?
    `, [userId]);

    const totalSales = revResult[0].total_sales || 0;
    const totalExpense = revResult[0].total_expense || 0;
    const netProfit = totalSales - totalExpense;
    const profitMargin = totalSales > 0 ? parseFloat(((netProfit / totalSales) * 100).toFixed(1)) : 0;

    const [curMonthRes] = await pool.query(`
      SELECT 
        SUM(ti.price * ti.quantity) as sales,
        SUM(p.buy_price * ti.quantity) as expense
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      WHERE t.user_id = ? AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?
    `, [userId, currentMonth, currentYear]);

    const [lastMonthRes] = await pool.query(`
      SELECT 
        SUM(ti.price * ti.quantity) as sales,
        SUM(p.buy_price * ti.quantity) as expense
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      WHERE t.user_id = ? AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?
    `, [userId, lastMonth, lastMonthYear]);

    const currentSales = curMonthRes[0].sales || 0;
    const currentExpense = curMonthRes[0].expense || 0;
    const currentProfit = currentSales - currentExpense;

    const lastSales = lastMonthRes[0].sales || 0;
    const lastExpense = lastMonthRes[0].expense || 0;
    const lastProfit = lastSales - lastExpense;

    let salesGrowth = 0;
    if (lastSales > 0) {
      salesGrowth = parseFloat((((currentSales - lastSales) / lastSales) * 100).toFixed(1));
    } else if (currentSales > 0) {
      salesGrowth = 100;
    }

    let profitGrowth = 0;
    if (lastProfit > 0) {
      profitGrowth = parseFloat((((currentProfit - lastProfit) / lastProfit) * 100).toFixed(1));
    } else if (currentProfit > 0) {
      profitGrowth = 100;
    }

    const [prodStats] = await pool.query(`
      SELECT 
        COUNT(id) as total_products,
        COUNT(DISTINCT category) as total_categories,
        SUM(CASE WHEN stock <= min_stock THEN 1 ELSE 0 END) as low_stock
      FROM products
      WHERE user_id = ?
    `, [userId]);

    res.status(200).json({
      totalSales,
      salesGrowth,
      totalProducts: prodStats[0].total_products || 0,
      totalCategories: prodStats[0].total_categories || 0,
      lowStock: prodStats[0].low_stock || 0,
      netProfit,
      profitMargin,
      profitGrowth
    });

  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSalesChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT 
        DATE_FORMAT(t.transaction_date, '%b') as month,
        MONTH(t.transaction_date) as month_num,
        SUM(ti.price * ti.quantity) as penjualan,
        SUM(p.buy_price * ti.quantity) as pembelian
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      WHERE t.user_id = ? AND YEAR(t.transaction_date) = YEAR(CURRENT_DATE())
      GROUP BY month, month_num
      ORDER BY month_num ASC
    `;
    const [data] = await pool.query(query, [userId]);
    res.status(200).json({ data });
  } catch (error) {
    console.error('getSalesChart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProfitChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT 
        DATE_FORMAT(t.transaction_date, '%b') as month,
        MONTH(t.transaction_date) as month_num,
        SUM(ti.price * ti.quantity) as pendapatan,
        SUM(p.buy_price * ti.quantity) as pengeluaran
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      WHERE t.user_id = ? AND YEAR(t.transaction_date) = YEAR(CURRENT_DATE())
      GROUP BY month, month_num
      ORDER BY month_num ASC
    `;
    const [rows] = await pool.query(query, [userId]);

    const data = rows.map(r => ({
      month: r.month,
      profit: parseFloat((r.pendapatan || 0) - (r.pengeluaran || 0))
    }));

    res.status(200).json({ data });
  } catch (error) {
    console.error('getProfitChart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const [transactions] = await pool.query(`
      SELECT 
        t.id,
        CONCAT('Penjualan #', t.id) as product,
        CONCAT(COUNT(ti.id), ' item') as qty,
        DATE_FORMAT(t.transaction_date, '%d %b %Y %H:%i') as time,
        t.total_amount as amount,
        'in' as type
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.user_id = ?
      GROUP BY t.id
      ORDER BY t.transaction_date DESC
      LIMIT 5
    `, [userId]);

    const [stockAlerts] = await pool.query(`
      SELECT 
        id,
        name as product,
        stock,
        min_stock as minStock,
        unit
      FROM products
      WHERE stock <= min_stock AND user_id = ?
      ORDER BY stock ASC
      LIMIT 4
    `, [userId]);

    res.status(200).json({
      transactions,
      stockAlerts
    });
  } catch (error) {
    console.error('getRecentTransactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStockStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();

    const [prodStats] = await pool.query(`
      SELECT 
        SUM(stock) as total_stock,
        SUM(CASE WHEN stock <= min_stock THEN 1 ELSE 0 END) as warnings
      FROM products
      WHERE user_id = ?
    `, [userId]);

    const [stockOutRes] = await pool.query(`
      SELECT SUM(ti.quantity) as stock_out
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.user_id = ? AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?
    `, [userId, currentMonth, currentYear]);

    const [stockInRes] = await pool.query(`
      SELECT SUM(stock) as stock_in
      FROM products
      WHERE user_id = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?
    `, [userId, currentMonth, currentYear]);

    const [movementOut] = await pool.query(`
      SELECT 
        DATE_FORMAT(t.transaction_date, '%b') as month,
        MONTH(t.transaction_date) as month_num,
        SUM(ti.quantity) as keluar
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.user_id = ? AND YEAR(t.transaction_date) = YEAR(CURRENT_DATE())
      GROUP BY month, month_num
    `, [userId]);

    const [movementIn] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        MONTH(created_at) as month_num,
        SUM(stock) as masuk
      FROM products
      WHERE user_id = ? AND YEAR(created_at) = YEAR(CURRENT_DATE())
      GROUP BY month, month_num
    `, [userId]);

    const monthsMap = {};
    const addMonth = (m, num) => {
      if (!monthsMap[num]) monthsMap[num] = { month: m, masuk: 0, keluar: 0 };
    };
    
    movementOut.forEach(item => {
      addMonth(item.month, item.month_num);
      monthsMap[item.month_num].keluar = parseInt(item.keluar) || 0;
    });

    movementIn.forEach(item => {
      addMonth(item.month, item.month_num);
      monthsMap[item.month_num].masuk = parseInt(item.masuk) || 0;
    });

    const stockMovement = Object.keys(monthsMap)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(k => monthsMap[k]);

    const [categoryRes] = await pool.query(`
      SELECT 
        category as name,
        CAST(SUM(stock) AS UNSIGNED) as value
      FROM products
      WHERE user_id = ?
      GROUP BY category
      HAVING value > 0
    `, [userId]);

    res.status(200).json({
      totalStock: parseInt(prodStats[0].total_stock) || 0,
      stockIn: parseInt(stockInRes[0].stock_in) || 0,
      stockOut: parseInt(stockOutRes[0].stock_out) || 0,
      warnings: parseInt(prodStats[0].warnings) || 0,
      stockMovement,
      categoryDistribution: categoryRes
    });
  } catch (error) {
    console.error('getStockStats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
