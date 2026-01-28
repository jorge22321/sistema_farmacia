<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()
const usuario = ref('')
const contrasena = ref('')
const errorMsg = ref('')
const cargando = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  cargando.value = true

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: usuario.value,
        contrasena: contrasena.value,
      }),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.message || 'Error al entrar')

    // --- AQUÍ ESTÁ LA CLAVE DEL JWT ---
    // 1. Guardamos el token para usarlo en futuras peticiones
    localStorage.setItem('token', data.token)

    // 2. Guardamos datos del usuario (opcional, para mostrar el nombre)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))

    // 3. REDIRECCIÓN AL DASHBOARD
    // Usamos router.push, que funciona tanto en dev (5173) como en prod (3000)
    router.push('/dashboard')
  } catch (err: any) {
    errorMsg.value = err.message
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login-card">
    <h2 class="login-title">Acceso al Sistema</h2>

    <form @submit.prevent="handleLogin">
      <BaseInput v-model="usuario" label="Usuario" />
      <BaseInput v-model="contrasena" label="Contraseña" type="password" />

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

      <BaseButton type="submit" :disabled="cargando">
        {{ cargando ? 'Verificando...' : 'Ingresar' }}
      </BaseButton>
    </form>
  </div>
</template>

<style scoped>
.login-card {
  width: 100%;
  max-width: 350px;
  padding: 1rem 2.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.login-title {
  text-align: center;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #212529;
}

form {
  display: flex;
  flex-direction: column;

  /*
    ¡AQUÍ ESTÁ LA MAGIA!
    Esta es la propiedad del "padre" que maneja el espaciado.
    'gap' pone 1rem (16px) de espacio vertical ENTRE cada
    elemento (Input, Input y Button).
  */
  gap: 1.5rem;
}

.link-registro {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.7rem;
}

.link-registro a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.link-registro a:hover {
  text-decoration: underline;
}
</style>
