/// <reference types="vite/client" />
import { FiboApp, FiboThemeProvider } from 'fiboui'
import { App } from './main/App'
import 'fiboui/style.css'
import './style.css'

function Root() {
  return (
    <FiboThemeProvider>
      <App />
    </FiboThemeProvider>
  )
}

FiboApp().root(Root).mount('root')
