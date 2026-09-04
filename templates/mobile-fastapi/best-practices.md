# Best Practices Guide — Mobile Application + FastAPI

This guide covers component-level best practices for each layer of a mobile application with a FastAPI backend. Every team member and AI agent MUST follow these practices when implementing features.

---

## Table of Contents

- [1. FastAPI Backend (Mobile-Optimized)](#1-fastapi-backend-mobile-optimized)
  - [1.1 API Design for Mobile](#11-api-design-for-mobile)
  - [1.2 Routers](#12-routers)
  - [1.3 Services](#13-services)
  - [1.4 Pydantic Schemas](#14-pydantic-schemas)
  - [1.5 Authentication & Device Management](#15-authentication--device-management)
  - [1.6 Push Notifications](#16-push-notifications)
  - [1.7 Error Handling](#17-error-handling)
  - [1.8 Async Best Practices](#18-async-best-practices)
  - [1.9 Testing](#19-testing)
  - [1.10 Performance for Mobile Clients](#110-performance-for-mobile-clients)
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
- [5. Message Queues (Celery / arq)](#5-message-queues-celery--arq)
- [6. Docker & Deployment](#6-docker--deployment)
- [7. Logging & Observability](#7-logging--observability)
- [8. Security (End-to-End)](#8-security-end-to-end)

---

## 1. FastAPI Backend (Mobile-Optimized)

### 1.1 API Design for Mobile

**DO:**
- Use cursor-based pagination for all list endpoints (better for infinite scroll)
- Support `If-Modified-Since` and `ETag` headers for bandwidth-efficient polling
- Provide delta sync endpoints (`?updated_since=<ISO timestamp>`)
- Return full resource representations after mutations
- Support `fields` query parameter for sparse fieldsets
- Use compression (gzip/brotli) for all responses
- Provide batch endpoints to reduce sequential requests
- Include `X-Request-Id` correlation header in all responses

**DON'T:**
- Return paginated responses without cursor/next page info
- Force the mobile app to make multiple requests for embeddable data
- Use server-side session state
- Return HTML error pages
- Ignore the `Accept-Language` header

```python
# GOOD: Mobile-optimized cursor-based pagination
from fastapi import APIRouter, Depends, Query
from src.common.schemas import CursorPaginatedResponse

router = APIRouter(prefix="/items", tags=["Items"])


@router.get("", response_model=CursorPaginatedResponse[ItemResponse])
async def list_items(
    cursor: str | None = Query(None, description="Opaque cursor for next page"),
    limit: int = Query(20, ge=1, le=100),
    updated_since: datetime | None = Query(None, description="Delta sync timestamp"),
    user: UserPayload = Depends(get_current_user),
    service: ItemsService = Depends(),
) -> CursorPaginatedResponse[ItemResponse]:
    return await service.list_paginated(
        user_id=user.id,
        cursor=cursor,
        limit=limit,
        updated_since=updated_since,
    )
```

### 1.2 Routers

**DO:**
- Keep routers thin: parse request, call service, return response
- Use proper HTTP status codes
- Declare explicit `response_model` on every endpoint
- Support idempotency via `X-Idempotency-Key` header for write operations
- Use FastAPI's dependency injection for services and auth

**DON'T:**
- Put business logic in routers
- Return raw SQLAlchemy models
- Ignore idempotency for POST/PUT (mobile retries are common)

```python
# GOOD: Idempotent create endpoint
@router.post(
    "",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create item (idempotent)",
)
async def create_item(
    body: CreateItemRequest,
    idempotency_key: str = Header(..., alias="X-Idempotency-Key"),
    user: UserPayload = Depends(get_current_user),
    service: ItemsService = Depends(),
) -> ItemResponse:
    item = await service.create_idempotent(
        idempotency_key=idempotency_key,
        user_id=user.id,
        data=body,
    )
    return ItemResponse.model_validate(item)
```

### 1.3 Services

**DO:**
- Contain all business logic in service classes
- Implement idempotency checks for write operations
- Use database transactions for multi-step writes
- Emit events for push notification triggers (decouple from business logic)
- Raise custom domain exceptions (not HTTPException)

**DON'T:**
- Access HTTP request/response objects in services
- Import FastAPI types in services
- Send push notifications synchronously (use queues)
- Swallow exceptions silently

```python
# GOOD: Service with idempotency support
class ItemsService:
    def __init__(
        self,
        repository: ItemsRepository = Depends(),
        idempotency: IdempotencyService = Depends(),
        event_bus: EventBus = Depends(),
    ) -> None:
        self.repository = repository
        self.idempotency = idempotency
        self.event_bus = event_bus

    async def create_idempotent(
        self,
        idempotency_key: str,
        user_id: UUID,
        data: CreateItemRequest,
    ) -> Item:
        # Check if already processed
        existing = await self.idempotency.get(idempotency_key)
        if existing:
            return existing

        # Create item
        item = await self.repository.create(user_id=user_id, **data.model_dump())

        # Store idempotency record
        await self.idempotency.store(idempotency_key, item)

        # Emit event for push notification (async via queue)
        await self.event_bus.emit("item.created", {"item_id": str(item.id), "user_id": str(user_id)})

        return item
```

### 1.4 Pydantic Schemas

**DO:**
- Create separate schemas for request and response
- Use Pydantic v2 with `model_config = ConfigDict(from_attributes=True)`
- Use `Field()` for validation constraints and OpenAPI documentation
- Include `client_id` field in create schemas for offline-created records
- Support partial updates with optional fields

**DON'T:**
- Use the same schema for create and response
- Expose internal fields (password hashes, internal IDs)
- Use `Any` in schema definitions

```python
# GOOD: Mobile-friendly schemas
class CreateItemRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2000)
    client_id: UUID | None = Field(None, description="Client-generated UUID for offline sync")


class ItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime  # Required for delta sync


class CursorPaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    meta: CursorMeta


class CursorMeta(BaseModel):
    cursor: str | None = Field(description="Opaque cursor for next page")
    has_more: bool
    count: int
```

### 1.5 Authentication & Device Management

**DO:**
- Implement device registration endpoint for push tokens
- Track devices per user (allow multiple devices)
- Rotate push tokens when they change
- Support biometric auth flow (token re-issue without password)
- Implement "logout from all devices" functionality
- Track refresh tokens per device

**DON'T:**
- Store device tokens without expiry/rotation
- Allow unlimited device registrations per user
- Send push to stale/invalid tokens (clean up on failure)

```python
# GOOD: Device registration with FastAPI dependencies
@router.post("/devices", response_model=DeviceResponse)
async def register_device(
    body: RegisterDeviceRequest,
    user: UserPayload = Depends(get_current_user),
    service: DevicesService = Depends(),
) -> DeviceResponse:
    device = await service.register_or_update(user_id=user.id, data=body)
    return DeviceResponse.model_validate(device)


class RegisterDeviceRequest(BaseModel):
    platform: Literal["ios", "android"]
    push_token: str = Field(..., min_length=1)
    app_version: str
    device_name: str | None = None
```

### 1.6 Push Notifications

**DO:**
- Send push notifications via a message queue (never synchronously)
- Use FCM for both iOS and Android when possible
- Implement notification categories/channels
- Include structured data payloads for deep linking
- Handle token invalidation: remove devices with failed delivery
- Log all notification sends with delivery status

**DON'T:**
- Send notifications without user consent/preferences
- Include sensitive data in push payloads
- Send at inappropriate times (respect timezone and quiet hours)
- Ignore delivery failures

```python
# GOOD: Queue-based push notification (Celery example)
@shared_task(bind=True, max_retries=3, retry_backoff=True)
def send_push_notification(self, user_id: str, notification_type: str, payload: dict) -> None:
    """Send push notification to all active devices for a user."""
    devices = DevicesRepository.get_active_devices(user_id)

    for device in devices:
        try:
            fcm_service.send(
                token=device.push_token,
                notification={"title": payload["title"], "body": payload["body"]},
                data={
                    "type": notification_type,
                    "deep_link": payload.get("deep_link", ""),
                },
            )
        except InvalidTokenError:
            DevicesRepository.deactivate(device.id)
            logger.warning("Deactivated device with invalid token", device_id=str(device.id))
        except Exception as exc:
            logger.error("Push delivery failed", device_id=str(device.id), error=str(exc))
```

### 1.7 Error Handling

**DO:**
- Return machine-readable error codes for mobile localization
- Include field-level validation errors for form submissions
- Use consistent error response structure
- Return `Retry-After` for rate-limited responses

**DON'T:**
- Return user-facing strings (mobile handles localization)
- Return stack traces
- Use generic error codes

```python
# GOOD: Mobile-friendly error handling
@app.exception_handler(BusinessRuleError)
async def business_rule_handler(request: Request, exc: BusinessRuleError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "detail": {
                "code": exc.code,          # e.g., "ORDER_ALREADY_CANCELLED"
                "message": exc.message,     # Fallback: "This order has already been cancelled"
                "fields": exc.fields or [],  # Field-level errors for forms
            }
        },
    )
```

### 1.8 Async Best Practices

**DO:**
- Use `async def` for all route handlers and service methods that perform I/O
- Use `asyncpg` via SQLAlchemy async for non-blocking database access
- Use `httpx.AsyncClient` for external HTTP calls (FCM, etc.)
- Use `asyncio.gather()` for concurrent independent I/O operations
- Use `run_in_executor` for CPU-intensive or blocking operations

**DON'T:**
- Mix sync and async code without `run_in_executor`
- Use synchronous libraries in async code paths
- Block the event loop with CPU-intensive operations
- Create unbounded concurrent tasks

### 1.9 Testing

**DO:**
- Test idempotency behavior (same request twice = same result)
- Test cursor-based pagination edge cases
- Test push notification job processing with mocked FCM
- Test delta sync with various timestamp scenarios
- Test device registration/deregistration flows
- Test rate limiting on auth endpoints
- Override FastAPI dependencies for test isolation

**DON'T:**
- Use production database for tests
- Skip testing offline-related edge cases
- Skip testing error responses match expected mobile format

### 1.10 Performance for Mobile Clients

**DO:**
- Optimize response payload size
- Support response compression
- Use database indexes for cursor-based pagination
- Cache frequently accessed data (Redis)
- Profile slow endpoints (mobile tolerance < 500ms)

**DON'T:**
- Return unnecessary nested data
- Ignore response size impact on mobile bandwidth
- Skip performance testing under mobile-realistic conditions

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
- Create deep folder nesting (3 levels max)
- Create god screens that handle data fetching, state management, and complex UI

### 2.2 Networking & API Integration

**DO:**
- Create a centralized API client with interceptors for auth, retry, logging
- Implement automatic token refresh (intercept 401, refresh, retry)
- Add request timeout handling (default 30s)
- Implement retry with exponential backoff for transient failures
- Type all API request/response shapes matching backend Pydantic schemas
- Use request cancellation on screen unmount
- Include device info in request headers

**DON'T:**
- Make API calls without error handling
- Retry non-idempotent requests without idempotency key
- Ignore SSL certificate validation in production
- Hard-code API URLs
- Store auth tokens in unencrypted storage

### 2.3 Offline Support & Local Storage

**DO:**
- Cache critical data locally for offline access
- Use appropriate storage per data type:
  - Encrypted keychain/keystore for tokens
  - Key-value store for preferences
  - SQLite for structured relational data
- Implement optimistic UI updates
- Queue failed writes for retry on connectivity
- Show clear offline indicators
- Implement conflict resolution strategy

**DON'T:**
- Store sensitive data in unencrypted storage
- Cache everything (only what user needs offline)
- Silently fail when offline
- Ignore storage limits

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
// GOOD: RTK Query API service for React Native (connects to FastAPI backend)
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
- Follow platform navigation conventions
- Implement deep linking for all navigable screens
- Handle navigation state restoration
- Type all navigation routes and parameters
- Implement authentication-gated navigation

**DON'T:**
- Create deeply nested navigation stacks (3 levels max)
- Navigate from business logic layer
- Lose navigation state on backgrounding
- Use hardcoded route strings

### 2.6 UI & UX

**DO:**
- Handle all screen states: loading, error, empty, populated, offline
- Use skeleton screens instead of spinners for initial loads
- Implement pull-to-refresh for list screens
- Use infinite scroll with cursor-based pagination
- Show progress indicators for long operations
- Support dark mode
- Handle safe areas (notch, home indicator)
- Optimize for both phone and tablet

**DON'T:**
- Show blank screens during loading
- Block UI during network operations
- Use platform-inconsistent patterns
- Ignore keyboard handling
- Use tiny tap targets (min 44x44pt / 48x48dp)

### 2.7 Push Notifications

**DO:**
- Request permission at appropriate time (not first launch)
- Implement notification categories for preference control
- Handle taps with deep linking
- Handle foreground/background/terminated states
- Register/unregister tokens on login/logout
- Handle push token rotation

**DON'T:**
- Request permission immediately on launch
- Assume tokens are permanent
- Show sensitive data in notifications
- Ignore delivery metrics

### 2.8 Security

**DO:**
- Store tokens in secure storage (Keychain/Keystore)
- Implement biometric auth as convenience unlock
- Clear sensitive data on logout
- Validate server SSL certificates
- Obfuscate release builds

**DON'T:**
- Store tokens in plain text
- Log sensitive data
- Ship debug builds
- Disable SSL verification in production
- Embed API keys in client code

### 2.9 Performance

**DO:**
- Optimize list rendering (virtualized lists)
- Use image caching and proper resolution per device
- Lazy-load screens and heavy components
- Minimize app startup time
- Monitor frame rate (target 60fps)
- Profile memory usage

**DON'T:**
- Render all list items at once
- Load full-res images for thumbnails
- Block main/UI thread
- Keep unnecessary listeners alive
- Ignore app size

### 2.10 Testing

**DO:**
- Unit tests for business logic
- Widget/component tests for UI
- Integration tests for critical flows
- E2E tests on real devices before release
- Test offline scenarios
- Test deep link handling
- Test push notification handling

**DON'T:**
- Test only on one platform
- Skip offline scenarios
- Use production APIs for tests
- Ignore visual regression testing

### 2.11 Accessibility

**DO:**
- Add accessibility labels to all interactive elements
- Support dynamic text sizing
- Ensure sufficient color contrast
- Support screen readers
- Test keyboard/switch control navigation

**DON'T:**
- Use images/icons without text alternatives
- Rely on color alone
- Create tiny touch targets
- Break native accessibility tree

---

## 3. Database

**DO:**
- Use Alembic migrations for ALL schema changes
- Add indexes on columns used in WHERE, JOIN, and ORDER BY
- Include `updated_at` on all tables for delta sync support
- Use foreign keys with appropriate ON DELETE behavior
- Use `EXPLAIN ANALYZE` for slow queries
- Configure connection pooling in SQLAlchemy

**DON'T:**
- Use `Base.metadata.create_all()` in production
- Store large blobs in database (use object storage)
- Skip backups

---

## 4. Caching (Redis)

> Only applicable if justified per `architectural-decisions-guide.md`

**DO:**
- Use `redis.asyncio` for non-blocking access
- Use structured key names: `app:entity:id`
- Always set TTL
- Implement cache-aside pattern
- Gracefully degrade if Redis is down
- Cache frequently requested mobile endpoints
- Monitor hit/miss ratio (target > 80%)

**DON'T:**
- Cache user-specific data without user ID in key
- Use Redis as primary data store
- Store sensitive data without encryption

---

## 5. Message Queues (Celery / arq)

> Only applicable if justified per `architectural-decisions-guide.md`. Strongly recommended for push notifications.

**DO:**
- Define typed task parameters
- Implement idempotent task execution
- Configure retry with exponential backoff
- Set up Dead Letter Queues
- Use queues for: push notifications, email, webhooks, heavy processing
- Monitor queue depth and latency

**DON'T:**
- Process push notifications synchronously
- Put entire payloads in task data
- Ignore failed tasks

---

## 6. Docker & Deployment

### API Deployment

**DO:**
- Use multi-stage Docker builds
- Run as non-root user
- Pin base image versions
- Implement health checks
- Graceful shutdown (SIGTERM)
- Use gunicorn + uvicorn workers in production
- Maintain backward compatibility for N-2 app versions

### Mobile Deployment

**DO:**
- Use CI/CD for builds (Fastlane, Codemagic, GitHub Actions)
- Implement semantic versioning
- Implement forced update mechanism
- Use build flavors/schemes per environment
- Sign builds properly
- Include build number in API requests

**DON'T:**
- Ship debug builds to stores
- Skip beta testing
- Deploy API breaking changes without version gating
- Forget to increment build numbers

---

## 7. Logging & Observability

**DO:**
- Use structured logging (structlog/loguru) with correlation IDs
- Include `X-Request-Id` in responses for mobile traceability
- Track mobile crashes (Sentry, Crashlytics)
- Monitor API response times (alert on p95 > 500ms)
- Track push notification delivery rates
- Monitor mobile metrics (crash rate, ANR, startup time)

**DON'T:**
- Log sensitive data
- Use `print()` in production
- Ignore mobile-specific metrics

---

## 8. Security (End-to-End)

**DO:**
- Validate ALL input server-side (Pydantic)
- Use parameterized queries (SQLAlchemy)
- Implement HTTPS everywhere
- Rate limit auth endpoints
- Store tokens securely (Keychain/Keystore)
- Clear sensitive data on logout
- Run dependency audits (`pip audit` / `safety check`)

**DON'T:**
- Trust client-side validation only
- Expose internal details in errors
- Store passwords in plain text
- Embed secrets in mobile code
- Disable SSL verification
- Use `eval()`, `exec()`, or `pickle.loads()` on user input

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
