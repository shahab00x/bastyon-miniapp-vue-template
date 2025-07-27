<script setup lang="ts">
import * as QRCode from 'qrcode-generator'
import { SdkService } from '../composables/sdkService'

defineOptions({
  name: 'PaymentQR',
})

const walletAddress = ref('')
const amount = ref('')
const description = ref('')
const qrCodeDataUrl = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const userInfo = ref<any>(null)

// Initialize SDK and get user wallet address
onMounted(async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // Request permissions to access account info
    await SdkService.checkAndRequestPermissions(['account'])

    // Get app info which should contain user data
    const appInfo = await SdkService.getAppInfo()
    userInfo.value = appInfo

    // Try to get user wallet address through RPC call
    try {
      const userAccount = await SdkService.rpc('getaddressesbyaccount', [''])
      if (userAccount && Array.isArray(userAccount) && userAccount.length > 0) {
        walletAddress.value = userAccount[0]
      }
      else {
        // Fallback: try to get address from account info
        const accountInfo = await SdkService.rpc('getaccountaddress', [''])
        if (accountInfo)
          walletAddress.value = accountInfo as string
      }
    }
    catch (rpcError) {
      console.warn('Could not get wallet address via RPC, using fallback method')
      // If RPC fails, try to get from app info
      if (appInfo && (appInfo as any).address) {
        walletAddress.value = (appInfo as any).address
      }
      else {
        // Generate a placeholder address for demo purposes
        walletAddress.value = 'PQasdP8TgWAkc2RBFgGSpS73xFdE5Rb8Yr'
        errorMessage.value = 'Using demo wallet address. In production, this would be your actual Bastyon wallet address.'
      }
    }

    // Generate initial QR code
    generateQR()
  }
  catch (error) {
    console.error('Error getting wallet address:', error)
    errorMessage.value = 'Error connecting to Bastyon. Please make sure you have granted permission to the mini app.'
    // Use demo address as fallback
    walletAddress.value = 'PQasdP8TgWAkc2RBFgGSpS73xFdE5Rb8Yr'
    generateQR()
  }
  finally {
    isLoading.value = false
  }
})

function generateQR() {
  if (!walletAddress.value)
    return

  try {
    // Create payment URI in Bitcoin format (Bastyon uses Bitcoin-compatible addresses)
    let paymentUri = `bitcoin:${walletAddress.value}`

    const params = []
    if (amount.value && Number.parseFloat(amount.value) > 0)
      params.push(`amount=${amount.value}`)

    if (description.value.trim())
      params.push(`label=${encodeURIComponent(description.value.trim())}`)

    if (params.length > 0)
      paymentUri += `?${params.join('&')}`

    // Generate QR code
    const qr = QRCode(0, 'L')
    qr.addData(paymentUri)
    qr.make()

    // Convert to data URL
    const size = 6
    qrCodeDataUrl.value = qr.createDataURL(size, 2)
  }
  catch (error) {
    console.error('Error generating QR code:', error)
    errorMessage.value = 'Error generating QR code'
  }
}

// Watch for changes to regenerate QR code
watch([amount, description], () => {
  generateQR()
})

function copyAddress() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(walletAddress.value)
      .then(() => {
        // Could add a toast notification here
        console.log('Address copied to clipboard')
      })
      .catch((err) => {
        console.error('Failed to copy address:', err)
      })
  }
}

function shareQR() {
  if (navigator.share && qrCodeDataUrl.value) {
    // Convert data URL to blob and share
    fetch(qrCodeDataUrl.value)
      .then(res => res.blob())
      .then((blob) => {
        const file = new File([blob], 'payment-qr.png', { type: 'image/png' })
        return navigator.share({
          title: 'Payment QR Code',
          text: `Payment request for ${amount.value ? `${amount.value} PKOIN` : 'PKOIN'}`,
          files: [file],
        })
      })
      .catch(err => console.error('Error sharing:', err))
  }
}
</script>

<template>
  <div class="payment-qr-container">
    <div class="mb-6 text-center">
      <h1 class="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
        💰 Bastyon Payment QR
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Generate QR codes to receive PKOIN payments
      </p>
    </div>

    <div v-if="isLoading" class="py-8 text-center">
      <div class="mx-auto h-12 w-12 animate-spin border-b-2 border-blue-600 rounded-full" />
      <p class="mt-4 text-gray-600 dark:text-gray-400">
        Connecting to Bastyon...
      </p>
    </div>

    <div v-else class="space-y-6">
      <!-- Error message -->
      <div v-if="errorMessage" class="border border-yellow-400 rounded bg-yellow-100 px-4 py-3 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
        {{ errorMessage }}
      </div>

      <!-- Wallet Address Display -->
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <label class="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
          Your Wallet Address:
        </label>
        <div class="flex items-center space-x-2">
          <code class="flex-1 break-all border rounded bg-white px-3 py-2 text-sm font-mono dark:bg-gray-900">
            {{ walletAddress }}
          </code>
          <button
            class="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            title="Copy address"
            @click="copyAddress"
          >
            📋
          </button>
        </div>
      </div>

      <!-- Payment Details Form -->
      <div class="rounded-lg bg-gray-50 p-4 space-y-4 dark:bg-gray-800">
        <h3 class="text-lg text-gray-800 font-semibold dark:text-white">
          Payment Details
        </h3>

        <div>
          <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">
            Amount (PKOIN):
          </label>
          <input
            v-model="amount"
            type="number"
            step="0.00001"
            min="0"
            placeholder="0.00"
            class="w-full border border-gray-300 rounded-md bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
        </div>

        <div>
          <label class="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-300">
            Description (optional):
          </label>
          <input
            v-model="description"
            type="text"
            placeholder="Payment for..."
            maxlength="100"
            class="w-full border border-gray-300 rounded-md bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
        </div>
      </div>

      <!-- QR Code Display -->
      <div class="rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
        <h3 class="mb-4 text-lg text-gray-800 font-semibold dark:text-white">
          Payment QR Code
        </h3>

        <div v-if="qrCodeDataUrl" class="inline-block">
          <img
            :src="qrCodeDataUrl"
            alt="Payment QR Code"
            class="mx-auto border-2 border-gray-200 rounded dark:border-gray-600"
          >
          <div class="mt-4 space-x-2">
            <button
              class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              @click="shareQR"
            >
              📤 Share QR
            </button>
            <button
              class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              @click="generateQR"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div v-else class="text-gray-500 dark:text-gray-400">
          No QR code generated
        </div>

        <!-- Payment info -->
        <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p v-if="amount">
            Amount: <strong>{{ amount }} PKOIN</strong>
          </p>
          <p v-if="description">
            Description: <strong>{{ description }}</strong>
          </p>
          <p v-if="!amount && !description" class="italic">
            Enter amount and description above to customize the QR code
          </p>
        </div>
      </div>

      <!-- Instructions -->
      <div class="border border-blue-200 rounded-lg bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h4 class="mb-2 text-lg text-blue-800 font-semibold dark:text-blue-300">
          How to use:
        </h4>
        <ul class="list-disc list-inside text-sm text-blue-700 space-y-1 dark:text-blue-400">
          <li>Share this QR code with someone who wants to send you PKOIN</li>
          <li>They can scan it with their Bastyon wallet or any Bitcoin-compatible wallet</li>
          <li>The amount and description will be pre-filled in their wallet</li>
          <li>Your wallet address is automatically included in the QR code</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-qr-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
