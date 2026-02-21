# Billing Simulation Feature Design

## Overview

The billing simulation feature provides users with a forward-looking view of their subscription expenses over a configurable time period (default 30 days, maximum 365 days). The system calculates when each active subscription will renew, projects multiple renewals for subscriptions that renew multiple times within the period, and aggregates this information into a comprehensive spending forecast.

This feature helps users:
- Anticipate upcoming charges
- Plan their finances around subscription renewals
- Identify potential cash flow issues before they occur
- Understand the cumulative impact of multiple subscriptions

## Architecture

### High-Level Components

```
┌─────────────────┐
│   API Route     │  /api/simulation
│  (simulation)   │  - Authentication
└────────┬────────┘  - Input validation
         │
         ▼
┌─────────────────┐
│ Simulation      │  - Fetch active subscriptions
│   Service       │  - Calculate renewal dates
└────────┬────────┘  - Aggregate projections
         │
         ▼
┌─────────────────┐
│   Database      │  Supabase (subscriptions table)
│   (Supabase)    │
└─────────────────┘
```

### Component Responsibilities

1. **API Route Handler** (`/routes/simulation.ts`)
   - Authenticate user requests
   - Validate query parameters (days)
   - Call simulation service
   - Format and return response

2. **Simulation Service** (`/services/simulation-service.ts`)
   - Fetch active subscriptions for user
   - Calculate projected renewal dates
   - Generate projection array
   - Calculate total projected spend
   - Assess balance risk (if balance provided)

3. **Database Layer**
   - Query subscriptions table
   - Filter by user_id and status
   - Return subscription data

## Components and Interfaces

### API Endpoint

**Route:** `GET /api/simulation`

**Query Parameters:**
- `days` (optional): Number of days to project (1-365, default: 30)

**Request Headers:**
- `Authorization: Bearer <token>` or `authToken` cookie

**Response Format:**
```typescript
{
  success: boolean;
  data: {
    projections: ProjectedRenewal[];
    summary: {
      totalProjectedSpend: number;
      projectionPeriodDays: number;
      startDate: string;
      endDate: string;
      subscriptionCount: number;
      renewalCount: number;
    };
    risk?: {
      insufficientBalance: boolean;
      currentBalance?: number;
      shortfall?: number;
    };
  };
}
```

### Simulation Service Interface

```typescript
interface SimulationService {
  /**
   * Generate billing simulation for a user
   * @param userId - The authenticated user's ID
   * @param days - Number of days to project (default: 30)
   * @returns Simulation result with projections and summary
   */
  generateSimulation(
    userId: string,
    days?: number
  ): Promise<SimulationResult>;

  /**
   * Calculate next renewal date based on billing cycle
   * @param currentDate - The current renewal date
   * @param billingCycle - The subscription's billing cycle
   * @returns The next renewal date
   */
  calculateNextRenewal(
    currentDate: Date,
    billingCycle: 'monthly' | 'quarterly' | 'yearly'
  ): Date;

  /**
   * Generate all projected renewals for a subscription within period
   * @param subscription - The subscription to project
   * @param endDate - The end of the projection period
   * @returns Array of projected renewals
   */
  projectSubscriptionRenewals(
    subscription: Subscription,
    endDate: Date
  ): ProjectedRenewal[];
}
```

## Data Models

### ProjectedRenewal

```typescript
interface ProjectedRenewal {
  subscriptionId: string;
  subscriptionName: string;
  provider: string;
  amount: number;
  projectedDate: string; // ISO 8601 format
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  category: string | null;
}
```

### SimulationResult

```typescript
interface SimulationResult {
  projections: ProjectedRenewal[];
  summary: {
    totalProjectedSpend: number;
    projectionPeriodDays: number;
    startDate: string;
    endDate: string;
    subscriptionCount: number;
    renewalCount: number;
  };
  risk?: {
    insufficientBalance: boolean;
    currentBalance?: number;
    shortfall?: number;
  };
}
```

### Subscription (existing)

