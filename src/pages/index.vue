<script setup lang="ts">
import QrCodeGenerator from '../components/QrCodeGenerator.vue'
import QrCodeScanner from '../components/QrCodeScanner.vue'
import { PriceService, SdkService } from '../composables'

defineOptions({
  name: 'QRPaymentApp',
})

const activeTab = ref('receive')
const userAddress = ref('')
const amount = ref(0)
const notes = ref('')
const sendAddress = ref('')
const sendAmount = ref(0)
const sendNotes = ref('')
const usdAmount = ref('$0.00')
const sendUsdAmount = ref('$0.00')

const developerAddress = 'PUg3fuJRCeN1nae2BnZQzW6SodDxRovNS2'

// Initialize SDK and get user address
onMounted(async () => {
  try {
    await SdkService.init()
    await SdkService.checkAndRequestPermissions(['account', 'payment', 'camera'])

    // Get user's address (this would come from the SDK)
    // For now, using a placeholder
    userAddress.value = 'PKoinUserAddress123...'
  }
  catch (error) {
    console.error('Failed to initialize:', error)
  }
})

// Watch amount changes for USD conversion
watch(amount, async (newAmount) => {
  if (newAmount > 0) {
    const usdValue = await PriceService.convertPkoinToUSD(newAmount)
    usdAmount.value = PriceService.formatUSD(usdValue)
  }
  else {
    usdAmount.value = '$0.00'
  }
})

watch(sendAmount, async (newAmount) => {
  if (newAmount > 0) {
    const usdValue = await PriceService.convertPkoinToUSD(newAmount)
    sendUsdAmount.value = PriceService.formatUSD(usdValue)
  }
  else {
    sendUsdAmount.value = '$0.00'
  }
})

function onQrScanned(data: { address: string, amount: number, notes?: string }) {
  sendAddress.value = data.address
  sendAmount.value = data.amount
  sendNotes.value = data.notes || ''
}

async function sendPayment() {
  if (!sendAddress.value || sendAmount.value <= 0) {
    console.warn('Please enter a valid address and amount')
    return
  }

  try {
    // This would use the actual Bastyon SDK payment method
    console.log('Sending payment:', {
      to: sendAddress.value,
      amount: sendAmount.value,
      notes: sendNotes.value,
    })

    console.log('Payment sent successfully!')

    // Reset form
    sendAddress.value = ''
    sendAmount.value = 0
    sendNotes.value = ''
  }
  catch (error) {
    console.error('Payment failed:', error)
  }
}

function openDonateTab() {
  activeTab.value = 'send'
  sendAddress.value = developerAddress
  sendAmount.value = 0
  sendNotes.value = 'Donation to developer'
}
</script>

<template>
  <div class="qr-payment-app">
    <!-- Header -->
    <div class="header">
      <h1>QR Payment</h1>
      <button class="donate-btn" title="Donate to Developer" @click="openDonateTab">
        <div i-carbon-favorite inline-block />
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'receive' }"
        @click="activeTab = 'receive'"
      >
        <div i-carbon-qr-code mr-2 inline-block />
        Receive
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'send' }"
        @click="activeTab = 'send'"
      >
        <div i-carbon-send mr-2 inline-block />
        Send
      </button>
    </div>

    <!-- Receive Tab -->
    <div v-if="activeTab === 'receive'" class="tab-content">
      <div class="form-section">
        <h2>Generate Payment QR Code</h2>

        <div class="form-group">
          <label>Amount (PKOIN)</label>
          <input
            v-model.number="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter amount"
            class="form-input"
          >
          <div class="usd-display">
            ≈ {{ usdAmount }} USD
          </div>
        </div>

        <div class="form-group">
          <label>Notes (Optional)</label>
          <textarea
            v-model="notes"
            placeholder="Add a note for this payment"
            class="form-textarea"
            rows="3"
          />
        </div>

        <div class="form-group">
          <label>Your Address</label>
          <input
            v-model="userAddress"
            type="text"
            placeholder="Your PKOIN address"
            class="form-input"
            readonly
          >
        </div>
      </div>

      <QrCodeGenerator
        :amount="amount"
        :address="userAddress"
        :notes="notes"
      />
    </div>

    <!-- Send Tab -->
    <div v-if="activeTab === 'send'" class="tab-content">
      <div class="form-section">
        <h2>Send Payment</h2>

        <QrCodeScanner
          @scanned="onQrScanned"
          @error="(error) => console.error('Scanner error:', error)"
        />

        <div class="form-group">
          <label>Recipient Address</label>
          <input
            v-model="sendAddress"
            type="text"
            placeholder="Enter recipient address"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label>Amount (PKOIN)</label>
          <input
            v-model.number="sendAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter amount"
            class="form-input"
          >
          <div class="usd-display">
            ≈ {{ sendUsdAmount }} USD
          </div>
        </div>

        <div class="form-group">
          <label>Notes (Optional)</label>
          <textarea
            v-model="sendNotes"
            placeholder="Add a note for this payment"
            class="form-textarea"
            rows="3"
          />
        </div>

        <button
          class="send-btn"
          :disabled="!sendAddress || sendAmount <= 0"
          @click="sendPayment"
        >
          <div i-carbon-send mr-2 inline-block />
          Send {{ sendAmount }} PKOIN
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-payment-app {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.donate-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.donate-btn:hover {
  transform: scale(1.1);
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
}

.tab {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab.active {
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
  margin-bottom: -2px;
}

.tab:hover {
  color: #3b82f6;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
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

.form-section {
  margin-bottom: 2rem;
}

.form-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.usd-display {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.send-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .qr-payment-app {
    color: #f9fafb;
  }

  .form-input,
  .form-textarea {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .form-group label {
    color: #d1d5db;
  }

  .tabs {
    border-bottom-color: #4b5563;
  }
}
</style>
