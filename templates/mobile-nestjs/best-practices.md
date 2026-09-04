# Best Practices Guide — Mobile Application + NestJS API

This guide covers component-level best practices for each layer of a mobile application with a NestJS API backend. Every team member and AI agent MUST follow these practices when implementing features.

---

## Table of Contents

- [1. NestJS API Backend (Mobile-Optimized)](#1-nestjs-api-backend-mobile-optimized)
  - [1.1 API Design for Mobile](#11-api-design-for-mobile)
  - [1.2 Controllers](#12-controllers)
  - [1.3 Services](#13-services)
  - [1.4 DTOs & Validation](#14-dtos--validation)
  - [1.5 Authentication & Device Management](#15-authentication--device-management)
  - [1.6 Push Notifications](#16-push-notifications)
  - [1.7 Error Handling](#17-error-handling)
  - [1.8 Testing](#18-testing)
  - [1.9 Performance for Mobile Clients](#19-performance-for-mobile-clients)
- [2. Mobile Application](#2-mobile-application)
  - [2.1 Architecture & Code Organization](#21-architecture--code-organization)
  - [2.2 Networking & API Integration](#22-networking--api-integration)
  - [2.3 Offline Support & Local Storage](#23-offline-support--local-storage)
  - [2.4 State Management](#24-state-management)
  - [2.5 Navigation](#25-navigation)
  - [2.6 UI & UX](#26-ui--ux)
  - [2.7 Push Notifications](#27-push-notifications)
  - [2.8 Security](#28-security)
  - [2.9 Performance](#29-performance)
  - [2.10 Testing](#210-testing)
  - [2.11 Accessibility](#211-accessibility)
- [3. Database](#3-database)
- [4. Caching (Redis)](#4-caching-redis)
- [5. Message Queues (BullMQ)](#5-message-queues-bullmq)
- [6. Docker & Deployment](#6-docker--deployment)
- [7. Logging & Observability](#7-logging--observability)
- [8. Security (End-to-End)](#8-security-end-to-end)

---

## 1. NestJS API Backend (Mobile-Optimized)

### 1.1 API Design for Mobile

**DO:**
- Use cursor-based pagination for all list endpoints (better for infinite scroll, real-time feeds)
- Support `If-Modified-Since` and `ETag` headers for bandwidth-efficient polling
- Provide delta sync endpoints (`?updated_since=<ISO timestamp>`) for offline-to-online sync
- Return full resource representations after mutations (mobile needs to update local cache)
- Support `fields` query parameter for sparse fieldsets (mobile may not need all data)
- Use compression (gzip/brotli) for all responses
- Provide batch endpoints where the mobile app would otherwise make N sequential requests
- Include `X-Request-Id` correlation header in all responses

**DON'T:**
- Return paginated responses without cursor/next page info
- Force the mobile app to make multiple requests for data that could be embedded
- Use server-side session state (mobile clients are stateless)
- Return HTML error pages (always JSON)
- Ignore the `Accept-Language` header (mobile apps may send locale info)

```typescript
// GOOD: Mobile-optimized paginated response
@Get()
@ApiQuery({ name: 'cursor', required: false })
@ApiQuery({ name: 'limit', required: false })
@ApiQuery({ name: 'updated_since', required: false })
async findAll(
  @Query('cursor') cursor?: string,
  @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  @Query('updated_since') updatedSince?: string,
): Promise<CursorPaginatedResponse<ItemResponseDto>> {
  return this.itemsService.findAll({ cursor, limit, updatedSince });
}

// Response format
{
  "data": [...],
  "meta": {
    "cursor": "eyJpZCI6IjEyMyJ9",  // Opaque cursor for next page
    "hasMore": true,
    "count": 20
  }
}
```

### 1.2 Controllers

**DO:**
- Keep controllers thin: parse request, call service, format response
- Use proper HTTP status codes
- Apply Swagger decorators to every endpoint
- Support idempotency headers for write operations (`X-Idempotency-Key`)
- Include `X-Request-Id` in responses for mobile debugging

**DON'T:**
- Put business logic in controllers
- Return raw database entities
- Ignore idempotency for POST/PUT endpoints (mobile retries are common)

```typescript
// GOOD: Idempotent create endpoint
@Post()
@ApiOperation({ summary: 'Create item (idempotent)' })
@ApiHeader({ name: 'X-Idempotency-Key', required: true })
async create(
  @Headers('x-idempotency-key') idempotencyKey: string,
  @CurrentUser() user: UserPayload,
  @Body() dto: CreateItemDto,
): Promise<ItemResponseDto> {
  const item = await this.itemsService.createIdempotent(
    idempotencyKey,
    user.id,
    dto,
  );
  return ItemResponseDto.fromEntity(item);
}
```

### 1.3 Services

**DO:**
- Contain all business logic in services
- Implement idempotency checks for write operations
- Use transactions for multi-step writes
- Emit events for push notification triggers (decouple notification from business logic)
- Throw typed exceptions

**DON'T:**
- Access HTTP request/response objects in services
- Send push notifications synchronously in request handlers (use queues)
- Swallow exceptions silently

### 1.4 DTOs & Validation

**DO:**
- Create separate DTOs for request (Create, Update) and response
- Use `class-validator` decorators for all validatable fields
- Include `clientId` or `idempotencyKey` field in create DTOs for offline-created records
- Use `@ApiPropertyOptional()` for fields that mobile may not always send
- Support partial updates with `PartialType()`

**DON'T:**
- Use the same DTO for create and response
- Skip validation on nested objects
- Expose internal fields in response DTOs

### 1.5 Authentication & Device Management

**DO:**
- Implement device registration endpoint for push notification tokens
- Track devices per user (allow multiple devices)
- Rotate push notification tokens when they change
- Support biometric authentication flow (token re-issue without password)
- Implement "logout from all devices" functionality
- Track refresh tokens per device (allow selective revocation)

**DON'T:**
- Store device tokens without expiry/rotation mechanism
- Allow unlimited device registrations per user (cap at a reasonable number, e.g., 10)
- Send push notifications to stale/invalid device tokens (clean up on delivery failure)

```typescript
// GOOD: Device registration with token management
@Post('devices')
@UseGuards(JwtAuthGuard)
async registerDevice(
  @CurrentUser() user: UserPayload,
  @Body() dto: RegisterDeviceDto,
): Promise<DeviceResponseDto> {
  return this.devicesService.registerOrUpdate(user.id, dto);
}

// RegisterDeviceDto
export class RegisterDeviceDto {
  @IsEnum(['ios', 'android'])
  platform: 'ios' | 'android';

  @IsString()
  @IsNotEmpty()
  pushToken: string;

  @IsString()
  @IsOptional()
  deviceName?: string;

  @IsString()
  appVersion: string;
}
```

### 1.6 Push Notifications

**DO:**
- Send push notifications via a message queue (never synchronously in request handlers)
- Use FCM for both iOS and Android when possible (simplifies infrastructure)
- Implement notification categories/channels for user preference control
- Include structured data payloads for deep linking
- Handle token invalidation: remove devices with consistently failed delivery
- Log all notification sends with delivery status
- Implement notification templates for consistent formatting

**DON'T:**
- Send push notifications without user consent/preferences
- Include sensitive data in push notification payloads (they may be visible on lock screen)
- Send notifications at inappropriate times (respect user timezone and quiet hours)
- Ignore delivery failures (track and clean up invalid tokens)

```typescript
// GOOD: Queue-based push notification with deep link payload
@Processor('notifications')
export class NotificationProcessor {
  @Process('push')
  async handlePush(job: Job<PushNotificationJob>): Promise<void> {
    const { userId, type, title, body, data } = job.data;

    const devices = await this.devicesService.getActiveDevices(userId);
    for (const device of devices) {
      try {
        await this.fcmService.send({
          token: device.pushToken,
          notification: { title, body },
          data: {
            type,                     // e.g., 'order_update'
            deepLink: data.deepLink,  // e.g., 'myapp://orders/123'
            ...data,
          },
        });
      } catch (error) {
        if (this.isInvalidToken(error)) {
          await this.devicesService.deactivate(device.id);
        }
        this.logger.error('Push delivery failed', { deviceId: device.id, error });
      }
    }
  }
}
```

### 1.7 Error Handling

**DO:**
- Return machine-readable error codes that the mobile app can map to localized messages
- Include field-level validation errors for form submissions
- Use consistent error response structure across all endpoints
- Return `Retry-After` header for rate-limited responses

**DON'T:**
- Return user-facing strings (mobile handles localization)
- Return stack traces in any environment
- Use generic error codes (be specific: `ORDER_ALREADY_CANCELLED`, not `BAD_REQUEST`)

```typescript
// GOOD: Mobile-friendly error response
{
  "statusCode": 422,
  "error": "BUSINESS_RULE_VIOLATION",
  "code": "ORDER_ALREADY_CANCELLED",  // Machine-readable for mobile localization
  "message": "This order has already been cancelled",  // Fallback message
  "details": [
    { "field": "status", "code": "INVALID_TRANSITION", "message": "Cannot cancel a cancelled order" }
  ]
}
```

### 1.8 Testing

**DO:**
- Test idempotency behavior (same request twice = same result)
- Test cursor-based pagination thoroughly (edge cases: empty, last page, concurrent inserts)
- Test push notification job processing with mocked FCM
- Test delta sync endpoints with various timestamp scenarios
- Test device registration/deregistration flows
- Test rate limiting on auth endpoints

### 1.9 Performance for Mobile Clients

**DO:**
- Optimize response payload size (mobile bandwidth matters)
- Support response compression (gzip/brotli)
- Use database indexes for cursor-based pagination queries
- Cache frequently accessed, rarely changing data (Redis)
- Use connection pooling for database
- Profile slow endpoints (mobile tolerance is < 500ms)

**DON'T:**
- Return unnecessary nested data (let mobile request what it needs)
- Ignore response size: a list endpoint returning 100 items with all fields is expensive on mobile
- Skip performance testing under mobile-realistic conditions (high latency, limited bandwidth)

---

## 2. Mobile Application (React Native + Redux)

### 2.1 Architecture & Code Organization (React Native)

**DO:**
- Use React Native 0.73+ with TypeScript strict mode and functional components exclusively
- Organize by feature/domain (not by file type):
  ```
  src/
  ├── app/                    # App entry, navigation, providers
  ├── features/
  │   ├── orders/
  │   │   ├── screens/        # Screen components
  │   │   ├── components/     # Feature-specific components
  │   │   ├── ordersSlice.ts  # Redux slice
  │   │   └── types.ts
  │   ├── auth/
  │   │   ├── screens/
  │   │   ├── authSlice.ts
  │   │   └── types.ts
  │   └── profile/
  ├── services/               # RTK Query API services
  │   ├── ordersApi.ts
  │   └── authApi.ts
  ├── store/                  # Redux store setup + typed hooks
  │   ├── index.ts
  │   └── hooks.ts
  ├── components/             # Shared reusable components
  ├── hooks/                  # Shared custom hooks
  ├── lib/                    # Utilities, helpers
  └── types/                  # Shared types
  ```
- Separate UI, business logic (Redux slices), and data layers (RTK Query services)
- Keep screen components focused: rendering + dispatching Redux actions, no business logic
- Create reusable UI components in a shared design system directory
- Co-locate feature-specific Redux slices with the feature they belong to

**DON'T:**
- Put API calls directly in screen components — use RTK Query hooks
- Mix navigation logic with business logic (navigation stays in screens/navigators only)
- Create deep folder nesting (3 levels max is ideal)
- Create god screens that handle data fetching, state management, and complex UI

### 2.2 Networking & API Integration

**DO:**
- Create a centralized API client with interceptors for auth, retry, logging
- Implement automatic token refresh (intercept 401, refresh, retry original request)
- Add request timeout handling (default 30s, configurable per endpoint)
- Implement retry logic with exponential backoff for transient failures
- Type all API request/response shapes matching backend DTOs
- Use request cancellation when screen unmounts (prevent state updates on unmounted components)
- Include device info in request headers (app version, OS version, device model) for server-side analytics

**DON'T:**
- Make API calls without error handling
- Retry non-idempotent requests (POST without idempotency key)
- Ignore SSL certificate validation in production builds
- Hard-code API URLs (use environment configuration)
- Store auth tokens in unencrypted storage

```typescript
// GOOD: API client with auth refresh interceptor (React Native example)
class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  async request<T>(config: RequestConfig): Promise<T> {
    try {
      const response = await this.httpClient.request<T>({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${await this.getAccessToken()}`,
          'X-App-Version': APP_VERSION,
          'X-Platform': Platform.OS,
          'X-Request-Id': uuid(),
        },
      });
      return response.data;
    } catch (error) {
      if (error.status === 401 && !config._retry) {
        return this.handleTokenRefresh(config);
      }
      throw this.normalizeError(error);
    }
  }

  private async handleTokenRefresh<T>(config: RequestConfig): Promise<T> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      try {
        const newToken = await this.authService.refresh();
        this.refreshSubscribers.forEach((cb) => cb(newToken));
        this.refreshSubscribers = [];
        // Retry the original request that triggered the refresh
        config._retry = true;
        return this.request<T>(config);
      } catch {
        // Refresh failed: force re-login
        this.authService.logout();
        throw new AuthError('Session expired');
      } finally {
        this.isRefreshing = false;
      }
    }
    // Queue this request until refresh completes
    return new Promise((resolve) => {
      this.refreshSubscribers.push(async (token) => {
        config._retry = true;
        resolve(await this.request<T>(config));
      });
    });
  }
}
```

### 2.3 Offline Support & Local Storage

**DO:**
- Cache critical data locally for offline access (user profile, recent items)
- Use appropriate storage for data type:
  - Encrypted keychain/keystore for tokens and secrets
  - Key-value store (MMKV/SharedPreferences) for preferences and small data
  - SQLite/WatermelonDB/Drift for structured relational data
- Implement optimistic UI updates (show changes immediately, sync in background)
- Queue failed write operations for retry when connectivity returns
- Show clear offline indicators to the user
- Implement conflict resolution strategy for data modified offline

**DON'T:**
- Store sensitive data in unencrypted storage (AsyncStorage, SharedPreferences)
- Cache everything (only cache what the user needs offline)
- Silently fail when offline (tell the user what is and isn't available)
- Ignore storage limits (clean up old cached data periodically)
- Assume writes will succeed (always handle the failure case)

```typescript
// GOOD: Offline queue pattern
class OfflineQueue {
  async enqueue(action: PendingAction): Promise<void> {
    const pending = await storage.get<PendingAction[]>('pendingActions') ?? [];
    pending.push({
      ...action,
      id: uuid(),
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });
    await storage.set('pendingActions', pending);
  }

  async processQueue(): Promise<void> {
    const pending = await storage.get<PendingAction[]>('pendingActions') ?? [];
    for (const action of pending) {
      try {
        await this.executeAction(action);
        await this.removeAction(action.id);
      } catch (error) {
        if (action.retryCount >= MAX_RETRIES) {
          await this.moveToDeadLetter(action);
        } else {
          await this.incrementRetry(action.id);
        }
      }
    }
  }
}
```

### 2.4 State Management (Redux Toolkit + RTK Query)

**DO:**
- Use Redux Toolkit (`@reduxjs/toolkit`) for all global/shared state
- Organize Redux code by feature slices: `features/auth/authSlice.ts`, `features/orders/ordersSlice.ts`
- Use RTK Query for ALL API data fetching, caching, and mutations
- Define RTK Query API services per backend domain: `services/ordersApi.ts`, `services/authApi.ts`
- Use `createSlice` with Immer for reducers (write "mutable" code safely)
- Use `createSelector` (reselect) for derived/computed state
- Use `useAppSelector` and `useAppDispatch` typed hooks (not raw `useSelector` / `useDispatch`)
- Use `useState` for ephemeral UI state (modal open/close, input focus, animation state)
- Track connectivity state in Redux (via `@react-native-community/netinfo`) for offline-aware UI
- Use `redux-persist` with `react-native-keychain` or MMKV for persisting auth and critical state across app restarts

**DON'T:**
- Put all state in Redux — local UI state belongs in `useState`
- Cache API responses manually — RTK Query handles caching, polling, invalidation
- Use `useEffect` + `fetch` for API calls — use RTK Query hooks instead
- Create one giant slice — split by domain/feature
- Store form state in Redux (use React Hook Form locally)
- Ignore stale data in RTK Query (configure `refetchOnFocus`, `refetchOnReconnect`)

```typescript
// GOOD: Redux store setup for React Native
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import { MMKV } from 'react-native-mmkv';
import { ordersApi } from '@/services/ordersApi';
import authReducer from '@/features/auth/authSlice';
import connectivityReducer from '@/features/connectivity/connectivitySlice';

const storage = new MMKV();

const mmkvStorage = {
  setItem: (key: string, value: string) => { storage.set(key, value); return Promise.resolve(true); },
  getItem: (key: string) => { const value = storage.getString(key); return Promise.resolve(value ?? null); },
  removeItem: (key: string) => { storage.delete(key); return Promise.resolve(); },
};

const persistedAuthReducer = persistReducer(
  { key: 'auth', storage: mmkvStorage, whitelist: ['accessToken', 'user'] },
  authReducer,
);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    connectivity: connectivityReducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: ['persist/FLUSH', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PERSIST', 'persist/PURGE', 'persist/REGISTER'] } })
      .concat(ordersApi.middleware),
});

setupListeners(store.dispatch); // enables refetchOnFocus / refetchOnReconnect

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// GOOD: RTK Query API service for React Native
// services/ordersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';
import Config from 'react-native-config';
import type { RootState } from '@/store';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: Config.API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('X-Platform', Platform.OS);
      headers.set('X-App-Version', Config.APP_VERSION ?? '1.0.0');
      return headers;
    },
  }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getOrders: builder.query<PaginatedResponse<Order>, { cursor?: string; limit?: number }>({
      query: ({ cursor, limit = 20 }) =>
        `/orders?${cursor ? `cursor=${cursor}&` : ''}limit=${limit}`,
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Order' as const, id })), { type: 'Order', id: 'LIST' }]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
  }),
});

export const { useGetOrdersQuery, useCreateOrderMutation } = ordersApi;
```

```typescript
// GOOD: Connectivity tracking in Redux
// features/connectivity/connectivitySlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import type { AppDispatch } from '@/store';

interface ConnectivityState {
  isConnected: boolean;
  type: string | null;
}

const connectivitySlice = createSlice({
  name: 'connectivity',
  initialState: { isConnected: true, type: null } as ConnectivityState,
  reducers: {
    setConnectivity(state, action: PayloadAction<ConnectivityState>) {
      state.isConnected = action.payload.isConnected;
      state.type = action.payload.type;
    },
  },
});

export const { setConnectivity } = connectivitySlice.actions;

// Call this in App.tsx to start monitoring
export function startNetworkMonitoring(dispatch: AppDispatch) {
  return NetInfo.addEventListener((state) => {
    dispatch(setConnectivity({
      isConnected: state.isConnected ?? false,
      type: state.type,
    }));
  });
}

export default connectivitySlice.reducer;
```

### 2.5 Navigation

**DO:**
- Follow platform navigation conventions (iOS: push/present, Android: fragments)
- Implement deep linking for all navigable screens
- Handle navigation state restoration (app killed and reopened from deep link)
- Type all navigation routes and parameters
- Implement authentication-gated navigation (redirect to login if not authenticated)

**DON'T:**
- Create deeply nested navigation stacks (3 levels max)
- Navigate from business logic layer (only from UI layer)
- Lose navigation state on app backgrounding
- Use hardcoded route strings (use constants or enums)

```typescript
// GOOD: Typed navigation with deep linking (React Navigation)
type RootStackParamList = {
  Home: undefined;
  OrderDetail: { orderId: string };
  Profile: undefined;
  Settings: undefined;
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      OrderDetail: 'orders/:orderId',
      Profile: 'profile',
      Settings: 'settings',
    },
  },
};
```

### 2.6 UI & UX

**DO:**
- Handle all screen states: loading, error, empty, populated, offline
- Use skeleton screens (shimmer) instead of spinners for initial loads
- Implement pull-to-refresh for list screens
- Use infinite scroll with cursor-based pagination
- Show progress indicators for long operations
- Provide haptic feedback for important actions
- Support dark mode (follow system setting by default)
- Handle safe areas (notch, home indicator, status bar)
- Optimize for both phone and tablet layouts

**DON'T:**
- Show blank screens during loading (use skeleton/shimmer)
- Block the UI during network operations
- Use platform-inconsistent UI patterns
- Ignore the keyboard (content should scroll when keyboard appears)
- Use tiny tap targets (minimum 44x44pt / 48x48dp)

### 2.7 Push Notifications

**DO:**
- Request notification permission at an appropriate time (not on first launch)
- Implement notification categories for user preference control
- Handle notification taps with proper deep linking
- Handle foreground, background, and terminated state notifications differently
- Update the UI when receiving data-only (silent) notifications
- Register/unregister device tokens with the API on login/logout
- Handle push token rotation (FCM may change tokens)

**DON'T:**
- Request notification permission immediately on app launch (poor UX)
- Assume push tokens are permanent (re-register on every app launch)
- Show sensitive data in notifications (visible on lock screen)
- Ignore notification delivery metrics (track opens/dismisses)

### 2.8 Security

**DO:**
- Store tokens in secure storage (iOS Keychain / Android Keystore)
- Implement biometric authentication as a convenience unlock
- Clear sensitive data on logout
- Validate server SSL certificates
- Obfuscate/minify release builds
- Implement jailbreak/root detection for high-security apps
- Use App Transport Security (iOS) and Network Security Config (Android)

**DON'T:**
- Store tokens in plain text (AsyncStorage, SharedPreferences)
- Log sensitive data (tokens, passwords, PII)
- Ship debug builds to app stores
- Disable SSL verification in production
- Embed API keys in client-side code (use server-side proxy)

### 2.9 Performance

**DO:**
- Optimize list rendering (FlatList/RecyclerView, avoid re-renders)
- Use image caching and proper resolution per device density
- Lazy-load screens and heavy components
- Minimize app startup time (defer non-critical initialization)
- Monitor frame rate (target 60fps)
- Minimize bridge crossings (React Native) or platform channel calls (Flutter)
- Profile memory usage (prevent leaks from listeners, subscriptions, timers)
- Use appropriate image formats (WebP for photos, SVG for icons)

**DON'T:**
- Render all list items at once (use virtualized lists)
- Load full-resolution images for thumbnails
- Block the main/UI thread with heavy computation
- Keep unnecessary timers/listeners alive (clean up on unmount)
- Ignore app size (users may skip downloading large apps)

### 2.10 Testing

**DO:**
- Write unit tests for business logic (services, state management, utilities)
- Write widget/component tests for UI components
- Write integration tests for critical flows (login, core features, offline scenarios)
- Use E2E testing tools (Detox for React Native, integration_test for Flutter, XCUITest/Espresso for native)
- Test on real devices (not just simulators) before release
- Test offline scenarios: airplane mode, slow network, request timeouts
- Test deep link handling
- Test push notification handling in all app states

**DON'T:**
- Test only on one platform (test iOS AND Android)
- Skip testing offline scenarios
- Use production APIs for tests (mock or use staging)
- Ignore visual regression testing for critical UI

### 2.11 Accessibility

**DO:**
- Add accessibility labels to all interactive elements
- Support dynamic text sizing (respect system font size preferences)
- Ensure sufficient color contrast (4.5:1 for text, 3:1 for large text)
- Support screen readers (VoiceOver on iOS, TalkBack on Android)
- Test navigation with keyboard/switch control
- Use semantic elements and roles

**DON'T:**
- Use images/icons without text alternatives
- Rely on color alone to convey information
- Create tiny touch targets (min 44x44pt / 48x48dp)
- Break native accessibility tree with custom components

---

## 3. Database

**DO:**
- Use migrations for ALL schema changes
- Add indexes on columns used in WHERE, JOIN, and ORDER BY
- Use foreign keys with appropriate ON DELETE behavior
- Include `updated_at` on all tables for delta sync support
- Use EXPLAIN ANALYZE for slow queries
- Configure connection pooling

**DON'T:**
- Use `synchronize: true` in production
- Store large blobs in the database (use object storage)
- Skip database backups

---

## 4. Caching (Redis)

> Only applicable if justified per `architectural-decisions-guide.md`

**DO:**
- Use structured key names: `app:entity:id`
- Always set TTL
- Implement cache-aside pattern
- Gracefully degrade if Redis is down
- Cache API responses that mobile clients frequently request
- Monitor hit/miss ratio (target > 80%)

**DON'T:**
- Cache user-specific data without user ID in key
- Use Redis as primary data store
- Store sensitive data without encryption consideration

---

## 5. Message Queues (BullMQ)

> Only applicable if justified per `architectural-decisions-guide.md`. Strongly recommended for push notifications.

**DO:**
- Define typed job data interfaces
- Implement idempotent job processors
- Configure retry with exponential backoff
- Set up Dead Letter Queues
- Use queues for: push notifications, email, webhooks, heavy processing
- Monitor queue depth and processing latency

**DON'T:**
- Process push notifications synchronously in request handlers
- Put entire payloads in job data (store references)
- Ignore failed jobs

---

## 6. Docker & Deployment

### API Deployment

**DO:**
- Use multi-stage Docker builds
- Run as non-root user
- Pin base image versions
- Implement health checks
- Implement graceful shutdown
- Maintain backward compatibility for N-2 app versions

### Mobile Deployment

**DO:**
- Use CI/CD for builds (Fastlane, Codemagic, GitHub Actions)
- Implement semantic versioning (MAJOR.MINOR.PATCH)
- Implement forced update mechanism (API returns minimum required version)
- Use build flavors/schemes for different environments (dev, staging, production)
- Sign builds properly (code signing for iOS, signing keys for Android)
- Include build number in API requests for analytics

**DON'T:**
- Ship debug/development builds to stores
- Skip beta testing (TestFlight / Google Play Internal Testing)
- Deploy API breaking changes without mobile version gating
- Forget to increment build numbers

---

## 7. Logging & Observability

**DO:**
- Use structured JSON logging (API) with correlation IDs
- Include `X-Request-Id` in API responses for mobile-to-server traceability
- Track mobile crashes with a crash reporting tool (Sentry, Crashlytics)
- Monitor API response times (alert on p95 > 500ms)
- Track push notification delivery rates
- Monitor app startup time, screen load time, and interaction latency
- Log mobile network errors with device/connectivity context

**DON'T:**
- Log sensitive data anywhere
- Use `console.log` / `print` in production
- Ignore mobile-specific metrics (crash rate, ANR rate, startup time)

---

## 8. Security (End-to-End)

**DO:**
- Validate ALL input server-side (Pydantic/class-validator)
- Use parameterized queries (ORM)
- Implement HTTPS everywhere
- Rate limit authentication endpoints
- Store tokens securely (Keychain/Keystore)
- Implement certificate pinning for high-security apps
- Clear sensitive data on logout
- Run dependency security audits regularly

**DON'T:**
- Trust client-side validation as the only validation
- Expose internal details in error responses
- Store passwords in plain text
- Embed secrets in mobile code
- Disable SSL verification
- Ship source maps / debug symbols to production

---

## 9. Mandatory Testing Requirements (Non-Negotiable)

- Every change MUST include backend unit, integration, E2E, and contract tests, plus mobile unit/component tests, mobile integration tests, and mobile E2E tests.
- Mobile test matrix is mandatory in CI for critical flows: latest iOS and Android versions, plus one previous major version for each platform.
- Offline and reconnect behavior MUST be tested for critical flows (create/update/sync), including retries, conflict resolution, and idempotent server handling.
- Coverage minimums are enforced in CI: backend lines >= 85%, backend branches >= 75%, mobile lines >= 80%, mobile branches >= 70%, and changed lines coverage >= 90%.
- API and sync contract tests MUST validate payload compatibility, error-shape stability, and backward compatibility for supported app versions.
- Test data MUST be deterministic and reproducible: seeded fixtures, fixed clocks, stable network simulation profiles, and isolated test environments.
- Flaky tests are treated as failures: quarantine within 24 hours with owner and fix deadline; no merge is allowed with known flaky critical-path tests.
- CI is the quality gate: pull requests MUST fail and MUST NOT merge when any required test suite fails (backend, mobile, contract, offline, or device-matrix checks).
