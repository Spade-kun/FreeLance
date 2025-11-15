# PayPal Payment Integration

## Overview
The Payment page now uses **PayPal Sandbox** for testing tuition payments. Students can pay using their PayPal accounts or credit/debit cards through PayPal.

## Current Setup

### Sandbox Mode
- Using PayPal Sandbox Client ID for testing
- All transactions are test transactions (no real money)
- Test credentials needed to complete payments

### Features
✅ PayPal Buttons Integration  
✅ Multiple payment types (Tuition, Enrollment, Lab fees, etc.)  
✅ Real-time payment processing  
✅ Payment history tracking  
✅ Transaction ID recording  

## How to Test

### 1. Access Payment Page
1. Login as a student
2. Navigate to "💳 Payment" in sidebar
3. Enter amount and description
4. Click "🅿️ Proceed to PayPal"

### 2. PayPal Sandbox Login
Use PayPal test accounts:
- **Test Buyer Account**: Create one at [PayPal Sandbox](https://developer.paypal.com/developer/accounts/)
- Default sandbox buyer: `sb-buyer@personal.example.com`

### 3. Complete Payment
- Login with test account
- Confirm payment
- You'll be redirected back with success message

## For Production

### Step 1: Get Live Credentials
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a **Live App** (not Sandbox)
3. Copy your **Live Client ID**

### Step 2: Update Code
In `StudentDashboard.jsx`, replace the client-id:

```jsx
<PayPalScriptProvider options={{ 
  "client-id": "YOUR_LIVE_CLIENT_ID_HERE",
  currency: "USD"
}}>
```

### Step 3: Backend Integration (Optional)
For better security and order tracking:

1. Create a payment service in backend
2. Store payment records in database
3. Verify payments server-side
4. Send payment confirmations via email

## Payment Flow

```
Student fills form
    ↓
Clicks "Proceed to PayPal"
    ↓
PayPal buttons appear
    ↓
Student logs into PayPal
    ↓
Confirms payment
    ↓
Payment captured
    ↓
Success message + Transaction ID
    ↓
Added to payment history
```

## Payment History

Each successful payment stores:
- Transaction ID
- Date
- Amount (USD)
- Description
- Status (Completed)
- Payer name

## Security Notes

✅ PayPal handles all sensitive payment data  
✅ No credit card info stored in app  
✅ PCI compliance handled by PayPal  
✅ Secure OAuth tokens  

## Troubleshooting

**PayPal buttons not showing?**
- Check internet connection
- Verify client-id is correct
- Check browser console for errors

**Payment not completing?**
- Use valid sandbox test account
- Ensure test account has test funds
- Check PayPal sandbox dashboard for status

**Transaction not in history?**
- Check browser console for errors
- Verify onApprove callback is firing
- Check payment details object structure

## Future Enhancements

🔜 Backend payment service  
🔜 Email receipts  
🔜 PDF invoices  
🔜 Multiple currency support  
🔜 Recurring payments for installments  
🔜 Refund handling  

## Resources

- [PayPal React SDK Docs](https://paypal.github.io/react-paypal-js/)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [Sandbox Testing Guide](https://developer.paypal.com/tools/sandbox/)
- [PayPal Orders API](https://developer.paypal.com/docs/api/orders/v2/)
