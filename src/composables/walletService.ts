import { computed, ref } from 'vue'
import { SdkService } from './sdkService'

export interface WalletInfo {
  address: string
  balance: number
  currency: string
}

export interface TransactionRequest {
  toAddress: string
  amount: number
  description?: string
}

export interface PaymentData {
  address: string
  amount: number
  currency: string
}

class WalletService {
  private walletInfo = ref<WalletInfo | null>(null)
  private loading = ref(false)
  private error = ref<string | null>(null)

  // Computed properties
  public address = computed(() => this.walletInfo.value?.address || '')
  public balance = computed(() => this.walletInfo.value?.balance || 0)
  public currency = computed(() => this.walletInfo.value?.currency || 'PKOIN')
  public isLoading = computed(() => this.loading.value)
  public hasError = computed(() => !!this.error.value)
  public errorValue = computed(() => this.error.value)

  async initializeWallet() {
    try {
      this.loading.value = true
      this.error.value = null

      // Request necessary permissions
      await SdkService.checkAndRequestPermissions(['account', 'payment'])

      // Get wallet address
      const address = await this.getWalletAddress()

      // Get wallet balance
      const balance = await this.getWalletBalance()

      this.walletInfo.value = {
        address,
        balance,
        currency: 'PKOIN',
      }
    }
    catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to initialize wallet'
      console.error('Wallet initialization error:', err)
    }
    finally {
      this.loading.value = false
    }
  }

  private async getWalletAddress(): Promise<string> {
    try {
      const accountInfo = await SdkService.rpc('getaccountinfo', []) as any
      return accountInfo.address || ''
    }
    catch (err) {
      console.error('Failed to get wallet address:', err)
      throw new Error('Could not retrieve wallet address')
    }
  }

  private async getWalletBalance(): Promise<number> {
    try {
      const balance = await SdkService.rpc('getbalance', []) as number
      return balance || 0
    }
    catch (err) {
      console.error('Failed to get wallet balance:', err)
      throw new Error('Could not retrieve wallet balance')
    }
  }

  async sendTransaction(request: TransactionRequest): Promise<string> {
    try {
      this.loading.value = true
      this.error.value = null

      const txResult = await SdkService.rpc('sendtoaddress', [
        request.toAddress,
        request.amount,
        request.description || 'QR Payment',
      ]) as any

      // Refresh balance after transaction
      await this.refreshBalance()

      return txResult.txid || ''
    }
    catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Transaction failed'
      console.error('Transaction error:', err)
      throw err
    }
    finally {
      this.loading.value = false
    }
  }

  async refreshBalance() {
    try {
      if (this.walletInfo.value) {
        const newBalance = await this.getWalletBalance()
        this.walletInfo.value.balance = newBalance
      }
    }
    catch (err) {
      console.error('Failed to refresh balance:', err)
    }
  }

  generatePaymentData(amount?: number): PaymentData {
    const address = this.address.value
    return {
      address,
      amount: amount || 0,
      currency: this.currency.value,
    }
  }

  parsePaymentData(data: string): TransactionRequest | null {
    try {
      const paymentData = JSON.parse(data)
      if (paymentData.address && typeof paymentData.amount === 'number') {
        return {
          toAddress: paymentData.address,
          amount: paymentData.amount,
          description: paymentData.description || 'QR Payment',
        }
      }
    }
    catch (err) {
      console.error('Invalid payment data format:', err)
    }
    return null
  }

  clearError() {
    this.error.value = null
  }
}

// Singleton instance
export const walletService = new WalletService()
