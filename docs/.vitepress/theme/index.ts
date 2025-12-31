
import DefaultTheme from 'vitepress/theme'
import ReactWrapper from './components/ReactWrapper.vue'
import '../../../src/styles/base.css' 
import '../../../src/styles/core.css' 
import '../../../src/styles/themes/web.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ReactWrapper', ReactWrapper)
  }
}
