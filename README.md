# API SaaS NestJS

API backend SaaS construida con NestJS, diseñada para aplicaciones modernas que requieren autenticación flexible, gestión de usuarios y arquitectura escalable.

## 🚀 Características

### Autenticación Multi-Estrategia
- **JWT (JSON Web Tokens)**: Autenticación estándar con tokens Bearer
- **Clerk Integration**: Integración completa con Clerk para autenticación gestionada
- **API Keys**: Autenticación mediante API Keys para servicios y aplicaciones

### Funcionalidades Principales
- ✅ Autenticación y autorización robusta con múltiples estrategias
- ✅ Gestión de usuarios con roles y permisos
- ✅ Sistema de productos completo (CRUD)
- ✅ Validación de datos con class-validator y class-transformer
- ✅ Documentación automática con Swagger
- ✅ TypeORM para gestión de base de datos
- ✅ PostgreSQL como base de datos principal
- ✅ Configuración mediante variables de entorno
- ✅ CORS configurado
- ✅ Testing con Jest
- ✅ Arquitectura modular y escalable

## 🛠️ Stack Tecnológico

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: TypeORM
- **Autenticación**: 
  - Passport.js
  - JWT
  - Clerk
  - API Keys
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest

## 📋 Requisitos Previos

- Node.js 24.x
- npm >= 11.0.0
- PostgreSQL (base de datos)
- Cuenta de Clerk (opcional, para autenticación con Clerk)

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd api-saas-nestjs
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno (ver sección de Configuración)

4. Ejecuta las migraciones de base de datos (si aplica)

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Servidor
PORT=4000
API_PREFIX=api
STAGE=development

# Base de Datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/nombre_db

# JWT
JWT_SECRET=tu_secreto_jwt_super_seguro

# Clerk (Opcional)
CLERK_SECRET_KEY=tu_clerk_secret_key
```

### Variables de Entorno Requeridas

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `PORT` | Puerto del servidor | ✅ |
| `DATABASE_URL` | URL de conexión a PostgreSQL | ✅ |
| `API_PREFIX` | Prefijo para las rutas de la API | ✅ |
| `STAGE` | Entorno (development/production) | ✅ |
| `JWT_SECRET` | Secreto para firmar tokens JWT | ✅ |
| `CLERK_SECRET_KEY` | Clave secreta de Clerk | ⚠️ Solo si usas Clerk |

## 🚦 Uso

### Desarrollo
```bash
npm run start:dev
```

El servidor se iniciará en `http://localhost:4000` (o el puerto configurado en `.env`)

### Producción
```bash
npm run build
npm run start:prod
```

### Modo Debug
```bash
npm run start:debug
```

## 🔐 Autenticación

### JWT Authentication

Autenticación mediante tokens JWT en el header `Authorization`:

```bash
Authorization: Bearer <token>
```

**Ejemplo de login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

### Clerk Authentication

Autenticación mediante tokens de Clerk:

```bash
Authorization: Bearer <clerk_token>
```

### API Key Authentication

Autenticación mediante API Keys:

```bash
Authorization: Api-Key <api_key>
```

### Guard Multi-Estrategia

El proyecto incluye un guard que permite usar múltiples estrategias de autenticación simultáneamente:

```typescript
@UseGuards(MultiAuthGuard)
@Get('protected-route')
getProtectedData(@GetUser() user: User) {
  return { message: 'Datos protegidos', user };
}
```

## 📁 Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación
│   ├── decorators/         # Decoradores personalizados
│   │   ├── auth.decorator.ts
│   │   ├── get-user.decorator.ts
│   │   └── role-protected.decorator.ts
│   ├── dto/                # Data Transfer Objects
│   │   ├── create-user.dto.ts
│   │   └── login-user.dto.ts
│   ├── entities/           # Entidades de base de datos
│   │   ├── user.entity.ts
│   │   └── apikey.entity.ts
│   ├── guards/             # Guards de autenticación
│   │   ├── multi.guard.ts
│   │   └── user-role/
│   ├── interfaces/         # Interfaces TypeScript
│   ├── providers/          # Providers personalizados
│   ├── strategies/         # Estrategias de Passport
│   │   ├── jwt.strategy.ts
│   │   ├── clerk.strategy.ts
│   │   └── apikey.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── products/               # Módulo de productos
│   ├── dto/
│   ├── entities/
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── config/                 # Configuración
│   ├── envs.ts
│   └── index.ts
├── app.module.ts           # Módulo principal
└── main.ts                 # Punto de entrada
```

## 📜 Scripts Disponibles

| Script | Descripción |
|-------|-------------|
| `npm run build` | Compila el proyecto TypeScript |
| `npm run start` | Inicia el servidor |
| `npm run start:dev` | Inicia en modo desarrollo con hot-reload |
| `npm run start:debug` | Inicia en modo debug |
| `npm run start:prod` | Inicia en modo producción |
| `npm run lint` | Ejecuta el linter y corrige errores |
| `npm run format` | Formatea el código con Prettier |
| `npm run test` | Ejecuta las pruebas unitarias |
| `npm run test:watch` | Ejecuta pruebas en modo watch |
| `npm run test:cov` | Genera reporte de cobertura |
| `npm run test:debug` | Ejecuta pruebas en modo debug |
| `npm run test:e2e` | Ejecuta pruebas end-to-end |

## 🧪 Testing

### Pruebas Unitarias
```bash
npm run test
```

### Pruebas con Cobertura
```bash
npm run test:cov
```

### Pruebas End-to-End
```bash
npm run test:e2e
```

## 📚 Documentación de API

La documentación de la API está disponible mediante Swagger. Una vez que el servidor esté corriendo, accede a:

```
http://localhost:4000/api/docs
```

(Nota: Asegúrate de que Swagger esté configurado en tu aplicación)

## 🏗️ Arquitectura

El proyecto sigue los principios de arquitectura modular de NestJS:

- **Módulos**: Cada funcionalidad está encapsulada en su propio módulo
- **Controladores**: Manejan las peticiones HTTP
- **Servicios**: Contienen la lógica de negocio
- **Entidades**: Representan las tablas de la base de datos
- **DTOs**: Validan y transforman los datos de entrada
- **Guards**: Protegen las rutas y validan autenticación/autorización
- **Strategies**: Implementan las diferentes estrategias de autenticación

## 🔒 Seguridad

- Validación de datos en todos los endpoints
- Autenticación multi-estrategia
- Protección de rutas con guards
- Validación de roles y permisos
- CORS configurado
- Variables de entorno para secretos

## 📝 Licencia

Este proyecto está protegido por **FasteryDev LLC**. Todos los derechos reservados.

Para más información sobre los términos de licencia, consulta el archivo [LICENSE.md](LICENSE.md).

## 👥 Autor

**FasteryDev LLC** - info@fastery.dev

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub.
