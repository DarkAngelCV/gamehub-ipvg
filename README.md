# GameHub IPVG

Sistema web para la gestión de torneos de videojuegos, equipos, inscripciones, partidos y resultados.

Este proyecto fue desarrollado como parte de la evaluación final de la asignatura **Lenguaje de Programación Web II**, del Instituto Profesional Virginio Gómez, Sede Chillán.

## Descripción del proyecto

GameHub IPVG permite administrar torneos de videojuegos desde una plataforma web. Los usuarios pueden consultar torneos, visualizar equipos y revisar rankings calculados a partir de los resultados de los partidos.

El sistema cuenta con autenticación de usuarios y control de acceso según roles.

## Tecnologías utilizadas

### Frontend
- Vue 3
- Vite
- Vue Router
- JavaScript
- HTML y CSS

### Backend
- NestJS
- TypeScript
- TypeORM
- MySQL
- JWT
- Passport
- Class Validator
- Swagger

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Autenticación mediante JWT.
- Gestión de usuarios y perfiles.
- Administración de equipos y capitanes.
- Creación y gestión de torneos.
- Inscripción de equipos en torneos.
- Gestión de partidos.
- Registro de resultados.
- Cálculo automático de rankings.
- Búsqueda y filtros de información.
- Control de permisos según roles.

## Roles de usuario

**Administrador (Admin)**
- Gestionar equipos.
- Crear, modificar y eliminar torneos.
- Administrar inscripciones.
- Gestionar partidos y resultados.
- Acceder a las operaciones administrativas.

**Estudiante (Student)**
- Iniciar sesión.
- Consultar torneos.
- Visualizar equipos.
- Consultar rankings.

## Estructura del proyecto

```text
gamehub-ipvg/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── usuarios/
│   │   ├── equipos/
│   │   ├── torneos/
│   │   ├── inscripciones/
│   │   ├── partidos/
│   │   ├── resultados/
│   │   └── ranking/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── router/
│   │   ├── services/
│   │   └── views/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js 22.18 o superior (o Node.js 24.12 o superior).
- npm.
- MySQL 8.
- Git.

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/DarkAngelCV/gamehub-ipvg.git
cd gamehub-ipvg
```

### 2. Configurar la base de datos

Crear la base de datos en MySQL:

```sql
CREATE DATABASE gamehub_ipvg;
```

### 3. Configurar el backend

Entrar a la carpeta:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo `.env` a partir de `.env.example`:

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configurar las variables de entorno con los datos de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_DATABASE=gamehub_ipvg

PORT=3000

JWT_SECRET=TU_SECRETO_JWT
```

Reemplazar los valores de ejemplo por los correspondientes al entorno local.

Iniciar el backend:

```bash
npm run start:dev
```

El servidor estará disponible en:

`http://localhost:3000`

### 4. Configurar el frontend

Abrir otra terminal y entrar a la carpeta:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

Iniciar el frontend:

```bash
npm run dev
```

Vite mostrará la dirección local para abrir la aplicación en el navegador.

## Documentación de la API

El backend incorpora Swagger para consultar los endpoints disponibles, sus parámetros y los métodos HTTP.

Documentación:

`http://localhost:3000/api`

Las operaciones protegidas utilizan autenticación mediante Bearer Token (JWT).

## Pruebas

Para ejecutar las pruebas automatizadas del backend:

```bash
cd backend
npm test
```

Para ejecutar las pruebas con cobertura:

```bash
npm test -- --coverage
```

También se puede compilar el backend:

```bash
npm run build
```

Y compilar el frontend:

```bash
cd frontend
npm run build
```

En las pruebas realizadas durante el desarrollo se obtuvieron 69 pruebas aprobadas en 8 archivos de prueba.

## Base de datos

El sistema utiliza MySQL y TypeORM para la persistencia de información.

Las entidades principales son:

- Usuario
- Equipo
- Torneo
- Inscripcion
- Partido
- Resultado

Las relaciones permiten asociar usuarios con equipos, equipos con torneos mediante inscripciones y partidos con sus respectivos resultados.

El ranking se calcula utilizando los resultados registrados en cada torneo.

## Repositorio

GitHub:

https://github.com/DarkAngelCV/gamehub-ipvg

## Desarrollo y uso de herramientas de IA

Durante el desarrollo se utilizaron herramientas de inteligencia artificial como apoyo para resolver dudas técnicas, revisar errores, comprender conceptos y mejorar algunos componentes del proyecto.

El código fue revisado, adaptado y probado durante el proceso de desarrollo.

## Autor

Nombre: Cristian Vasquez

**Instituto Profesional Virginio Gómez**  
Sede Chillán  
Asignatura: Lenguaje de Programación Web II
