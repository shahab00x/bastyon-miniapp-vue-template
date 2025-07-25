<script setup lang="ts">
import { SdkService } from '~/composables'
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <button icon-btn @click="toggleDark()">
        <div i-carbon-sun dark:i-carbon-moon />
      </button>

      <div class="footer-text">
        <span>QR Payment App for Bastyon</span>
        <span class="version">v1.0.0</span>
      </div>

      <button
        i-carbon-logo-github icon-btn
        rel="noreferrer"
        target="_blank"
        title="GitHub"
        @click="SdkService.openExternalLink('https://github.com/shahab00x/bastyon-miniapp-vue-template')"
      />
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 600px;
  margin: 0 auto;
}

.footer-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.version {
  font-size: 0.625rem;
  opacity: 0.7;
}
</style>
