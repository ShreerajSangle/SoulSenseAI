import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  user: 'soulsense_ai',
  host: 'localhost',
  database: 'soulsense_ai',
  password: 'admin',
  port: 5432,
  ssl: false,
});

client.connect()
  .then(() => {
    console.log('Successfully connected to PostgreSQL!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Query result:', res.rows[0]);
    return client.end();
  })
  .then(() => {
    console.log('Client disconnected.');
  })
  .catch(err => {
    console.error('PostgreSQL connection or query error:', err);
  });