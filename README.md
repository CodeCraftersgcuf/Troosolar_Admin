# Troosolar Admin Dashboard

A comprehensive React TypeScript dashboard for managing solar energy solutions, built with Vite and Tailwind CSS.

## 🎨 Design Reference

[Figma Design File](https://www.figma.com/design/KxcxSWYQkX3bu84YEc6xMp/Troosolar-Admin?node-id=0-1&t=d1SeIymDvuVpCZIk-1)

## 🚀 Quick Start

### Frontend Setup

```bash
npm install
npm run dev
```

## 📋 Backend Developer Guide

This section provides comprehensive information for backend developers to create APIs that integrate seamlessly with this frontend dashboard.

### 🏗️ Project Structure Overview

```
src/
├── components/          # Reusable UI components
├── constants/          # Static data and configuration
├── layout/             # Layout components (Sidebar, Header)
├── pages/              # Main application pages
│   ├── analytics/      # Analytics dashboard
│   ├── auth/           # Authentication pages
│   ├── balances/       # Financial balances
│   ├── credit_score/   # Credit scoring system
│   ├── dashboard/      # Main dashboard
│   ├── loans_disbursement/ # Loan disbursement management
│   ├── loans_mgt/      # Loan management
│   ├── referral_mgt/   # Referral system
│   ├── settings/       # Admin settings and configuration
│   ├── shop_mgt/       # Shop/inventory management
│   ├── transactions/   # Transaction management
│   └── user_mgt/       # User management
└── types/              # TypeScript type definitions
```

## 🔌 API Integration Requirements

### 1. Authentication APIs

**Base URL**: `/api/auth`

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response:
{
  "success": boolean,
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "admin" | "user",
    "firstName": "string",
    "lastName": "string"
  }
}
```

**Frontend File**: `src/pages/auth/Login.tsx`

### 2. Dashboard APIs

**Base URL**: `/api/dashboard`

#### Dashboard Statistics

```http
GET /api/dashboard/stats
Authorization: Bearer {token}

Response:
{
  "totalUsers": number,
  "totalOrders": number,
  "totalLoans": number,
  "revenue": number,
  "monthlyGrowth": number
}
```

**Frontend Files**:

- `src/pages/dashboard/Dashboard.tsx`
- `src/pages/dashboard/DashboardStats.tsx`

#### Latest Users

```http
GET /api/dashboard/latest-users?limit=5
Authorization: Bearer {token}

Response:
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "joinDate": "string",
      "status": "active" | "inactive"
    }
  ]
}
```

**Frontend File**: `src/pages/dashboard/DashboardLatestUsers.tsx`

### 3. User Management APIs

**Base URL**: `/api/users`

#### Get All Users

```http
GET /api/users?page=1&limit=20&search=""
Authorization: Bearer {token}

Response:
{
  "users": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "bvn": "string",
      "dateJoined": "string",
      "status": "active" | "inactive",
      "kycStatus": "verified" | "pending" | "rejected"
    }
  ],
  "total": number,
  "totalPages": number
}
```

#### User KYC Details

```http
GET /api/users/{userId}/kyc
Authorization: Bearer {token}

Response:
{
  "id": "string",
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  },
  "documents": [
    {
      "type": "passport" | "drivers_license" | "national_id",
      "url": "string",
      "status": "verified" | "pending" | "rejected"
    }
  ],
  "verificationStatus": "verified" | "pending" | "rejected"
}
```

**Frontend Files**:

- `src/pages/user_mgt/`
- `src/component/users/KycModal.tsx`

### 4. Loan Management APIs

**Base URL**: `/api/loans`

#### Get All Loans

```http
GET /api/loans?page=1&limit=20&status=""
Authorization: Bearer {token}

Response:
{
  "loans": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "amount": number,
      "purpose": "string",
      "status": "pending" | "approved" | "disbursed" | "rejected",
      "applicationDate": "string",
      "dueDate": "string",
      "interestRate": number
    }
  ],
  "total": number,
  "totalPages": number
}
```

#### Loan Disbursement

```http
POST /api/loans/{loanId}/disburse
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": number,
  "accountDetails": {
    "bankName": "string",
    "accountNumber": "string",
    "accountName": "string"
  }
}
```

#### Repayment History

```http
GET /api/loans/{loanId}/repayments
Authorization: Bearer {token}

