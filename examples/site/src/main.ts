import 'fiboui/style.css'
import './site.css'
import { mount } from 'fiboui/core'
import { App } from './main/App'
import { startClock } from './modules/site/state'

startClock()
mount('#root', App)
