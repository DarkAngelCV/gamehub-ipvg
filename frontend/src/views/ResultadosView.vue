<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../services/api.js'
import { obtenerUsuario } from '../services/authService.js'

const usuario = obtenerUsuario()
const esAdmin = usuario?.rol === 'Admin'

const resultados = ref([])
const partidos = ref([])
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
const mensaje = ref('')
const busqueda = ref('')
const torneoSeleccionado = ref('')
const mostrarFormulario = ref(false)

const formulario = ref({
  partidoId: '',
  puntosLocal: 0,
  puntosVisitante: 0,
  observaciones: '',
})

const torneos = computed(() => {
  const nombres = resultados.value
    .map((resultado) => resultado.partido?.torneo?.nombre)
    .filter(Boolean)

  return [...new Set(nombres)]
})

const partidosDisponibles = computed(() => {
  const partidosConResultado = resultados.value.map(
    (resultado) => resultado.partido?.id,
  )

  return partidos.value.filter((partido) => {
    return (
      partido.estado !== 'Pendiente' &&
      !partidosConResultado.includes(partido.id)
    )
  })
})

const resultadosFiltrados = computed(() => {
  const termino = busqueda.value.toLowerCase().trim()

  return resultados.value.filter((resultado) => {
    const partido = resultado.partido
    const torneo = partido?.torneo?.nombre || ''
    const local = partido?.equipoLocal?.nombre || ''
    const visitante = partido?.equipoVisitante?.nombre || ''

    const coincideBusqueda = [
      torneo,
      local,
      visitante,
      resultado.ganador || '',
    ].some((valor) => valor.toLowerCase().includes(termino))

    const coincideTorneo =
      !torneoSeleccionado.value || torneo === torneoSeleccionado.value

    return coincideBusqueda && coincideTorneo
  })
})

async function cargarDatos() {
  cargando.value = true
  error.value = ''

  try {
    const [respuestaResultados, respuestaPartidos] = await Promise.all([
      apiFetch('/resultados'),
      apiFetch('/partidos'),
    ])

    resultados.value = Array.isArray(respuestaResultados)
      ? respuestaResultados
      : respuestaResultados?.value || []

    partidos.value = Array.isArray(respuestaPartidos)
      ? respuestaPartidos
      : respuestaPartidos?.value || []
  } catch (err) {
    error.value = err.message || 'No fue posible cargar la información.'
  } finally {
    cargando.value = false
  }
}

function claseGanador(ganador) {
  if (ganador === 'Empate') return 'estado-empate'
  return 'estado-ganador'
}

function limpiarFormulario() {
  formulario.value = {
    partidoId: '',
    puntosLocal: 0,
    puntosVisitante: 0,
    observaciones: '',
  }
}

async function crearResultado() {
  error.value = ''
  mensaje.value = ''

  if (!formulario.value.partidoId) {
    error.value = 'Debes seleccionar un partido.'
    return
  }

  if (
    formulario.value.puntosLocal === '' ||
    formulario.value.puntosVisitante === '' ||
    Number(formulario.value.puntosLocal) < 0 ||
    Number(formulario.value.puntosVisitante) < 0
  ) {
    error.value = 'Ingresa marcadores válidos para ambos equipos.'
    return
  }

  guardando.value = true

  try {
    await apiFetch('/resultados', {
      method: 'POST',
      body: JSON.stringify({
        partidoId: Number(formulario.value.partidoId),
        puntosLocal: Number(formulario.value.puntosLocal),
        puntosVisitante: Number(formulario.value.puntosVisitante),
        observaciones: formulario.value.observaciones.trim(),
      }),
    })

    mensaje.value = 'Resultado registrado correctamente.'
    limpiarFormulario()
    mostrarFormulario.value = false
    await cargarDatos()
  } catch (err) {
    error.value = err.message || 'No fue posible registrar el resultado.'
  } finally {
    guardando.value = false
  }
}