Response:
{
  "repayments": [
    {
      "id": "string",
      "amount": number,
      "date": "string",
      "method": "bank_transfer" | "card" | "cash",
      "status": "completed" | "pending" | "failed"
    }
  ]
}
```

**Frontend Files**:

- `src/pages/loans_disbursement/`
- `src/pages/loans_mgt/`
- `src/components/modals/DisburseModal.tsx`
- `src/components/modals/RepaymentHistory.tsx`

### 5. Transaction Management APIs

**Base URL**: `/api/transactions`

#### Get All Transactions

```http
GET /api/transactions?page=1&limit=20&type=""&status=""&dateFrom=""&dateTo=""
Authorization: Bearer {token}

Response:
{
  "transactions": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "type": "credit" | "debit",
      "amount": number,
      "description": "string",
      "status": "completed" | "pending" | "failed",
      "date": "string",
      "reference": "string"
    }
  ],
  "summary": {
    "totalCredits": number,
    "totalDebits": number,
    "netAmount": number
  },
  "total": number,
  "totalPages": number
}
```

**Frontend Files**:

- `src/pages/transactions/`
- `src/component/TransactionTable.tsx`
- `src/component/TransactionSummaryCards.tsx`

### 6. Product Management APIs

**Base URL**: `/api/products`

#### Categories Management

```http
GET /api/products/categories
POST /api/products/categories
PUT /api/products/categories/{id}
DELETE /api/products/categories/{id}

Category Object:
{
  "id": "string",
  "categoryName": "string",
  "image": "string", // URL or base64
  "dateCreated": "string",
  "status": "Active" | "Pending"
}
```

#### Brands Management

```http
GET /api/products/brands
POST /api/products/brands
PUT /api/products/brands/{id}
DELETE /api/products/brands/{id}

Brand Object:
{
  "id": "string",
  "brandName": "string",
  "category": "string",
  "dateCreated": "string",
  "status": "Active" | "Pending"
}
```

**Frontend Files**:

- `src/pages/settings/Product.tsx`
- `src/pages/settings/AddNewCategory.tsx`
- `src/pages/settings/AddNewBrand.tsx`

### 7. Settings & Configuration APIs

**Base URL**: `/api/settings`

#### Admin Management

```http
GET /api/settings/admins
POST /api/settings/admins
PUT /api/settings/admins/{id}
DELETE /api/settings/admins/{id}

Admin Object:
{
  "id": "string",
  "firstName": "string",
  "surname": "string",
  "email": "string",
  "role": "super_admin" | "admin" | "moderator",
  "bvn": "string",
  "dateJoined": "string",
  "activity": [
    {
      "id": "string",
      "description": "string",
      "date": "string"
    }
  ]
}
```

#### Financing Partners

```http
GET /api/settings/financing-partners
POST /api/settings/financing-partners
PUT /api/settings/financing-partners/{id}
DELETE /api/settings/financing-partners/{id}

Partner Object:
{
  "id": "string",
  "name": "string",
  "numberOfLoans": number,
  "amount": "string",
  "dateCreated": "string",
  "status": "Active" | "Inactive"
}
```

#### Notifications

```http
GET /api/settings/notifications
POST /api/settings/notifications
PUT /api/settings/notifications/{id}
DELETE /api/settings/notifications/{id}

Notification Object:
{
  "id": "string",
  "message": "string",
  "dateCreated": "string"
}
```

#### Banners

```http
GET /api/settings/banners
POST /api/settings/banners
PUT /api/settings/banners/{id}
DELETE /api/settings/banners/{id}

Banner Object:
{
  "id": "string",
  "image": "string", // URL or file upload
  "dateCreated": "string"
}
```

**Frontend Files**:

- `src/pages/settings/Admin.tsx`
- `src/pages/settings/FinancingPartner.tsx`
- `src/pages/settings/Notifications.tsx`
- `src/pages/settings/Banner.tsx`

### 8. Analytics APIs

**Base URL**: `/api/analytics`

#### Overview Statistics

```http
GET /api/analytics/overview
Authorization: Bearer {token}

