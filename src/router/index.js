// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import CategoriesList from '../components/CategoriesList.vue'
import CountriesList from '../components/CountryList.vue'
import LanguagesList from '../components/LanguagesList.vue'

const routes = [
  { path: '/categories', component: CategoriesList },
  { path: '/countries', component: CountriesList },
  { path: '/languages', component: LanguagesList },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
