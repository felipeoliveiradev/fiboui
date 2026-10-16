import 'fiboui/style.css'
import './site.css'
import { mount } from 'fiboui'
import { App } from './main/App'
import { startClock } from './modules/site/state'

startClock()
mount('#root', App)
