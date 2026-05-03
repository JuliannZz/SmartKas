const pool = require('../config/db');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

exports.getReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || 'monthly';

    let dateFilterContext = '';
    let groupByContext = '';
    let selectDateContext = '';

    if (period === 'weekly') {
      dateFilterContext = 't.transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)';
      selectDateContext = "DATE_FORMAT(t.transaction_date, '%a') as month, DAYOFWEEK(t.transaction_date) as month_num";
      groupByContext = 'month, month_num';
    } else if (period === 'monthly') {
      dateFilterContext = 'MONTH(t.transaction_date) = MONTH(CURRENT_DATE()) AND YEAR(t.transaction_date) = YEAR(CURRENT_DATE())';
      selectDateContext = "DATE_FORMAT(t.transaction_date, '%d %b') as month, DAY(t.transaction_date) as month_num";
      groupByContext = 'month, month_num';
    } else {
      dateFilterContext = 'YEAR(t.transaction_date) = YEAR(CURRENT_DATE())';
      selectDateContext = "DATE_FORMAT(t.transaction_date, '%b') as month, MONTH(t.transaction_date) as month_num";
      groupByContext = 'month, month_num';
    }

    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT t.id) as total_transactions, 
        SUM(ti.price * ti.quantity) as total_revenue,
        SUM(p.buy_price * ti.quantity) as total_expense
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      WHERE t.user_id = ? AND ${dateFilterContext}
    `, [userId]);

    const totalRevenue = stats[0].total_revenue || 0;
    const totalExpense = stats[0].total_expense || 0;
    const netProfit = totalRevenue - totalExpense;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    const query = `
      SELECT 
        ${selectDateContext},
        SUM(ti.price * ti.quantity) as pendapatan,
        SUM(p.buy_price * ti.quantity) as pengeluaran
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      WHERE t.user_id = ? AND ${dateFilterContext}
      GROUP BY ${groupByContext}
      ORDER BY month_num ASC
    `;
    const [monthlyData] = await pool.query(query, [userId]);

    const revenueData = monthlyData.map(item => {
      const rev = parseFloat(item.pendapatan) || 0;
      const pengeluaran = parseFloat(item.pengeluaran) || 0; 
      const profit = rev - pengeluaran;
      return {
        month: item.month,
        pendapatan: rev,
        pengeluaran: pengeluaran,
        profit: profit
      };
    });

    const profitTrend = revenueData.map(item => ({
      month: item.month,
      margin: item.pendapatan > 0 ? parseFloat(((item.profit / item.pendapatan) * 100).toFixed(1)) : 0
    }));

    res.status(200).json({
      totalRevenue: totalRevenue || 0,
      totalExpense: totalExpense || 0,
      netProfit: netProfit || 0,
      profitMargin: parseFloat(profitMargin) || 0,
      revenueData,
      profitTrend
    });
  } catch (error) {
    console.error('Get Report Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(total_amount) as total_revenue,
        COUNT(id) as total_transactions
      FROM transactions
      WHERE user_id = ?
      GROUP BY month
      ORDER BY month DESC
    `;
    const [reports] = await pool.query(query, [userId]);
    res.status(200).json(reports);
  } catch (error) {
    console.error('Monthly Report Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        p.name, 
        SUM(ti.quantity) as total_sold,
        SUM(ti.price * ti.quantity) as total_revenue
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      WHERE t.user_id = ?
      GROUP BY ti.product_id
      ORDER BY total_sold DESC
      LIMIT 5
    `;
    const [topProducts] = await pool.query(query, [userId]);
    res.status(200).json(topProducts);
  } catch (error) {
    console.error('Top Products Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.exportPdf = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT t.id, t.transaction_date, ti.quantity, ti.price as price_at_transaction, 
             (ti.price * ti.quantity) as total_price, p.name 
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC
    `;
    const [transactions] = await pool.query(query, [userId]);

    const doc = new PDFDocument();
    
    res.setHeader('Content-disposition', 'attachment; filename="transaction_report.pdf"');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(20).text('SmartKas - Transaction Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
    doc.moveDown();
    
    transactions.forEach((tx, index) => {
      doc.text(`${index + 1}. ${tx.name} | Qty: ${tx.quantity} | Total: Rp ${parseFloat(tx.total_price).toLocaleString('id-ID')} | Date: ${new Date(tx.transaction_date).toLocaleDateString()}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error('PDF Export Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT t.id, t.transaction_date, ti.quantity, ti.price as price_at_transaction, 
             (ti.price * ti.quantity) as total_price, p.name 
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC
    `;
    const [transactions] = await pool.query(query, [userId]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Transaksi');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Produk', key: 'name', width: 30 },
      { header: 'Qty', key: 'qty', width: 10 },
      { header: 'Total (Rp)', key: 'total', width: 20 },
      { header: 'Tanggal', key: 'date', width: 20 },
    ];

    transactions.forEach((tx, index) => {
      worksheet.addRow({
        no: index + 1,
        name: tx.name,
        qty: tx.quantity,
        total: parseFloat(tx.total_price),
        date: new Date(tx.transaction_date).toLocaleDateString()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-keuangan.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel Export Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
