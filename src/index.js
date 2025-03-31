import express from 'express';
import connectDB from './config/dbConfig.js';
import { PORT } from './config/serverConfig.js';

const app = express();

app.get('/', (req, res) => {
  return res.send('hello');
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDB();
});
