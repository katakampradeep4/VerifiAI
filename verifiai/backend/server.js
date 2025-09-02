require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ruleRouter = require('./src/controllers/ruleController');
const checkRouter = require('./src/controllers/checkController');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error', err));

app.use('/api/rules', ruleRouter);
app.use('/api/check', checkRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Backend listening on ${PORT}`));
