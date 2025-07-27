/**
 * Bastyon SdkService: Simplified integration with Bastyon SDK.
 * Documentation: https://bastyon.com/application?id=app.pocketnet.docs&p=6465762f617070732f6d696e69617070732f73646b2e68746d6c
 *
 * For secure execution of payments and RPC calls, it is recommended to use the ready-to-use Express.js template:
 * https://github.com/DaniilKimlb/bastyon-miniapp-expressjs-template.
 * This template already includes the `pocketnet-proxy-api` library, simplifying interaction with the Bastyon API.
 */
export class SdkService {
  private static sdk: BastyonSdk | null = null

  /**
   * Initializes the Bastyon SDK at the very start of the application lifecycle.
   * Must be called before any other SDK interactions.
   * Emits the `loaded` event to notify the platform that the application is ready.
   *
   * @example
   * await SdkService.init();
   */
  public static async init(): Promise<void> {
    if (this.sdk) {
      console.warn('Bastyon SDK is already initialized.')
      return
    }

    try {
      this.sdk = new window.BastyonSdk()
      await this.sdk.init()
      this.sdk.emit('loaded') // Notify the platform that the app is ready
      await this.sdk.serviceWorker.register()
      console.log('Bastyon SDK successfully initialized.')
    }
    catch (error) {
      console.error('Error initializing Bastyon SDK:', error)
      throw error // Re-throw error for handling at a higher level
    }
  }

  /**
   * Ensures the SDK is initialized before calling other methods.
   * Throws an error if the SDK is not initialized.
   */
  private static ensureInitialized(): void {
    if (!this.sdk) {
      throw new Error(
        'Bastyon SDK is not initialized. Call SdkService.init() at the start of the application.',
      )
    }
  }

  /**
   * Opens an external link using the Bastyon platform.
   * @param url The URL to open.
   * @example
   * SdkService.openExternalLink('https://example.com');
   */
  public static openExternalLink(url: string): void {
    this.ensureInitialized()
    this.sdk!.openExternalLink(url).catch((error) => {
      console.error('Error opening external link:', error)
    })
  }

  /**
   * Example of an RPC call. It is recommended to use a server for secure execution.
   * @param method The RPC method to call.
   * @param parameters The parameters for the method.
   * @returns Promise<unknown> The result of the RPC call.
   * @example
   * SdkService.rpc('getnodeinfo').then((info) => console.log(info));
   */
  public static async rpc(method: string, parameters?: unknown[]): Promise<unknown> {
    this.ensureInitialized()
    try {
      const result = await this.sdk!.rpc(method, parameters)
      return result
    }
    catch (error) {
      console.error('Error during RPC call:', error)
      throw error
    }
  }

  /**
   * Adds an event listener for a specific SDK event.
   * @param event The event name to listen to.
   * @param callback The callback function to handle the event data.
   * @example
   * SdkService.on('balance', (data) => console.log('Balance updated:', data));
   */
  public static on(event: BastyonSdkEvents, callback: (data: unknown) => void): void {
    this.ensureInitialized()
    this.sdk!.on(event, callback)
  }

  /**
   * Removes an event listener for a specific SDK event.
   * @param event The event name to remove the listener from.
   * @param callback The callback function to remove.
   * @example
   * const handler = (data) => console.log('Balance updated:', data);
   * SdkService.on('balance', handler);
   * SdkService.off('balance', handler);
   */
  public static off(event: BastyonSdkEvents, callback: (data: unknown) => void): void {
    this.ensureInitialized()
    this.sdk!.off(event, callback)
  }

  /**
   * Fetches application information from the Bastyon SDK.
   * @returns Promise<ApplicationInfo> The application information.
   * @example
   * SdkService.getAppInfo().then((info) => console.log('App info:', info));
   */
  public static async getAppInfo(): Promise<ApplicationInfo> {
    this.ensureInitialized()
    try {
      const info = await this.sdk!.get.appinfo()
      return info
    }
    catch (error) {
      console.error('Error fetching application information:', error)
      throw error
    }
  }

  /**
   * Checks and requests permissions.
   * @param permissions The list of permissions to check and request if needed.
   * @returns Promise<void>
   * @example
   * SdkService.checkAndRequestPermissions(['account', 'payment']);
   */
  public static async checkAndRequestPermissions(permissions: string[]): Promise<void> {
    this.ensureInitialized()
    try {
      for (const permission of permissions) {
        const granted = await this.sdk!.permissions.check({ permission })
        if (!granted)
          await this.sdk!.permissions.request([permission])
      }
      console.log('All required permissions granted:', permissions)
    }
    catch (error) {
      console.error('Error checking or requesting permissions:', error)
      throw error
    }
  }

