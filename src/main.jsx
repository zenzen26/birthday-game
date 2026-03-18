import React from 'react'
import ReactDOM from 'react-dom/client'
import './preload.js'
import App from './App.jsx'
import WorldBuilder from './worldbuilder/WorldBuilder.jsx'

const isWorldBuilder = window.location.pathname === '/worldbuilder'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isWorldBuilder ? <WorldBuilder /> : <App />}
  </React.StrictMode>
)