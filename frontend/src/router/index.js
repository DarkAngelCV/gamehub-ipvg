import { createRouter, createWebHistory } from 'vue-router'

import ResultadosView from '../views/ResultadosView.vue'
import PartidosView from '../views/PartidosView.vue'
import InscripcionesView from '../views/InscripcionesView.vue'
import InicioView from '../views/InicioView.vue'
import TorneosView from '../views/TorneosView.vue'
import EquiposView from '../views/EquiposView.vue'
import RankingView from '../views/RankingView.vue'
import LoginView from '../views/LoginView.vue'
import RegistroView from '../views/RegistroView.vue'

import { estaAutenticado, obtenerUsuario } from '../services/authService.js'

const routes = [
  {
  path: '/resultados',
  name: 'resultados',
  component: ResultadosView,
  },
  {
  path: '/partidos',
  name: 'partidos',
  component: PartidosView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { publico: true },
  },
  {
    path: '/registro',
    name: 'registro',
    component: RegistroView,
    meta: { publico: true },
  },
  {
    path: '/',
    name: 'inicio',
    component: InicioView,
  },
  {
    path: '/torneos',
    name: 'torneos',
    component: TorneosView,
  },
  {
    path: '/equipos',
    name: 'equipos',
    component: EquiposView,
  },
  {
    path: '/ranking',
    name: 'ranking',
    component: RankingView,
  },
  {
  path: '/inscripciones',
  name: 'inscripciones',
  component: InscripcionesView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const autenticado = estaAutenticado()

  if (to.meta.publico && autenticado) {
    return '/'
  }

  if (!to.meta.publico && !autenticado) {
    return '/login'
  }

  const usuario = obtenerUsuario()

  if (usuario && !['Admin', 'Student'].includes(usuario.rol)) {
    return '/login'
  }

  return true
})

export default router
