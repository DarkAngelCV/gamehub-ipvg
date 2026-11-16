const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...options.headers,
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos?.message)
      ? datos.message.join(', ')
      : datos?.message || 'Ocurrió un error al comunicarse con el servidor'

    throw new Error(mensaje)
  }

  return datos
}
