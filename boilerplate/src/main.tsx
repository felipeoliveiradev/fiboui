import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './main/App'
import { FiboThemeProvider } from 'fiboui'
import 'fiboui/dist/style.css'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FiboThemeProvider>
      <App />
    </FiboThemeProvider>
  </React.StrictMode>,
)
