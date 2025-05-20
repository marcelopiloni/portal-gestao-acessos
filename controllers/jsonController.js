// Endpoint para simular JSON de usuários
exports.getUsuarioJson = (req, res) => {
  // Dados de exemplo para simulação
  const usuarioJson = {
    id: "usr_123456",
    displayName: "Usuário de Exemplo",
    email: "usuario@exemplo.com",
    groups: [
      {
        id: "grp_001",
        name: "Grupo Financeiro"
      },
      {
        id: "grp_002",
        name: "Grupo Administrativo"
      }
    ],
    attributes: {
      departamento: "TI",
      cargo: "Analista",
      dataAdmissao: "2023-01-15"
    },
    active: true,
    createdAt: "2023-01-10T08:30:00Z",
    lastLogin: "2023-06-20T14:45:30Z"
  };

  res.status(200).json(usuarioJson);
};

// Endpoint para simular JSON de grupos
exports.getGrupoJson = (req, res) => {
  // Dados de exemplo para simulação
  const grupoJson = {
    id: "grp_001",
    name: "Grupo Financeiro",
    description: "Grupo para usuários do departamento financeiro",
    members: [
      {
        id: "usr_123456",
        displayName: "Usuário de Exemplo",
        email: "usuario@exemplo.com"
      },
      {
        id: "usr_789012",
        displayName: "Outro Usuário",
        email: "outro@exemplo.com"
      }
    ],
    permissions: [
      "ler_relatorios",
      "aprovar_despesas",
      "visualizar_dashboards"
    ],
    createdAt: "2023-01-05T10:15:00Z",
    updatedAt: "2023-05-12T16:20:00Z",
    active: true
  };

  res.status(200).json(grupoJson);
};