<script setup lang="ts">
import { SdkService } from '../composables'

defineOptions({
  name: 'IndexPage',
})

const activeTab = ref('receive')

// Initialize the Bastyon SDK when the component is mounted
onMounted(async () => {
  try {
    await SdkService.init()
    console.log('Bastyon SDK initialized successfully')
  }
  catch (error) {
    console.error('Failed to initialize Bastyon SDK:', error)
  }
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">
        QR Payment
      </h1>
      <p class="app-subtitle">
        Send and receive PKOIN using QR codes
      </p>
    </header>

    <div class="tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'receive' }"
        @click="activeTab = 'receive'"
      >
        Receive
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'send' }"
        @click="activeTab = 'send'"
      >
        Send
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'receive'" class="tab-pane">
        <PaymentForm />
      </div>
      <div v-else-if="activeTab === 'send'" class="tab-pane">
        <QrCodeScanner />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.app-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.tab-button {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button.active {
  color: var(--text-primary);
  border-bottom: 2px solid #1890ff;
}

.tab-content {
  min-height: 400px;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