```typescript
interface Subscription {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  price: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'cancelled' | 'paused' | 'trial';
  next_billing_date: string | null;
  category: string | null;
  // ... other fields
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: All projected renewals fall within projection period
*For any* simulation with projection period of N days, all projected renewal dates should be greater than or equal to the start date and less than or equal to the end date (start + N days).
**Validates: Requirements 1.4, 1.5**

### Property 2: Renewal date calculation preserves billing cycle intervals
*For any* subscription with a specific billing cycle, the difference between consecutive projected renewal dates should equal the billing cycle duration (30 days for monthly, 90 for quarterly, 365 for yearly).
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: Total projected spend equals sum of all renewal amounts
*For any* simulation result, the totalProjectedSpend should equal the sum of all amounts in the projections array.
**Validates: Requirements 3.1, 3.2**

### Property 4: Subscriptions without next_billing_date are excluded
*For any* subscription where next_billing_date is null, that subscription should not appear in the projections array.
**Validates: Requirements 1.3**

### Property 5: Only active and trial subscriptions are included
*For any* simulation, all subscriptions in the projections array should have status 'active' or 'trial'.
**Validates: Requirements 1.2**

### Property 6: Renewal count matches projection array length
*For any* simulation result, the summary.renewalCount should equal the length of the projections array.
**Validates: Requirements 3.2**

### Property 7: Insufficient balance risk is correctly identified
*For any* simulation where currentBalance is provided, insufficientBalance should be true if and only if totalProjectedSpend exceeds currentBalance.
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 8: Empty projections yield zero spend
*For any* user with no active subscriptions or no renewals in the period, totalProjectedSpend should equal zero.
**Validates: Requirements 3.3**

### Property 9: Projection period validation
*For any* request with days parameter, if days < 1 or days > 365, the system should reject the request with a validation error.
**Validates: Requirements 6.4, 6.5**

## Algorithm: Renewal Projection

### Core Algorithm

```
function generateSimulation(userId, days):
  1. Validate days parameter (1 <= days <= 365)
  2. Calculate startDate = now()
  3. Calculate endDate = startDate + days
  
  4. Fetch active subscriptions:
     - WHERE user_id = userId
     - AND status IN ('active', 'trial')
     - AND next_billing_date IS NOT NULL
  
  5. Initialize projections = []
  
  6. For each subscription:
     a. currentRenewalDate = subscription.next_billing_date
     b. While currentRenewalDate <= endDate:
        i. Create ProjectedRenewal:
           - subscriptionId = subscription.id
           - subscriptionName = subscription.name
           - provider = subscription.provider
           - amount = subscription.price
           - projectedDate = currentRenewalDate
           - billingCycle = subscription.billing_cycle
           - category = subscription.category
        ii. Add to projections array
        iii. currentRenewalDate = calculateNextRenewal(
               currentRenewalDate,
               subscription.billing_cycle
             )
  
  7. Sort projections by projectedDate (ascending)
  
  8. Calculate summary:
     - totalProjectedSpend = sum(projections.map(p => p.amount))
     - projectionPeriodDays = days
     - startDate = startDate.toISOString()
     - endDate = endDate.toISOString()
     - subscriptionCount = unique subscription IDs in projections
     - renewalCount = projections.length
  
  9. Return SimulationResult
```

### Date Calculation Logic

```
function calculateNextRenewal(currentDate, billingCycle):
  switch billingCycle:
    case 'monthly':
      return addDays(currentDate, 30)
    case 'quarterly':
      return addDays(currentDate, 90)
    case 'yearly':
      return addDays(currentDate, 365)
```

**Note:** We use fixed day intervals (30, 90, 365) rather than calendar months to ensure predictable, testable behavior. This avoids complexities with varying month lengths and leap years.

## Error Handling

### Validation Errors (400)
- Invalid `days` parameter (< 1 or > 365)
- Non-numeric `days` parameter

### Authentication Errors (401)
- Missing authentication token
- Invalid or expired token

### Server Errors (500)
- Database connection failures
- Unexpected errors during calculation

### Error Response Format
```typescript
{
  success: false;
  error: string;
}
```

## Testing Strategy

### Unit Tests
- Test `calculateNextRenewal` for each billing cycle type
- Test date validation logic
- Test projection filtering (status, next_billing_date)
- Test summary calculation
- Test error handling for invalid inputs

### Property-Based Tests
We will use **fast-check** (a property-based testing library for TypeScript/JavaScript) to verify the correctness properties defined above. Each property will be tested with randomly generated subscriptions, dates, and parameters to ensure the system behaves correctly across all valid inputs.

**Configuration:** Each property test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

### Integration Tests
- Test full API endpoint with authenticated requests
- Test with various subscription configurations
- Test with edge cases (no subscriptions, all cancelled, etc.)
- Test pagination and filtering behavior

### Edge Cases to Test
- User with no subscriptions
- User with only cancelled/paused subscriptions
- Subscriptions with next_billing_date in the past
- Subscriptions with next_billing_date beyond projection period
- Subscription that renews exactly on the end date boundary
- Very short projection periods (1 day)
- Maximum projection period (365 days)
- Yearly subscriptions in short projection periods

## Performance Considerations

### Expected Load
- Typical user: 5-20 active subscriptions
- Projection period: 30-60 days
- Expected renewals per request: 5-40 items

### Optimization Strategies
1. **Database Query Optimization**
   - Single query to fetch all active subscriptions
   - Use indexes on user_id and status columns
   - Filter at database level rather than application level

2. **Calculation Efficiency**
   - O(n*m) complexity where n = subscriptions, m = renewals per subscription
   - For typical case: 10 subscriptions * 2 renewals = 20 calculations
   - No caching needed for this scale

3. **Response Size**
   - Typical response: < 5KB
   - No pagination needed for projection results

## Security Considerations

1. **Authentication Required**
   - All requests must include valid JWT token or auth cookie
   - Use existing authentication middleware

2. **Authorization**
   - Users can only access their own subscription data
   - Database queries filtered by user_id from authenticated token

3. **Input Validation**
   - Validate and sanitize `days` parameter
   - Prevent injection attacks through parameterized queries

4. **Rate Limiting**
   - Consider rate limiting if endpoint is abused
   - Not critical for initial implementation

## Future Enhancements

1. **Balance Integration**
   - Fetch user's actual balance from payment provider
   - Provide more accurate risk assessment

2. **Customizable Risk Thresholds**
   - Allow users to set their own balance warning thresholds
   - Multiple risk levels (warning, critical)

3. **Spending Trends**
   - Compare projected spend to historical averages
   - Identify unusual spending patterns

4. **Calendar Export**
   - Export projected renewals to calendar format (iCal)
   - Integration with Google Calendar, Outlook

5. **Notification Integration**
   - Trigger notifications for high-risk periods
   - Weekly/monthly spending summaries

6. **Currency Support**
   - Handle multiple currencies
   - Currency conversion for total spend

7. **Caching**
   - Cache simulation results for short periods
   - Invalidate on subscription changes
