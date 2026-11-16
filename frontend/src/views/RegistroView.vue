<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../services/api.js'

const router = useRouter()

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmarPassword = ref('')

const cargando = ref(false)
const error = ref('')
const exito = ref('')

async function registrar() {
  error.value = ''
  exito.value = ''

  if (password.value !== confirmarPassword.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  cargando.value = true

  try {
    await apiFetch('/usuarios', {
      method: 'POST',
      body: JSON.stringify({
        nombre: nombre.value,
        email: email.value,
        password: password.value,
      }),
    })

    exito.value = 'Cuenta creada correctamente. Ahora puedes iniciar sesión.'

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (err) {
    error.value = err.message || 'No fue posible crear la cuenta.'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <main class="register-page">
    <section class="register-card">

      <h1>Crear cuenta</h1>
      <p class="subtitle">Únete a GameHub IPVG</p>

      <form @submit.prevent="registrar">
        <label for="nombre">Nombre completo</label>
        <input
          id="nombre"
          v-model.trim="nombre"
          type="text"
          placeholder="Tu nombre"
          minlength="3"
          required
        />

        <label for="email">Correo electrónico</label>
        <input
          id="email"
          v-model.trim="email"
          type="email"
          placeholder="usuario@gamehub.cl"
          required
        />

        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          minlength="6"
          required
        />

        <label for="confirmar">Confirmar contraseña</label>
        <input
          id="confirmar"
          v-model="confirmarPassword"
          type="password"
          placeholder="Repite tu contraseña"
          required
        />

        <p v-if="error" class="message error" role="alert">
          {{ error }}
        </p>

        <p v-if="exito" class="message success" role="status">
          {{ exito }}
        </p>

        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Registrando...' : 'Crear cuenta' }}
        </button>
      </form>

      <p class="login-text">
        ¿Ya tienes cuenta?
        <RouterLink to="/login">Iniciar sesión</RouterLink>
      </p>

      <span class="institution">
        Instituto Profesional Virginio Gómez · Chillán
      </span>
    </section>
  </main>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #111827, #312e81);
  font-family: Inter, sans-serif;
}

.register-card {
  width: 100%;
  max-width: 440px;
  padding: 35px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 60px #0004;
}

.brand-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  margin: 0 auto 15px;
  background: #eef2ff;
  border-radius: 15px;
  font-size: 27px;
}

h1 {
  margin: 0;
  text-align: center;
  color: #111827;
  font-size: 25px;
}

.subtitle {
  margin: 9px 0 24px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  margin-top: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

input {
  padding: 12px;
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
  margin-top: 12px;
  padding: 13px;
  border: 0;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  padding: 10px;
  border-radius: 7px;
  font-size: 12px;
}

.error {
  background: #fee2e2;
  color: #b91c1c;
}

.success {
  background: #dcfce7;
  color: #166534;
}

.login-text {
  margin-top: 22px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}

.login-text a {
  color: #4f46e5;
  font-weight: 700;
  text-decoration: none;
}

.institution {
  display: block;
  margin-top: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 10px;
}
</style>
