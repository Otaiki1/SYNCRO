// src/index.ts
import { EventEmitter } from 'node:events';
import {
  createEventListener,
  type ListenToEventsOptions,
  type RenewalAttemptEvent,
  type ApprovalGrantedEvent,
  type RenewalFailedEvent,
} from './event-listener';

const GIFT_CARD_HASH_REGEX = /^[a-fA-F0-9]{32,64}$/;

export interface SyncroSDKOptions {
  /** Base URL of the Syncro backend API */
  baseUrl: string;
  /** Auth: Bearer token, or use credentials: 'include' for cookie auth */
  getAuth?: () => Promise<string | null>;
  /** Use fetch with credentials (cookies) when true and no getAuth */
  credentials?: 'include' | 'omit' | 'same-origin';
}

export type BillingCycle = 'monthly' | 'yearly' | 'quarterly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused' | 'trial';
export type SubscriptionSource = 'manual' | 'gift_card';

export interface SubscriptionCreateInput {
  name: string;
  price: number;
  billing_cycle: BillingCycle;
  provider?: string;
  status?: SubscriptionStatus;
  next_billing_date?: string;
  category?: string;
  logo_url?: string;
  website_url?: string;
  renewal_url?: string;
  notes?: string;
  tags?: string[];
  email_account_id?: string;
  source?: SubscriptionSource;
}