async function eliminarResultado(resultado) {
  const confirmar = window.confirm(
    '¿Estás seguro de eliminar este resultado? Esta acción no se puede deshacer.',
  )

  if (!confirmar) return

  error.value = ''
  mensaje.value = ''

  try {
    await apiFetch(`/resultados/${resultado.id}`, {
      method: 'DELETE',
    })

    mensaje.value = 'Resultado eliminado correctamente.'
    await cargarDatos()
  } catch (err) {
    error.value = err.message || 'No fue posible eliminar el resultado.'
  }
}

onMounted(cargarDatos)
</script>

<template>
  <section class="resultados-view">
    <header class="pagina-header">
      <div>
        <span class="subtitulo">COMPETICIONES</span>
        <h1>Resultados</h1>
        <p>Consulta y administra los marcadores de los partidos.</p>
      </div>

      <div class="acciones-header">
        <button class="btn-actualizar" @click="cargarDatos">
          Actualizar
        </button>

        <button
          v-if="esAdmin"
          class="btn-principal"
          @click="mostrarFormulario = !mostrarFormulario"
        >
          {{ mostrarFormulario ? 'Cancelar' : 'Registrar resultado' }}
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
      @submit.prevent="crearResultado"
    >
      <h2>Registrar nuevo resultado</h2>

      <div class="form-grid">
        <div class="campo campo-completo">
          <label for="partido">Partido</label>

          <select id="partido" v-model="formulario.partidoId" required>
            <option value="" disabled>Seleccionar partido</option>

            <option
              v-for="partido in partidosDisponibles"
              :key="partido.id"
              :value="partido.id"
            >
              {{ partido.torneo?.nombre }}:
              {{ partido.equipoLocal?.nombre }}
              vs
              {{ partido.equipoVisitante?.nombre }}
            </option>
          </select>

          <small v-if="partidosDisponibles.length === 0">
            No hay partidos disponibles para registrar resultados.
          </small>
        </div>

        <div class="campo">
          <label for="puntosLocal">Puntos del equipo local</label>
          <input
            id="puntosLocal"
            v-model.number="formulario.puntosLocal"
            type="number"
            min="0"
            step="1"
            required
          />
        </div>

        <div class="campo">
          <label for="puntosVisitante">Puntos del equipo visitante</label>
          <input
            id="puntosVisitante"
            v-model.number="formulario.puntosVisitante"
            type="number"
            min="0"
            step="1"
            required
          />
        </div>

        <div class="campo campo-completo">
          <label for="observaciones">Observaciones (opcional)</label>
          <textarea
            id="observaciones"
            v-model="formulario.observaciones"
            maxlength="100"
            rows="3"
            placeholder="Información adicional del encuentro..."
          ></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn-actualizar"
          @click="limpiarFormulario"
        >
          Limpiar
        </button>

        <button
          type="submit"
          class="btn-principal"
          :disabled="guardando || partidosDisponibles.length === 0"
        >
          {{ guardando ? 'Guardando...' : 'Guardar resultado' }}
        </button>
      </div>
    </form>

    <div class="filtros">
      <input
        v-model="busqueda"
        type="search"
        placeholder="Buscar torneo o equipo..."
      />

      <select v-model="torneoSeleccionado">
        <option value="">Todos los torneos</option>
        <option v-for="torneo in torneos" :key="torneo" :value="torneo">
          {{ torneo }}
        </option>
      </select>
    </div>

    <div v-if="cargando" class="mensaje">
      Cargando resultados...
    </div>

    <div v-else-if="resultadosFiltrados.length === 0" class="mensaje">
      No hay resultados que coincidan con la búsqueda.
    </div>

    <div v-else class="resultados-grid">
      <article
        v-for="resultado in resultadosFiltrados"
        :key="resultado.id"
        class="resultado-card"
      >
        <div class="resultado-torneo">
          {{ resultado.partido?.torneo?.nombre || 'Torneo sin nombre' }}
        </div>

        <div class="marcador">
          <div class="equipo">
            <span class="equipo-nombre">
              {{ resultado.partido?.equipoLocal?.nombre || 'Equipo local' }}
            </span>
            <strong>{{ resultado.puntosLocal }}</strong>
          </div>

          <span class="separador">-</span>

          <div class="equipo">
            <strong>{{ resultado.puntosVisitante }}</strong>
            <span class="equipo-nombre">
              {{ resultado.partido?.equipoVisitante?.nombre || 'Equipo visitante' }}
            </span>
          </div>
        </div>

        <div class="resultado-footer">
          <span :class="['estado', claseGanador(resultado.ganador)]">
            {{ resultado.ganador === 'Empate'
              ? 'Empate'
              : `Ganador: ${resultado.ganador || 'No definido'}` }}
          </span>
        </div>

        <p v-if="resultado.observaciones" class="observaciones">
          {{ resultado.observaciones }}
        </p>

        <button
          v-if="esAdmin"
          class="btn-eliminar"
          @click="eliminarResultado(resultado)"
        >
          Eliminar resultado
        </button>
      </article>
    </div>

    <div class="contador">
      {{ resultadosFiltrados.length }}
      {{ resultadosFiltrados.length === 1 ? 'resultado encontrado' : 'resultados encontrados' }}
    </div>
  </section>
