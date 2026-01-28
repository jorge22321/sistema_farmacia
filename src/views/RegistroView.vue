// src/views/RegistroView.vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router' // Para redirigir al login al terminar
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()

// Datos del formulario
const nombreCompleto = ref('')
const correo = ref('') // Nota: Tu tabla Empleados NO tiene campo correo, no se guardará en BD por ahora.
const usuario = ref('')
const contrasena = ref('')

// Mensajes de feedback
const mensajeError = ref('')
const cargando = ref(false)

async function handleRegistro() {
  mensajeError.value = ''

  cargando.value = true

  try {
    // 2. Petición al Backend
    const respuesta = await fetch('http://localhost:3000/api/auth/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombreCompleto: nombreCompleto.value,
        usuario: usuario.value,
        contrasena: contrasena.value,
        correo: correo.value,
      }),
    })

    const datos = await respuesta.json()

    if (!respuesta.ok) {
      throw new Error(datos.message || 'Error al registrar')
    }

    // 3. Éxito
    alert('¡Registro exitoso! Ahora puedes iniciar sesión.')
    router.push('/login') // Redirigir al login
  } catch (error: any) {
    mensajeError.value = error.message
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="registro-card">
    <h2 class="registro-title">Registro</h2>

    <form @submit.prevent="handleRegistro">
      <BaseInput v-model="nombreCompleto" label="Nombre Completo" type="text" required />
      <BaseInput v-model="correo" label="Correo Electrónico (opcional)" type="email" />
      <BaseInput v-model="usuario" label="Usuario" type="text" required />
      <BaseInput v-model="contrasena" label="Contraseña" type="password" required />

      <p v-if="mensajeError" class="error-msg">{{ mensajeError }}</p>

      <BaseButton type="submit" :disabled="cargando">
        {{ cargando ? 'Registrando...' : 'Registrarse' }}
      </BaseButton>
    </form>
  </div>
</template>

<style scoped>
.registro-card {
  width: 100%;
  max-width: 400px; /* Un poco más ancha para más campos */
  padding: 1rem 2.5rem; /* 40px */
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.registro-title {
  text-align: center;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #212529;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Espacio entre los campos */
}
</style>
