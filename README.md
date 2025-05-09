# Rutinas de Aprendizaje

Aplicación web para la gestión de rutinas de aprendizaje personalizadas. Permite a los usuarios crear perfiles con sus intereses y disponibilidad, y generar rutinas de actividades adaptadas a sus necesidades.

## Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución para JavaScript del lado del servidor
- **Express**: Framework para aplicaciones web de Node.js
- **MongoDB**: Base de datos NoSQL para almacenamiento de datos
- **Mongoose**: ODM (Object Data Modeling) para MongoDB
- **JWT**: JSON Web Tokens para autenticación
- **bcryptjs**: Librería para encriptación de contraseñas
- **dotenv**: Para gestión de variables de entorno

### Frontend
- **Angular 19**: Framework para desarrollo de aplicaciones web
- **Angular Material**: Componentes UI basados en Material Design
- **Bootstrap 5**: Framework CSS para diseño responsive
- **RxJS**: Librería para programación reactiva
- **Angular JWT**: Para manejo de tokens JWT en el cliente

## Requisitos Previos

Para ejecutar este proyecto necesitarás tener instalado:

1. **Node.js** (versión 18 o superior)
2. **npm** (normalmente viene con Node.js)
3. **MongoDB** (versión 6.0 o superior)
4. **Angular CLI** (versión 19)

## Instalación y Configuración

### Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd rutinas-aprendizaje
```

### Configuración del Backend

1. Navega al directorio del backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz del directorio backend con el siguiente contenido:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/rutinas-aprendizaje
JWT_SECRET=rutinas_aprendizaje_secreto_seguro_2025
```

4. Asegúrate de que MongoDB esté en ejecución en tu sistema.

### Configuración del Frontend

1. Navega al directorio del frontend:
```bash
cd ../frontend
```

2. Instala las dependencias:
```bash
npm install
```

## Ejecución del Proyecto

### Iniciar el Backend

1. Desde el directorio `backend`:
```bash
npm run dev
```
El servidor se iniciará en `http://localhost:3000`.

### Iniciar el Frontend

1. Desde el directorio `frontend`:
```bash
npm start
```
La aplicación se iniciará en `http://localhost:4200`.

## Estructura del Proyecto

### Backend

```
backend/
├── middleware/     # Middleware para autenticación y validación
├── models/         # Modelos de datos (User, Profile, Routine)
├── routes/         # Rutas de la API
├── .env            # Variables de entorno
├── package.json    # Dependencias y scripts
└── server.js       # Punto de entrada de la aplicación
```

### Frontend

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/    # Componentes de la aplicación
│   │   │   ├── activity-calendar/   # Calendario de actividades
│   │   │   ├── auth/                # Componentes de autenticación
│   │   │   ├── dashboard/           # Panel principal
│   │   │   ├── home/                # Página de inicio
│   │   │   ├── profile/             # Gestión de perfil
│   │   │   ├── routine/             # Visualización de rutinas
│   │   │   ├── routine-editor/      # Editor de rutinas
│   │   │   └── routine-list/        # Lista de rutinas
│   │   ├── guards/        # Guardias de rutas
│   │   ├── models/        # Interfaces y modelos
│   │   ├── services/      # Servicios para comunicación con la API
│   │   ├── app.module.ts  # Módulo principal
│   │   └── app-routing.module.ts  # Configuración de rutas
│   ├── assets/         # Recursos estáticos
│   ├── environments/   # Configuración de entornos
│   └── index.html      # Página principal
└── package.json        # Dependencias y scripts
```

## Funcionalidades Implementadas

### Autenticación y Usuarios
- Registro de usuarios
- Inicio de sesión
- Protección de rutas con guardias de autenticación
- Gestión de tokens JWT

### Perfiles de Usuario
- Creación y edición de perfil
- Gestión de intereses y disponibilidad
- Establecimiento de metas de aprendizaje

### Rutinas de Aprendizaje
- Creación, edición y eliminación de rutinas
- Asignación de actividades a días y horarios específicos
- Visualización de rutinas en formato lista y calendario
- Validación de formularios

### Interfaz de Usuario
- Diseño responsive con Bootstrap 5
- Componentes interactivos con Angular Material
- Navegación intuitiva entre secciones
- Feedback visual para acciones del usuario

## Uso de la Aplicación

1. **Registro e Inicio de Sesión**: Crea una cuenta o inicia sesión si ya tienes una.
2. **Completa tu Perfil**: Define tus intereses, metas y disponibilidad horaria.
3. **Crea Rutinas**: Genera rutinas personalizadas con actividades específicas.
4. **Visualiza tus Rutinas**: Consulta tus rutinas en formato lista o calendario.
5. **Gestiona tus Actividades**: Añade, modifica o elimina actividades según tus necesidades.


