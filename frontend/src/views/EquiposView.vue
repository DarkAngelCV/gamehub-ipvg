<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../services/api.js'

const equipos = ref([])
const cargando = ref(true)
const error = ref('')
const busqueda = ref('')

const equiposFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  if (!texto) return equipos.value

  return equipos.value.filter((equipo) => {
    return (
      equipo.nombre?.toLowerCase().includes(texto) ||
      equipo.sigla?.toLowerCase().includes(texto) ||
      equipo.descripcion?.toLowerCase().includes(texto) ||
      equipo.capitan?.nombre?.toLowerCase().includes(texto)
    )
  })
})

async function cargarEquipos() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await apiFetch('/equipos')

    equipos.value = Array.isArray(respuesta)
      ? respuesta
      : respuesta.value || []
  } catch (err) {
    error.value = err.message || 'No se pudieron cargar los equipos'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarEquipos)
</script>

<template>
  <section class="equipos-page">
    <div class="encabezado">
      <div>
        <h1>Equipos</h1>
        <p>Consulta los equipos registrados en GameHub.</p>
      </div>

      <div class="contador">
        {{ equipos.length }} equipos registrados
      </div>
    </div>

    <div class="busqueda">
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar por nombre, sigla o capitán..."
      />
    </div>

    <div v-if="cargando" class="mensaje">
      Cargando equipos...
    </div>

    <div v-else-if="error" class="mensaje error">
      {{ error }}
      <button @click="cargarEquipos">Reintentar</button>
    </div>

    <div v-else-if="equiposFiltrados.length === 0" class="mensaje">
      {{ busqueda ? 'No se encontraron equipos.' : 'Todavía no hay equipos registrados.' }}
    </div>

    <div v-else class="equipos-grid">
      <article
        v-for="equipo in equiposFiltrados"
        :key="equipo.id"
        class="equipo-card"
      >
        <div class="equipo-superior">
          <div class="equipo-icono">
            {{ equipo.sigla?.substring(0, 2) || 'EQ' }}
          </div>

          <span class="equipo-sigla">{{ equipo.sigla }}</span>
        </div>

        <h2>{{ equipo.nombre }}</h2>

        <p class="descripcion">
          {{ equipo.descripcion || 'Sin descripción disponible.' }}
        </p>

        <div class="capitan">
          <span class="etiqueta">Capitán</span>
          <strong>{{ equipo.capitan?.nombre || 'No asignado' }}</strong>
          <small v-if="equipo.capitan?.email">
            {{ equipo.capitan.email }}
          </small>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.equipos-page {
  width: 100%;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 25px;
}

.encabezado h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.encabezado p {
  margin: 0;
  color: #94a3b8;
}

.contador {
  padding: 10px 15px;
  border-radius: 10px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 13px;
}

.busqueda {
  margin-bottom: 25px;
}

.busqueda input {
  width: 100%;
  max-width: 450px;
  padding: 13px 16px;
  border: 1px solid #334155;
  border-radius: 10px;
  outline: none;
  background: #1e293b;
  color: white;
  font-size: 14px;
}

.busqueda input:focus {
  border-color: #6366f1;
}

.equipos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.equipo-card {
  padding: 22px;
  border: 1px solid #334155;
  border-radius: 14px;
  background: #1e293b;
  transition: transform 0.2s, border-color 0.2s;
}

.equipo-card:hover {
  transform: translateY(-3px);
  border-color: #6366f1;
}

.equipo-superior {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.equipo-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #312e81;
  color: #c7d2fe;
  font-weight: bold;
  font-size: 16px;
}

.equipo-sigla {
  padding: 6px 10px;
  border-radius: 8px;
  background: #334155;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
}

.equipo-card h2 {
  margin: 0 0 10px;
  font-size: 19px;
  color: #ffffff;
  font-weight: 700;
}

.descripcion {
  min-height: 42px;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.5;
}

.descripcion {
  min-height: 42px;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
}

.capitan {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #334155;
}

.etiqueta {
  color: #94a3b8;
  font-size: 12px;
}

.capitan strong {
  color: #ffffff;
  font-size: 14px;
}

.capitan small {
  color: #94a3b8;
  font-size: 12px;
}

.mensaje {
  padding: 25px;
  border-radius: 12px;
  background: #1e293b;
  color: #cbd5e1;
  text-align: center;
}

.error {
  color: #fca5a5;
}

.error button {
  display: block;
  margin: 15px auto 0;
  padding: 9px 16px;
  border: none;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

@media (max-width: 600px) {
  .encabezado {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
