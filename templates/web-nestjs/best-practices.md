# Best Practices Guide — Web Application + NestJS API

This guide covers component-level best practices for each layer of a web application with a NestJS backend. Every team member and AI agent MUST follow these practices when implementing features.

---

## Table of Contents

- [1. NestJS Backend](#1-nestjs-backend)
  - [1.1 Modules](#11-modules)
  - [1.2 Controllers](#12-controllers)
  - [1.3 Services](#13-services)
  - [1.4 DTOs & Validation](#14-dtos--validation)
  - [1.5 Entities & Data Access](#15-entities--data-access)
  - [1.6 Authentication & Authorization](#16-authentication--authorization)
  - [1.7 Error Handling](#17-error-handling)
  - [1.8 Configuration](#18-configuration)
  - [1.9 Testing](#19-testing)
  - [1.10 Performance](#110-performance)
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
- [5. Message Queues (BullMQ)](#5-message-queues-bullmq)
- [6. Docker & Deployment](#6-docker--deployment)
- [7. Logging & Observability](#7-logging--observability)
- [8. Security](#8-security)

---

## 1. NestJS Backend

### 1.1 Modules

**DO:**
- One module per domain/bounded context (e.g., `UsersModule`, `OrdersModule`, `PaymentsModule`)
- Export only what other modules need; keep internal services private
- Use `forwardRef()` only when absolutely necessary and document why
- Register global modules (logging, config) in `AppModule` with `@Global()`

**DON'T:**
- Create a "shared" module that becomes a dumping ground for unrelated code
- Import modules circularly without documented justification
- Put multiple domains in one module for convenience

```typescript
// GOOD: Clean module with explicit exports
@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService], // Only export what others need
})
export class OrdersModule {}
```

### 1.2 Controllers

**DO:**
- Keep controllers thin: parse request, call service, format response
- Use proper HTTP status codes (`201` for creation, `204` for deletion, `404` for not found)
- Apply Swagger decorators to every endpoint
- Use `@Param()`, `@Query()`, `@Body()` with DTO types for automatic validation
- Group related endpoints under a single controller

**DON'T:**
- Put business logic in controllers
- Return raw database entities (use DTOs/serialization)
- Catch exceptions in controllers (let exception filters handle them)
- Use string-based route parameters without validation

```typescript
// GOOD: Thin controller, proper decorators, DTO responses
@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  async create(
    @CurrentUser() user: UserPayload,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.create(user.id, createOrderDto);
    return OrderResponseDto.fromEntity(order);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.findOneOrFail(id, user.id);
    return OrderResponseDto.fromEntity(order);
  }
}
```

### 1.3 Services

**DO:**
- Contain all business logic in services
- Use dependency injection for all dependencies
- Throw typed exceptions (`NotFoundException`, `ConflictException`, `ForbiddenException`)
- Keep methods focused: one method = one business operation
- Use transactions for multi-step write operations

**DON'T:**
- Access the HTTP request/response objects in services
- Call other services' private methods directly
- Swallow exceptions silently
- Perform raw SQL without documenting why ORM is insufficient

```typescript
// GOOD: Business logic in service with proper error handling
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    // Validate business rules
    const products = await this.productsService.findByIds(dto.productIds);
    if (products.length !== dto.productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // Use transaction for multi-table write
    return this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        userId,
        items: products.map((p) => ({ productId: p.id, price: p.price })),
        total: products.reduce((sum, p) => sum + p.price, 0),
      });
      return manager.save(order);
    });
  }
}
```

### 1.4 DTOs & Validation

**DO:**
- Create separate DTOs for request (Create, Update) and response
- Use `class-validator` decorators for all validatable fields
- Use `class-transformer` for type conversion (`@Type(() => Number)`)
- Apply `@IsOptional()` for truly optional fields in update DTOs
- Use `PartialType()` and `PickType()` from `@nestjs/swagger` to derive DTOs

**DON'T:**
- Use the same DTO for create and response
- Skip validation on nested objects
- Use `any` in DTO definitions
- Expose internal fields (database IDs, timestamps) in create DTOs

```typescript
// GOOD: Separate DTOs with proper validation
export class CreateOrderDto {
  @ApiProperty({ type: [String], example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  productIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  status: OrderStatus;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(entity: Order): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = entity.id;
    dto.total = entity.total;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
```

### 1.5 Entities & Data Access

**DO:**
- Use UUIDs as primary keys (not auto-increment integers)
- Add `createdAt` and `updatedAt` timestamps to all entities
- Define indexes for frequently queried columns
- Use eager loading sparingly; prefer explicit joins/relations in queries
- Use query builders for complex queries instead of raw SQL

**DON'T:**
- Expose entity objects directly in API responses
- Use `eager: true` on relations by default (causes N+1 and over-fetching)
- Create bidirectional relations unless both directions are queried
- Skip database migrations (never use `synchronize: true` in production)

```typescript
// GOOD: Well-defined entity with proper decorators
@Entity('orders')
@Index(['userId', 'status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date; // Soft delete
}
```

### 1.6 Authentication & Authorization

**DO:**
- Use short-lived JWT access tokens (15-30 minutes) with refresh token rotation
- Store refresh tokens hashed in the database with expiry and device info
- Implement guards at the controller/route level, not in services
- Use custom decorators for extracting the current user (`@CurrentUser()`)
- Implement rate limiting on auth endpoints (login, register, password reset)
- Log all authentication events (login, logout, failed attempts, token refresh)

**DON'T:**
- Store sensitive data in JWT payload (only user ID and roles)
- Use a single long-lived token without refresh rotation
- Implement authorization checks in controllers (use guards)
- Hardcode roles or permissions (use a database-driven RBAC system)

```typescript
// GOOD: Custom decorator + Guard pattern
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### 1.7 Error Handling

**DO:**
- Create custom exception classes for domain-specific errors
- Use a global exception filter for consistent error response formatting
- Include error codes that frontend can use for localized messages
- Log full error details server-side; return sanitized messages to clients
- Return appropriate HTTP status codes (400 for validation, 401 for auth, 403 for authz, 404 for not found, 409 for conflict, 422 for business rule violations)

**DON'T:**
- Return stack traces in production
- Use generic 500 errors for known error conditions
- Swallow exceptions without logging
- Return database error messages to clients

```typescript
// GOOD: Consistent error response format
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      exception instanceof Error ? exception.stack : undefined,
      { correlationId: request.headers['x-correlation-id'] },
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 1.8 Configuration

**DO:**
- Use `@nestjs/config` with `.env` files for all environment-specific values
- Validate environment variables at startup using a schema (Joi or class-validator)
- Group configuration by domain (database, auth, cache, queue, etc.)
- Provide sensible defaults for development; require explicit values for production
- Document every environment variable in `.env.example`

**DON'T:**
- Hardcode configuration values
- Access `process.env` directly (use `ConfigService`)
- Commit `.env` files to version control
- Use different config patterns in different modules

```typescript
// GOOD: Typed, validated configuration
@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get databaseUrl(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '15m');
  }

  get redisUrl(): string | undefined {
    return this.configService.get<string>('REDIS_URL');
  }
}
```

### 1.9 Testing

**DO:**
- Write unit tests for services with mocked dependencies
- Write integration tests for controllers using `@nestjs/testing` module
- Use test factories/fixtures for creating test data
- Test both success and error paths
- Use `beforeEach` to reset state between tests
- Test DTOs validation separately

**DON'T:**
- Test implementation details (test behavior, not internals)
- Share mutable state between tests
- Use production database for tests (use in-memory or test-specific DB)
- Skip testing error scenarios

```typescript
// GOOD: Clean unit test with mocked dependencies
describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepo: jest.Mocked<Repository<Order>>;
  let productsService: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: ProductsService,
          useValue: { findByIds: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(OrdersService);
    orderRepo = module.get(getRepositoryToken(Order));
    productsService = module.get(ProductsService);
  });

  describe('create', () => {
    it('should create an order with valid products', async () => {
      const products = [createMockProduct({ price: 10 }), createMockProduct({ price: 20 })];
      productsService.findByIds.mockResolvedValue(products);
      orderRepo.save.mockResolvedValue(createMockOrder({ total: 30 }));

      const result = await service.create('user-1', {
        productIds: products.map((p) => p.id),
      });

      expect(result.total).toBe(30);
    });

    it('should throw BadRequestException when product not found', async () => {
      productsService.findByIds.mockResolvedValue([]);

      await expect(
        service.create('user-1', { productIds: ['nonexistent-id'] }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

### 1.10 Performance

**DO:**
- Use pagination for all list endpoints (cursor-based preferred for large datasets)
- Select only needed columns in queries (`select: ['id', 'name']`)
- Use database indexes on frequently queried and filtered columns
- Enable gzip/brotli compression for responses
- Use connection pooling for database connections
- Profile slow queries and add them to monitoring

**DON'T:**
- Return unbounded result sets (always paginate)
- Load full entity graphs when only a subset is needed
- Run expensive operations synchronously in request handlers (use queues)
- Ignore N+1 query problems (use `leftJoinAndSelect` or DataLoader)

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
- Import backend types directly (create frontend-specific types mirroring DTOs)

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
// GOOD: RTK Query API service
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
// GOOD: Using RTK Query in a component
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
- Define Zod schemas that mirror backend validation rules
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
- Use migrations for ALL schema changes (never manually alter tables)
- Add indexes on columns used in WHERE, JOIN, and ORDER BY clauses
- Use foreign keys with appropriate ON DELETE behavior
- Set column types precisely (VARCHAR length, DECIMAL precision, ENUM values)
- Use EXPLAIN ANALYZE for queries that take > 100ms
- Implement connection pooling (PgBouncer or ORM-level pooling)

**DON'T:**
- Use `synchronize: true` in production (TypeORM)
- Store large blobs in the database (use object storage)
- Create indexes on every column (indexes have write overhead)
- Use database-level cascade deletes without careful consideration
- Skip database backups and point-in-time recovery setup

---

## 4. Caching (Redis)

> Only applicable if caching was justified per `architectural-decisions-guide.md`

**DO:**
- Use structured key names with prefixes: `app:entity:id` (e.g., `myapp:user:123`)
- Always set TTL on every cache entry (no unbounded cache)
- Implement cache-aside pattern: check cache -> miss -> query DB -> store in cache
- Use Redis pipelines for batch operations
- Monitor hit/miss ratio; alert if hit ratio drops below 80%
- Implement graceful degradation: if Redis is down, serve from database

**DON'T:**
- Cache user-specific data without the user ID in the key
- Cache mutable data with long TTLs without invalidation
- Use Redis as a primary database
- Store sensitive data in cache without encryption consideration
- Ignore cache stampede scenarios (use locks or probabilistic early expiration)

---

## 5. Message Queues (BullMQ)

> Only applicable if queues were justified per `architectural-decisions-guide.md`

**DO:**
- Define typed job data interfaces for every queue
- Implement idempotent job processors (jobs may be delivered more than once)
- Configure retry strategies with exponential backoff
- Set up Dead Letter Queues for failed jobs
- Monitor queue depth and processing latency
- Log job lifecycle events (added, processing, completed, failed)

**DON'T:**
- Put entire request payloads in job data (store references, fetch fresh data)
- Process jobs synchronously if they take > 30 seconds (break into sub-jobs)
- Ignore failed jobs in DLQ (set up alerting)
- Create a new queue for every job type (group related jobs)

```typescript
// GOOD: Typed BullMQ job with proper error handling
interface SendEmailJobData {
  userId: string;
  templateId: string;
  variables: Record<string, string>;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send')
  async handleSend(job: Job<SendEmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id} for user ${job.data.userId}`);

    try {
      // Fetch fresh user data (not from job payload)
      const user = await this.usersService.findById(job.data.userId);
      if (!user) {
        this.logger.warn(`User ${job.data.userId} not found, skipping job ${job.id}`);
        return; // Don't retry if user doesn't exist
      }

      await this.emailService.send(user.email, job.data.templateId, job.data.variables);
      this.logger.log(`Email job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed: ${error.message}`, error.stack);
      throw error; // Rethrow to trigger retry
    }
  }
}
```

---

## 6. Docker & Deployment

**DO:**
- Use multi-stage Docker builds (build stage + production stage)
- Run application as non-root user in container
- Use `.dockerignore` to exclude node_modules, .git, tests
- Use health checks in Docker Compose and orchestrator
- Pin dependency versions in Dockerfile (`FROM node:20.11-alpine`, not `FROM node:latest`)
- Implement graceful shutdown (handle SIGTERM, drain connections)

**DON'T:**
- Install dev dependencies in production images
- Store secrets in Docker images or Compose files (use secrets management)
- Use `latest` tags for base images
- Run multiple processes in a single container (one process per container)

```dockerfile
# GOOD: Multi-stage production build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

---

## 7. Logging & Observability

**DO:**
- Use structured JSON logging (Winston or Pino) with consistent fields
- Include correlation ID in every log entry (propagate from request header)
- Log at appropriate levels: ERROR for failures, WARN for degraded behavior, INFO for business events, DEBUG for troubleshooting
- Include context in logs: user ID, entity ID, operation name, duration
- Set up alerting for error spikes and performance degradation

**DON'T:**
- Log sensitive data (passwords, tokens, PII without masking)
- Use `console.log` in production code
- Log every request in detail (use sampling for high-traffic endpoints)
- Ignore log rotation and retention policies

```typescript
// GOOD: Structured logging with context
this.logger.log({
  message: 'Order created',
  orderId: order.id,
  userId: user.id,
  total: order.total,
  itemCount: order.items.length,
  duration: Date.now() - startTime,
});
```

---

## 8. Security

**DO:**
- Validate and sanitize ALL user input (backend is the source of truth)
- Use parameterized queries / ORM (prevent SQL injection)
- Implement CSRF protection if using cookie-based authentication
- Set security headers via Helmet middleware
- Rate limit authentication endpoints (5 attempts per minute)
- Rotate secrets and tokens regularly
- Keep dependencies updated; run `npm audit` / `pnpm audit` regularly
- Implement request size limits to prevent payload attacks

**DON'T:**
- Trust client-side validation as the only validation
- Log or return raw error messages from database/ORM
- Store passwords in plain text (use bcrypt with salt rounds >= 12)
- Disable HTTPS in production
- Use wildcard CORS (`*`) in production
- Expose internal service details in error responses (stack traces, file paths)

---

## 9. Mandatory Testing Requirements (Non-Negotiable)

- Every change MUST include tests at the appropriate levels: frontend component tests, frontend integration tests, frontend E2E tests, backend unit tests, backend integration tests, backend E2E tests, and API contract tests between frontend and backend.
- API contract tests MUST run on every pull request and MUST fail on any backward-incompatible schema or error-shape change unless versioned and explicitly approved.
- Coverage minimums are enforced in CI: backend lines >= 85%, backend branches >= 75%, frontend lines >= 80%, frontend branches >= 70%, and changed lines coverage >= 90%.
- Critical paths MUST include explicit negative-path tests (authorization failures, validation failures, and retry/idempotency behavior for retried writes).
- Test data MUST be deterministic and reproducible: seeded factories, frozen clocks where needed, isolated databases, and no dependence on shared mutable state.
- Flaky tests are treated as failures: any flaky test MUST be quarantined within 24 hours, ticketed with owner, and fixed before release; no merge is allowed with known flaky critical-path tests.
- CI is the quality gate: pull requests MUST fail and MUST NOT merge when any required test suite fails (unit, integration, E2E, or contract).
