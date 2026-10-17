import 'fiboui/style.css'
import './site.css'
import { mount } from 'fiboui'
import { App } from './main/App'
import { startClock } from './modules/site/state'
import { bootHash } from './modules/site/Views/ui'

startClock()
mount('#root', App)
bootHash()
