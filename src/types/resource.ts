export type ResourceState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { data: T; status: 'ready' }
  | { status: 'empty' }
  | { message: string; retryable: boolean; status: 'error' }
  | { reason: string; status: 'unavailable' };

