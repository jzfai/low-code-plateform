import { createApp } from 'vue';
import App from './App.vue';
const app = createApp(App);
import router from './router';
import '@/styles/index.scss';
import 'virtual:svg-icons-register';
import svgIcon from '@/icons/SvgIcon.vue';
import directive from '@/directives';
import './permission';
import './theme/index.scss';
import 'uno.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
app.use(ElementPlus);
app.component('SvgIcon', svgIcon);
directive(app);
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router).mount('#app');
