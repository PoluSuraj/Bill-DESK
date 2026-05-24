# API Structure

## Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/refresh`

## Shops and branches
- `GET /api/shops`
- `POST /api/shops`
- `GET /api/shops/:shopId`
- `POST /api/shops/:shopId/branches`
- `PATCH /api/branches/:branchId`

## Billing
- `GET /api/billing`
- `POST /api/billing`
- `GET /api/billing/:invoiceId`
- `POST /api/billing/:invoiceId/share`
- `POST /api/billing/:invoiceId/print`
- `POST /api/billing/:invoiceId/refund`

## Inventory
- `GET /api/inventory`
- `POST /api/inventory`
- `PATCH /api/inventory/:productId`
- `DELETE /api/inventory/:productId`
- `POST /api/inventory/import`
- `GET /api/inventory/low-stock`
- `POST /api/inventory/stock-adjustments`

## Customers
- `GET /api/customers`
- `POST /api/customers`
- `GET /api/customers/:customerId`
- `PATCH /api/customers/:customerId`
- `GET /api/customers/:customerId/history`
- `POST /api/customers/:customerId/loyalty/redeem`

## Reports
- `GET /api/reports`
- `GET /api/reports/sales`
- `GET /api/reports/profit-loss`
- `GET /api/reports/gst`
- `POST /api/reports/export`

## Platform extras
- `GET /api/expenses`
- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `GET /api/audit-logs`
- `POST /api/backups/run`
- `POST /api/backups/restore`
- `GET /api/subscriptions/plans`
