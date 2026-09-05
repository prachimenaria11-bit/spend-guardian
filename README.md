# 💰 Spend Guardian

### Spend without worry. Save without trying.

**Spend Guardian** is an AI-powered personal finance assistant that helps users make smarter spending decisions before they run out of money.

It combines financial planning, expense tracking, savings goals, upcoming expense management, affordability checks, and AI-powered recommendations into one simple dashboard.

## 🚀 Live Demo

**Live Application:**
https://spend-guardian.vercel.app/

**GitHub Repository:**
https://github.com/prachimenaria11-bit/spend-guardian

---

## 🎯 Problem

Most expense trackers tell users where their money went.

But the more important question is:

> **"How much can I safely spend right now?"**

Users often need to mentally consider their current balance, upcoming bills, savings goals, emergency reserves, current spending, and remaining days in the month.

Spend Guardian brings these factors together and turns them into practical spending guidance.

---

## 💡 Solution

Spend Guardian calculates a personalized **Safe-to-Spend** amount and provides AI-powered guidance to help users make better financial decisions.

The application helps users:

* Track expenses
* Categorize transactions using AI
* Plan upcoming expenses
* Set and track savings goals
* Calculate a daily spending limit
* Receive personalized AI financial recommendations
* Check whether a purchase is affordable
* Generate a month-end financial summary
* View an audit trail of AI decisions

---

## ✨ Key Features

### 🟣 Safe-to-Spend

Calculates how much the user can safely spend after considering:

* Current balance
* Upcoming expenses
* Savings target
* Emergency buffer

```text
Safe-to-Spend =
Current Balance
− Upcoming Expenses
− Savings Target
− Emergency Buffer
```

The application also calculates a suggested daily spending limit based on the remaining days in the month.

### 💳 AI Expense Categorization

Transactions are categorized using Google Gemini.

Example:

```text
Swiggy → Food
```

If the AI service fails or returns unusable output, rule-based fallback logic keeps the application functional.

### ⚠️ Spending Nudges

Spend Guardian evaluates spending pace and provides a plain-English warning when spending may put the user off track.

### 💰 Financial Planning

Users can create a financial plan with:

* Monthly income
* Current balance
* Monthly savings target
* Emergency buffer

### 📅 Upcoming Expenses

Users can record future expenses such as:

* Rent
* Electricity bills
* Subscriptions
* Loan payments
* Other planned payments

Upcoming expenses are included in Safe-to-Spend calculations.

### 🎯 Savings Progress

Users can set a monthly savings target and record savings contributions.

The dashboard displays the amount saved and progress toward the target.

### 🤖 AI Financial Recommendation

Spend Guardian analyzes the user's financial situation and provides a short, practical recommendation based on:

* Income
* Current balance
* Savings target
* Emergency buffer
* Upcoming expenses
* Safe-to-Spend amount
* Daily spending limit
* Total spending
* Category-wise spending

### 🛍️ Can I Afford This?

Users can enter a planned purchase and its amount.

Spend Guardian evaluates it against the user's Safe-to-Spend amount and provides one of three outcomes:

* 🟢 **Safe**
* 🟡 **Caution**
* 🔴 **Not Recommended**

### 📊 Month-End Summary

Generates an AI-powered summary of the user's monthly financial activity, including spending and savings information.

### 🔍 AI Audit Trail

Every AI decision is recorded in the `ai_logs` table.

The audit trail stores:

* Decision type
* Sanitized input
* AI output
* Whether fallback logic was used
* Timestamp
* Related transaction

This makes the AI behavior transparent and traceable.

---

## 🧠 AI + Financial Logic

Spend Guardian deliberately separates **financial calculations** from **AI reasoning**.

### Deterministic calculations

Used for:

* Safe-to-Spend
* Daily spending limit
* Savings progress
* Affordability thresholds
* Financial totals

### AI reasoning

Used for:

* Transaction categorization
* Spending pace evaluation
* Financial recommendations
* Month-end summaries

This approach keeps important numerical calculations predictable while using AI where contextual reasoning is useful.

---

## 🛡️ Privacy

Spend Guardian uses a privacy-conscious AI architecture.

Transaction information is sanitized before being sent to the AI model, and unnecessary payment/account identifiers are not sent to Gemini.

AI decisions are stored in the audit trail along with the sanitized information that was provided to the model.

---

## 🛠️ Tech Stack

### Frontend

* Next.js 14
* React
* TypeScript
* CSS

