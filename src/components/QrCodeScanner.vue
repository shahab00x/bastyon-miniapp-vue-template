<script setup lang="ts">
import { QrcodeStream } from 'vue-qrcode-reader'
import { PriceService, SdkService } from '../composables'

const emit = defineEmits<{
  (e: 'scan', data: { address: string, amount: number }): void
}>()

const error = ref('')
const isScanning = ref(false)
const scanResult = ref<{ address: string, amount: number } | null>(null)
const usdAmount = ref('$0.00')

// Handle successful QR code scan
async function onDecode(result: string) {
  try {
    const data = JSON.parse(result)

    if (!data.address || !data.amount) {
      error.value = 'Invalid QR code: Missing required fields'
      return
    }

    scanResult.value = {
      address: data.address,
      amount: data.amount,
    }

    // Calculate USD amount
    const usdValue = await PriceService.convertPkoinToUSD(data.amount)
    usdAmount.value = PriceService.formatUSD(usdValue)

    // Stop scanning after successful scan
    isScanning.value = false

    // Emit scan event
    emit('scan', scanResult.value)
  }
  catch (e) {
    error.value = 'Invalid QR code format'
    console.error('Error parsing QR code:', e)
  }
}

// Handle camera errors
function onError(err: Error) {
  error.value = `Camera error: ${err.message}`
  console.error('QR scanner error:', err)
}

// Reset scanner
function resetScanner() {
  error.value = ''
  scanResult.value = null
  isScanning.value = true
}

// Send payment
async function sendPayment() {
  if (!scanResult.value)
    return

  try {
    // Request payment permission if not already granted
    await SdkService.checkAndRequestPermissions(['payment'])

    // Implement payment logic here using the Bastyon SDK
    // This is a placeholder for the actual implementation
    console.log('Sending payment:', scanResult.value)

    // Reset scanner after payment
    resetScanner()
  }
  catch (e) {
    error.value = `Payment error: ${(e as Error).message}`
    console.error('Payment error:', e)
  }
}

// Initialize scanner
onMounted(() => {
  isScanning.value = true

  // Request camera permission
  SdkService.checkAndRequestPermissions(['camera']).catch((e) => {
    error.value = `Permission error: ${e.message}`
    console.error('Permission error:', e)
  })
})
</script>

<template>
  <div class="qr-scanner-container">
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="resetScanner">
        Try Again
      </button>
    </div>

    <div v-else-if="scanResult" class="scan-result">
      <h3>Payment Details</h3>
      <div class="payment-info">
        <div class="info-row">
          <span class="label">Address:</span>
          <span class="value">{{ scanResult.address }}</span>
        </div>
        <div class="info-row">
          <span class="label">Amount:</span>
          <span class="value">{{ scanResult.amount }} PKOIN</span>
        </div>
        <div class="info-row">
          <span class="label">USD Value:</span>
          <span class="value">{{ usdAmount }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <button class="cancel-button" @click="resetScanner">
          Cancel
        </button>
        <button class="pay-button" @click="sendPayment">
          Send Payment
        </button>
      </div>
    </div>

    <div v-else-if="isScanning" class="scanner">
      <QrcodeStream @decode="onDecode" @error="onError" />
      <div class="scanner-overlay">
        <div class="scanner-frame" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-scanner-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 0.5rem;
  background-color: var(--bg-secondary);
}

.scanner {
  position: relative;
  width: 100%;
  height: 300px;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  width: 200px;
  height: 200px;
  border: 2px solid #fff;
  border-radius: 1rem;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.5);
}

.error-message {
  padding: 2rem;
  text-align: center;
  color: #ff4d4f;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  background-color: #1890ff;
  color: white;
  cursor: pointer;
}

.scan-result {
  padding: 1.5rem;
}

.scan-result h3 {
  margin-top: 0;
  text-align: center;
}

.payment-info {
  margin: 1.5rem 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button,
.pay-button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
}

.cancel-button {
  background-color: #f0f0f0;
  color: #333;
}

.pay-button {
  background-color: #52c41a;
  color: white;
}
</style>
