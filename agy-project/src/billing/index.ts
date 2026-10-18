/**
 * Sample Billing Module demonstrating domain rules in practice:
 * - Currency amounts represented strictly in integer cents.
 * - Idempotency key verification.
 */

export interface ChargeRequest {
  idempotencyKey: string;
  customerId: string;
  amountInCents: number; // e.g., $15.50 -> 1550
  currency: 'USD' | 'EUR' | 'CAD';
}

export interface ChargeResult {
  transactionId: string;
  status: 'succeeded' | 'pending' | 'failed';
  amountInCents: number;
}

export async function processCharge(request: ChargeRequest): Promise<ChargeResult> {
  if (!Number.isInteger(request.amountInCents) || request.amountInCents <= 0) {
    throw new Error('amountInCents must be a positive integer representing cents');
  }

  if (!request.idempotencyKey) {
    throw new Error('Idempotency-Key is required for processing charges');
  }

  // Simulated payment processing
  return {
    transactionId: `tx_${Date.now()}`,
    status: 'succeeded',
    amountInCents: request.amountInCents,
  };
}
