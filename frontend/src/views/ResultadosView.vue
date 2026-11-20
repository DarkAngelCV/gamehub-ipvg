<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../services/api.js'

const resultados = ref([])
const cargando = ref(false)
const error = ref('')
const busqueda = ref('')
const torneoSeleccionado = ref('')

const torneos = computed(() => {
  const nombres = resultados.value
    .map((resultado) => resultado.partido?.torneo?.nombre)
    .filter(Boolean)

  return [...new Set(nombres)]
})

const resultadosFiltrados = computed(() => {
  const termino = busqueda.value.toLowerCase().trim()

  return resultados.value.filter((resultado) => {
    const partido = resultado.partido
    const torneo = partido?.torneo?.nombre || ''
    const local = partido?.equipoLocal?.nombre || ''
    const visitante = partido?.equipoVisitante?.nombre || ''

    const coincideBusqueda = [torneo, local, visitante, resultado.ganador || '']
      .some((valor) => valor.toLowerCase().includes(termino))

    const coincideTorneo =
      !torneoSeleccionado.value || torneo === torneoSeleccionado.value

    return coincideBusqueda && coincideTorneo
  })
})

async function cargarResultados() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await apiFetch('/resultados')

    resultados.value = Array.isArray(respuesta)
      ? respuesta
      : respuesta?.value || []
  } catch (err) {
    error.value = err.message || 'No fue posible cargar los resultados'
  } finally {
    cargando.value = false
  }
}

function claseGanador(ganador) {
  if (ganador === 'Empate') return 'estado-empate'
  return 'estado-ganador'
}

onMounted(cargarResultados)
</script>

<template>
  <section class="resultados-view">
    <header class="pagina-header">
      <div>
        <span class="subtitulo">COMPETICIONES</span>
        <h1>Resultados</h1>
        <p>Consulta los marcadores y resultados de los partidos.</p>
      </div>

      <button class="btn-actualizar" @click="cargarResultados">
        Actualizar
      </button>
    </header>

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

    <div v-else-if="error" class="mensaje error">
      {{ error }}
      <button @click="cargarResultados">Reintentar</button>
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

.btn-actualizar {
  padding: 10px 18px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #1e293b;
  color: white;
  cursor: pointer;
}

.btn-actualizar:hover {
  background: #334155;
}

.filtros {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filtros input,
.filtros select {
  min-width: 220px;
  padding: 12px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #1e293b;
  color: white;
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
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 10px;
  text-align: center;
}

.equipo strong {
  font-size: 32px;
  color: #f8fafc;
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
  padding: 35px;
  border: 1px solid #334155;
  border-radius: 10px;
  color: #94a3b8;
  text-align: center;
}

.error {
  color: #fca5a5;
}

.error button {
  display: block;
  margin: 12px auto 0;
  padding: 8px 14px;
  border: 1px solid #7f1d1d;
  border-radius: 6px;
  background: #7f1d1d;
  color: white;
  cursor: pointer;
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

  .filtros {
    flex-direction: column;
  }

  .filtros input,
  .filtros select {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
