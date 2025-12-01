# Lixnet Marketplace

This is a **Laravel 12 + React** project.  
Laravel provides the backend, while React (via the official Laravel frontend scaffold) is used for the frontend inside `resources/js`.

---

## Requirements

- **PHP**: v8.2 or higher  
- **Composer**: v2  
- **Node.js**: v18 or higher (includes `npm`)  
- **MySQL**: v8 or compatible  
- **Git**

---

## Installation & Setup

1. **Clone the repository**
   ```
   git clone https://github.com/Njau-dev/lixnet-marketplace.git
   cd lixnet-marketplace
   ```
   
2. **Install Dependencies**
   ```
   composer install
   npm install
   ```
   
3. **Configure environment**
    ```
    cp .env.example .env
    php artisan key:generate
    ```

4. **Create a MySQL database**
    ```
    mysql -u root -p
    CREATE DATABASE lixnet_marketplace;
    EXIT;
    ```

5. **Configure .env Credentials**
    ```
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=lixnet_marketplace
    DB_USERNAME=root
    DB_PASSWORD=your_password
    ```

6. **Run migrations and seeders**
    ```
    php artisan migrate --seed
    ```

7. **Start the development server**
    ```
    Composer run dev
    ```


   The project will be available at 👉 http://localhost:8000




   # Central Marketplace SSO Architecture and Subscription Flow

This document provides a technical overview of a centralized Single Sign-On (SSO) system and subscription-based access model for a multi-product software ecosystem. The marketplace serves as the identity provider (IdP), while each connected product (e.g., Payroll, HR, Accounting) functions as a service provider (SP) that relies on marketplace-issued authentication tokens.

---

## 1. System Overview

The marketplace operates as the **central authentication authority**, responsible for verifying user identities and determining product-level subscription entitlements. All products defer authentication to the marketplace and trust its issued tokens for access control decisions.

Each product (Payroll, HR, etc.) implements a lightweight SSO integration that validates tokens received from the marketplace and creates an internal session for the user.

---

## 2. Login and Redirection Flow

### **Step 1: User signs in at the marketplace**

The marketplace provides the unified login interface. Individual products do not implement independent authentication flows.

### **Step 2: User selects a product to access**

Examples: “Open Payroll,” “Open HR,” or “Open Accounting.”

### **Step 3: Marketplace verifies subscription entitlements**

The marketplace checks whether the user:

* has an active subscription,
* has access to the requested product,
* has the appropriate subscription tier (e.g., free, basic, premium).

### **Step 4: Marketplace generates a short-lived access token**

The token contains:

* user ID,
* product identifier,
* subscription status,
* tier name (free/basic/premium),
* feature entitlement list,
* a short expiration period (30–60 seconds).

### **Step 5: Marketplace redirects the user to the product**

Example redirect structure:

```
https://product-domain.com/sso-auth?token=JWT_TOKEN_VALUE
```

### **Step 6: Product validates the token and establishes a session**

The product validates:

* the token signature,
* the expiration time,
* the product identifier embedded in the token.

If valid, the product creates an internal session and grants access based on the tier and feature entitlements. If invalid, the request is rejected.

---

## 3. Reason for Short-Lived Tokens

The marketplace issues tokens that expire within **30–60 seconds**. These short-lived tokens provide a secure mechanism for one-time login handoff, preventing:

* token reuse,
* replay attacks,
* unauthorized link sharing,
* long-term token exposure.

Once the product validates the token, it manages its own independent session.

---

## 4. Subscription and Tier Handling

### Marketplace Responsibilities

The marketplace determines:

* which products the user has subscribed to,
* subscription validity,
* assigned tier,
* the list of enabled features.

This information is embedded in the token passed to the product.

### Product Responsibilities

Each product enforces the entitlements it receives, including:

* feature visibility and UI access,
* internal usage limits (e.g., employee count limits),
* API-level authorization.

The marketplace communicates entitlement data; the product performs enforcement.

---

## 5. Example Token Payload

```json
{
    "user_id": 2,
    "email": "muthonisophie12@gmail.com",
    "name": "msoo",
    "product_id": 1,
    "product": "Evolve Payroll & HR System",
    "subscription_status": "active",
    "tier": "premium",
    "features": [
        "Unlimited employee capacity",
        "Full KRA tax compliance and PAYE submissions",
        "Automated NHIF & NSSF integrations",
        "Advanced leave management with accruals",
        "Multi-department payroll processing",
        "Real-time salary analytics dashboard",
        "Custom benefit configurations",
        "Audit trail and compliance logging",
        "Priority technical support"
    ],
    "iat": 1764605703,
    "exp": 1764605763
}
```

---

## 6. Feature-Level Authorization

The marketplace provides authorization metadata (tier and feature list), and each product applies it internally. Examples within a product such as Payroll:

* Premium tier enables advanced reports.
* Basic tier restricts certain automations.
* Free tier allows limited core features.

---

## 7. Responsibility Summary

### Marketplace (Identity Provider)

* Authenticates users.
* Determines subscription status and entitlements.
* Generates signed short-lived tokens.
* Redirects users to the appropriate product.

### Products (Service Providers)

* Validate marketplace-issued tokens.
* Establish internal authenticated sessions.
* Enforce feature and tier rules.
* Manage product-specific authorization.

---

## 8. Product Integration Requirements

Each product integrates with the SSO system by implementing the following steps:

1. Accepting incoming redirect requests.
2. Reading and decoding the JWT token.
3. Validating the marketplace’s public signature key.
4. Creating an internal user session.
5. Enforcing entitlement and feature restrictions.

This requires only minimal modification to each product codebase.

---

## 9. System Advantages

* Centralized authentication and subscription logic.
* Unified login experience across all products.
* Scalable architecture capable of supporting any number of products.
* Strong security due to short-lived tokens and signature validation.
* Clean separation of authentication (marketplace) and authorization (products).

---

## 10. Summary

The marketplace functions as the centralized SSO authority and subscription manager, while each product consumes marketplace-issued tokens to authenticate users and enforce access levels. This architecture provides a robust, scalable, and secure foundation for a multi-product SaaS ecosy

