# GameHub IPVG

GameHub IPVG es una aplicación web que permite gestionar torneos de videojuegos. El sistema permite administrar equipos, inscripciones, partidos y resultados, además de consultar los rankings de cada torneo.

Este proyecto fue desarrollado para la evaluación final de la asignatura **Lenguaje de Programación Web II**, del Instituto Profesional Virginio Gómez, Sede Chillán.

## 1. ¿De qué trata el proyecto?

La idea de GameHub IPVG es tener un solo lugar donde se pueda organizar la información de los torneos de videojuegos.

El sistema permite que los usuarios ingresen con su cuenta y, dependiendo de su rol, puedan realizar distintas acciones. Por ejemplo, el administrador puede gestionar los torneos, las inscripciones, los partidos y los resultados. Los estudiantes pueden ingresar y consultar la información disponible.

## 2. Tecnologías utilizadas

### Frontend
- **Vue 3:** para crear las pantallas y los componentes de la aplicación.
- **Vite:** para ejecutar y compilar el frontend.
- **Vue Router:** para navegar entre las distintas páginas.
- **JavaScript, HTML y CSS:** para desarrollar la interfaz y sus funcionalidades.

### Backend
- **NestJS:** para desarrollar el servidor y organizar las funcionalidades.
- **TypeScript:** para escribir el código del backend.
- **TypeORM:** para conectar el sistema con la base de datos.
- **MySQL:** para guardar la información.
- **JWT y Passport:** para manejar el inicio de sesión y la autenticación.
- **Class Validator:** para validar los datos recibidos.
- **Swagger:** para consultar y probar los endpoints de la API.

## 3. Funcionalidades principales

El sistema cuenta con las siguientes funcionalidades:

- Registro e inicio de sesión de usuarios.
- Acceso según el rol de cada usuario.
- Administración de equipos y torneos.
- Inscripción de equipos en torneos.
- Revisión y administración de inscripciones.
- Creación y gestión de partidos.
- Registro de resultados de los partidos.
- Cálculo de rankings según los resultados.
- Búsqueda y filtros para encontrar información.
- Consulta de torneos, equipos, partidos y resultados.

## 4. Roles del sistema

El sistema tiene dos tipos de usuarios:

### Administrador (Admin)

Es el usuario encargado de administrar la plataforma. Puede gestionar equipos y torneos, revisar las inscripciones, organizar los partidos y registrar sus resultados.

### Estudiante (Student)

Puede iniciar sesión y consultar la información del sistema, como los torneos, equipos, partidos, resultados y rankings. No tiene acceso a las funciones administrativas.

El acceso a las operaciones está protegido mediante autenticación JWT y validación de roles en el backend.

## 5. Organización del proyecto

El proyecto está dividido en dos partes principales:

- **Frontend:** contiene las páginas que utiliza el usuario, los componentes, las rutas y los servicios que se comunican con el backend.
- **Backend:** se encarga de procesar las solicitudes, aplicar las reglas del sistema, validar los datos y comunicarse con la base de datos.

La estructura general de las carpetas es la siguiente:

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

## 6. Base de datos

Para guardar la información se utiliza MySQL junto con TypeORM.

El sistema trabaja con seis entidades principales:

- **Usuario:** almacena los datos de las personas que ingresan al sistema.
- **Equipo:** guarda la información de los equipos participantes.
- **Torneo:** contiene los datos de los torneos disponibles.
- **Inscripción:** relaciona los equipos con los torneos en los que participan.
- **Partido:** almacena los encuentros programados entre dos equipos.
- **Resultado:** guarda los puntos obtenidos por cada equipo en un partido.

Estas entidades se relacionan entre sí para mantener organizada la información. Por ejemplo, un torneo puede tener varias inscripciones y partidos, mientras que cada partido puede tener su resultado correspondiente.

El ranking se obtiene a partir de los resultados registrados en cada torneo.

## 7. Requisitos para ejecutar el proyecto

Antes de iniciar se necesita tener instalado:

- Node.js 22.18 o superior, o Node.js 24.12 o superior.
- npm.
- MySQL 8.
- Git.

## 8. Instalación y configuración

### 8.1. Descargar el proyecto

Clonar el repositorio desde GitHub:

```bash
git clone https://github.com/DarkAngelCV/gamehub-ipvg.git
cd gamehub-ipvg
```

### 8.2. Crear la base de datos

Desde MySQL, ejecutar:

```sql
CREATE DATABASE gamehub_ipvg;
```

### 8.3. Preparar el backend

Ingresar a la carpeta del backend:

```bash
cd backend
```

Instalar las dependencias:

```bash
npm install
```

Crear el archivo `.env` utilizando el archivo de ejemplo:

```powershell
Copy-Item .env.example .env
```

Luego configurar los datos de conexión a MySQL y la clave JWT:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_DATABASE=gamehub_ipvg

PORT=3000

