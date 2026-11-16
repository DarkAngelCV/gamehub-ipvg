import { apiFetch } from './api.js'

export async function iniciarSesion(email, password) {
  const respuesta = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  localStorage.setItem('token', respuesta.access_token)
  localStorage.setItem('usuario', JSON.stringify(respuesta.usuario))

  return respuesta
}

export function obtenerUsuario() {
  const usuario = localStorage.getItem('usuario')

  return usuario ? JSON.parse(usuario) : null
}

export function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

export function estaAutenticado() {
  const token = localStorage.getItem('token')
  return Boolean(token && token !== 'undefined' && token !== 'null')
}
