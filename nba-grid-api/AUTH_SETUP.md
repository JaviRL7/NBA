# 🔐 NBA Grid Authentication Setup

## Backend Creado ✅

He creado un backend completo con autenticación en `auth-backend.js` que incluye:

### ✅ **Funcionalidades Implementadas**
- **Registro de usuarios** (username/password)
- **Login tradicional** con JWT tokens
- **Base de datos SQLite** para persistir usuarios
- **Tabla de partidas** para guardar progreso
- **Leaderboard** con ranking de jugadores
- **API protegida** con middleware de autenticación
- **Hash de contraseñas** con bcrypt

### 🗄️ **Estructura de Base de Datos**

#### Tabla `users`:
- `id` - ID único del usuario
- `username` - Nombre de usuario (único)
- `email` - Email del usuario (único)
- `password` - Contraseña hasheada
- `google_id` - ID de Google (para OAuth)
- `display_name` - Nombre para mostrar
- `avatar_url` - URL del avatar
- `games_played` - Partidas jugadas
- `games_won` - Partidas ganadas
- `best_time` - Mejor tiempo de completado

#### Tabla `games`:
- `id` - ID de la partida
- `user_id` - ID del usuario
- `grid_data` - Datos del grid (JSON)
- `completed` - Si se completó la partida
- `completion_time` - Tiempo de completado
- `date_played` - Fecha de la partida

### 🚀 **Cómo usar el Backend**

```bash
# 1. Instalar dependencias (ya hecho)
cd nba-grid-api
npm install

# 2. Iniciar servidor de autenticación
npm run auth

# El servidor correrá en http://localhost:5000
```

### 📡 **Endpoints Disponibles**

| Método | Endpoint | Descripción | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Registro de usuario | ❌ |
| POST | `/auth/login` | Login de usuario | ❌ |
| POST | `/auth/google` | Login con Google | ❌ |
| GET | `/auth/profile` | Perfil del usuario | ✅ |
| POST | `/game/save` | Guardar partida | ✅ |
| GET | `/leaderboard` | Ranking de jugadores | ❌ |
| GET | `/health` | Estado del servidor | ❌ |

### 📝 **Ejemplo de Uso**

#### Registro:
```javascript
const response = await fetch('http://localhost:5000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'javirl7',
    email: 'jrlsanlucar11@gmail.com',
    password: 'mypassword123'
  })
})
```

#### Login:
```javascript
const response = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'javirl7',
    password: 'mypassword123'
  })
})

const { token, user } = await response.json()
// Guardar token en localStorage
localStorage.setItem('nba-grid-token', token)
```

---

## 🔍 **Google Auth Setup**

Para implementar Google Authentication necesitas:

### **Paso 1: Crear proyecto en Google Cloud Console**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la "Google Sign-In API"

### **Paso 2: Configurar OAuth 2.0**
1. Ve a "APIs & Services" > "Credentials"
2. Crear "OAuth 2.0 Client ID"
3. Configurar origen autorizado:
   - `http://localhost:3000` (frontend)
   - `http://localhost:5000` (backend)

### **Paso 3: Variables de entorno**
Crear archivo `.env` en `/nba-grid-api/`:
```env
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
JWT_SECRET=tu_jwt_secret_super_seguro
```

### **Paso 4: Código para Google Auth (Frontend)**
```javascript
// En el frontend (React)
import { GoogleLogin } from '@react-oauth/google'

function GoogleSignIn() {
  const handleGoogleSuccess = async (credentialResponse) => {
    const response = await fetch('http://localhost:5000/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        googleToken: credentialResponse.credential
      })
    })

    const data = await response.json()
    // Manejar respuesta
  }

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.log('Google Login Failed')}
    />
  )
}
```

### **Paso 5: Instalar dependencias adicionales (Frontend)**
```bash
cd nba-grid-app
npm install @react-oauth/google
```

### **¿Necesitas ayuda con Google Auth?**
Si quieres que implemente la configuración completa de Google Auth, necesito que:

1. **Crees el proyecto en Google Cloud** (es gratis)
2. **Me proporciones el Client ID**
3. **O me digas si prefieres que te explique paso a paso**

El backend ya está listo para recibir tokens de Google, solo falta la configuración de credenciales.

---

## 🎯 **Próximos Pasos Sugeridos**

1. **Probar el backend** con registro/login tradicional
2. **Configurar Google Auth** (si lo deseas)
3. **Integrar el frontend** con el sistema de autenticación
4. **Añadir componentes de login/registro** al React app
5. **Implementar persistencia de partidas**

¿Quieres que proceda con alguno de estos pasos?