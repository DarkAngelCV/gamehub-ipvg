<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../services/api.js'

const partidos = ref([])
const cargando = ref(true)
const error = ref('')
const busqueda = ref('')
const filtroEstado = ref('Todos')

const partidosFiltrados = computed(() => {
  return partidos.value.filter((partido) => {
    const texto = busqueda.value.toLowerCase()

    const coincideBusqueda =
      partido.torneo?.nombre?.toLowerCase().includes(texto) ||
      partido.equipoLocal?.nombre?.toLowerCase().includes(texto) ||
      partido.equipoVisitante?.nombre?.toLowerCase().includes(texto)

    const coincideEstado =
      filtroEstado.value === 'Todos' ||
      partido.estado === filtroEstado.value

    return coincideBusqueda && coincideEstado
  })
})

async function cargarPartidos() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await apiFetch('/partidos')

    partidos.value = Array.isArray(respuesta)
      ? respuesta
      : respuesta.value || []
  } catch (err) {
    error.value = err.message || 'No fue posible cargar los partidos.'
  } finally {
    cargando.value = false
  }
}

function formatearFecha(fecha) {
  if (!fecha) return 'No definida'

  const fechaLocal = new Date(fecha)

  if (Number.isNaN(fechaLocal.getTime())) return 'No definida'

  return fechaLocal.toLocaleString('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function claseEstado(estado) {
  const clases = {
    Pendiente: 'pendiente',
    'En curso': 'encurso',
    Finalizado: 'finalizado',
  }

  return clases[estado] || 'pendiente'
}

onMounted(cargarPartidos)
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <h1>Partidos</h1>
        <p>Consulta los enfrentamientos y el calendario de competencias de GameHub.</p>
      </div>

      <button class="refresh-button" @click="cargarPartidos">
        ↻ Actualizar
      </button>
    </div>

    <div class="filters">
      <input
        v-model="busqueda"
        type="search"
        placeholder="Buscar por torneo o equipo..."
      />

      <select v-model="filtroEstado">
        <option>Todos</option>
        <option>Pendiente</option>
        <option>En curso</option>
        <option>Finalizado</option>
      </select>
    </div>

    <div v-if="cargando" class="message">
      Cargando partidos...
    </div>

    <div v-else-if="error" class="message error">
      {{ error }}
      <button @click="cargarPartidos">Reintentar</button>
    </div>

    <div v-else-if="partidosFiltrados.length === 0" class="message">
      No se encontraron partidos.
    </div>

    <div v-else class="match-grid">
      <article
        v-for="partido in partidosFiltrados"
        :key="partido.id"
        class="match-card"
      >
        <div class="card-top">
          <span class="match-id">Partido #{{ partido.id }}</span>

          <span class="status" :class="claseEstado(partido.estado)">
            {{ partido.estado }}
          </span>
        </div>

        <p class="tournament-name">
          {{ partido.torneo?.nombre || 'Torneo no disponible' }}
        </p>

        <div class="teams">
          <div class="team">
            <span class="team-icon"></span>
            <strong>{{ partido.equipoLocal?.nombre || 'Equipo local' }}</strong>
            <small>LOCAL</small>
          </div>

          <span class="versus">VS</span>

          <div class="team">
            <span class="team-icon"></span>
            <strong>{{ partido.equipoVisitante?.nombre || 'Equipo visitante' }}</strong>
            <small>VISITANTE</small>
          </div>
        </div>

        <div class="match-details">
          <span>Fecha y hora del encuentro</span>
          <strong>{{ formatearFecha(partido.fechaPartido) }}</strong>
        </div>
      </article>
    </div>

    <div v-if="!cargando && !error" class="results-count">
      Mostrando {{ partidosFiltrados.length }} de {{ partidos.length }} partidos
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

.match-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

.match-card {
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
  gap: 10px;
  margin-bottom: 17px;
}

.match-id {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
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

.tournament-name {
  margin-bottom: 20px;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 600;
}

.teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 20px 10px;
  border-radius: 11px;
  background: #f8fafc;
}

.team {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
  text-align: center;
}

.team-icon {
  font-size: 25px;
}

.team strong {
  color: #1e293b;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.team small {
  color: #94a3b8;
  font-size: 9px;
  font-weight: 700;
}

.versus {
  color: #4f46e5;
  font-size: 12px;
  font-weight: 800;
}

.match-details {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 20px;
  padding-top: 17px;
  border-top: 1px solid #eef0f5;
}

.match-details span {
  color: #94a3b8;
  font-size: 10px;
}

.match-details strong {
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
