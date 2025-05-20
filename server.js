require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Definindo um valor fixo para o comportamento de sincronização
// Você pode optar por true ou false dependendo do comportamento desejado
const alterDatabase = false; // Defina como true se quiser alterar o banco de dados automaticamente

// Sync database models
sequelize.sync({ alter: alterDatabase })
  .then(() => {
    console.log('Database connected and synchronized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });