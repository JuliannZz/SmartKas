const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function initDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
    });

    console.log('Connected to MySQL server.');

    const dbName = process.env.DB_NAME || 'smartkas_db';

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' created or already exists.`);

    await connection.query(`USE \`${dbName}\`;`);

    console.log('Dropping old tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('DROP TABLE IF EXISTS transaction_items;');
    await connection.query('DROP TABLE IF EXISTS transactions;');
    await connection.query('DROP TABLE IF EXISTS products;');
    await connection.query('DROP TABLE IF EXISTS users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        target_revenue DECIMAL(15,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await connection.query(createUsersTableQuery);
    console.log('Table `users` created.');

    const createProductsTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        sku VARCHAR(50) NOT NULL,
        category VARCHAR(100) DEFAULT 'Semua',
        name VARCHAR(255) NOT NULL,
        description TEXT,
        buy_price DECIMAL(15,2) NOT NULL DEFAULT 0,
        sell_price DECIMAL(15,2) NOT NULL DEFAULT 0,
        stock INT DEFAULT 0,
        min_stock INT DEFAULT 10,
        unit VARCHAR(50) DEFAULT 'Pcs',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await connection.query(createProductsTableQuery);
    console.log('Table `products` created.');

    // 5. Create Transactions table
    const createTransactionsTableQuery = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(15,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        cash_amount DECIMAL(15,2) NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await connection.query(createTransactionsTableQuery);
    console.log('Table `transactions` created.');

    // 6. Create Transaction Items table
    const createTransactionItemsTableQuery = `
      CREATE TABLE IF NOT EXISTS transaction_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `;
    await connection.query(createTransactionItemsTableQuery);
    console.log('Table `transaction_items` created.');

    await connection.end();
    console.log('Database initialization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDb();
