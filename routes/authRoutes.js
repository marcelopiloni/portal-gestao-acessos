const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validationMiddleware = require('../middleware/validation');

const router = express.Router();

// Validação para registro
const registerValidation = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'gerente', 'operador'])
    .withMessage('Role inválido. Use admin, gerente ou operador'),
  validationMiddleware
];

// Validação para login
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória'),
  validationMiddleware
];

// Rotas de autenticação
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/debug', authController.debug);

module.exports = router;