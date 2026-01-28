// src/layouts/MainLayout.vue
<script setup lang="ts">
import Logo from '@/components/Logo.vue'
import miLogoWebp from '@/assets/Logo.webp'
// (No necesitamos script por ahora)
</script>

<template>
  <div class="main-layout">
    <header class="main-header">
      <Logo to="/" :imgSrc="miLogoWebp"> </Logo>
      <nav class="main-nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/registro">Registro</RouterLink>
        <RouterLink to="/login">Inicio</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
}

.main-nav a {
  margin-left: 1.5rem;
  font-size: 1rem;
  color: #555;
  text-decoration: none;
}

.main-nav a:hover {
  text-decoration: underline;
}

/* El contenido (tus vistas) ocupará el resto del espacio */
.content {
  flex: 1;
  padding: 2rem;
  /* Podemos centrar el contenido de las vistas (como Login) 
    fácilmente desde aquí si queremos
  */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa; /* Fondo gris claro para el contenido */
}
</style>
