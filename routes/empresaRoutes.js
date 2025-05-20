const express = require('express');
const { body } = require('express-validator');
const empresaController = require('../controllers/empresaController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const validationMiddleware = require('../middleware/validation');

const router = express.Router();

// Proteção de rotas - autenticação obrigatória
router.use(authenticate);

// Validação para criar/atualizar empresa
const empresaValidation = [
  body('nome').notEmpty().withMessage('Nome da empresa é obrigatório'),
  body('localizacao').optional(),
  validationMiddleware
];

// Rotas para gerenciar empresas
router.get('/', authorize('admin', 'gerente'), empresaController.getEmpresas);
router.get('/:id', authorize('admin', 'gerente'), empresaController.getEmpresa);

// Rotas restritas a administradores
router.post('/', authorize('admin'), empresaValidation, empresaController.createEmpresa);
router.put('/:id', authorize('admin'), empresaValidation, empresaController.updateEmpresa);
router.delete('/:id', authorize('admin'), empresaController.deleteEmpresa);

module.exports = router;