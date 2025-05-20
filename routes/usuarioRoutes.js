const express = require('express');
const { body } = require('express-validator');
const usuarioController = require('../controllers/usuarioController');
const { authenticate } = require('../middleware/auth');
const { authorize, sameCompany } = require('../middleware/roles');
const validationMiddleware = require('../middleware/validation');

const router = express.Router();

// Proteção de rotas - autenticação obrigatória
router.use(authenticate);

// Validação para aprovar/rejeitar usuário
const statusValidation = [
  body('status')
    .isIn(['aprovado', 'rejeitado'])
    .withMessage('Status inválido. Use aprovado ou rejeitado'),
  validationMiddleware
];

// Validação para associar empresa
const empresaValidation = [
  body('empresa_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('ID da empresa deve ser um número inteiro'),
  validationMiddleware
];

// Rota para obter informações do usuário logado
router.get('/me', usuarioController.getMe);

// Rotas para gerenciar usuários
router.get('/', authorize('admin', 'gerente'), usuarioController.getUsuarios);
router.get('/:id', sameCompany, usuarioController.getUsuario);
router.patch(
  '/:id/aprovar', 
  authorize('admin', 'gerente'), 
  statusValidation,
  usuarioController.aprovarUsuario
);
router.patch(
  '/:id/empresa', 
  authorize('admin'), 
  empresaValidation,
  usuarioController.associarEmpresa
);

module.exports = router;