import Vue from 'vue';
import VueResource from 'vue-resource';
import Element from 'element-ui';
import 'element-ui/lib/theme-default/index.css';
import App from './App.vue';

Vue.use(VueResource);
Vue.use(Element);

Vue.filter('shoft-hash', val => val.slice(0, 10));
Vue.filter('beautify-msg', val => {
  return val.indexOf('change') >= 0 ? new Date(val.slice(24)).toLocaleString()
                                    : new Date(val.slice(22)).toLocaleString();
});
Vue.filter('beautify-img', val => {
  return val.slice(0, 10);
});
Vue.filter('beautify-date', val => {
  return new Date(val).toLocaleString();
});

new Vue({
  el: '#app',
  render: h => h(App)
});