</template>

<style scoped>
.resultados-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: var(--text-primary, #f1f5f9);
}

.pagina-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.subtitulo {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.pagina-header h1 {
  margin: 6px 0;
  font-size: 30px;
}

.pagina-header p {
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
.btn-actualizar,
.btn-eliminar {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-principal {
  border: 0;
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

.btn-actualizar {
  border: 1px solid #334155;
  background: #1e293b;
  color: white;
}

.btn-actualizar:hover {
  background: #334155;
}

.btn-eliminar {
  width: 100%;
  margin-top: 16px;
  border: 0;
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

.campo-completo {
  grid-column: 1 / -1;
}

.campo label {
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 600;
}

.campo small {
  color: #94a3b8;
  font-size: 12px;
}

.campo input,
.campo select,
.campo textarea,
.filtros input,
.filtros select {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  border: 1px solid #475569;
  border-radius: 8px;
  outline: none;
  background: #0f172a;
  color: white;
  font: inherit;
}

.campo input:focus,
.campo select:focus,
.campo textarea:focus,
.filtros input:focus,
.filtros select:focus {
  border-color: #6366f1;
}

.campo textarea {
  resize: vertical;
}

.form-actions {
  justify-content: flex-end;
  margin-top: 20px;
}

.filtros {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filtros input {
  flex: 1;
  min-width: 220px;
}

.filtros select {
  min-width: 220px;
}

.resultados-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.resultado-card {
  padding: 20px;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #1e293b;
}

.resultado-torneo {
  margin-bottom: 20px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
}

.marcador {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.equipo {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.equipo strong {
  color: #f8fafc;
  font-size: 32px;
}

.equipo-nombre {
  font-size: 14px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.separador {
  color: #64748b;
  font-size: 22px;
}

.resultado-footer {
  display: flex;
  justify-content: center;
  margin-top: 22px;
}

.estado {
  padding: 7px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.estado-ganador {
  background: #14532d;
  color: #bbf7d0;
}

.estado-empate {
  background: #854d0e;
  color: #fef08a;
}

.observaciones {
  margin: 16px 0 0;
  padding-top: 12px;
  border-top: 1px solid #334155;
  color: #94a3b8;
  font-size: 13px;
}

.mensaje {
  padding: 25px;
  border: 1px solid #334155;
  border-radius: 10px;
  color: #94a3b8;
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
  font-size: 13px;
}

@media (max-width: 600px) {
  .pagina-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .campo-completo {
    grid-column: auto;
  }

  .filtros {
    flex-direction: column;
  }

  .filtros input,
  .filtros select {
    min-width: 0;
  }
}
</style>
