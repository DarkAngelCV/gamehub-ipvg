<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../services/api.js'
import { obtenerUsuario } from '../services/authService.js'

const inscripciones = ref([])
const cargando = ref(true)
const error = ref('')
const busqueda = ref('')
const filtroEstado = ref('Todos')
const usuario = obtenerUsuario()
const esAdmin = usuario?.rol === 'Admin'
const procesando = ref(null)

const inscripcionesFiltradas = computed(() => {
  return inscripciones.value.filter((inscripcion) => {
    const texto = busqueda.value.toLowerCase()

    const coincideBusqueda =
      inscripcion.equipo?.nombre?.toLowerCase().includes(texto) ||
      inscripcion.torneo?.nombre?.toLowerCase().includes(texto)

    const coincideEstado =
      filtroEstado.value === 'Todos' ||
      inscripcion.estado === filtroEstado.value

    return coincideBusqueda && coincideEstado
  })
})

async function cargarInscripciones() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await apiFetch('/inscripciones')

    inscripciones.value = Array.isArray(respuesta)
      ? respuesta
      : respuesta.value || []
  } catch (err) {
    error.value = err.message || 'No fue posible cargar las inscripciones.'
  } finally {
    cargando.value = false
  }
}

async function actualizarEstado(inscripcion, estado) {
  const accion = estado === 'Aprobada' ? 'aprobar' : 'rechazar'

  if (!confirm(`¿Deseas ${accion} esta inscripción?`)) return

  procesando.value = inscripcion.id
  error.value = ''

  try {
    await apiFetch(`/inscripciones/${inscripcion.id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    })

    await cargarInscripciones()
  } catch (err) {
    error.value = err.message || 'No fue posible actualizar la inscripción.'
  } finally {
    procesando.value = null
  }
}

async function eliminarInscripcion(inscripcion) {
  if (!confirm('¿Estás seguro de eliminar esta inscripción?')) return

  procesando.value = inscripcion.id
  error.value = ''

  try {
    await apiFetch(`/inscripciones/${inscripcion.id}`, {
      method: 'DELETE',
    })

    await cargarInscripciones()
  } catch (err) {
    error.value = err.message || 'No fue posible eliminar la inscripción.'
  } finally {
    procesando.value = null
  }
}

function formatearFecha(fecha) {
  if (!fecha) return 'No definida'

  return new Date(fecha).toLocaleDateString('es-CL')
}

function claseEstado(estado) {
  const clases = {
    Pendiente: 'pendiente',
    Aprobada: 'aprobada',
    Rechazada: 'rechazada',
  }

  return clases[estado] || 'pendiente'
}

onMounted(cargarInscripciones)
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <h1>Inscripciones</h1>
        <p>Consulta y administra las inscripciones de los equipos a los torneos.</p>
      </div>

      <button class="refresh-button" @click="cargarInscripciones">
        ↻ Actualizar
      </button>
    </div>

    <div class="filters">
      <input
        v-model="busqueda"
        type="search"
        placeholder="Buscar por equipo o torneo..."
      />

      <select v-model="filtroEstado">
        <option>Todos</option>
        <option>Pendiente</option>
        <option>Aprobada</option>
        <option>Rechazada</option>
      </select>
    </div>

    <div v-if="cargando" class="message">
      Cargando inscripciones...
    </div>

    <div v-else-if="error" class="message error">
      {{ error }}
      <button @click="cargarInscripciones">Reintentar</button>
    </div>

    <div v-else-if="inscripcionesFiltradas.length === 0" class="message">
      No se encontraron inscripciones.
    </div>

    <div v-else class="inscription-grid">
      <article
        v-for="inscripcion in inscripcionesFiltradas"
        :key="inscripcion.id"
        class="inscription-card"
      >
        <div class="card-top">
          <span class="inscription-id">Inscripción #{{ inscripcion.id }}</span>

          <span class="status" :class="claseEstado(inscripcion.estado)">
            {{ inscripcion.estado }}
          </span>
        </div>

        <h2>{{ inscripcion.equipo?.nombre || 'Equipo no disponible' }}</h2>
        <p class="tournament-name">
         {{ inscripcion.torneo?.nombre || 'Torneo no disponible' }}
        </p>

        <div class="inscription-details">
          <div>
            <span>Sigla del equipo</span>
            <strong>{{ inscripcion.equipo?.sigla || 'No disponible' }}</strong>
          </div>

          <div>
            <span>Fecha de inscripción</span>
            <strong>{{ formatearFecha(inscripcion.fechaInscripcion) }}</strong>
          </div>
        </div>

        <div v-if="esAdmin" class="admin-actions">
          <button
            v-if="inscripcion.estado !== 'Aprobada'"
            class="approve-button"
            :disabled="procesando === inscripcion.id"
            @click="actualizarEstado(inscripcion, 'Aprobada')"
          >
            Aprobar
          </button>

          <button
            v-if="inscripcion.estado !== 'Rechazada'"
            class="reject-button"
            :disabled="procesando === inscripcion.id"
            @click="actualizarEstado(inscripcion, 'Rechazada')"
          >
            Rechazar
          </button>

          <button
            class="delete-button"
            :disabled="procesando === inscripcion.id"
            @click="eliminarInscripcion(inscripcion)"
          >
            Eliminar
          </button>
        </div>
      </article>
    </div>

    <div v-if="!cargando && !error" class="results-count">
      Mostrando {{ inscripcionesFiltradas.length }} de
      {{ inscripciones.length }} inscripciones
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

.inscription-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 20px;
}

.inscription-card {
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

.inscription-id {
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

.aprobada {
  background: #dcfce7;
  color: #166534;
}

.rechazada {
  background: #fee2e2;
  color: #b91c1c;
}

.inscription-card h2 {
  margin: 0 0 8px;
  color: #1e293b;
  font-size: 18px;
}

.tournament-name {
  color: #4f46e5;
  font-size: 12px;
  font-weight: 600;
}

.inscription-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
  padding-top: 17px;
  border-top: 1px solid #eef0f5;
}

.inscription-details div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.inscription-details span {
  color: #94a3b8;
  font-size: 10px;
}

.inscription-details strong {
  color: #334155;
  font-size: 12px;
}

.admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eef0f5;
}

.admin-actions button {
  flex: 1;
  padding: 9px 10px;
  border: 0;
  border-radius: 7px;
  color: white;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.admin-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.approve-button {
  background: #16a34a;
}

.reject-button {
  background: #d97706;
}

.delete-button {
  background: #dc2626;
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
