# Payment Method Implementation Plan

## Database & Model Updates
- [x] Create migration to add `payment_method` column to orders table
- [x] Update Order model to include `payment_method` in fillable array

## Backend Updates
- [x] Modify OrderController store method to accept and validate payment_method
- [x] Ensure payment_method is stored when creating orders

## Frontend Implementation
- [ ] Create `Checkout.tsx` page for order review and payment method selection
- [ ] Create `PaymentMethodSelector.tsx` component (initially with Pesapal only)
- [ ] Add web routes for checkout page
- [ ] Update cart context/navigation to link to checkout

## Testing & Verification
- [x] Run database migration
- [ ] Test complete checkout and payment flow
- [ ] Verify Pesapal integration works end-to-end
