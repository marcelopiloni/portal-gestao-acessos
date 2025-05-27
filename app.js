const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const logRoutes = require('./routes/logRoutes');
const jsonRoutes = require('./routes/jsonRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes da API
app.use('/api/auth', authRoutes); 
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/simulacao-json', jsonRoutes);

// ADICIONE ESTAS LINHAS PARA SERVIR O FRONTEND:

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Servir assets (CSS, JS, etc)
app.use('/assets', express.static(path.join(__dirname, 'src')));

// Rota catch-all para SPA (deve ser DEPOIS das rotas da API)
app.get('*', (req, res) => {
  // Se não for uma rota de API, serve o index.html
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    // Se for API e chegou aqui, é 404
    res.status(404).json({
      status: 'error',
      message: 'Rota não encontrada'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  res.status(statusCode).json({
    status: 'error',
    message
  });
});

module.exports = app;