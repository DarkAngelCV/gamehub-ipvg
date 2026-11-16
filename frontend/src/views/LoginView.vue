<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { iniciarSesion } from '../services/authService.js'

const router = useRouter()

const email = ref('')
const password = ref('')
const cargando = ref(false)
const error = ref('')

async function ingresar() {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Completa tu correo electrónico y contraseña.'
    return
  }

  cargando.value = true

  try {
    await iniciarSesion(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message || 'No fue posible iniciar sesión.'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">


      <h1>GameHub IPVG</h1>
      <p class="subtitle">Plataforma de torneos de videojuegos</p>

      <form @submit.prevent="ingresar">
        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          placeholder="usuario@gamehub.cl"
          autocomplete="username"
          required
        />

        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Ingresa tu contraseña"
          autocomplete="current-password"
          required
        />

        <p v-if="error" class="error-message" role="alert">
          {{ error }}
        </p>

        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="register-text">
        ¿No tienes cuenta?
        <RouterLink to="/registro">Crear cuenta</RouterLink>
      </p>

      <span class="institution">Instituto Profesional Virginio Gómez · Chillán</span>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #111827, #312e81);
  font-family: Inter, sans-serif;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 38px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 60px #0004;
}

.brand-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin: 0 auto 18px;
  background: #eef2ff;
  border-radius: 16px;
  font-size: 28px;
}

h1 {
  margin: 0;
  text-align: center;
  color: #111827;
  font-size: 26px;
}

.subtitle {
  margin: 10px 0 30px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

label {
  margin-top: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

input {
  padding: 13px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
}

input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px #4f46e51a;
}

button {
  margin-top: 15px;
  padding: 14px;
  border: 0;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

button:hover {
  background: #4338ca;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 10px;
  border-radius: 7px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 13px;
}

.register-text {
  margin-top: 25px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}

.register-text a {
  color: #4f46e5;
  font-weight: 700;
  text-decoration: none;
}

.institution {
  display: block;
  margin-top: 28px;
  text-align: center;
  color: #94a3b8;
  font-size: 10px;
}
</style>