export interface SubscriptionUpdateInput {
  name?: string;
  provider?: string;
  price?: number;
  billing_cycle?: BillingCycle;
  status?: SubscriptionStatus;
  next_billing_date?: string | null;
  category?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  renewal_url?: string | null;
  notes?: string | null;
  tags?: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  price: number;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  next_billing_date: string | null;
  category: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  renewal_url?: string | null;
  notes?: string | null;
  tags: string[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface SubscriptionResult<T = Subscription> {
  success: boolean;
  data?: T;
  error?: string;
  blockchain?: {
    synced: boolean;
    transactionHash?: string | null;
    error?: string | null;
  };
}

export type SubscriptionEventType =
  | 'created'
  | 'updated'
  | 'cancelled'
  | 'deleted'
  | 'failed';

export interface SubscriptionLifecycleEvent {
  type: SubscriptionEventType;
  subscriptionId: string;
  data?: Subscription | null;
  error?: string;
  blockchain?: {
    synced: boolean;
    transactionHash?: string;
    error?: string;
  };
}

export interface AttachGiftCardResult {
  success: boolean;
  data?: {
    id: string;
    subscriptionId: string;
    giftCardHash: string;
    provider: string;
    transactionHash?: string;
    status: string;
  };
  error?: string;
  blockchain?: {
    transactionHash?: string;
    error?: string;
  };
}

export type GiftCardEventType = 'attached' | 'failed';

export interface GiftCardEvent {
  type: GiftCardEventType;
  subscriptionId: string;
  giftCardHash?: string;
  provider?: string;
  data?: AttachGiftCardResult['data'];
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateSubscriptionCreateInput(
  input: SubscriptionCreateInput
): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.name || String(input.name).trim().length === 0) {
    errors.name = 'Subscription name is required';
  } else if (String(input.name).length > 100) {
    errors.name = 'Subscription name must be less than 100 characters';
  }
  const price = Number(input.price);
  if (isNaN(price) || price < 0) {
    errors.price = 'Price must be 0 or greater';
  } else if (price > 1e5) {
    errors.price = 'Price must be less than $100,000';
  }
  const validBillingCycles = ['monthly', 'yearly', 'quarterly'];
  if (
    !input.billing_cycle ||
    !validBillingCycles.includes(input.billing_cycle)
  ) {
    errors.billing_cycle =
      'billing_cycle must be monthly, yearly, or quarterly';
  }
  if (input.source && !['manual', 'gift_card'].includes(input.source)) {
    errors.source = "source must be 'manual' or 'gift_card'";
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSubscriptionUpdateInput(
  input: SubscriptionUpdateInput
): ValidationResult {
  const errors: Record<string, string> = {};
  if (input.name !== undefined) {
    if (!String(input.name).trim()) {
      errors.name = 'Subscription name cannot be empty';
    } else if (String(input.name).length > 100) {
      errors.name = 'Subscription name must be less than 100 characters';
    }
  }
  if (input.price !== undefined) {
    const price = Number(input.price);
    if (isNaN(price) || price < 0) {
      errors.price = 'Price must be 0 or greater';
    } else if (price > 1e5) {
      errors.price = 'Price must be less than $100,000';
    }
  }
  if (input.billing_cycle !== undefined) {
    const valid = ['monthly', 'yearly', 'quarterly'];
    if (!valid.includes(input.billing_cycle)) {
      errors.billing_cycle =
        'billing_cycle must be monthly, yearly, or quarterly';
    }
  }
  if (input.status !== undefined) {
    const valid = ['active', 'cancelled', 'paused', 'trial'];
    if (!valid.includes(input.status)) {
      errors.status =
        'status must be active, cancelled, paused, or trial';
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateGiftCardHash(hash: string): boolean {
  if (typeof hash !== 'string' || hash.length < 32 || hash.length > 64) {
    return false;
  }
  return GIFT_CARD_HASH_REGEX.test(hash);
}

export class SyncroSDK extends EventEmitter {
  private baseUrl: string;
  private getAuth?: () => Promise<string | null>;
  private credentials: 'include' | 'omit' | 'same-origin';

  constructor(options: SyncroSDKOptions) {
    super();
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getAuth = options.getAuth;
    this.credentials = options.credentials ?? 'include';
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.getAuth) {
      const token = await this.getAuth();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<{ ok: boolean; status: number; data: unknown }> {
    const headers = { ...(await this.getHeaders()), ...extraHeaders };
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      credentials: this.credentials,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }

  /**
   * Listen to on-chain Soroban contract events.
   * Emits: renewalAttempt, approvalGranted, renewalFailed
   * Real-time delivery via polling. Auto-reconnects on disconnect.
   *
   * @param options - RPC URL, contract IDs, poll interval, optional cursor persistence
   * @returns Stop function to unsubscribe
   */
  listenToEvents(options: ListenToEventsOptions): () => void {
    const controller = createEventListener(
      options,
      (event) => {
        switch (event.type) {
          case 'renewalAttempt':
            this.emit('renewalAttempt', event.data);
            break;
          case 'approvalGranted':
            this.emit('approvalGranted', event.data);
            break;
          case 'renewalFailed':
            this.emit('renewalAttempt', {
              ...event.data,
              success: false,
            } as RenewalAttemptEvent);
            this.emit('renewalFailed', event.data);
            break;
        }
      },
      (err) => this.emit('eventError', err)
    );

    return () => controller.stop();
  }

  async createSubscription(
    input: SubscriptionCreateInput,
    options?: { idempotencyKey?: string }
  ): Promise<SubscriptionResult> {
    const validation = validateSubscriptionCreateInput(input);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      const err = { success: false, error: firstError };
      this.emit('subscription', {
        type: 'failed',
        subscriptionId: '',
        error: firstError,
      });
      return err;
    }
    const payload = {
      name: input.name,
      price: Number(input.price),
      billing_cycle: input.billing_cycle,
      provider: input.provider ?? input.name,
      status: input.status ?? 'active',
      next_billing_date: input.next_billing_date ?? null,
      category: input.category ?? null,
      logo_url: input.logo_url ?? null,
      website_url: input.website_url ?? null,
      renewal_url: input.renewal_url ?? null,
      notes: input.notes ?? null,
      tags: input.tags ?? [],
      email_account_id: input.email_account_id ?? null,
    };
    const extraHeaders: Record<string, string> = {};
    if (options?.idempotencyKey) {
      extraHeaders['Idempotency-Key'] = options.idempotencyKey;
    }
    const { ok, status, data } = await this.request(
      'POST',
      '/api/subscriptions',
      payload,
      extraHeaders
    );
    const body = data as { data?: Subscription; blockchain?: unknown };
    if (!ok) {
      const error =
        (body as { error?: string })?.error ??
        `Request failed with status ${status}`;
      this.emit('subscription', {
        type: 'failed',
        subscriptionId: '',
        error,
      });
      return { success: false, error };
    }
    const sub = body.data;
    this.emit('subscription', {
      type: 'created',
      subscriptionId: sub?.id ?? '',
      data: sub ?? null,
      blockchain: body.blockchain,
    });
    return {
      success: true,
      data: sub,
      blockchain: body.blockchain as SubscriptionResult['blockchain'],
    };
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionResult> {
    if (!subscriptionId || String(subscriptionId).trim().length === 0) {
      return { success: false, error: 'Subscription ID is required' };
    }
    const { ok, data } = await this.request(
      'GET',
      `/api/subscriptions/${encodeURIComponent(subscriptionId)}`
    );
    const body = data as { data?: Subscription };
    if (!ok) {
      const error =
        (body as { error?: string })?.error ?? 'Failed to fetch subscription';
      return { success: false, error };
    }
    return {
      success: true,
      data: body.data,
    };
  }

  async updateSubscription(
    subscriptionId: string,
    input: SubscriptionUpdateInput,
    options?: { idempotencyKey?: string; ifMatch?: number }
  ): Promise<SubscriptionResult> {
    if (!subscriptionId || String(subscriptionId).trim().length === 0) {
      return { success: false, error: 'Subscription ID is required' };
    }
    const validation = validateSubscriptionUpdateInput(input);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      const err = { success: false, error: firstError };
      this.emit('subscription', {
        type: 'failed',
        subscriptionId,
        error: firstError,
      });
      return err;
    }
    const extraHeaders: Record<string, string> = {};
    if (options?.idempotencyKey)
      extraHeaders['Idempotency-Key'] = options.idempotencyKey;
    if (options?.ifMatch !== undefined)
      extraHeaders['If-Match'] = String(options.ifMatch);
    const { ok, status, data } = await this.request(
      'PATCH',
      `/api/subscriptions/${encodeURIComponent(subscriptionId)}`,
      input,
      extraHeaders
    );
    const body = data as { data?: Subscription; blockchain?: unknown };
    if (!ok) {
      const error =
        (body as { error?: string })?.error ??
        `Request failed with status ${status}`;
      this.emit('subscription', {
        type: 'failed',
        subscriptionId,
        error,
      });
      return { success: false, error };
    }
    const sub = body.data;
    this.emit('subscription', {
      type: 'updated',
      subscriptionId,
      data: sub ?? null,
      blockchain: body.blockchain,
    });
    return {
      success: true,
      data: sub,
      blockchain: body.blockchain as SubscriptionResult['blockchain'],
    };
  }

  async cancelSubscription(
    subscriptionId: string
  ): Promise<SubscriptionResult> {
    if (!subscriptionId || String(subscriptionId).trim().length === 0) {
      return { success: false, error: 'Subscription ID is required' };
    }
    const { ok, status, data } = await this.request(
      'PATCH',
      `/api/subscriptions/${encodeURIComponent(subscriptionId)}`,
      { status: 'cancelled' }
    );
    const body = data as { data?: Subscription; blockchain?: unknown };
    if (!ok) {
      const error =
        (body as { error?: string })?.error ??
        `Request failed with status ${status}`;
      this.emit('subscription', {
        type: 'failed',
        subscriptionId,
        error,
      });
      return { success: false, error };
    }
    const sub = body.data;
    this.emit('subscription', {
      type: 'cancelled',
      subscriptionId,
      data: sub ?? null,
      blockchain: body.blockchain,
    });
    return {
      success: true,
      data: sub,
      blockchain: body.blockchain as SubscriptionResult['blockchain'],
    };
  }

  async deleteSubscription(
    subscriptionId: string
  ): Promise<SubscriptionResult> {
    if (!subscriptionId || String(subscriptionId).trim().length === 0) {
      return { success: false, error: 'Subscription ID is required' };
    }
    const { ok, status, data } = await this.request(
      'DELETE',
      `/api/subscriptions/${encodeURIComponent(subscriptionId)}`
    );
    const body = data as { blockchain?: unknown };
    if (!ok) {
      const error =
        (body as { error?: string })?.error ??
        `Request failed with status ${status}`;
      this.emit('subscription', {
        type: 'failed',
        subscriptionId,
        error,
      });
      return { success: false, error };
    }
    this.emit('subscription', {
      type: 'deleted',
      subscriptionId,
      data: null,
      blockchain: body.blockchain,
    });
    return {
      success: true,
      blockchain: body.blockchain as SubscriptionResult['blockchain'],
    };
  }

  async attachGiftCard(
    subscriptionId: string,
    giftCardHash: string,
    provider: string
  ): Promise<AttachGiftCardResult> {
    if (!validateGiftCardHash(giftCardHash)) {
      const err = {
        success: false,
        error:
          'Invalid gift card format. Hash must be 32-64 hex characters.',
      };
      this.emit('giftCard', {
        type: 'failed',
        subscriptionId,
        giftCardHash,
        provider,
        error: err.error,
      });
      return err;
    }
    const trimmedProvider = String(provider ?? '').trim();
    if (!trimmedProvider) {
      const err = { success: false, error: 'Provider is required' };
      this.emit('giftCard', {
        type: 'failed',
        subscriptionId,
        giftCardHash,
        provider: trimmedProvider,
        error: err.error,
      });
      return err;
    }
    const headers = await this.getHeaders();
    try {
      const res = await fetch(
        `${this.baseUrl}/api/subscriptions/${encodeURIComponent(subscriptionId)}/attach-gift-card`,
        {
          method: 'POST',
          credentials: this.credentials,
          headers,
          body: JSON.stringify({
            giftCardHash,
            provider: trimmedProvider,
          }),
        }
      );
      const body = (await res.json().catch(() => ({}))) as {
        data?: AttachGiftCardResult['data'];
        error?: string;
        blockchain?: AttachGiftCardResult['blockchain'];
      };
      if (!res.ok) {
        const err = {
          success: false,
          error: body.error ?? `Request failed with status ${res.status}`,
        };
        this.emit('giftCard', {
          type: 'failed',
          subscriptionId,
          giftCardHash,
          provider: trimmedProvider,
          error: err.error,
        });
        return err;
      }
      const result: AttachGiftCardResult = {
        success: true,
        data: body.data,
        blockchain: body.blockchain,
      };
      this.emit('giftCard', {
        type: 'attached',
        subscriptionId,
        giftCardHash,
        provider: trimmedProvider,
        data: body.data,
      });
      return result;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      const err = { success: false, error: errorMessage };
      this.emit('giftCard', {
        type: 'failed',
        subscriptionId,
        giftCardHash,
        provider: trimmedProvider,
        error: errorMessage,
      });
      return err;
    }
  }
}

export function createSyncroSDK(options: SyncroSDKOptions): SyncroSDK {
  return new SyncroSDK(options);
}

export type { ListenToEventsOptions, RenewalAttemptEvent, ApprovalGrantedEvent, RenewalFailedEvent };
