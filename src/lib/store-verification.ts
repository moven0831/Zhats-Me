import { kv } from '@vercel/kv';
import { VerificationResponse } from '@/lib/verification';

// Store a verification result for a user ID
export async function storeVerificationResult(userId: string, result: Record<string, unknown> | VerificationResponse) {
  // Normalize userId format: Remove hyphens and ensure 0x prefix
  const normalizedUserId = userId.startsWith('0x') 
    ? userId.replace(/-/g, '') 
    : `0x${userId.replace(/-/g, '')}`;
  
  console.log(`Storing verification result for user ${normalizedUserId}`);
  await kv.set(normalizedUserId, result);
} 