JWT_SECRET=TU_SECRETO_JWT
```

Se deben reemplazar los valores de ejemplo por los datos correspondientes al computador donde se ejecutará el proyecto.

Iniciar el backend:

```bash
npm run start:dev
```

El servidor estará disponible en:

http://localhost:3000

### 8.4. Preparar el frontend

Abrir otra terminal e ingresar a la carpeta del frontend:

```bash
cd frontend
```

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` con la dirección del backend:

```env
VITE_API_URL=http://localhost:3000
```

Iniciar el frontend:

```bash
npm run dev
```

Vite mostrará la dirección local para abrir la aplicación en el navegador.

## 9. Crear una cuenta de administrador para la evaluación

Por seguridad, el formulario de registro de GameHub crea automáticamente las cuentas con el rol `Student`. Para acceder a las funciones administrativas durante la evaluación, se debe realizar el siguiente procedimiento:

### 9.1. Registrar un usuario

Ingresar a GameHub y crear una cuenta desde el formulario de registro, utilizando un nombre, correo electrónico y contraseña.

### 9.2. Asignar el rol de administrador

Abrir MySQL Command Line Client y ejecutar las siguientes instrucciones, reemplazando el correo por el utilizado durante el registro:

```sql
USE gamehub_ipvg;

UPDATE usuarios
SET rol = 'Admin'
WHERE email = 'correo_utilizado_en_el_registro'
AND rol = 'Student';
```

### 9.3. Verificar el cambio

Ejecutar la siguiente consulta para comprobar que la cuenta tiene el rol de administrador:

```sql
SELECT id, nombre, email, rol
FROM usuarios
WHERE email = 'correo_utilizado_en_el_registro';
```

El resultado debe mostrar `Admin` en la columna `rol`.

### 9.4. Iniciar sesión

Cerrar la sesión actual en GameHub e iniciar sesión nuevamente con la cuenta creada. De esta manera, el sistema reconocerá los permisos administrativos.

**Importante:** Este procedimiento requiere acceso autorizado a la base de datos MySQL. Se utiliza para preparar una cuenta de administrador y evita que cualquier persona pueda registrarse directamente con permisos administrativos desde la aplicación.

## 10. Documentación de la API

Para revisar las rutas y operaciones disponibles en el backend se utiliza Swagger.

Con el backend iniciado, ingresar a:

http://localhost:3000/api

Desde ahí se pueden consultar los endpoints, sus métodos HTTP y los datos que necesita cada operación. Las rutas protegidas requieren autenticación mediante un token JWT.

## 11. Pruebas realizadas

Durante el desarrollo se realizaron pruebas para comprobar que las principales funcionalidades del backend funcionaran correctamente.

### 11.1. Pruebas automatizadas

Para ejecutar las pruebas automatizadas:

```bash
cd backend
npm test
```

Para ejecutar las pruebas con cobertura:

```bash
npm test -- --coverage
```

**Resultados de la última ejecución:**

- 8 archivos de prueba aprobados.
- 69 pruebas automatizadas aprobadas.

### 11.2. Compilación

También se comprobó que ambos proyectos compilaran correctamente.

**Backend:**

```bash
npm run build
```

**Frontend:**

```bash
cd frontend
npm run build
```

Las dos compilaciones finalizaron correctamente.

### 11.3. Pruebas manuales de acceso y permisos

Se realizaron comprobaciones de inicio de sesión y acceso según el rol:

- Inicio de sesión exitoso con un usuario Student.
- Inicio de sesión exitoso con un usuario Admin.
- Comprobación de que Student puede consultar la información, pero no dispone de las opciones administrativas.
- Comprobación del acceso al sistema con el rol Admin.

Las funcionalidades de los módulos también fueron revisadas durante el desarrollo y las pruebas de la aplicación.

## 12. Repositorio

El código fuente del proyecto se encuentra disponible en GitHub:

https://github.com/DarkAngelCV/gamehub-ipvg

## 13. Uso de herramientas de inteligencia artificial

Durante el desarrollo utilicé ChatGPT como herramienta de apoyo para resolver dudas, entender errores y buscar soluciones a problemas que fueron apareciendo.

También lo utilicé como ayuda para revisar y mejorar algunas partes del código. De todas formas, fui revisando, adaptando y probando los cambios en el proyecto para comprobar que funcionaran correctamente.

## 14. Gestión de tareas

Para organizar y realizar el seguimiento del desarrollo del proyecto se utilizó un tablero Kanban de GitHub Projects.

En el tablero se registran las tareas y su estado de avance, organizadas en las columnas Pendiente, En proceso y Terminado.

**Tablero de gestión de tareas:**

https://github.com/users/DarkAngelCV/projects/1

## 15. Autor

**Nombre:** Cristian Vasquez

**Institución:** Instituto Profesional Virginio Gómez

**Sede:** Chillán

**Asignatura:** Lenguaje de Programación Web II