require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./db');

const loginRouter = require('./routes/loginroutes');
const todoRouter = require('./routes/todoroutes');


const app = express();
connectDB();

app.use(cors());
app.use(express.json());

//heath check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/user', loginRouter);
app.use('/todos', todoRouter);

//404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

//global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});