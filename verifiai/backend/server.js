require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routers
const ruleRouter = require('./src/controllers/ruleController');
const checkRouter = require('./src/controllers/checkController');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error', err));

// Routes
app.use('/api/rules', ruleRouter);

// 🔑 Make sure compliance endpoint matches frontend
app.use('/api/compliance', checkRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend listening on port ${PORT}`));
