<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { cerrarSesion, obtenerUsuario } from './services/authService.js'

const router = useRouter()

const usuario = computed(() => obtenerUsuario())

const nombreUsuario = computed(() => usuario.value?.nombre || 'Usuario')

const rolUsuario = computed(() => usuario.value?.rol || 'Estudiante')

const inicialUsuario = computed(() => nombreUsuario.value.charAt(0).toUpperCase())

function salir() {
  cerrarSesion()
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="brand">

        <div>
          <h2>GameHub</h2>
          <span>IPVG · Chillán</span>
        </div>
      </div>

      <div class="menu-label">MENÚ PRINCIPAL</div>

      <nav class="navigation">
        <RouterLink to="/" class="nav-link" active-class="active" exact>
          <span></span> Inicio
        </RouterLink>

        <RouterLink to="/torneos" class="nav-link" active-class="active">
          <span></span> Torneos
        </RouterLink>

        <RouterLink to="/equipos" class="nav-link" active-class="active">
          <span></span> Equipos
        </RouterLink>

        <RouterLink to="/inscripciones" class="nav-link">
          <span class="nav-icon"></span>
          <span>Inscripciones</span>
        </RouterLink>

        <RouterLink to="/partidos" class="nav-link">
          <span class="nav-icon"></span>
          <span>Partidos</span>
        </RouterLink>

        <RouterLink to="/resultados" class="nav-link">
          <span class="nav-icon"></span>
          <span>Resultados</span>
        </RouterLink>

        <RouterLink to="/ranking" class="nav-link" active-class="active">
          <span></span> Ranking
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="status-dot"></div>
        Plataforma de competencias
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div>
          <span class="topbar-label">INSTITUTO PROFESIONAL</span>
          <h3>Virginio Gómez</h3>
        </div>

        <div class="user-area">
          <div class="user-info">
            <strong>{{ nombreUsuario }}</strong>
            <span>{{ rolUsuario }}</span>
          </div>

          <div class="avatar">{{ inicialUsuario }}</div>

          <button class="logout-button" @click="salir">
            Cerrar sesión
          </button>
        </div>
      </header>

      <div class="page-content">
        <RouterView />
      </div>

      <footer class="footer">
        GameHub IPVG · Plataforma de torneos de videojuegos
      </footer>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: #f4f6fb;
  color: #1e293b;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 255px;
  background: #111827;
  color: white;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 55px;
}

.brand-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  background: #6366f1;
  border-radius: 13px;
  font-size: 23px;
}

.brand h2 {
  margin: 0;
  font-size: 20px;
}

.brand span {
  display: block;
  color: #9ca3af;
  font-size: 11px;
  margin-top: 4px;
}

.menu-label {
  color: #6b7280;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin: 0 0 15px 10px;
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.nav-link {
  padding: 13px 15px;
  border-radius: 9px;
  text-decoration: none;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  transition: 0.2s;
}

.nav-link:hover {
  background: #263449;
  color: white;
}

.nav-link.active {
  background: #4f46e5;
  color: white;
  font-weight: 600;
}

.nav-link span {
  font-size: 17px;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 25px;
  color: #9ca3af;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  min-height: 85px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.topbar-label {
  color: #9ca3af;
  font-size: 9px;
  letter-spacing: 1.5px;
  font-weight: 700;
}

.topbar h3 {
  margin: 5px 0 0;
  font-size: 16px;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: right;
}

.user-info strong {
  font-size: 13px;
  color: #1e293b;
}

.user-info span {
  font-size: 11px;
  color: #64748b;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4338ca;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.logout-button {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
}

.logout-button:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.page-content {
  padding: 40px;
  flex: 1;
}

.page-content h1 {
  font-size: 28px;
  margin-top: 0;
  color: #111827;
}

.page-content p {
  color: #64748b;
  line-height: 1.7;
}

.footer {
  padding: 20px 40px;
  color: #94a3b8;
  font-size: 11px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

@media (max-width: 700px) {
  .sidebar {
    width: 75px;
    padding: 20px 10px;
  }

  .brand {
    justify-content: center;
  }

  .brand > div:last-child,
  .menu-label,
  .nav-link:not(.active),
  .sidebar-footer {
    display: none;
  }

  .nav-link {
    justify-content: center;
    padding: 14px 5px;
    font-size: 0;
  }

  .nav-link span {
    font-size: 20px;
  }

  .topbar {
    padding: 12px 18px;
    flex-wrap: wrap;
  }

  .user-area {
    gap: 7px;
  }

  .user-info strong {
    max-width: 100px;
    overflow-wrap: anywhere;
  }

  .logout-button {
    padding: 8px;
  }

  .page-content {
    padding: 25px 18px;
  }
}
</style>