### Backend

* Next.js API Routes
* Node.js

### Database

* Supabase
* PostgreSQL

### AI

* Google Gemini
* `gemini-3.6-flash`

### Deployment

* Vercel

### Version Control

* Git
* GitHub

---

## 📁 Project Structure

```text
spend-guardian/
│
├── app/
│   ├── api/
│   │   ├── affordability/
│   │   ├── budget/
│   │   ├── expense/
│   │   ├── money/
│   │   ├── recommendation/
│   │   ├── savings/
│   │   ├── summary/
│   │   └── upcoming-expenses/
│   │
│   ├── components/
│   │   ├── AffordabilityChecker.tsx
│   │   ├── FinancialRecommendation.tsx
│   │   ├── MoneyManagement.tsx
│   │   ├── SavingsProgress.tsx
│   │   ├── SpendRing.tsx
│   │   └── UpcomingExpenses.tsx
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   ├── ai.ts
│   └── supabase.ts
│
├── supabase/
│   └── schema.sql
│
├── .env.example
├── package.json
└── README.md
```

---

## 🔄 How It Works

```text
User
  ↓
Spend Guardian Dashboard
  ↓
Next.js API Routes
  ↓
 ┌───────────────────┬───────────────────┐
 ↓                   ↓
Supabase           Gemini AI
 ↓                   ↓
Financial Data     AI Reasoning
 └───────────────────┴───────────────────┘
              ↓
       Financial Guidance
```

### Typical expense flow

```text
User enters payment
        ↓
Transaction stored
        ↓
Sanitized data sent to Gemini
        ↓
AI categorizes transaction
        ↓
Spending pace evaluated
        ↓
AI decision logged
        ↓
Safe-to-Spend recalculated
        ↓
User receives spending guidance
```

---

## 🧪 Testing

The final application was tested across the major user flows:

* ✅ Financial plan
* ✅ Upcoming expenses
* ✅ Safe-to-Spend calculation
* ✅ Daily spending limit
* ✅ Savings progress
* ✅ Payment/expense flow
* ✅ AI transaction categorization
* ✅ Spending nudge
* ✅ AI financial recommendation
* ✅ Purchase affordability check
* ✅ Month-end summary
* ✅ AI audit trail
* ✅ Production build
* ✅ Live deployment

The production build completed successfully and the deployed application was tested after deployment.

---

## 🐛 What Broke & How We Got Out

During development, the Gemini integration initially returned a `404` model-not-found error because the application was configured to use an unavailable model:

```text
gemini-2.5-flash
```

We traced the problem to the Gemini configuration in `lib/ai.ts` and updated the model to:

```text
gemini-3.6-flash
```

After the fix:

* The application compiled successfully
* Type checking passed
* Static generation passed
* AI functionality worked again
* The production build completed successfully
* The application was deployed to Vercel
* All major production test cases passed

We also encountered a repository configuration issue during deployment and resolved it by connecting Vercel to the correct GitHub repository.

---

## ⚙️ What's Simulated vs. Real

### Simulated

**Payments:**
Payments are currently simulated through a form rather than a live UPI/QR payment.

This was a deliberate hackathon scope decision so development time could focus on the AI reasoning, financial logic, and user experience.

### Demo User

The current version uses a single demo user:

```text
demo_user
```

Authentication is not implemented in this hackathon MVP.

### Row Level Security

RLS is disabled for the demo environment to simplify development.

A production version would use authentication and user-specific RLS policies.

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/prachimenaria11-bit/spend-guardian.git
cd spend-guardian
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file using `.env.example` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Set up Supabase

Run the SQL in:

```text
supabase/schema.sql
```

inside the Supabase SQL Editor.

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔮 Future Scope

Possible future improvements include:

* Real Razorpay test-mode QR/payment integration
* Razorpay webhooks
* User authentication
* Multiple financial accounts
* Automatic transaction synchronization
* Recurring expense detection
* Advanced spending analytics
* Goal-based financial planning
* Dynamic daily spending based on financial goals
* Stronger data privacy controls
* Re-enabled RLS with authenticated users

---

## 🏆 Hackathon

Built for the **Razorpay Buildathon 2026 — Open Track**.

The project focuses on combining AI with personal finance to help users make better spending decisions before overspending happens.

---

## 👩‍💻 Built By

**Prachi Menaria**

Information Technology Student

GitHub:
https://github.com/prachimenaria11-bit
