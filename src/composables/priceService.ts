import axios from 'axios'

export class PriceService {
  private static cachedPrice: number | null = null
  private static lastFetchTime: number = 0
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

  /**
   * Fetches the current price of PKOIN in USD from the Bastyon API
   */
  public static async getPkoinPriceInUSD(): Promise<number> {
    const currentTime = Date.now()

    // Return cached price if it's still valid
    if (this.cachedPrice !== null && (currentTime - this.lastFetchTime) < this.CACHE_DURATION)
      return this.cachedPrice

    try {
      // Get price from the Bastyon QR payment API
      const response = await axios.get('https://qrpayment.bastyon.ir/pkoin_price')

      if (response.data && typeof response.data === 'number') {
        this.cachedPrice = response.data
        this.lastFetchTime = currentTime
        return this.cachedPrice
      }

      // Fallback to a default value if API fails
      return this.getFallbackPrice()
    }
    catch (error) {
      console.error('Error fetching PKOIN price:', error)
      return this.getFallbackPrice()
    }
  }

  /**
   * Provides a fallback price in case the API call fails
   * In a real application, you might want to handle this differently
   */
  private static getFallbackPrice(): number {
    // If we have a cached price, use it even if it's expired
    if (this.cachedPrice !== null)
      return this.cachedPrice

    // Default fallback price if we have no data at all
    return 0.05 // Example fallback price
  }

  /**
   * Converts a given amount of PKOIN to USD
   */
  public static async convertPkoinToUSD(pkoinAmount: number): Promise<number> {
    const price = await this.getPkoinPriceInUSD()
    return pkoinAmount * price
  }

  /**
   * Formats a USD amount as a string with 2 decimal places
   */
  public static formatUSD(amount: number): string {
    return `$${amount.toFixed(2)}`
  }
}
