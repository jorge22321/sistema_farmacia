# Sistema_Farmacia.vue

Aplicación web desarrollada para la administración básica de una farmacia.
El sistema permite gestionar productos, controlar inventario, registrar ventas y administrar clientes desde una interfaz simple y eficiente.

Este proyecto fue construido utilizando Vue 3 y Vite, aprovechando su rendimiento y arquitectura basada en componentes para desarrollar una aplicación moderna, escalable y fácil de mantener.

El objetivo del sistema es digitalizar los procesos principales de una farmacia pequeña o mediana, permitiendo tener un mejor control del stock, mejorar el registro de ventas y facilitar la consulta de información del negocio.


## Tecnologías utilizadas
El proyecto fue desarrollado utilizando herramientas modernas del ecosistema JavaScript.

Vue 3

Vite

JavaScript / TypeScript

Node.js

Vitest para pruebas unitarias

Playwright para pruebas end-to-end

ESLint para control de calidad del código

## Funcionalidades del sistema

El sistema se organiza en diferentes módulos que cubren los procesos principales de una farmacia, permitiendo gestionar ventas, inventario, recetas médicas y administración general desde una sola plataforma.

---

### Panel principal

Pantalla inicial del sistema que permite acceder rápidamente a los diferentes módulos de gestión y visualizar las opciones principales del sistema.

---

### Punto de venta

Módulo encargado de registrar las ventas realizadas en la farmacia.

**Funciones principales:**

- Registrar ventas de medicamentos
- Calcular totales automáticamente
- Gestionar productos dentro de una venta
- Registrar transacciones del día

---

### Dispensación

Módulo orientado al control y gestión de recetas médicas.

#### Dispensador de recetas

- Registro de recetas médicas
- Asociación de medicamentos con la receta
- Control de dispensación de medicamentos

#### Historial

- Registro histórico de recetas dispensadas
- Consulta de operaciones realizadas

---

### Inventario

Módulo encargado de la gestión completa del inventario de medicamentos.

#### Control de productos

Permite administrar el catálogo de medicamentos disponibles en el sistema.

#### Añadir lote

- Registro de nuevos lotes de medicamentos
- Control de entrada de productos al inventario

#### Ver lotes (stock)

- Consulta de lotes disponibles
- Visualización de cantidades actuales en inventario

#### Ver productos

Listado completo de medicamentos registrados en el sistema.

#### Ver categorías

Administración y clasificación de medicamentos por categorías.

---

### Informes

Sección dedicada a la visualización de información relevante del negocio.

#### Informe de ventas

- Reportes de ventas realizadas
- Análisis básico de transacciones

#### Lotes por vencer

- Identificación de medicamentos próximos a vencer
- Control preventivo de productos caducados

#### Stock bajo

- Detección de productos con bajo inventario
- Apoyo para la reposición de medicamentos

---

### Administración

Módulo de configuración y gestión interna del sistema.

#### Empleados

- Gestión del personal que utiliza el sistema
- Registro y administración de usuarios del sistema

#### Ubicaciones

- Configuración de ubicaciones dentro del inventario
- Organización física de productos

#### Laboratorios

- Registro de laboratorios o proveedores de medicamentos
- Asociación de productos con sus fabricantes
- 
## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