  /**
   * Gets the current user's wallet balance
   * @returns Promise<number> The balance in PKTC
   * @example
   * const balance = await SdkService.getBalance();
   */
  public static async getBalance(): Promise<number> {
    this.ensureInitialized()
    try {
      const result = await this.sdk!.rpc('getbalance')
      return typeof result === 'number' ? result : 0
    }
    catch (error) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }

  /**
   * Gets the user's wallet address
   * @returns Promise<string> The wallet address
   * @example
   * const address = await SdkService.getAddress();
   */
  public static async getAddress(): Promise<string> {
    this.ensureInitialized()
    try {
      const result = await this.sdk!.rpc('getaccountaddress', [''])
      return typeof result === 'string' ? result : ''
    }
    catch (error) {
      console.error('Error fetching address:', error)
      throw error
    }
  }

  /**
   * Sends a payment to a specified address
   * @param toAddress The recipient address
   * @param amount The amount to send in PKTC
   * @param comment Optional comment for the transaction
   * @returns Promise<string> The transaction ID
   * @example
   * const txId = await SdkService.sendPayment('PxAddress...', 10.5, 'Payment for goods');
   */
  public static async sendPayment(toAddress: string, amount: number, comment?: string): Promise<string> {
    this.ensureInitialized()
    try {
      const parameters = comment
        ? [toAddress, amount, comment]
        : [toAddress, amount]

      const result = await this.sdk!.rpc('sendtoaddress', parameters)
      return typeof result === 'string' ? result : ''
    }
    catch (error) {
      console.error('Error sending payment:', error)
      throw error
    }
  }

  /**
   * Gets transaction history for the current user
   * @param count Number of transactions to retrieve (default: 10)
   * @returns Promise<Array> Array of transaction objects
   * @example
   * const transactions = await SdkService.getTransactionHistory(20);
   */
  public static async getTransactionHistory(count = 10): Promise<any[]> {
    this.ensureInitialized()
    try {
      const result = await this.sdk!.rpc('listtransactions', ['', count])
      return Array.isArray(result) ? result : []
    }
    catch (error) {
      console.error('Error fetching transaction history:', error)
      throw error
    }
  }

  /**
   * Validates a Bastyon address
   * @param address The address to validate
   * @returns Promise<boolean> True if address is valid
   * @example
   * const isValid = await SdkService.validateAddress('PxAddress...');
   */
  public static async validateAddress(address: string): Promise<boolean> {
    this.ensureInitialized()
    try {
      const result = await this.sdk!.rpc('validateaddress', [address])
      return result && typeof result === 'object' && 'isvalid' in result
        ? (result as any).isvalid
        : false
    }
    catch (error) {
      console.error('Error validating address:', error)
      return false
    }
  }

  /**
   * Gets network information
   * @returns Promise<object> Network information
   * @example
   * const networkInfo = await SdkService.getNetworkInfo();
   */
  public static async getNetworkInfo(): Promise<any> {
    this.ensureInitialized()
    try {
      const result = await this.sdk!.rpc('getnetworkinfo')
      return result || {}
    }
    catch (error) {
      console.error('Error fetching network info:', error)
      throw error
    }
  }

  /**
   * Creates a new address for receiving payments
   * @param label Optional label for the address
   * @returns Promise<string> The new address
   * @example
   * const newAddress = await SdkService.getNewAddress('Payment address');
   */
  public static async getNewAddress(label?: string): Promise<string> {
    this.ensureInitialized()
    try {
      const parameters = label ? [label] : []
      const result = await this.sdk!.rpc('getnewaddress', parameters)
      return typeof result === 'string' ? result : ''
    }
    catch (error) {
      console.error('Error creating new address:', error)
      throw error
    }
  }

  /**
   * Estimates transaction fee
   * @param _toAddress The recipient address
   * @param _amount The amount to send
   * @returns Promise<number> Estimated fee in PKTC
   * @example
   * const fee = await SdkService.estimateFee('PxAddress...', 10.5);
   */
  public static async estimateFee(_toAddress: string, _amount: number): Promise<number> {
    this.ensureInitialized()
    try {
      // This is a simplified fee estimation
      // In reality, you might use 'estimatefee' or similar RPC calls
      const result = await this.sdk!.rpc('estimatefee', [1])
      return typeof result === 'number' ? result : 0.0001 // fallback to minimal fee
    }
    catch (error) {
      console.error('Error estimating fee:', error)
      return 0.0001 // fallback to minimal fee
    }
  }
}
