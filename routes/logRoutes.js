const express = require('express');
const logController = require('../controllers/logController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

const router = express.Router();

// Proteção de rotas - autenticação obrigatória
router.use(authenticate);

// Rota para listar logs (acessível para todos os papéis, mas com restrições implementadas no controller)
router.get('/', logController.getLogs);

module.exports = router;