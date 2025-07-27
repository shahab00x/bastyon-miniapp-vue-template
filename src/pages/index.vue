<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { walletService } from '../composables/walletService'
import QRCodeDisplay from '../components/QRCodeDisplay.vue'
import SendPayment from '../components/SendPayment.vue'

defineOptions({
  name: 'IndexPage',
})

const activeTab = ref<'receive' | 'send'>('receive')
const receiveAmount = ref(0)

const wallet = walletService

onMounted(async () => {
  await wallet.initializeWallet()
})

function handleCopied(type: string) {
  console.log(`${type} copied to clipboard`)
}
</script>

<template>
  <div class="qr-payment-app">
    <div class="mx-auto max-w-2xl p-6">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-3xl text-gray-800 font-bold">
          QR Payment App
        </h1>
        <p class="text-gray-600">
          Send and receive PKOIN payments with ease
        </p>
      </div>

      <!-- Wallet Info -->
      <div class="mb-6 rounded-lg bg-white p-6 shadow-md">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            Wallet Information
          </h2>
          <button
            class="hover:bg-blue-6600 rounded bg-blue-500 px-3 py-1 text-sm text-white"
            :disabled="wallet.isLoading.value"
            @click="wallet.refreshBalance()"
          >
            Refresh
          </button>
        </div>

        <div v-if="wallet.isLoading.value" class="py-4 text-center">
          <div class="mx-auto h-8 w-8 animate-spin border-b-2 border-blue-500 rounded-full" />
          <p class="mt-2 text-gray-600">
            Loading wallet...
          </p>
        </div>

        <div v-else-if="wallet.hasError.value" class="py-4 text-center">
          <div class="mb-2 text-red-500">
            {{ wallet.errorValue.value }}
          </div>
          <button
            class="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
            @click="wallet.clearError(); wallet.initializeWallet()"
          >
            Retry
          </button>
        </div>

        <div v-else-if="wallet.address.value" class="space-y-3">
          <div>
            <span class="text-sm font-medium">Address:</span>
            <div class="mt-1 rounded bg-gray-100 p-2 text-sm font-mono">
              {{ wallet.address.value }}
            </div>
          </div>
          <div>
            <span class="text-sm font-medium">Balance:</span>
            <span class="ml-2 text-lg text-green-600 font-bold">
              {{ wallet.balance.value }} PKOIN
            </span>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="rounded-lg bg-white shadow-md">
        <div class="border-b border-gray-200">
          <nav class="flex px-6 space-x-8">
            <button
              class="border-b-2 px-1 py-4 text-sm font-medium" :class="[
                activeTab === 'receive'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              ]"
              @click="activeTab = 'receive'"
            >
              Receive Payment
            </button>
            <button
              class="border-b-2 px-1 py-4 text-sm font-medium" :class="[
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              ]"
              @click="activeTab = 'send'"
            >
              Send Payment
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Receive Tab -->
          <div v-if="activeTab === 'receive'" class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium">
                Amount to receive (optional)
              </label>
              <input
                v-model.number="receiveAmount"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.000"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <QRCodeDisplay
              :address="wallet.address.value"
              :amount="receiveAmount"
              title="Receive Payment"
              description="Scan this QR code to receive PKOIN"
              @copied="handleCopied"
            />
          </div>

          <!-- Send Tab -->
          <div v-if="activeTab === 'send'">
            <SendPayment
              :balance="wallet.balance.value"
            />
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mt-6 text-center text-sm text-gray-600">
        <p>
          This app uses your existing Bastyon wallet. Make sure you're logged in to Bastyon.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-payment-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

:global(body) {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
