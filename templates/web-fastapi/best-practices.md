# Best Practices Guide — Web Application + FastAPI

This guide covers component-level best practices for each layer of a web application with a FastAPI backend. Every team member and AI agent MUST follow these practices when implementing features.

---

## Table of Contents

- [1. FastAPI Backend](#1-fastapi-backend)
  - [1.1 Project Structure & Modules](#11-project-structure--modules)
  - [1.2 Routers (API Layer)](#12-routers-api-layer)
  - [1.3 Services (Business Logic)](#13-services-business-logic)
  - [1.4 Pydantic Schemas & Validation](#14-pydantic-schemas--validation)
  - [1.5 SQLAlchemy Models & Data Access](#15-sqlalchemy-models--data-access)
  - [1.6 Authentication & Authorization](#16-authentication--authorization)
  - [1.7 Error Handling](#17-error-handling)
  - [1.8 Configuration](#18-configuration)
  - [1.9 Dependency Injection](#19-dependency-injection)
  - [1.10 Testing](#110-testing)
  - [1.11 Async Best Practices](#111-async-best-practices)
  - [1.12 Performance](#112-performance)
- [2. Frontend (Web)](#2-frontend-web)
  - [2.1 Component Architecture](#21-component-architecture)
  - [2.2 State Management](#22-state-management)
  - [2.3 API Integration](#23-api-integration)
  - [2.4 Forms & Validation](#24-forms--validation)
  - [2.5 Error Handling & UX](#25-error-handling--ux)
  - [2.6 Performance](#26-performance)
  - [2.7 Testing](#27-testing)
  - [2.8 Accessibility](#28-accessibility)
- [3. Database](#3-database)
- [4. Caching (Redis)](#4-caching-redis)
- [5. Message Queues (Celery / arq)](#5-message-queues-celery--arq)
- [6. Docker & Deployment](#6-docker--deployment)
- [7. Logging & Observability](#7-logging--observability)
- [8. Security](#8-security)

---

## 1. FastAPI Backend

### 1.1 Project Structure & Modules

**DO:**
- One package per domain/bounded context (e.g., `users/`, `orders/`, `payments/`)
- Each domain package contains: `router.py`, `service.py`, `schemas.py`, `models.py`, `repository.py`
- Share only through well-defined interfaces (service classes, not raw queries)
- Use `__init__.py` to control public API of each package

**DON'T:**
- Create a monolithic `routes.py` or `models.py` with everything in one file
- Import repositories directly from other domains (go through services)
- Create circular imports between domain packages
- Put utility code inside domain packages (use `common/`)

```python
# GOOD: Clean domain package structure
# src/orders/__init__.py
from src.orders.router import router as orders_router
from src.orders.service import OrdersService

__all__ = ["orders_router", "OrdersService"]
```

### 1.2 Routers (API Layer)

**DO:**
- Keep routers thin: parse request, call service, return response
- Use proper HTTP status codes (`201` for creation, `204` for deletion, `404` for not found)
- Declare explicit `response_model` on every endpoint for auto-documentation
- Use FastAPI's dependency injection for services and auth
- Group related endpoints with `APIRouter` and tags
- Use `status_code` parameter on route decorators

**DON'T:**
- Put business logic in routers
- Return raw SQLAlchemy model instances (use Pydantic response schemas)
- Catch exceptions in routers (let exception handlers handle them)
- Use string-based path parameters without type validation

```python
# GOOD: Thin router with proper typing and dependency injection
from fastapi import APIRouter, Depends, status
from src.orders.schemas import CreateOrderRequest, OrderResponse, PaginatedOrdersResponse
from src.orders.service import OrdersService
from src.auth.dependencies import get_current_user
from src.common.schemas import PaginationParams

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
)
async def create_order(
    body: CreateOrderRequest,
    user: UserPayload = Depends(get_current_user),
    service: OrdersService = Depends(),
) -> OrderResponse:
    order = await service.create(user_id=user.id, data=body)
    return OrderResponse.model_validate(order)


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get order by ID",
)
async def get_order(
    order_id: UUID,
    user: UserPayload = Depends(get_current_user),
    service: OrdersService = Depends(),
) -> OrderResponse:
    order = await service.get_or_fail(order_id=order_id, user_id=user.id)
    return OrderResponse.model_validate(order)
```

### 1.3 Services (Business Logic)

**DO:**
- Contain all business logic in service classes
- Use dependency injection for repositories and external services
- Raise custom domain exceptions (not HTTPException) for business rule violations
- Keep methods focused: one method = one business operation
- Use database transactions for multi-step write operations via `async with session.begin()`

**DON'T:**
- Access HTTP request/response objects in services
- Import FastAPI-specific types (HTTPException, Request) in services
- Swallow exceptions silently
- Perform raw SQL without documenting why ORM is insufficient

```python
# GOOD: Business logic in service with proper error handling
from src.orders.repository import OrdersRepository
from src.products.service import ProductsService
from src.exceptions import NotFoundError, BusinessRuleError


class OrdersService:
    def __init__(
        self,
        repository: OrdersRepository = Depends(),
        products_service: ProductsService = Depends(),
    ) -> None:
        self.repository = repository
        self.products_service = products_service

    async def create(self, user_id: UUID, data: CreateOrderRequest) -> Order:
        # Validate business rules
        products = await self.products_service.get_by_ids(data.product_ids)
        if len(products) != len(data.product_ids):
            raise BusinessRuleError("One or more products not found")

        # Calculate total
        total = sum(p.price for p in products)

        # Create order within transaction
        return await self.repository.create(
            user_id=user_id,
            items=[{"product_id": p.id, "price": p.price} for p in products],
            total=total,
        )

    async def get_or_fail(self, order_id: UUID, user_id: UUID) -> Order:
        order = await self.repository.get_by_id(order_id)
        if order is None or order.user_id != user_id:
            raise NotFoundError(f"Order {order_id} not found")
        return order
```

### 1.4 Pydantic Schemas & Validation

**DO:**
- Create separate schemas for request (Create, Update) and response
- Use Pydantic v2 with `model_config = ConfigDict(from_attributes=True)` for ORM compatibility
- Use `Field()` for validation constraints and OpenAPI documentation
- Use `Annotated` types for reusable field definitions
- Apply `@field_validator` for custom validation logic
- Use `PartialModel` pattern for update schemas (all fields optional)

**DON'T:**
- Use the same schema for create and response
- Skip validation on nested objects
- Use `Any` in schema definitions
- Expose internal fields (password hashes, internal IDs) in response schemas
- Use `dict` return types when a Pydantic model is appropriate

```python
# GOOD: Separate schemas with proper validation
from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class CreateOrderRequest(BaseModel):
    product_ids: list[UUID] = Field(..., min_length=1, description="List of product UUIDs")
    notes: str | None = Field(None, max_length=500, description="Optional order notes")


class UpdateOrderRequest(BaseModel):
    notes: str | None = Field(None, max_length=500)
    status: OrderStatus | None = None

    @field_validator("status")
    @classmethod
    def validate_status_transition(cls, v: OrderStatus | None) -> OrderStatus | None:
        if v is not None and v == OrderStatus.COMPLETED:
            # Business rule: cannot directly set to completed via API
            raise ValueError("Cannot set status to COMPLETED directly")
        return v


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    total: Decimal
    status: OrderStatus
    notes: str | None
    created_at: datetime
    updated_at: datetime


class PaginatedOrdersResponse(BaseModel):
    data: list[OrderResponse]
    meta: PaginationMeta
```

### 1.5 SQLAlchemy Models & Data Access

**DO:**
- Use SQLAlchemy 2.0 style with `Mapped` and `mapped_column` type annotations
- Use UUIDs as primary keys (`uuid7` or `uuid4`)
- Add `created_at` and `updated_at` timestamps to all models
- Define indexes on frequently queried columns
- Use async sessions (`AsyncSession`) for non-blocking database I/O
- Create repository classes to encapsulate data access logic

**DON'T:**
- Expose SQLAlchemy model instances directly in API responses (convert to Pydantic schemas)
- Use `lazy="joined"` on relationships by default (causes over-fetching)
- Skip database migrations (never use `create_all()` in production)
- Create bidirectional relationships unless both directions are queried
- Use `session.execute(text("raw SQL"))` without documenting why

```python
# GOOD: SQLAlchemy 2.0 model with proper typing
from sqlalchemy import ForeignKey, Index, String, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base
from datetime import datetime, timezone
from uuid import UUID, uuid4
from decimal import Decimal


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index("idx_orders_user_status", "user_id", "status"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(String(20), server_default="pending")
    notes: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at: Mapped[datetime | None] = mapped_column(default=None)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
```

```python
# GOOD: Repository pattern for data access
class OrdersRepository:
    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session

    async def get_by_id(self, order_id: UUID) -> Order | None:
        stmt = (
            select(Order)
            .where(Order.id == order_id, Order.deleted_at.is_(None))
            .options(selectinload(Order.items))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user_id: UUID, items: list[dict], total: Decimal) -> Order:
        order = Order(user_id=user_id, total=total)
        order.items = [OrderItem(**item, order=order) for item in items]
        self.session.add(order)
        await self.session.flush()
        return order
```

### 1.6 Authentication & Authorization

**DO:**
- Use short-lived JWT access tokens (15-30 minutes) with refresh token rotation
- Store refresh tokens hashed in the database with expiry and device info
- Implement auth as FastAPI dependencies for clean, reusable injection
- Use `python-jose` or `PyJWT` for JWT handling, `passlib[bcrypt]` for password hashing
- Implement rate limiting on auth endpoints
- Log all authentication events

**DON'T:**
- Store sensitive data in JWT payload (only user ID and roles)
- Use a single long-lived token without refresh rotation
- Implement auth checks inside service methods (use dependencies)
- Hardcode roles or permissions

```python
# GOOD: Auth dependency pattern
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(),
) -> UserPayload:
    token = credentials.credentials
    payload = auth_service.verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return payload


def require_roles(*roles: str):
    """Factory for role-based authorization dependency."""
    async def check_roles(user: UserPayload = Depends(get_current_user)) -> UserPayload:
        if not any(role in user.roles for role in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user
    return check_roles
```

### 1.7 Error Handling

**DO:**
- Create custom exception classes for domain-specific errors
- Register global exception handlers in the FastAPI app
- Include error codes that frontend can use for localized messages
- Log full error details server-side; return sanitized messages to clients
- Return appropriate HTTP status codes

**DON'T:**
- Return stack traces in production
- Use generic 500 errors for known error conditions
- Raise `HTTPException` directly in services (use custom exceptions)
- Return database error messages to clients

```python
# GOOD: Custom exceptions + global handlers
# src/exceptions.py
class AppError(Exception):
    """Base application error."""
    def __init__(self, message: str, code: str = "UNKNOWN_ERROR") -> None:
        self.message = message
        self.code = code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(message=message, code="NOT_FOUND")


class BusinessRuleError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(message=message, code="BUSINESS_RULE_VIOLATION")


class ConflictError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(message=message, code="CONFLICT")


# src/main.py - Register handlers
@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content={"detail": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(BusinessRuleError)
async def business_rule_handler(request: Request, exc: BusinessRuleError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"detail": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception", exc_info=exc, path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": {"code": "INTERNAL_ERROR", "message": "Internal server error"}},
    )
```

### 1.8 Configuration

**DO:**
- Use Pydantic `BaseSettings` with `.env` file support for all configuration
- Validate all configuration at startup (fail fast on missing/invalid values)
- Group settings by domain (database, auth, cache, etc.)
- Provide sensible defaults for development; require explicit values for production
- Document every environment variable in `.env.example`

**DON'T:**
- Access `os.environ` directly anywhere in the codebase
- Commit `.env` files to version control
- Use different config patterns in different modules
- Hardcode URLs, secrets, or connection strings

```python
# GOOD: Typed, validated configuration
from pydantic_settings import BaseSettings
from pydantic import Field, PostgresDsn


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # App
    app_name: str = "MyApp"
    debug: bool = False
    environment: str = Field("development", pattern="^(development|staging|production)$")

    # Database
    database_url: PostgresDsn
    db_pool_size: int = Field(5, ge=1, le=50)
    db_max_overflow: int = Field(10, ge=0, le=100)

    # Auth
    jwt_secret: str = Field(..., min_length=32)
    jwt_access_token_expire_minutes: int = Field(15, ge=1)
    jwt_refresh_token_expire_days: int = Field(30, ge=1)

    # Redis (optional)
    redis_url: str | None = None

    # CORS
    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
```

### 1.9 Dependency Injection

**DO:**
- Use FastAPI's `Depends()` for injecting services, repositories, and config
- Create factory functions for complex dependencies (database sessions, cache clients)
- Use `Annotated` types for cleaner dependency declarations
- Override dependencies in tests for easy mocking

**DON'T:**
- Use global mutable state instead of dependency injection
- Create dependencies with side effects that are hard to test
- Nest dependencies too deeply (3 levels max is a good rule)

```python
# GOOD: Clean dependency injection with Annotated
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

# Define reusable annotated types
DbSession = Annotated[AsyncSession, Depends(get_db_session)]
CurrentUser = Annotated[UserPayload, Depends(get_current_user)]
AdminUser = Annotated[UserPayload, Depends(require_roles("admin"))]


# Use in routers
@router.get("/admin/users")
async def list_users(
    admin: AdminUser,
    service: Annotated[UsersService, Depends()],
) -> list[UserResponse]:
    return await service.list_all()
```

### 1.10 Testing

**DO:**
- Use pytest with async support (`pytest-asyncio`)
- Create shared fixtures in `conftest.py` for database sessions, test clients, auth tokens
- Use factory functions for creating test data (factory_boy or custom factories)
- Test both success and error paths
- Override FastAPI dependencies in tests for isolation
- Use `httpx.AsyncClient` for integration tests

**DON'T:**
- Test implementation details (test behavior, not internals)
- Share mutable state between tests
- Use production database for tests
- Skip testing error scenarios

```python
# GOOD: Test setup with dependency overrides
import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app
from src.database import get_db_session


@pytest.fixture
async def client(test_db_session):
    """HTTP client with test database session."""
    app.dependency_overrides[get_db_session] = lambda: test_db_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
async def auth_client(client, test_user):
    """Authenticated HTTP client."""
    token = create_test_token(user_id=test_user.id)
    client.headers["Authorization"] = f"Bearer {token}"
    return client


# GOOD: Clean integration test
class TestCreateOrder:
    async def test_creates_order_with_valid_products(
        self, auth_client: AsyncClient, product_factory
    ):
        products = await product_factory.create_batch(2)
        response = await auth_client.post(
            "/api/orders",
            json={"product_ids": [str(p.id) for p in products]},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["total"] == str(sum(p.price for p in products))

    async def test_returns_400_for_invalid_products(self, auth_client: AsyncClient):
        response = await auth_client.post(
            "/api/orders",
            json={"product_ids": ["00000000-0000-0000-0000-000000000000"]},
        )
        assert response.status_code == 422

    async def test_returns_401_without_auth(self, client: AsyncClient):
        response = await client.post("/api/orders", json={"product_ids": []})
        assert response.status_code == 401
```

### 1.11 Async Best Practices

**DO:**
- Use `async def` for all route handlers and service methods that perform I/O
- Use `asyncpg` (via SQLAlchemy async) for non-blocking database access
- Use `httpx.AsyncClient` for external HTTP calls (not `requests`)
- Use `asyncio.gather()` for concurrent independent I/O operations
- Use async context managers for resource lifecycle management

**DON'T:**
- Mix sync and async code without `run_in_executor` for blocking operations
- Use synchronous libraries (requests, psycopg2) in async code paths
- Create unbounded concurrent tasks (use semaphores for rate limiting)
- Block the event loop with CPU-intensive operations (use `run_in_executor` or background tasks)

```python
# GOOD: Concurrent async operations
async def enrich_orders(self, orders: list[Order]) -> list[EnrichedOrder]:
    """Fetch user and product details concurrently for each order."""
    tasks = [self._enrich_single_order(order) for order in orders]
    return await asyncio.gather(*tasks)

# GOOD: Run blocking code in executor
async def generate_pdf(self, data: ReportData) -> bytes:
    """CPU-intensive PDF generation in thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, self._sync_generate_pdf, data)
```

### 1.12 Performance

**DO:**
- Use pagination for all list endpoints (cursor-based preferred for large datasets)
- Select only needed columns in queries (`.options(load_only(Model.id, Model.name))`)
- Use database indexes on frequently queried and filtered columns
- Enable gzip compression via middleware
- Use connection pooling for database connections (SQLAlchemy pool configuration)
- Profile slow queries and add them to monitoring

**DON'T:**
- Return unbounded result sets (always paginate)
- Load full entity graphs when only a subset is needed
- Run expensive operations synchronously in request handlers (use background tasks)
- Ignore N+1 query problems (use `selectinload` or `joinedload`)

---

## 2. Frontend (React + shadcn/ui + Redux)

### 2.1 Component Architecture (shadcn/ui + Radix)

**DO:**
- Use shadcn/ui components as the primary building blocks — they are pre-styled, accessible Radix UI primitives
- Separate presentational components (UI primitives) from feature components (data-aware)
- Keep components small and focused (< 200 lines of JSX)
- Co-locate component-specific tests and types in the same directory
- Compose shadcn/ui primitives for custom components (e.g., combine `<Card>`, `<Badge>`, `<Avatar>` for a user card)
- Use Tailwind CSS classes exclusively for styling; customize via the `cn()` utility from shadcn
- Use Lucide React for all icons (shadcn/ui default icon set)

**DON'T:**
- Build custom modals, dropdowns, tooltips, or popovers from scratch — use shadcn's `<Dialog>`, `<DropdownMenu>`, `<Tooltip>`, `<Popover>`
- Override shadcn/ui internal styles with CSS — customize via Tailwind classes or the component's variant props
- Use Tailwind arbitrary values (e.g., `h-[600px]`) when a design token exists (`h-96`, `h-screen`)
- Import entire icon libraries — import individual icons: `import { Loader2, Check } from 'lucide-react'`
- Create god components that handle fetching, state, and rendering
- Import backend types directly (create frontend-specific types mirroring Pydantic schemas)

```typescript
// GOOD: Feature component composing shadcn/ui primitives
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types/orders';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Order #{order.id.slice(0, 8)}
        </CardTitle>
        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
          {order.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(order.total)}</div>
        <p className="text-xs text-muted-foreground">
          {order.items.length} items
        </p>
      </CardContent>
    </Card>
  );
}

// GOOD: Loading skeleton matching the component layout
export function OrderCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-1 h-3 w-12" />
      </CardContent>
    </Card>
  );
}
```

### 2.2 State Management (Redux Toolkit + RTK Query)

**DO:**
- Use Redux Toolkit (`@reduxjs/toolkit`) for all global/shared state
- Organize Redux code by feature slices: `features/auth/authSlice.ts`, `features/orders/ordersSlice.ts`
- Use RTK Query for ALL API data fetching, caching, and mutations — it replaces manual `useEffect` + `fetch` patterns
- Define RTK Query API services per backend domain: `services/ordersApi.ts`, `services/authApi.ts`
- Use `createSlice` with Immer for reducers (write "mutable" code safely)
- Use `createSelector` (reselect) for derived/computed state
- Use `useAppSelector` and `useAppDispatch` typed hooks (not raw `useSelector` / `useDispatch`)
- Use `useState` for ephemeral UI state (modal open/close, input focus, hover state)

**DON'T:**
- Put all state in Redux — local UI state belongs in `useState`
- Cache API responses manually — RTK Query handles caching, polling, invalidation
- Mutate state outside of Redux slices (no `state.value = x` in components)
- Create one giant slice — split by domain/feature
- Use `useEffect` + `fetch` for API calls — use RTK Query hooks instead
- Store form state in Redux (use React Hook Form locally)

```typescript
// GOOD: Store setup with typed hooks
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { ordersApi } from '@/services/ordersApi';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ordersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

```typescript
// GOOD: RTK Query API service (connects to FastAPI backend)
// services/ordersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Order, CreateOrderRequest, PaginatedResponse } from '@/types/orders';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    getOrders: builder.query<PaginatedResponse<Order>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => `/orders?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    updateOrder: builder.mutation<Order, { id: string; body: Partial<CreateOrderRequest> }>({
      query: ({ id, body }) => ({ url: `/orders/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),
    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({ url: `/orders/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;
```

```typescript
// GOOD: Feature slice for auth
// features/auth/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  user: { id: string; email: string; role: string } | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ accessToken: string; user: AuthState['user'] }>) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    logout(state) {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

### 2.3 API Integration (RTK Query)

**DO:**
- Define all API endpoints in RTK Query services — one service per backend domain
- Use `providesTags` and `invalidatesTags` for automatic cache invalidation after mutations
- Use `transformResponse` to normalize API responses if needed
- Use optimistic updates via `onQueryStarted` for responsive UX on mutations
- Configure `baseQuery` with auth token injection and error handling
- Use RTK Query's built-in loading/error states: `isLoading`, `isError`, `isFetching`, `isSuccess`

**DON'T:**
- Call `fetch`/`axios` directly in components — use RTK Query hooks
- Manually manage loading/error state with `useState` — RTK Query handles this
- Ignore error responses (always show user-friendly messages via shadcn `<Alert>` or toast)
- Hard-code API URLs (use `import.meta.env.VITE_API_URL`)
- Store tokens in localStorage (use Redux state + memory; refresh via RTK Query)

```typescript
// GOOD: Using RTK Query in a component with shadcn/ui
import { useGetOrdersQuery } from '@/services/ordersApi';
import { OrderCard, OrderCardSkeleton } from '@/components/orders/OrderCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function OrdersList() {
  const { data, isLoading, isError, error, refetch } = useGetOrdersQuery({ page: 1, limit: 20 });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load orders.{' '}
          <button onClick={refetch} className="underline">Retry</button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.data.length) {
    return <EmptyState title="No orders yet" description="Create your first order to get started." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.data.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

### 2.4 Forms & Validation (React Hook Form + Zod + shadcn)

**DO:**
- Use React Hook Form (`react-hook-form`) with `@hookform/resolvers/zod` for all forms
- Define Zod schemas that mirror backend Pydantic validation rules
- Use shadcn/ui form components: `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormMessage>`
- Use shadcn/ui input components: `<Input>`, `<Textarea>`, `<Select>`, `<Checkbox>`, `<Switch>`
- Validate on blur and on change for interactive feedback
- Disable submit button during submission; show loading state with `<Loader2>` icon
- Preserve form state on validation errors

**DON'T:**
- Implement custom form state management — React Hook Form handles this
- Show all errors at the top of the form only (use inline `<FormMessage>`)
- Skip server-side validation (never trust client-only validation)
- Store form state in Redux (keep it in React Hook Form)

```typescript
// GOOD: Form with React Hook Form + Zod + shadcn/ui
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useCreateOrderMutation } from '@/services/ordersApi';
import { useToast } from '@/components/ui/use-toast';

const createOrderSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'Select at least one product'),
  notes: z.string().max(500).optional(),
});

type CreateOrderForm = z.infer<typeof createOrderSchema>;

export function CreateOrderForm({ onSuccess }: { onSuccess: () => void }) {
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { toast } = useToast();

  const form = useForm<CreateOrderForm>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { productIds: [], notes: '' },
  });

  async function onSubmit(data: CreateOrderForm) {
    try {
      await createOrder(data).unwrap();
      toast({ title: 'Order created successfully' });
      onSuccess();
    } catch (error) {
      toast({ title: 'Failed to create order', variant: 'destructive' });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional order notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Order
        </Button>
      </form>
    </Form>
  );
}
```

### 2.5 Error Handling & UX

**DO:**
- Use React Error Boundaries at the route level for unexpected errors
- Show user-friendly errors via shadcn `<Alert variant="destructive">` for inline errors
- Use shadcn `<Toaster>` + `useToast()` for notification-style feedback (success, error, info)
- Provide retry actions for transient errors (network issues, timeouts)
- Use shadcn `<Skeleton>` components for loading states (match the layout of the loaded content)
- Log frontend errors to Sentry or similar error tracking service

**DON'T:**
- Show blank screens on error (always render fallback UI)
- Show raw API error messages to users (map error codes to localized messages)
- Use `console.log` for error tracking in production
- Ignore network connectivity issues (show offline banner)

### 2.6 Performance

**DO:**
- Lazy-load routes with `React.lazy()` + `<Suspense fallback={<Skeleton />}>`
- Use image optimization (WebP, lazy loading, `srcset`, next-gen formats)
- Debounce search inputs and resize handlers (use `useDebouncedValue` or similar)
- Memoize expensive computations with `useMemo`; memoize callbacks with `useCallback` when passing to child components
- Use virtual scrolling for long lists (> 100 items) via `@tanstack/react-virtual`
- Leverage RTK Query's built-in caching to avoid redundant network requests
- Minimize bundle size: use tree-shaking, analyze with `npx vite-bundle-visualizer`

**DON'T:**
- Prematurely optimize — measure first with Lighthouse / React DevTools Profiler
- Import entire libraries (`import _ from 'lodash'`) — use named imports (`import { debounce } from 'lodash'`)
- Re-render entire page when a small piece of state changes (split Redux selectors)
- Wrap everything in `React.memo` without profiling first

### 2.7 Testing

**DO:**
- Test user behavior, not implementation (what the user sees and clicks)
- Use React Testing Library queries: `getByRole`, `getByText`, `getByLabelText`
- Mock API calls at the network level using MSW (Mock Service Worker)
- Wrap components in a test `<Provider store={testStore}>` for Redux integration
- Test loading, error, and empty states
- Test form validation (submit with invalid data, verify error messages)
- Test accessibility: verify ARIA roles, keyboard navigation with shadcn components

**DON'T:**
- Test Redux store internals directly — test through component behavior
- Snapshot-test everything (only for stable, presentational UI)
- Mock RTK Query hooks directly — use MSW to intercept network requests
- Write tests that break when Tailwind classes change

```typescript
// GOOD: Testing a component with RTK Query + MSW
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { OrdersList } from '@/components/orders/OrdersList';
import { createTestStore } from '@/test/helpers';

const server = setupServer(
  http.get('*/orders', () =>
    HttpResponse.json({
      data: [{ id: '1', total: 99.99, status: 'pending', items: [] }],
      meta: { total: 1, page: 1, limit: 20 },
    }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders order cards after loading', async () => {
  render(
    <Provider store={createTestStore()}>
      <OrdersList />
    </Provider>,
  );

  // Shows skeletons while loading
  expect(screen.getAllByTestId('order-skeleton')).toHaveLength(6);

  // Shows order card after data loads
  await waitFor(() => {
    expect(screen.getByText(/Order #1/)).toBeInTheDocument();
  });
});
```

### 2.8 Accessibility

**DO:**
- shadcn/ui components are built on Radix UI which provides excellent a11y out of the box — DO NOT break it
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<article>`, `<section>`)
- Add `aria-label` to icon-only buttons (e.g., `<Button variant="ghost" size="icon" aria-label="Delete order">`)
- Ensure all interactive elements are keyboard accessible (Tab, Enter, Escape, Arrow keys)
- Maintain sufficient color contrast (WCAG 2.1 AA: 4.5:1 for normal text, 3:1 for large text)
- Support dark mode via shadcn's theme system — verify contrast in both themes
- Test with screen readers (VoiceOver, NVDA) periodically

**DON'T:**
- Use `<div onClick>` instead of `<Button>` — shadcn buttons handle focus, keyboard, and ARIA
- Remove focus rings without providing a visible alternative
- Use color alone to convey information (pair with icons or text)
- Override Radix UI's keyboard handling in shadcn components

---

## 3. Database

**DO:**
- Use Alembic migrations for ALL schema changes (never manually alter tables)
- Add indexes on columns used in WHERE, JOIN, and ORDER BY clauses
- Use foreign keys with appropriate ON DELETE behavior
- Set column types precisely (VARCHAR length, DECIMAL precision, ENUM values)
- Use `EXPLAIN ANALYZE` for queries that take > 100ms
- Configure connection pooling in SQLAlchemy (pool_size, max_overflow)
- Use `server_default` for database-level defaults in models

**DON'T:**
- Use `Base.metadata.create_all()` in production
- Store large blobs in the database (use object storage)
- Create indexes on every column (indexes have write overhead)
- Use database-level cascade deletes without careful consideration
- Skip database backups and point-in-time recovery setup

```python
# GOOD: Alembic migration
"""Add orders table

Revision ID: abc123
"""

def upgrade() -> None:
    op.create_table(
        "orders",
        sa.Column("id", sa.UUID(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.UUID(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("total", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_orders_user_status", "orders", ["user_id", "status"])


def downgrade() -> None:
    op.drop_index("idx_orders_user_status")
    op.drop_table("orders")
```

---

## 4. Caching (Redis)

> Only applicable if caching was justified per `architectural-decisions-guide.md`

**DO:**
- Use `redis.asyncio` for non-blocking Redis access
- Use structured key names with prefixes: `app:entity:id`
- Always set TTL on every cache entry
- Implement cache-aside pattern
- Use Redis pipelines for batch operations
- Monitor hit/miss ratio
- Implement graceful degradation if Redis is down

**DON'T:**
- Cache user-specific data without the user ID in the key
- Cache mutable data with long TTLs without invalidation
- Use Redis as a primary database
- Store sensitive data in cache
- Ignore cache stampede scenarios

```python
# GOOD: Cache-aside pattern with graceful degradation
import redis.asyncio as redis
from src.config import settings

redis_client = redis.from_url(settings.redis_url) if settings.redis_url else None


async def get_product_cached(product_id: UUID) -> Product | None:
    """Get product with cache-aside pattern."""
    if redis_client:
        try:
            cached = await redis_client.get(f"product:{product_id}")
            if cached:
                return Product.model_validate_json(cached)
        except redis.RedisError:
            logger.warning("Redis unavailable, falling back to database")

    # Cache miss or Redis down: fetch from DB
    product = await repository.get_by_id(product_id)
    if product and redis_client:
        try:
            await redis_client.setex(
                f"product:{product_id}",
                300,  # 5 minute TTL
                product.model_dump_json(),
            )
        except redis.RedisError:
            pass  # Non-critical: skip caching

    return product
```

---

## 5. Message Queues (Celery / arq)

> Only applicable if queues were justified per `architectural-decisions-guide.md`

**DO:**
- Define typed task parameters using Pydantic models or TypedDict
- Implement idempotent task execution (tasks may be delivered more than once)
- Configure retry strategies with exponential backoff
- Set up Dead Letter Queues for failed tasks
- Monitor queue depth and processing latency
- Log task lifecycle events

**DON'T:**
- Put entire request payloads in task data (store references, fetch fresh data)
- Process tasks that take > 30 minutes without checkpointing
- Ignore failed tasks (set up alerting)
- Create a new queue for every task type

```python
# GOOD: Celery task with proper error handling and idempotency
from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(ConnectionError, TimeoutError),
    retry_backoff=True,
)
def send_order_confirmation(self, order_id: str) -> None:
    """Send order confirmation email. Idempotent: checks if already sent."""
    logger.info("Processing order confirmation", extra={"order_id": order_id})

    # Idempotency check
    if EmailLog.objects.filter(order_id=order_id, type="confirmation").exists():
        logger.info("Confirmation already sent, skipping", extra={"order_id": order_id})
        return

    # Fetch fresh data (not from task arguments)
    order = Order.objects.get(id=order_id)
    email_service.send_confirmation(order)
    EmailLog.objects.create(order_id=order_id, type="confirmation")

    logger.info("Order confirmation sent", extra={"order_id": order_id})
```

---

## 6. Docker & Deployment

**DO:**
- Use multi-stage Docker builds (build stage + production stage)
- Run application as non-root user in container
- Use `.dockerignore` to exclude `.venv`, `.git`, tests, `__pycache__`
- Use health checks in Docker Compose and orchestrator
- Pin dependency versions in Dockerfile
- Implement graceful shutdown (handle SIGTERM)
- Use gunicorn + uvicorn workers in production

**DON'T:**
- Install dev dependencies in production images
- Store secrets in Docker images or Compose files
- Use `latest` tags for base images
- Run multiple processes in a single container

```dockerfile
# GOOD: Multi-stage production build
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./

FROM python:3.12-slim AS production
WORKDIR /app
RUN addgroup --gid 1001 appgroup && adduser --uid 1001 --gid 1001 --disabled-password appuser
COPY --from=builder --chown=appuser:appgroup /app /app
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import httpx; httpx.get('http://localhost:8000/health').raise_for_status()"
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

---

## 7. Logging & Observability

**DO:**
- Use structured JSON logging (`structlog` or `loguru`) with consistent fields
- Include correlation ID in every log entry (propagate via middleware)
- Log at appropriate levels: ERROR for failures, WARN for degraded behavior, INFO for business events, DEBUG for troubleshooting
- Include context in logs: user ID, entity ID, operation name, duration
- Set up alerting for error spikes and performance degradation

**DON'T:**
- Log sensitive data (passwords, tokens, PII without masking)
- Use `print()` in production code
- Log every request body in detail (use sampling for high-traffic endpoints)
- Ignore log rotation and retention policies

```python
# GOOD: Structured logging with structlog
import structlog

logger = structlog.get_logger()


async def create_order(self, user_id: UUID, data: CreateOrderRequest) -> Order:
    log = logger.bind(user_id=str(user_id), product_count=len(data.product_ids))
    log.info("Creating order")

    order = await self.repository.create(...)
    log.info("Order created", order_id=str(order.id), total=str(order.total))
    return order
```

---

## 8. Security

**DO:**
- Validate and sanitize ALL user input (Pydantic handles most of this automatically)
- Use parameterized queries via SQLAlchemy (prevent SQL injection)
- Set security headers via middleware (X-Content-Type-Options, X-Frame-Options, etc.)
- Rate limit authentication endpoints
- Rotate secrets and tokens regularly
- Keep dependencies updated; run `pip audit` or `safety check` regularly
- Implement request size limits via middleware
- Use HTTPS everywhere in production

**DON'T:**
- Trust client-side validation as the only validation
- Log or return raw error messages from database/ORM
- Store passwords in plain text (use passlib + bcrypt, rounds >= 12)
- Disable HTTPS in production
- Use wildcard CORS (`*`) in production
- Expose internal service details in error responses
- Use `eval()`, `exec()`, or `pickle.loads()` on user input

---

## 9. Mandatory Testing Requirements (Non-Negotiable)

- Every change MUST include tests at the appropriate levels: frontend component tests, frontend integration tests, frontend E2E tests, backend unit tests, backend integration tests, backend E2E tests, and API contract tests between frontend and backend.
- API contract tests MUST run on every pull request and MUST fail on any backward-incompatible schema or error-shape change unless versioned and explicitly approved.
- Coverage minimums are enforced in CI: backend lines >= 85%, backend branches >= 75%, frontend lines >= 80%, frontend branches >= 70%, and changed lines coverage >= 90%.
- Critical paths MUST include explicit negative-path tests (authorization failures, validation failures, and retry/idempotency behavior for retried writes).
- Test data MUST be deterministic and reproducible: seeded factories, frozen clocks where needed, isolated databases, and no dependence on shared mutable state.
- Flaky tests are treated as failures: any flaky test MUST be quarantined within 24 hours, ticketed with owner, and fixed before release; no merge is allowed with known flaky critical-path tests.
- CI is the quality gate: pull requests MUST fail and MUST NOT merge when any required test suite fails (unit, integration, E2E, or contract).
