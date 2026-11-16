<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../services/api.js'

const torneos = ref([])
const torneoSeleccionado = ref('')
const ranking = ref([])
const nombreTorneo = ref('')

const cargando = ref(false)
const cargandoTorneos = ref(true)
const error = ref('')

const totalEquipos = computed(() => ranking.value.length)

async function cargarTorneos() {
  cargandoTorneos.value = true
  error.value = ''

  try {
    const respuesta = await apiFetch('/torneos')

    torneos.value = Array.isArray(respuesta)
      ? respuesta
      : respuesta.value || []

    if (torneos.value.length > 0) {
      torneoSeleccionado.value = String(torneos.value[0].id)
      await cargarRanking()
    }
  } catch (err) {
    error.value = err.message || 'No se pudieron cargar los torneos'
  } finally {
    cargandoTorneos.value = false
  }
}

async function cargarRanking() {
  if (!torneoSeleccionado.value) return

  cargando.value = true
  error.value = ''
  ranking.value = []

  try {
    const respuesta = await apiFetch(
      `/ranking/${torneoSeleccionado.value}`,
    )

    ranking.value = respuesta.ranking || []
    nombreTorneo.value = respuesta.torneo?.nombre || 'Ranking del torneo'
  } catch (err) {
    error.value = err.message || 'No se pudo cargar el ranking'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarTorneos)
</script>

<template>
  <section class="ranking-page">
    <div class="encabezado">
      <div>
        <h1>Ranking</h1>
        <p>Posiciones oficiales según los resultados de los partidos.</p>
      </div>
    </div>

    <div class="filtros">
      <label for="torneo">Seleccionar torneo</label>

      <select
        id="torneo"
        v-model="torneoSeleccionado"
        :disabled="cargandoTorneos || torneos.length === 0"
        @change="cargarRanking"
      >
        <option value="" disabled>Selecciona un torneo</option>

        <option
          v-for="torneo in torneos"
          :key="torneo.id"
          :value="String(torneo.id)"
        >
          {{ torneo.nombre }}
        </option>
      </select>
    </div>

    <div v-if="cargandoTorneos || cargando" class="mensaje">
      Cargando ranking...
    </div>

    <div v-else-if="error" class="mensaje error">
      {{ error }}
      <button @click="torneos.length ? cargarRanking() : cargarTorneos()">
        Reintentar
      </button>
    </div>

    <template v-else-if="torneoSeleccionado">
      <div class="resumen">
        <div>
          <span>Torneo</span>
          <strong>{{ nombreTorneo }}</strong>
        </div>

        <div>
          <span>Equipos participantes</span>
          <strong>{{ totalEquipos }}</strong>
        </div>
      </div>

      <div v-if="ranking.length === 0" class="mensaje">
        Todavía no hay equipos con posiciones para este torneo.
      </div>

      <div v-else class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>Dif.</th>
              <th>Pts.</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="equipo in ranking" :key="equipo.equipoId">
              <td>
                <span
                  class="posicion"
                  :class="{
                    primero: equipo.posicion === 1,
                    segundo: equipo.posicion === 2,
                    tercero: equipo.posicion === 3,
                  }"
                >
                  {{ equipo.posicion }}
                </span>
              </td>

              <td class="nombre-equipo">
                <strong>{{ equipo.equipo }}</strong>
                <small>{{ equipo.sigla }}</small>
              </td>

              <td>{{ equipo.partidosJugados }}</td>
              <td>{{ equipo.ganados }}</td>
              <td>{{ equipo.empatados }}</td>
              <td>{{ equipo.perdidos }}</td>
              <td>{{ equipo.diferencia }}</td>
              <td class="puntos">{{ equipo.puntos }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="nota">
        PJ: partidos jugados · G: ganados · E: empatados ·
        P: perdidos · Dif.: diferencia de puntos · Pts.: puntos.
      </p>
    </template>

    <div v-else class="mensaje">
      No hay torneos disponibles para mostrar el ranking.
    </div>
  </section>
</template>

<style scoped>
.ranking-page {
  width: 100%;
}

.encabezado {
  margin-bottom: 25px;
}

.encabezado h1 {
  margin: 0 0 8px;
  color: #ffffff;
  font-size: 28px;
}

.encabezado p {
  margin: 0;
  color: #cbd5e1;
}

.filtros {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 22px;
}

.filtros label {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}

.filtros select {
  width: 100%;
  max-width: 350px;
  padding: 12px;
  border: 1px solid #475569;
  border-radius: 9px;
  background: #1e293b;
  color: #ffffff;
  font-size: 14px;
}

.resumen {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 22px;
}

.resumen div {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 190px;
  padding: 17px;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #1e293b;
}

.resumen span {
  color: #cbd5e1;
  font-size: 13px;
}

.resumen strong {
  color: #ffffff;
  font-size: 17px;
}

.tabla-contenedor {
  overflow-x: auto;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #1e293b;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  color: #e2e8f0;
}

th {
  padding: 15px 12px;
  background: #334155;
  color: #ffffff;
  font-size: 13px;
}

td {
  padding: 15px 12px;
  border-top: 1px solid #334155;
  font-size: 14px;
}

.nombre-equipo {
  text-align: left;
}

.nombre-equipo strong {
  display: block;
  color: #ffffff;
}

.nombre-equipo small {
  display: block;
  margin-top: 4px;
  color: #cbd5e1;
}

.posicion {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 29px;
  height: 29px;
  border-radius: 50%;
  background: #475569;
  color: #ffffff;
  font-weight: bold;
}

.primero {
  background: #a16207;
}

.segundo {
  background: #64748b;
}

.tercero {
  background: #92400e;
}

.puntos {
  color: #a5b4fc;
  font-weight: bold;
}

.nota {
  margin-top: 15px;
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.6;
}

.mensaje {
  padding: 25px;
  border-radius: 12px;
  background: #1e293b;
  color: #e2e8f0;
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
  th,
  td {
    padding: 12px 9px;
    font-size: 12px;
  }
}
</style>
