<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../services/api.js'
import { obtenerUsuario } from '../services/authService.js'

const usuario = obtenerUsuario()
const esAdmin = usuario?.rol === 'Admin'

const partidos = ref([])
const torneos = ref([])
const equipos = ref([])
const resultados = ref([])

const cargando = ref(true)
const guardando = ref(false)
const error = ref('')
const mensaje = ref('')
const busqueda = ref('')
const filtroEstado = ref('Todos')
const mostrarFormulario = ref(false)

const formulario = ref({
  torneoId: '',
  equipoLocalId: '',
  equipoVisitanteId: '',
  fechaPartido: '',
})

const partidosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  return partidos.value.filter((partido) => {
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

function obtenerResultado(partidoId) {
  return resultados.value.find(
    (resultado) => resultado.partido?.id === partidoId,
  )
}

async function cargarDatos() {
  cargando.value = true
  error.value = ''

  try {
    const solicitudes = [
      apiFetch('/partidos'),
      apiFetch('/torneos'),
      apiFetch('/equipos'),
      apiFetch('/resultados'),
    ]

    const [respuestaPartidos, respuestaTorneos, respuestaEquipos, respuestaResultados] =
      await Promise.all(solicitudes)

    partidos.value = Array.isArray(respuestaPartidos)
      ? respuestaPartidos
      : respuestaPartidos?.value || []

    torneos.value = Array.isArray(respuestaTorneos)
      ? respuestaTorneos
      : respuestaTorneos?.value || []

    equipos.value = Array.isArray(respuestaEquipos)
      ? respuestaEquipos
      : respuestaEquipos?.value || []

    resultados.value = Array.isArray(respuestaResultados)
      ? respuestaResultados
      : respuestaResultados?.value || []
  } catch (err) {
    error.value = err.message || 'No fue posible cargar la información.'
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

function limpiarFormulario() {
  formulario.value = {
    torneoId: '',
    equipoLocalId: '',
    equipoVisitanteId: '',
    fechaPartido: '',
  }
}

async function crearPartido() {
  mensaje.value = ''
  error.value = ''

  if (
    !formulario.value.torneoId ||
    !formulario.value.equipoLocalId ||
    !formulario.value.equipoVisitanteId ||
    !formulario.value.fechaPartido
  ) {
    error.value = 'Completa todos los campos del formulario.'
    return
  }

  if (
    formulario.value.equipoLocalId ===
    formulario.value.equipoVisitanteId
  ) {
    error.value = 'Los equipos local y visitante deben ser diferentes.'
    return
  }

  guardando.value = true

  try {
    await apiFetch('/partidos', {
      method: 'POST',
      body: JSON.stringify({
        torneoId: Number(formulario.value.torneoId),
        equipoLocalId: Number(formulario.value.equipoLocalId),
        equipoVisitanteId: Number(formulario.value.equipoVisitanteId),
        fechaPartido: new Date(formulario.value.fechaPartido).toISOString(),
      }),
    })

    mensaje.value = 'Partido creado correctamente.'
    limpiarFormulario()
    mostrarFormulario.value = false
    await cargarDatos()
  } catch (err) {
    error.value = err.message || 'No fue posible crear el partido.'
  } finally {
    guardando.value = false
  }
}

async function actualizarEstado(partido, nuevoEstado) {
  if (partido.estado === nuevoEstado) return

  error.value = ''
  mensaje.value = ''

  try {
    await apiFetch(`/partidos/${partido.id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado }),
    })

    mensaje.value = 'Estado del partido actualizado correctamente.'
    await cargarDatos()
  } catch (err) {
    error.value = err.message || 'No fue posible actualizar el estado.'
  }
}

async function eliminarPartido(partido) {
  const confirmar = window.confirm(
    `¿Estás seguro de eliminar el partido entre ${partido.equipoLocal?.nombre} y ${partido.equipoVisitante?.nombre}?`,
  )

  if (!confirmar) return

  error.value = ''
  mensaje.value = ''

  try {
    await apiFetch(`/partidos/${partido.id}`, {
      method: 'DELETE',
    })

    mensaje.value = 'Partido eliminado correctamente.'
    await cargarDatos()
  } catch (err) {
    error.value = err.message || 'No fue posible eliminar el partido.'
  }
}

onMounted(cargarDatos)
</script>

<template>
  <section class="partidos-page">
    <header class="encabezado">
      <div>
        <span class="subtitulo">COMPETICIONES</span>
        <h1>Partidos</h1>
        <p>Consulta y administra los enfrentamientos de GameHub.</p>
      </div>

      <div class="acciones-header">
        <button class="btn-secundario" @click="cargarDatos">
          Actualizar
        </button>

        <button
          v-if="esAdmin"
          class="btn-principal"
          @click="mostrarFormulario = !mostrarFormulario"
        >
          {{ mostrarFormulario ? 'Cancelar' : 'Crear partido' }}
        </button>
      </div>
    </header>

    <div v-if="mensaje" class="mensaje exito">
      {{ mensaje }}
    </div>

    <div v-if="error" class="mensaje error">
      {{ error }}
    </div>

    <form
      v-if="esAdmin && mostrarFormulario"
      class="formulario"
      @submit.prevent="crearPartido"
    >
      <h2>Registrar nuevo partido</h2>

      <div class="form-grid">
        <div class="campo">
          <label for="torneo">Torneo</label>
          <select id="torneo" v-model="formulario.torneoId" required>
            <option value="" disabled>Seleccionar torneo</option>
            <option
              v-for="torneo in torneos"
              :key="torneo.id"
              :value="torneo.id"
            >
              {{ torneo.nombre }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label for="equipoLocal">Equipo local</label>
          <select
            id="equipoLocal"
            v-model="formulario.equipoLocalId"
            required
          >
            <option value="" disabled>Seleccionar equipo</option>
            <option
              v-for="equipo in equipos"
              :key="equipo.id"
              :value="equipo.id"
            >
              {{ equipo.nombre }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label for="equipoVisitante">Equipo visitante</label>
          <select
            id="equipoVisitante"
            v-model="formulario.equipoVisitanteId"
            required
          >
            <option value="" disabled>Seleccionar equipo</option>
            <option
              v-for="equipo in equipos"
              :key="equipo.id"
              :value="equipo.id"
              :disabled="equipo.id === Number(formulario.equipoLocalId)"
            >
              {{ equipo.nombre }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label for="fechaPartido">Fecha y hora</label>
          <input
            id="fechaPartido"
            v-model="formulario.fechaPartido"
            type="datetime-local"
            required
          />
        </div>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn-secundario"
          @click="limpiarFormulario"
        >
          Limpiar
        </button>

        <button
          type="submit"
          class="btn-principal"
          :disabled="guardando"
        >
          {{ guardando ? 'Guardando...' : 'Registrar partido' }}
        </button>
      </div>
    </form>

    <div class="filtros">
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

    <div v-if="cargando" class="mensaje">
      Cargando partidos...
    </div>

    <div v-else-if="partidosFiltrados.length === 0" class="mensaje">
      No se encontraron partidos.
    </div>

    <div v-else class="partidos-grid">
      <article
        v-for="partido in partidosFiltrados"
        :key="partido.id"
        class="partido-card"
      >
        <div class="card-top">
          <span class="partido-id">Partido #{{ partido.id }}</span>

          <span class="estado" :class="claseEstado(partido.estado)">
            {{ partido.estado }}
          </span>
        </div>

        <p class="torneo-nombre">
          {{ partido.torneo?.nombre || 'Torneo no disponible' }}
        </p>

        <div class="equipos">
          <div class="equipo">
            <strong>
              {{ partido.equipoLocal?.nombre || 'Equipo local' }}
            </strong>
            <small>LOCAL</small>
            <span v-if="obtenerResultado(partido.id)" class="marcador">
              {{ obtenerResultado(partido.id).puntosLocal }}
            </span>
          </div>

          <span class="versus">VS</span>

          <div class="equipo">
            <strong>
              {{ partido.equipoVisitante?.nombre || 'Equipo visitante' }}
            </strong>
            <small>VISITANTE</small>
            <span v-if="obtenerResultado(partido.id)" class="marcador">
              {{ obtenerResultado(partido.id).puntosVisitante }}
            </span>
          </div>
        </div>

        <div class="detalle">
          <span>Fecha y hora del encuentro</span>
          <strong>{{ formatearFecha(partido.fechaPartido) }}</strong>
        </div>

        <div v-if="obtenerResultado(partido.id)" class="ganador">
          Resultado: {{ obtenerResultado(partido.id).ganador }}
        </div>

        <div v-if="esAdmin" class="administracion">
          <label :for="`estado-${partido.id}`">Cambiar estado</label>

          <select
            :id="`estado-${partido.id}`"
            :value="partido.estado"
            @change="actualizarEstado(partido, $event.target.value)"
          >
            <option>Pendiente</option>
            <option>En curso</option>
            <option>Finalizado</option>
          </select>

          <button
            class="btn-eliminar"
            @click="eliminarPartido(partido)"
          >
            Eliminar partido
          </button>
        </div>
      </article>
    </div>

    <div v-if="!cargando" class="contador">
      Mostrando {{ partidosFiltrados.length }} de {{ partidos.length }} partidos
    </div>
  </section>
</template>

<style scoped>
.partidos-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: #f1f5f9;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.subtitulo {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.encabezado h1 {
  margin: 7px 0;
  font-size: 28px;
}

.encabezado p {
  margin: 0;
  color: #94a3b8;
}

.acciones-header,
.form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-principal,
.btn-secundario,
.btn-eliminar {
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-principal {
  background: #4f46e5;
  color: white;
}

.btn-principal:hover {
  background: #4338ca;
}

.btn-principal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secundario {
  border: 1px solid #334155;
  background: #1e293b;
  color: #e2e8f0;
}

.btn-eliminar {
  width: 100%;
  margin-top: 10px;
  background: #7f1d1d;
  color: white;
}

.formulario {
  padding: 22px;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #1e293b;
}

.formulario h2 {
  margin: 0 0 20px;
  font-size: 19px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.campo label,
.administracion label {
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 600;
}

.campo input,
.campo select,
.filtros input,
.filtros select,
.administracion select {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  border: 1px solid #475569;
  border-radius: 8px;
  outline: none;
  background: #0f172a;
  color: white;
}

.campo input:focus,
.campo select:focus,
.filtros input:focus,
.filtros select:focus {
  border-color: #6366f1;
}

.form-actions {
  justify-content: flex-end;
  margin-top: 20px;
}

.filtros {
  display: flex;
  gap: 12px;
}

.filtros input {
  flex: 1;
  min-width: 0;
}

.filtros select {
  width: 180px;
}

.partidos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px;
}

.partido-card {
  padding: 21px;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #1e293b;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.partido-id {
  color: #94a3b8;
  font-size: 11px;
}

.estado {
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}

.pendiente {
  background: #854d0e;
  color: #fef3c7;
}

.encurso {
  background: #1e40af;
  color: #dbeafe;
}

.finalizado {
  background: #14532d;
  color: #bbf7d0;
}

.torneo-nombre {
  margin-bottom: 18px;
  color: #a5b4fc;
  font-size: 13px;
  font-weight: 600;
}

.equipos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 10px;
  border-radius: 10px;
  background: #0f172a;
}

.equipo {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
  text-align: center;
}

.equipo strong {
  color: #f8fafc;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.equipo small {
  color: #94a3b8;
  font-size: 9px;
  font-weight: 700;
}

.marcador {
  color: #a5b4fc;
  font-size: 25px;
  font-weight: 800;
}

.versus {
  color: #818cf8;
  font-size: 12px;
  font-weight: 800;
}

.detalle {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 18px;
  padding-top: 15px;
  border-top: 1px solid #334155;
}

.detalle span {
  color: #94a3b8;
  font-size: 11px;
}

.detalle strong {
  color: #e2e8f0;
  font-size: 12px;
}

.ganador {
  margin-top: 14px;
  padding: 10px;
  border-radius: 7px;
  background: #14532d;
  color: #bbf7d0;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.administracion {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 18px;
  padding-top: 15px;
  border-top: 1px solid #334155;
}

.mensaje {
  padding: 20px;
  border: 1px solid #334155;
  border-radius: 10px;
  background: #1e293b;
  color: #cbd5e1;
  text-align: center;
}

.exito {
  border-color: #166534;
  color: #bbf7d0;
}

.error {
  border-color: #7f1d1d;
  color: #fca5a5;
}

.contador {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 600px) {
  .encabezado {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .filtros {
    flex-direction: column;
  }

  .filtros select {
    width: 100%;
  }
}
</style>
