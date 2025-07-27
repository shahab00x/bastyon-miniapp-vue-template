<script setup lang="ts">
import { SdkService } from '@/composables/sdkService'
import QRCodeVue3 from '@/components/QRCodeVue3.vue'

defineOptions({
  name: 'QRPaymentApp',
})

// Application state
const isLoggedIn = ref(false)
const userInfo = ref<any>(null)
const userBalance = ref(0)
const userAddress = ref('')
const paymentAmount = ref('0.00')
const recipientAddress = ref('')
const showQRCode = ref(false)
const showScanner = ref(false)
const qrCodeData = ref('')
const paymentHistory = ref<any[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Initialize the SDK when component mounts
onMounted(async () => {
  try {
    await SdkService.init()
    console.log('Bastyon SDK initialized successfully')

    // Request account and payment permissions
    await SdkService.checkAndRequestPermissions(['account', 'payment'])

    // Get user info to check if logged in
    try {
      userInfo.value = await SdkService.getAppInfo()
      userAddress.value = await SdkService.getAddress()
      userBalance.value = await SdkService.getBalance()
      isLoggedIn.value = true
      await loadPaymentHistory()
    }
    catch {
      console.log('User not logged in')
      isLoggedIn.value = false
    }
  }
  catch (error) {
    console.error('Failed to initialize Bastyon SDK:', error)
    errorMessage.value = 'Failed to initialize payment system'
  }
})

// Generate QR code for payment request
function generatePaymentQR() {
  if (!paymentAmount.value || Number.parseFloat(paymentAmount.value) <= 0) {
    errorMessage.value = 'Please enter a valid payment amount'
    return
  }

  // Create payment request URL/data
  const paymentData = {
    amount: paymentAmount.value,
    recipient: userAddress.value,
    timestamp: Date.now(),
    currency: 'PKTC',
    type: 'payment_request',
  }

  qrCodeData.value = JSON.stringify(paymentData)
  showQRCode.value = true
  clearMessages()
}

// Scan QR code for payment
function scanPaymentQR() {
  showScanner.value = true
  clearMessages()
}

// Send payment using enhanced Bastyon SDK
async function sendPayment() {
  if (!recipientAddress.value || !paymentAmount.value) {
    errorMessage.value = 'Please fill in all payment details'
    return
  }

  const amount = Number.parseFloat(paymentAmount.value)
  if (amount <= 0) {
    errorMessage.value = 'Please enter a valid amount'
    return
  }

  if (amount > userBalance.value) {
    errorMessage.value = 'Insufficient balance'
    return
  }

  isLoading.value = true
  clearMessages()

  try {
    // Validate recipient address first
    const isValidAddress = await SdkService.validateAddress(recipientAddress.value)
    if (!isValidAddress) {
      errorMessage.value = 'Invalid recipient address'
      return
    }

    // Send payment using enhanced SDK method
    const txId = await SdkService.sendPayment(
      recipientAddress.value,
      amount,
      'Payment from Bastyon Pay',
    )

    // Add to payment history
    const payment = {
      id: txId,
      amount: paymentAmount.value,
      recipient: recipientAddress.value,
      timestamp: new Date().toLocaleString(),
      status: 'sent',
      type: 'outgoing',
      txId,
    }

    paymentHistory.value.unshift(payment)
    successMessage.value = `Payment of ${paymentAmount.value} PKTC sent successfully!`

    // Update balance
    userBalance.value = await SdkService.getBalance()

    // Reset form
    paymentAmount.value = '0.00'
    recipientAddress.value = ''
  }
  catch (error) {
    console.error('Payment failed:', error)
    errorMessage.value = 'Payment failed. Please check your balance and try again.'
  }
  finally {
    isLoading.value = false
  }
}

// Load payment history from blockchain
async function loadPaymentHistory() {
  try {
    const transactions = await SdkService.getTransactionHistory(20)

    // Convert blockchain transactions to our format
    paymentHistory.value = transactions.map((tx: any) => ({
      id: tx.txid || tx.hash || Date.now().toString(),
      amount: Math.abs(tx.amount || 0).toString(),
      recipient: tx.address || 'Unknown',
      timestamp: tx.time ? new Date(tx.time * 1000).toLocaleString() : new Date().toLocaleString(),
      status: tx.confirmations > 0 ? 'confirmed' : 'pending',
      type: (tx.amount || 0) > 0 ? 'incoming' : 'outgoing',
      txId: tx.txid || tx.hash,
      confirmations: tx.confirmations || 0,
    }))
  }
  catch {
    console.error('Failed to load payment history')
    // Fallback to mock data for demo
    paymentHistory.value = [
      {
        id: '1',
        amount: '10.50',
        recipient: `${userAddress.value.slice(0, 8)}...`,
        timestamp: new Date(Date.now() - 3600000).toLocaleString(),
        status: 'confirmed',
        type: 'outgoing',
        confirmations: 6,
      },
      {
        id: '2',
        amount: '25.00',
        recipient: `${userAddress.value.slice(0, 8)}...`,
        timestamp: new Date(Date.now() - 7200000).toLocaleString(),
        status: 'confirmed',
        type: 'incoming',
        confirmations: 12,
      },
    ]
  }
}

// Refresh balance
async function refreshBalance() {
  try {
    userBalance.value = await SdkService.getBalance()
    await loadPaymentHistory()
    successMessage.value = 'Balance updated successfully'
  }
  catch {
    errorMessage.value = 'Failed to refresh balance'
  }
}

// Utility functions
function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function closeQR() {
  showQRCode.value = false
}

function closeScanner() {
  showScanner.value = false
}

function formatBalance(balance: number) {
  return balance.toFixed(8)
}

function shortenAddress(address: string) {
  if (!address)
    return ''
  return address.length > 16 ? `${address.slice(0, 8)}...${address.slice(-8)}` : address
}
</script>

<template>
  <div class="qr-payment-app">
    <!-- Header -->
    <div class="app-header">
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="h-10 w-10 flex items-center justify-center rounded-full from-purple-500 to-pink-500 bg-gradient-to-r">
            <div class="h-6 w-6 text-white">
              💳
            </div>
          </div>
          <div>
            <h1 class="text-2xl text-gray-900 font-bold dark:text-white">
              Bastyon Pay
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              QR Payment App
            </p>
          </div>
        </div>
        <div v-if="isLoggedIn" class="text-right">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Balance
          </p>
          <p class="text-lg text-green-600 font-semibold">
            {{ formatBalance(userBalance) }} PKTC
          </p>
          <button
            class="text-xs text-blue-500 hover:text-blue-700"
            @click="refreshBalance"
          >
            Refresh
          </button>
        </div>
      </div>

      <!-- User Address Display -->
      <div v-if="isLoggedIn && userAddress" class="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <p class="mb-1 text-xs text-gray-600 dark:text-gray-400">
          Your Address:
        </p>
        <p class="break-all text-sm text-gray-900 font-mono dark:text-white">
          {{ userAddress }}
        </p>
      </div>
    </div>

    <!-- Login Required Message -->
    <div v-if="!isLoggedIn" class="py-8 text-center">
      <div class="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <div class="text-3xl">
          🔐
        </div>
      </div>
      <h2 class="mb-2 text-xl text-gray-900 font-semibold dark:text-white">
        Login Required
      </h2>
      <p class="mb-4 text-gray-600 dark:text-gray-400">
        Please log in to your Bastyon account to use the payment features.
      </p>
      <p class="text-sm text-blue-600 dark:text-blue-400">
        Open this app within the Bastyon platform to access payment functionality.
      </p>
    </div>

    <!-- Main Payment Interface -->
    <div v-if="isLoggedIn" class="payment-interface">
      <!-- Alert Messages -->
      <div v-if="errorMessage" class="mb-4 border border-red-400 rounded bg-red-100 p-3 text-red-700">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="mb-4 border border-green-400 rounded bg-green-100 p-3 text-green-700">
        {{ successMessage }}
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 mb-6 gap-4">
        <button
          class="flex flex-col items-center border-2 border-blue-200 rounded-xl bg-blue-50 p-6 transition-colors dark:border-blue-800 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          @click="generatePaymentQR"
        >
          <div class="mb-3 h-12 w-12 flex items-center justify-center rounded-full bg-blue-500">
            <div class="text-xl text-white">
              📱
            </div>
          </div>
          <h3 class="text-gray-900 font-semibold dark:text-white">
            Request Payment
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Generate QR Code
          </p>
        </button>

        <button
          class="flex flex-col items-center border-2 border-green-200 rounded-xl bg-green-50 p-6 transition-colors dark:border-green-800 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
          @click="scanPaymentQR"
        >
          <div class="mb-3 h-12 w-12 flex items-center justify-center rounded-full bg-green-500">
            <div class="text-xl text-white">
              📷
            </div>
          </div>
          <h3 class="text-gray-900 font-semibold dark:text-white">
            Scan & Pay
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Scan QR Code
          </p>
        </button>
      </div>

      <!-- Payment Form -->
      <div class="payment-form mb-6 border border-gray-200 rounded-xl bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-4 text-lg text-gray-900 font-semibold dark:text-white">
          Send Payment
        </h3>

        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
              Amount (PKTC)
            </label>
            <input
              v-model="paymentAmount"
              type="number"
              step="0.00000001"
              min="0"
              placeholder="0.00000000"
              class="w-full border border-gray-300 rounded-lg bg-white px-4 py-3 text-gray-900 dark:border-gray-600 focus:border-transparent dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
              Recipient Address
            </label>
            <input
              v-model="recipientAddress"
              type="text"
              placeholder="Enter Bastyon address"
              class="w-full border border-gray-300 rounded-lg bg-white px-4 py-3 text-gray-900 dark:border-gray-600 focus:border-transparent dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <button
            :disabled="isLoading || !paymentAmount || !recipientAddress"
            class="w-full rounded-lg bg-purple-600 py-3 text-white font-semibold transition-colors disabled:bg-gray-400 hover:bg-purple-700"
            @click="sendPayment"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <div class="mr-2 h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
              Sending...
            </span>
            <span v-else>Send Payment</span>
          </button>
        </div>
      </div>

      <!-- Payment History -->
      <div class="payment-history border border-gray-200 rounded-xl bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-4 text-lg text-gray-900 font-semibold dark:text-white">
          Recent Transactions
        </h3>

        <div v-if="paymentHistory.length === 0" class="py-4 text-center text-gray-500 dark:text-gray-400">
          No transactions yet
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="payment in paymentHistory"
            :key="payment.id"
            class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
          >
            <div class="flex items-center space-x-3">
              <div
                class="h-8 w-8 flex items-center justify-center rounded-full"
                :class="payment.type === 'incoming' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
              >
                {{ payment.type === 'incoming' ? '↓' : '↑' }}
              </div>
              <div>
                <p class="text-gray-900 font-medium dark:text-white">
                  {{ payment.type === 'incoming' ? '+' : '-' }}{{ payment.amount }} PKTC
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ payment.timestamp }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ shortenAddress(payment.recipient) }}
              </p>
              <p
                class="text-xs"
                :class="payment.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'"
              >
                {{ payment.status }}
                <span v-if="payment.confirmations">({{ payment.confirmations }})</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQRCode" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="mx-4 max-w-sm w-full rounded-xl bg-white p-6 dark:bg-gray-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg text-gray-900 font-semibold dark:text-white">
            Payment Request
          </h3>
          <button class="text-gray-500 hover:text-gray-700" @click="closeQR">
            ✕
          </button>
        </div>

        <div class="text-center">
          <div class="mb-4 inline-block rounded-lg bg-white p-4">
            <QRCodeVue3
              :value="qrCodeData"
              :width="200"
              :height="200"
              :corner-square-options="{ type: 'square', color: '#000000' }"
              :corner-dot-options="{ type: 'square', color: '#000000' }"
              :dots-options="{ type: 'square', color: '#000000' }"
            />
          </div>

          <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Request for {{ paymentAmount }} PKTC
          </p>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-500">
            Show this QR code to receive payment
          </p>
          <p class="break-all text-xs text-gray-400 font-mono dark:text-gray-600">
            {{ shortenAddress(userAddress) }}
          </p>
        </div>
      </div>
    </div>

    <!-- QR Scanner Modal -->
    <div v-if="showScanner" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="mx-4 max-w-sm w-full rounded-xl bg-white p-6 dark:bg-gray-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg text-gray-900 font-semibold dark:text-white">
            Scan Payment QR
          </h3>
          <button class="text-gray-500 hover:text-gray-700" @click="closeScanner">
            ✕
          </button>
        </div>

        <div class="text-center">
          <div class="mb-4 rounded-lg bg-gray-100 p-8 dark:bg-gray-700">
            <div class="mb-2 text-4xl">
              📷
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              QR Scanner would be here
            </p>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-500">
              For demo: Use the payment form above to send payments
            </p>
          </div>

          <button
            class="w-full rounded-lg bg-gray-200 py-2 text-gray-800 dark:bg-gray-600 dark:text-white"
            @click="closeScanner"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-payment-app {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.app-header {
  margin-bottom: 1.5rem;
}

.payment-interface {
  space-y: 1.5rem;
}

/* Custom animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
