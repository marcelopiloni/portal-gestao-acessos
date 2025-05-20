const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { logAction } = require('../utils/logger');

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Login de usuário
exports.login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    // Verificar se email e senha foram fornecidos
    if (!email || !senha) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, forneça email e senha'
      });
    }

    // Verificar se o usuário existe
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar se a senha está correta
    const senhaCorreta = await usuario.verificarSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar se o usuário está aprovado
    if (usuario.status !== 'aprovado') {
      return res.status(403).json({
        status: 'error',
        message: 'Seu cadastro ainda não foi aprovado ou foi rejeitado'
      });
    }

    // Gerar token JWT
    const token = generateToken(usuario.id);

    // Registrar ação no log
    await logAction(usuario.id, 'Login no sistema');

    // Enviar resposta
    res.status(200).json({
      status: 'success',
      token,
      data: {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          empresa_id: usuario.empresa_id
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Registro de usuário
exports.register = async (req, res, next) => {
  try {
    const { nome, email, senha, role } = req.body;

    // Verificar se o email já está em uso
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({
        status: 'error',
        message: 'Este email já está em uso'
      });
    }

    // Criar usuário (sempre com status pendente, exceto se for o primeiro admin)
    const isFirstUser = (await Usuario.count()) === 0;
    
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha_hash: senha,
      role: isFirstUser ? 'admin' : (role || 'operador'),
      status: isFirstUser ? 'aprovado' : 'pendente',
      criado_em: new Date()
    });

    // Registrar ação no log
    if (isFirstUser) {
      await logAction(novoUsuario.id, 'Registro como primeiro administrador');
    } else {
      await logAction(novoUsuario.id, 'Solicitação de registro');
    }

    // Enviar resposta
    res.status(201).json({
      status: 'success',
      message: isFirstUser 
        ? 'Administrador criado com sucesso' 
        : 'Cadastro realizado com sucesso. Aguarde aprovação.',
      data: {
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          status: novoUsuario.status,
          role: novoUsuario.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};