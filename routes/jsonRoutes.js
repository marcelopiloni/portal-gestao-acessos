const express = require('express');
const jsonController = require('../controllers/jsonController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Proteção de rotas - autenticação obrigatória
router.use(authenticate);

// Rotas para simulação de JSON
router.get('/usuario', jsonController.getUsuarioJson);
router.get('/grupo', jsonController.getGrupoJson);

module.exports = router;