Response:
{
  "userGrowth": {
    "current": number,
    "previous": number,
    "percentage": number
  },
  "transactionVolume": {
    "current": number,
    "previous": number,
    "percentage": number
  },
  "loanPerformance": {
    "disbursed": number,
    "repaid": number,
    "defaulted": number
  },
  "monthlyRevenue": [
    {
      "month": "string",
      "amount": number
    }
  ]
}
```

**Frontend File**: `src/pages/analytics/Analytics.tsx`

### 9. Financial Balance APIs

**Base URL**: `/api/balances`

#### Account Balances

```http
GET /api/balances
Authorization: Bearer {token}

Response:
{
  "mainAccount": {
    "balance": number,
    "currency": "NGN"
  },
  "loanFund": {
    "balance": number,
    "currency": "NGN"
  },
  "escrowAccount": {
    "balance": number,
    "currency": "NGN"
  },
  "transactions": [
    {
      "id": "string",
      "type": "credit" | "debit",
      "amount": number,
      "description": "string",
      "date": "string"
    }
  ]
}
```

**Frontend File**: `src/pages/balances/Balances.tsx`

## 🔧 Tools & Calculators APIs

**Base URL**: `/api/tools`

#### Solar Panel Calculator

```http
POST /api/tools/solar-calculator
Content-Type: application/json

{
  "monthlyBill": number,
  "roofArea": number,
  "location": "string"
}

Response:
{
  "systemSize": number,
  "estimatedCost": number,
  "monthlySavings": number,
  "paybackPeriod": number,
  "co2Reduction": number
}
```

#### Inverter Load Calculator

```http
POST /api/tools/inverter-calculator
Content-Type: application/json

{
  "appliances": [
    {
      "name": "string",
      "wattage": number,
      "hours": number,
      "quantity": number
    }
  ]
}

Response:
{
  "totalLoad": number,
  "recommendedInverter": string,
  "batteryRequirement": number,
  "estimatedRuntime": number
}
```

## 📁 File Upload Requirements

### Image Upload Endpoints

- Profile pictures: `POST /api/upload/profile`
- Product images: `POST /api/upload/products`
- Banner images: `POST /api/upload/banners`
- Document uploads: `POST /api/upload/documents`

### File Format Support

- Images: JPG, PNG, WEBP (max 5MB)
- Documents: PDF (max 10MB)

## 🔐 Authentication & Authorization

### JWT Token Structure

```json
{
  "userId": "string",
  "email": "string",
  "role": "super_admin" | "admin" | "moderator",
  "permissions": ["users.read", "loans.write", etc.],
  "exp": timestamp
}
```

### Permission Levels

- **Super Admin**: Full access to all features
- **Admin**: Limited admin features, no user management
- **Moderator**: Read-only access with basic operations

## 🚨 Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object" // optional
  }
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## 📊 Data Pagination

All list endpoints should support pagination:

```
?page=1&limit=20&sort=createdAt&order=desc
```

## 🔄 Real-time Updates

Consider implementing WebSocket connections for:

- Live transaction updates
- Loan status changes
- New user registrations
- System notifications

## 🧪 Testing Recommendations

### Required Test Data

- Minimum 100 test users
- 50+ transactions
- 20+ loan applications
- Various KYC document examples

### API Testing Tools

- Postman collection recommended
- Include authentication flows
- Test all CRUD operations
- Validate error responses

## 📝 Additional Notes

1. **Date Format**: Use ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`)
2. **Currency**: All amounts in kobo (multiply by 100 for naira)
3. **File Storage**: Recommend cloud storage (AWS S3, Cloudinary)
4. **Rate Limiting**: Implement appropriate rate limits
5. **Logging**: Log all API requests and responses
6. **Backup**: Regular database backups recommended

## 🔗 Frontend Integration Points

Each page component expects specific data structures. Refer to the TypeScript interfaces in each file for exact requirements. The frontend uses React Query for data fetching and state management.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
