<script setup>
import { ref } from 'vue'

const estadisticas = ref([
  {
    titulo: 'Torneos activos',
    valor: '3'
  },
  {
    titulo: 'Equipos registrados',
    valor: '12'
  },
  {
    titulo: 'Partidos jugados',
    valor: '24'
  },
  {
    titulo: 'Estudiantes',
    valor: '48'
  },
])

const torneos = ref([
  {
    nombre: 'Torneo FIFA 26',
    juego: 'EA Sports FC 26',
    fecha: '20 de noviembre de 2026',
    estado: 'Inscripciones abiertas',
  },
  {
    nombre: 'Campeonato Valorant',
    juego: 'Valorant',
    fecha: '25 de noviembre de 2026',
    estado: 'Próximamente',
  },
  {
    nombre: 'Torneo League of Legends',
    juego: 'League of Legends',
    fecha: '30 de noviembre de 2026',
    estado: 'Próximamente',
  },
])
</script>

<template>
  <div class="dashboard">
    <section class="welcome-section">
      <div>
        <span class="welcome-tag">PANEL PRINCIPAL</span>
        <h1>¡Bienvenido a GameHub!</h1>
        <p>
          Gestiona tus torneos, equipos y competencias
          de videojuegos desde un solo lugar.
        </p>
      </div>

    </section>

    <section class="stats-grid">
      <article
        v-for="estadistica in estadisticas"
        :key="estadistica.titulo"
        class="stat-card"
      >
        <div class="stat-icon" :class="estadistica.color">
          {{ estadistica.icono }}
        </div>

        <div>
          <p>{{ estadistica.titulo }}</p>
          <h2>{{ estadistica.valor }}</h2>
        </div>
      </article>
    </section>

    <section class="tournaments-section">
      <div class="section-heading">
        <div>
          <h2>Torneos destacados</h2>
          <p>Conoce las próximas competencias disponibles.</p>
        </div>
      </div>

      <div class="tournament-list">
        <article
          v-for="torneo in torneos"
          :key="torneo.nombre"
          class="tournament-card"
        >

          <div class="tournament-info">
            <h3>{{ torneo.nombre }}</h3>
            <p>{{ torneo.juego }}</p>
            <span>{{ torneo.fecha }}</span>
          </div>

          <span
            class="tournament-status"
            :class="{
              open: torneo.estado === 'Inscripciones abiertas',
            }"
          >
            {{ torneo.estado }}
          </span>
        </article>
      </div>
    </section>

    <section class="info-banner">
      <div>
        <h3>¡Prepárate para competir!</h3>
        <p>
          Forma tu equipo, participa en torneos y demuestra
          tus habilidades.
        </p>
      </div>

    </section>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  background: linear-gradient(120deg, #312e81, #6366f1);
  color: white;
  border-radius: 16px;
  padding: 35px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.welcome-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  opacity: 0.8;
}

.welcome-section h1 {
  color: white;
  font-size: 27px;
  margin: 12px 0;
}

.welcome-section p {
  color: #e0e7ff;
  margin: 0;
}

.welcome-icon {
  font-size: 65px;
  background: #ffffff20;
  border-radius: 18px;
  padding: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 35px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 13px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.purple {
  background: #ede9fe;
}

.blue {
  background: #dbeafe;
}

.green {
  background: #dcfce7;
}

.orange {
  background: #ffedd5;
}

.stat-card p {
  font-size: 11px;
  margin: 0 0 7px;
  color: #64748b;
}

.stat-card h2 {
  margin: 0;
  font-size: 25px;
  color: #111827;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0 0 6px;
  font-size: 19px;
}

.section-heading p {
  margin: 0;
  font-size: 13px;
}

.tournament-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tournament-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 17px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.game-icon {
  width: 45px;
  height: 45px;
  background: #eef2ff;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-size: 21px;
}

.tournament-info {
  flex: 1;
}

.tournament-info h3 {
  font-size: 14px;
  margin: 0 0 5px;
}

.tournament-info p {
  font-size: 12px;
  margin: 0 0 5px;
}

.tournament-info span {
  font-size: 11px;
  color: #94a3b8;
}

.tournament-status {
  font-size: 10px;
  font-weight: 600;
  padding: 7px 10px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
}

.tournament-status.open {
  background: #dcfce7;
  color: #15803d;
}

.info-banner {
  margin-top: 25px;
  padding: 22px;
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-banner h3 {
  color: #3730a3;
  margin: 0 0 7px;
  font-size: 15px;
}

.info-banner p {
  margin: 0;
  font-size: 12px;
}

.info-banner span {
  font-size: 35px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 550px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-section {
    padding: 23px;
  }

  .welcome-icon {
    display: none;
  }

  .tournament-card {
    flex-wrap: wrap;
  }

  .tournament-status {
    margin-left: 60px;
  }
}
</style>
