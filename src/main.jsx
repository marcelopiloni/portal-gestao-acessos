import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Importar estilos globais
import './styles/variables.css'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)