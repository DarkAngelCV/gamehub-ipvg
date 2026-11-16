<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../services/api.js'

const torneos = ref([])
const cargando = ref(true)
const error = ref('')
const busqueda = ref('')
const filtroEstado = ref('Todos')

const torneosFiltrados = computed(() => {
  return torneos.value.filter((torneo) => {
    const texto = busqueda.value.toLowerCase()

    const coincideBusqueda =
      torneo.nombre?.toLowerCase().includes(texto) ||
      torneo.videojuego?.toLowerCase().includes(texto)

    const coincideEstado =
      filtroEstado.value === 'Todos' || torneo.estado === filtroEstado.value

    return coincideBusqueda && coincideEstado
  })
})

async function cargarTorneos() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await apiFetch('/torneos')

    torneos.value = Array.isArray(respuesta)
      ? respuesta
      : respuesta.value || []
  } catch (err) {
    error.value = err.message || 'No fue posible cargar los torneos.'
  } finally {
    cargando.value = false
  }
}

function formatearFecha(fecha) {
  if (!fecha) return 'No definida'

  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CL')
}

function claseEstado(estado) {
  const clases = {
    Pendiente: 'pendiente',
    'En curso': 'encurso',
    Finalizado: 'finalizado',
  }

  return clases[estado] || 'pendiente'
}

onMounted(cargarTorneos)
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <h1>Torneos</h1>
        <p>Explora y consulta los torneos disponibles en GameHub.</p>
      </div>

      <button class="refresh-button" @click="cargarTorneos">
        ↻ Actualizar
      </button>
    </div>

    <div class="filters">
      <input
        v-model="busqueda"
        type="search"
        placeholder="Buscar por torneo o videojuego..."
      />

      <select v-model="filtroEstado">
        <option>Todos</option>
        <option>Pendiente</option>
        <option>En curso</option>
        <option>Finalizado</option>
      </select>
    </div>

    <div v-if="cargando" class="message">
      Cargando torneos...
    </div>

    <div v-else-if="error" class="message error">
      {{ error }}
      <button @click="cargarTorneos">Reintentar</button>
    </div>

    <div v-else-if="torneosFiltrados.length === 0" class="message">
      No se encontraron torneos.
    </div>

    <div v-else class="tournament-grid">
      <article
        v-for="torneo in torneosFiltrados"
        :key="torneo.id"
        class="tournament-card"
      >
        <div class="card-top">

          <span class="status" :class="claseEstado(torneo.estado)">
            {{ torneo.estado }}
          </span>
        </div>

        <h2>{{ torneo.nombre }}</h2>
        <p class="game-name">{{ torneo.videojuego }}</p>

        <p class="description">
          {{ torneo.descripcion || 'Sin descripción disponible.' }}
        </p>

        <div class="tournament-details">
          <div>
            <span>Inicio</span>
            <strong>{{ formatearFecha(torneo.fechaInicio) }}</strong>
          </div>

          <div>
            <span>Finalización</span>
            <strong>{{ formatearFecha(torneo.fechaFin) }}</strong>
          </div>

          <div>
            <span>Capacidad máxima</span>
            <strong>{{ torneo.capacidadMaxima }} equipos</strong>
          </div>

          <div>
            <span>Cierre de inscripción</span>
            <strong>{{ formatearFecha(torneo.fechaCierreInscripcion) }}</strong>
          </div>
        </div>
      </article>
    </div>

    <div v-if="!cargando && !error" class="results-count">
      Mostrando {{ torneosFiltrados.length }} de {{ torneos.length }} torneos
    </div>
  </section>
</template>

<style scoped>
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.page-heading h1 {
  margin-bottom: 8px;
}

.refresh-button {
  padding: 11px 16px;
  border: 0;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
}

.filters input,
.filters select {
  padding: 12px 14px;
  border: 1px solid #dbe1ea;
  border-radius: 9px;
  background: white;
  color: #334155;
  font-size: 13px;
}

.filters input {
  flex: 1;
  min-width: 0;
}

.tournament-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 20px;
}

.tournament-card {
  padding: 23px;
  background: white;
  border: 1px solid #e8edf4;
  border-radius: 14px;
  box-shadow: 0 4px 15px #0f172a08;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 17px;
}

.game-icon {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  background: #eef2ff;
  border-radius: 11px;
  font-size: 21px;
}

.status {
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}

.pendiente {
  background: #fef3c7;
  color: #92400e;
}

.encurso {
  background: #dbeafe;
  color: #1d4ed8;
}

.finalizado {
  background: #dcfce7;
  color: #166534;
}

.tournament-card h2 {
  margin: 0 0 5px;
  color: #1e293b;
  font-size: 18px;
}

.game-name {
  margin: 0 0 12px;
  color: #4f46e5 !important;
  font-size: 12px;
  font-weight: 600;
}

.description {
  min-height: 42px;
  font-size: 12px;
}

.tournament-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
  padding-top: 17px;
  border-top: 1px solid #eef0f5;
}

.tournament-details div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tournament-details span {
  color: #94a3b8;
  font-size: 10px;
}

.tournament-details strong {
  color: #334155;
  font-size: 12px;
}

.message {
  padding: 25px;
  background: white;
  border-radius: 10px;
  color: #64748b;
  text-align: center;
}

.message.error {
  color: #b91c1c;
}

.message button {
  display: block;
  margin: 12px auto 0;
  padding: 9px 15px;
  border: 0;
  border-radius: 7px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

.results-count {
  margin-top: 20px;
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 600px) {
  .page-heading,
  .filters {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
