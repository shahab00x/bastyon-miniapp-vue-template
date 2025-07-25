<script setup lang="ts">
import { QrcodeStream } from 'vue-qrcode-reader'
import { PriceService, SdkService } from '../composables'

const address = ref('')
const amount = ref(0)
const notes = ref('')
const usdAmount = ref('$0.00')
const isLoading = ref(false)
const error = ref('')
const isScanning = ref(false)

// Update USD amount when PKOIN amount changes
watch(amount, async (newAmount) => {
  if (newAmount > 0) {
    isLoading.value = true
    try {
      const usdValue = await PriceService.convertPkoinToUSD(newAmount)
      usdAmount.value = PriceService.formatUSD(usdValue)
    }
    catch (error) {
      console.error('Error converting to USD:', error)
    }
    finally {
      isLoading.value = false
    }
  }
  else {
    usdAmount.value = '$0.00'
  }
}, { immediate: true })

// Handle successful QR code scan
async function onDecode(result) {
  try {
    const data = JSON.parse(result)

    if (!data.address || !data.amount) {
      error.value = 'Invalid QR code: Missing required fields'
      return
    }

    // Fill the form with scanned data
    address.value = data.address
    amount.value = data.amount
    notes.value = data.notes || ''

    // Calculate USD amount
    const usdValue = await PriceService.convertPkoinToUSD(data.amount)
    usdAmount.value = PriceService.formatUSD(usdValue)

    // Stop scanning after successful scan
    isScanning.value = false
  }
  catch (e) {
    error.value = 'Invalid QR code format'
    console.error('Error parsing QR code:', e)
  }
}

// Handle camera errors
function onError(err) {
  error.value = `Camera error: ${err.message}`
  console.error('QR scanner error:', err)
}

// Toggle scanner
function toggleScanner() {
  isScanning.value = !isScanning.value
  if (!isScanning.value)
    error.value = ''
}

// Send payment
async function sendPayment() {
  if (!address.value || amount.value <= 0) {
    error.value = 'Please enter a valid address and amount'
    return
  }

  try {
    // Request payment permission if not already granted
    await SdkService.checkAndRequestPermissions(['payment'])

    // Implement payment logic here using the Bastyon SDK
    // This is a placeholder for the actual implementation
    console.log('Sending payment:', {
      address: address.value,
      amount: amount.value,
      notes: notes.value,
    })

    // Reset form after payment
    resetForm()
  }
  catch (e) {
    error.value = `Payment error: ${e.message}`
    console.error('Payment error:', e)
  }
}

// Reset form
function resetForm() {
  address.value = ''
  amount.value = 0
  notes.value = ''
  error.value = ''
  isScanning.value = false
}

// Fill form with developer address for donation
function donateToDevs() {
  address.value = 'PUg3fuJRCeN1nae2BnZQzW6SodDxRovNS2'
  notes.value = 'Donation to QR Payment App developer'
}

// Initialize component
onMounted(() => {
  // Request camera permission
  SdkService.checkAndRequestPermissions(['camera']).catch((e) => {
    console.error('Camera permission error:', e)
  })
})
</script>

<template>
  <div class="payment-form">
    <div class="form-group">
      <label for="recipient-address">Recipient Address</label>
      <input
        id="recipient-address"
        v-model="address"
        type="text"
        placeholder="Enter recipient's PKOIN address"
        class="form-input"
      >
    </div>

    <div class="form-group">
      <label for="payment-amount">Amount (PKOIN)</label>
      <input
        id="payment-amount"
        v-model.number="amount"
        type="number"
        min="0"
        step="0.01"
        placeholder="Enter amount"
        class="form-input"
      >
      <div class="usd-conversion">
        <span v-if="isLoading">Converting...</span>
        <span v-else>≈ {{ usdAmount }} USD</span>
      </div>
    </div>

    <div class="form-group">
      <label for="payment-notes">Notes (Optional)</label>
      <textarea
        id="payment-notes"
        v-model="notes"
        placeholder="Add optional payment notes"
        class="form-input notes-input"
        rows="3"
      />
    </div>

    <div class="scanner-controls">
      <button class="scan-btn btn" @click="toggleScanner">
        <span v-if="!isScanning">Scan QR Code</span>
        <span v-else>Cancel Scanning</span>
      </button>

      <button class="send-btn btn" :disabled="!address || amount <= 0" @click="sendPayment">
        Send Payment
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="isScanning" class="scanner-container">
      <QrcodeStream @decode="onDecode" @error="onError" />
      <div class="scanner-overlay">
        <div class="scanner-frame" />
      </div>
    </div>

    <div class="donate-container">
      <button class="donate-btn" @click="donateToDevs">
        Donate to Developer
      </button>
    </div>
  </div>
</template>

<style scoped>
.payment-form {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
}

.notes-input {
  resize: vertical;
}

.usd-conversion {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: right;
}

.scanner-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.scan-btn {
  background-color: #1890ff;
  color: white;
}

.scan-btn:hover {
  background-color: #40a9ff;
}

.send-btn {
  background-color: #52c41a;
  color: white;
}

.send-btn:hover {
  background-color: #73d13d;
}

.send-btn:disabled {
  background-color: #d9d9d9;
  color: #999999;
  cursor: not-allowed;
}

.error-message {
  margin: 1rem 0;
  padding: 0.75rem;
  border-radius: 0.25rem;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

.scanner-container {
  position: relative;
  width: 100%;
  height: 300px;
  margin: 1rem 0;
  overflow: hidden;
  border-radius: 0.5rem;
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

.donate-container {
  margin-top: 2rem;
  text-align: center;
}

.donate-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  background-color: transparent;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.donate-btn:hover {
  color: #1890ff;
  text-decoration: underline;
}
</style>
