# Tanda - Complete Project Context

> This file contains all context from the planning session. Read this file fully before starting implementation.

---

## 1. What is Tanda?

A **stablecoin social payment mobile app** targeting Nigerian users. Users can send/receive USDC, split bills, create group collections, pay bills (airtime, data, electricity, cable), deposit/withdraw fiat via bank transfer or card. Built for the **Privy Hackathon on Tempo** (Stripe's L1 blockchain).

---

## 2. Tech Stack (Confirmed)

| Layer | Technology |
|---|---|
| **Frontend** | React Native + Expo (managed workflow, Expo Router) |
| **Auth & Wallets** | Privy Expo SDK (`@privy-io/expo`) — SMS OTP + embedded Ethereum wallets |
| **Blockchain** | Tempo Testnet (Stripe's L1) — Chain ID: 42429, RPC: `https://rpc.moderato.tempo.xyz`, Explorer: `https://explore.tempo.xyz`, gas paid in stablecoins |
| **Database/Backend** | Supabase (Postgres + Edge Functions + Realtime) |
| **On/Off-Ramp** | Due Network API (`https://api.due.network/v1/`) |
| **State Management** | Zustand |
| **Blockchain Client** | viem |

---

## 3. Current Phase: UI ONLY

**We are building the UI first. No integrations.** No Privy, no Supabase, no blockchain, no APIs. Pure UI with mock data, navigation, and animations. Every screen, every micro-interaction, every state.

---

## 4. Design Direction

- **Style:** Cash App inspired — bold, high-contrast, premium feel with playful touches
- **Theme:** Dark mode only
- **Primary Color:** Purple/Violet (#8B5CF6 range) as the premium accent
- **Data:** Full realistic mock data (Nigerian names, NGN/USDC amounts, real-looking transactions)
- **Font:** Inter (via `@expo-google-fonts/inter`)
- **Goal:** A polished, production-grade UI that looks like a $10M startup built it. Premium, clean, modern.

---

## 5. Color Palette

```typescript
export const colors = {
  bg: {
    primary: '#0A0A0F',        // Main app background (near-black)
    secondary: '#13131A',      // Card backgrounds
    tertiary: '#1C1C27',       // Elevated surfaces
    input: '#1C1C27',          // Input backgrounds
  },
  accent: {
    primary: '#8B5CF6',        // Primary purple
    secondary: '#A78BFA',      // Lighter purple
    muted: 'rgba(139, 92, 246, 0.15)', // Purple tint for backgrounds
    gradient: ['#8B5CF6', '#6D28D9'],  // Gradient pair
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    tertiary: '#6B7280',
    inverse: '#0A0A0F',
  },
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    active: 'rgba(139, 92, 246, 0.4)',
  },
  overlay: 'rgba(0, 0, 0, 0.6)',
  shimmer: 'rgba(255, 255, 255, 0.05)',
};
```

---

## 6. Typography

```
Font: Inter
Sizes: 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 40, 48
Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
Key styles: display (48/bold), h1 (32/bold), h2 (24/semibold),
  h3 (20/semibold), body (16/regular), bodySmall (14/regular),
  caption (12/regular), label (13/medium), amount (40/bold)
```

---

## 7. Spacing

```
4px base: 0, 1(4), 2(8), 3(12), 4(16), 5(20), 6(24), 8(32), 10(40), 12(48), 16(64)
Screen horizontal padding: 20px
Card padding: 16px
Card border radius: 16px
Button border radius: 12px
Input border radius: 12px
Button height: 52px
Input height: 52px
Header height: 56px
```

---

## 8. Dependencies to Install

```bash
npx create-expo-app@latest tanda --template blank-typescript
npx expo install expo-router react-native-screens react-native-safe-area-context
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @gorhom/bottom-sheet
npx expo install expo-haptics expo-blur expo-linear-gradient expo-image
npx expo install expo-clipboard expo-local-authentication
npx expo install react-native-svg
npm install zustand date-fns libphonenumber-js
npm install @expo-google-fonts/inter
```

---

## 9. Full Project Structure

```
tanda/
├── app/
│   ├── _layout.tsx                   # Root layout with dark theme
│   ├── index.tsx                     # Splash -> redirect to onboarding or home
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx               # Welcome/splash with app branding
│   │   ├── login.tsx                 # Phone number input
│   │   ├── verify.tsx                # OTP input (animated)
│   │   ├── username.tsx              # Username creation
│   │   └── set-pin.tsx               # PIN creation
│   │
│   ├── (main)/
│   │   ├── _layout.tsx               # Tab navigator (custom tab bar)
│   │   │
│   │   ├── (home)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Home dashboard
│   │   │   └── notifications.tsx     # Notification center
│   │   │
│   │   ├── (send)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Recipient search/picker
│   │   │   ├── amount.tsx            # Amount entry with keypad
│   │   │   ├── confirm.tsx           # Review & confirm
│   │   │   ├── success.tsx           # Success animation
│   │   │   └── claim.tsx             # Claim pending payment
│   │   │
│   │   ├── (wallet)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Wallet overview
│   │   │   ├── deposit.tsx           # Deposit method selection
│   │   │   ├── deposit-bank.tsx      # Bank transfer details
│   │   │   ├── deposit-card.tsx      # Card payment form
│   │   │   ├── withdraw.tsx          # Withdraw to bank
│   │   │   ├── transactions.tsx      # Full transaction history
│   │   │   └── transaction-detail.tsx # Single transaction detail
│   │   │
│   │   ├── (services)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Services grid
│   │   │   ├── airtime.tsx           # Buy airtime
│   │   │   ├── data.tsx              # Buy data bundles
│   │   │   ├── electricity.tsx       # Pay electricity
│   │   │   ├── cable.tsx             # Cable TV subscription
│   │   │   ├── bill-split.tsx        # Create bill split
│   │   │   ├── bill-split-detail.tsx # Split detail + pay/track
│   │   │   ├── pool-create.tsx       # Create collection pool
│   │   │   └── pool-detail.tsx       # Pool detail + contribute
│   │   │
│   │   └── (profile)/
│   │       ├── _layout.tsx
│   │       ├── index.tsx             # Profile overview
│   │       ├── edit-profile.tsx      # Edit profile form
│   │       ├── friends.tsx           # Friends list
│   │       ├── add-friend.tsx        # Search & add friends
│   │       ├── bank-accounts.tsx     # Saved bank accounts
│   │       ├── add-bank.tsx          # Add bank account
│   │       ├── security.tsx          # Security settings
│   │       └── request-money.tsx     # Request money
│   │
│   └── (modals)/
│       ├── verify-pin.tsx            # PIN verification modal
│       └── receipt.tsx               # Transaction receipt modal
│
├── src/
│   ├── components/
│   │   ├── ui/                       # Design system primitives
│   │   │   ├── Button.tsx            # Primary, secondary, ghost, danger variants
│   │   │   ├── Input.tsx             # Text input with label, error, icon support
│   │   │   ├── OTPInput.tsx          # 6-digit OTP with auto-focus advance
│   │   │   ├── PinInput.tsx          # PIN dots with filled/empty states
│   │   │   ├── Card.tsx              # Dark card with subtle border
│   │   │   ├── Avatar.tsx            # User avatar with initials fallback
│   │   │   ├── Badge.tsx             # Status badges (success, pending, failed)
│   │   │   ├── BottomSheet.tsx       # Reusable bottom sheet wrapper
│   │   │   ├── Toast.tsx             # Toast notifications
│   │   │   ├── Chip.tsx              # Filter chips
│   │   │   ├── Divider.tsx           # Subtle divider line
│   │   │   ├── IconButton.tsx        # Circular icon button
│   │   │   ├── SearchBar.tsx         # Search input with icon
│   │   │   ├── ProgressBar.tsx       # Animated progress bar
│   │   │   ├── Skeleton.tsx          # Loading skeleton shimmer
│   │   │   ├── EmptyState.tsx        # Empty state illustration
│   │   │   ├── KeypadButton.tsx      # Number keypad button
│   │   │   ├── CountryPicker.tsx     # Country code selector
│   │   │   ├── NetworkBadge.tsx      # MTN, Airtel, Glo network logos
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── Screen.tsx            # Screen wrapper (SafeArea + padding + scroll)
│   │   │   ├── Header.tsx            # Custom header with back button
│   │   │   └── CustomTabBar.tsx      # Premium custom tab bar
│   │   │
│   │   ├── home/
│   │   │   ├── BalanceCard.tsx       # Large balance display with eye toggle
│   │   │   ├── QuickActions.tsx      # Send, Request, Deposit, Withdraw circles
│   │   │   ├── RecentActivity.tsx    # Transaction list preview
│   │   │   └── PromoCard.tsx         # Optional promo/tip cards
│   │   │
│   │   ├── send/
│   │   │   ├── ContactItem.tsx       # Contact row (avatar + name + username)
│   │   │   ├── AmountDisplay.tsx     # Large animated amount text
│   │   │   ├── Keypad.tsx            # Full numeric keypad
│   │   │   ├── RecipientBanner.tsx   # Selected recipient mini-card
│   │   │   ├── TransactionSummary.tsx # Summary card for confirm screen
│   │   │   └── SuccessAnimation.tsx  # Animated checkmark
│   │   │
│   │   ├── wallet/
│   │   │   ├── TransactionItem.tsx   # Single transaction row
│   │   │   ├── TransactionFilter.tsx # Filter chips row
│   │   │   ├── DepositCard.tsx       # Deposit method option card
│   │   │   ├── BankDetails.tsx       # Virtual bank account display
│   │   │   ├── WithdrawSummary.tsx   # Withdrawal review card
│   │   │   └── BalanceBreakdown.tsx  # Available / pending / locked
│   │   │
│   │   ├── services/
│   │   │   ├── ServiceCard.tsx       # Service option (icon + label)
│   │   │   ├── NetworkSelector.tsx   # Mobile network picker (MTN, etc.)
│   │   │   ├── PlanCard.tsx          # Data/cable plan option
│   │   │   ├── MeterVerification.tsx # Meter number verify display
│   │   │   ├── SplitParticipant.tsx  # Participant row with status
│   │   │   ├── SplitSummary.tsx      # Split overview card
│   │   │   ├── PoolProgress.tsx      # Pool progress with contributor list
│   │   │   └── ContributorItem.tsx   # Pool contributor row
│   │   │
│   │   └── profile/
│   │       ├── ProfileHeader.tsx     # Large avatar + name + username
│   │       ├── ProfileMenuItem.tsx   # Settings menu row
│   │       ├── FriendItem.tsx        # Friend row with actions
│   │       ├── BankAccountCard.tsx   # Saved bank account display
│   │       ├── VerificationBadge.tsx # Verification status indicators
│   │       └── StatCard.tsx          # Profile stat (transactions, friends, etc.)
│   │
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   ├── mock/                         # All mock data
│   │   ├── users.ts
│   │   ├── transactions.ts
│   │   ├── contacts.ts
│   │   ├── notifications.ts
│   │   ├── billSplits.ts
│   │   ├── pools.ts
│   │   ├── services.ts
│   │   └── bankAccounts.ts
│   │
│   ├── stores/
│   │   ├── useAuthStore.ts           # Mock auth state
│   │   └── useUIStore.ts             # UI toggles (balance visibility, etc.)
│   │
│   └── utils/
│       ├── format.ts                 # Currency, date, phone formatting
│       └── haptics.ts                # Haptic feedback wrapper
│
├── assets/images/logo.png
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## 10. Screen-by-Screen Specifications

### PHASE 1: Foundation + Auth Screens

#### Welcome screen (`app/(auth)/welcome.tsx`)
- Full-screen dark background
- Animated Tanda logo/wordmark (center, large)
- Tagline: "Send money. Split bills. No boundaries."
- Purple gradient "Get Started" button at bottom
- Subtle particle/dot animation in background (optional premium touch)

#### Login screen (`app/(auth)/login.tsx`)
- Header: "What's your number?"
- Subtext: "We'll send you a verification code"
- CountryPicker (defaults to +234 Nigeria) + phone number Input
- "Continue" primary button (disabled until valid number)
- Bottom text: "By continuing, you agree to our Terms of Service"
- Keyboard auto-opens, input auto-focuses

#### Verify screen (`app/(auth)/verify.tsx`)
- Header: "Enter verification code"
- Subtext: "We sent a code to +234 801 234 5678"
- OTPInput component (6 digits)
- Auto-verify on 6th digit (mock: any 6 digits = success)
- "Resend code" link with 60-second countdown timer
- Success: haptic + navigate

#### Username screen (`app/(auth)/username.tsx`)
- Header: "Choose your username"
- Subtext: "Friends can find and pay you with this"
- Input with "@" prefix visual
- Real-time "availability" check (mock: instant, always available unless "taken")
- Character counter (3-20)
- "Continue" button
- Username rules shown below: "Letters, numbers, underscores only"

#### Set PIN screen (`app/(auth)/set-pin.tsx`)
- Header: "Create your PIN"
- Subtext: "You'll use this to confirm payments"
- PinInput (6 dots)
- Number keypad below
- On 6 digits: advance to confirm step
- Confirm step: "Confirm your PIN" header, re-enter
- If mismatch: shake animation, "PINs don't match" error, reset

---

### PHASE 2: Home Dashboard + Tab Navigation

#### Tab navigator (`app/(main)/_layout.tsx`)
- CustomTabBar with 5 tabs
- Icons: Home (house), Send (arrow-up-right), Wallet (wallet), Services (grid-2x2), Profile (user)
- Active: purple icon + purple dot below, Inactive: gray icon
- Subtle glass/blur background (expo-blur)
- Floating style with rounded corners, 16px margin from edges

#### Home dashboard (`app/(main)/(home)/index.tsx`)
Layout (top to bottom):
1. **Top bar**: "Good morning, Chioma" greeting (left), notification bell icon with red dot (right)
2. **Balance Card** (large, full-width):
   - "Total Balance" label
   - "$2,450.00" large amount (Inter Bold, 40px)
   - "₦3,675,000.00" secondary in NGN below (smaller, gray)
   - Eye icon to toggle visibility (shows "****" when hidden)
   - Subtle purple gradient overlay at bottom of card
3. **Quick Actions** row (4 circular icons):
   - Send (arrow-up), Request (arrow-down), Add Money (plus), Withdraw (bank)
   - Purple background circles, white icons, labels below each
4. **Recent Activity** section:
   - "Recent Activity" header with "See All" link (right)
   - 5 most recent transactions from mock data
   - Each: avatar, name, +/- amount, time ("2h ago"), type icon
   - Green (+) for received, white (-) for sent
5. **Promo card** (optional):
   - "Invite friends, earn rewards" with purple accent, dismissible

#### Notification center (`app/(main)/(home)/notifications.tsx`)
- Header: "Notifications"
- Grouped by date: "Today", "Yesterday", "Earlier"
- Each notification: icon (colored by type), title, body, timestamp
- Unread: subtle purple left border

---

### PHASE 3: Send Money Flow

#### Recipient search (`app/(main)/(send)/index.tsx`)
- SearchBar at top: "Search name, @username, or phone"
- Recent recipients row (horizontal scroll, avatars + names)
- Contacts list below (mock registered + unregistered)
- Each contact: Avatar, Full Name, @username (or phone if unregistered)
- Unregistered contacts: gray badge "Not on Tanda"
- Tap on unregistered -> bottom sheet: "This person isn't on Tanda yet. We'll send them an SMS to claim the money."

#### Amount entry (`app/(main)/(send)/amount.tsx`)
- RecipientBanner at top: avatar + name + @username (small, fixed)
- AmountDisplay center: large "$0" that animates as digits are entered
  - Below: "≈ ₦0.00" conversion in gray
- Keypad bottom: full numeric pad
- "Add a note" text link (expands to input)
- "Continue" button (disabled until amount > 0)
- "Balance: $2,450.00" shown above continue button

#### Confirm screen (`app/(main)/(send)/confirm.tsx`)
- TransactionSummary card:
  - "Sending to" with recipient avatar + name
  - Amount: "$50.00", Converted: "≈ ₦75,000.00", Fee: "$0.01", Total: "$50.01"
  - Note: "Lunch money" (if added)
- "Confirm & Send" primary button -> PIN modal -> success

#### PIN verification modal (`app/(modals)/verify-pin.tsx`)
- Slide-up modal (presentation: 'modal')
- "Enter your PIN" header
- PinInput dots + Keypad
- Biometric option button (Face ID / fingerprint icon)
- Mock: any 6 digits = success

#### Success screen (`app/(main)/(send)/success.tsx`)
- Large animated checkmark (purple, animated scale+fade-in)
- "Payment Sent!" title
- "$50.00 to @tunde_lagos"
- "Share Receipt" secondary button + "Done" primary button -> back to home
- Haptic success feedback

#### Claim payment screen (`app/(main)/(send)/claim.tsx`)
- "You received $50.00!" large text
- "From @chioma_unilag" with avatar
- "Claim Now" purple button

---

### PHASE 4: Wallet & Transactions

#### Wallet overview (`app/(main)/(wallet)/index.tsx`)
- Balance section: Large "$2,450.00", "Available Balance" label
- BalanceBreakdown chips: Available $2,400 | Pending $50 | In Escrow $0
- Action buttons row: "Add Money" + "Withdraw" (two buttons side by side)
- Transaction history preview (last 10)
- "View All Transactions" link

#### Deposit method selection (`app/(main)/(wallet)/deposit.tsx`)
- Header: "Add Money"
- Two DepositCards: Bank Transfer + Card Payment
- Each card: icon, title, description, arrow-right

#### Bank transfer deposit (`app/(main)/(wallet)/deposit-bank.tsx`)
- Enter amount input (NGN/USDC toggle)
- "Generate Account" button
- After mock 1s delay: BankDetails card with Bank Name ("Wema Bank"), Account Number ("7821234567" with copy icon), Account Name ("Tanda/Chioma Okafor"), Amount
- Instructions text + "I've made the transfer" button

#### Card deposit (`app/(main)/(wallet)/deposit-card.tsx`)
- Amount input + card number + expiry + CVV
- "Pay ₦75,000" button
- Mock: loading -> success

#### Withdraw screen (`app/(main)/(wallet)/withdraw.tsx`)
- Amount input + bank account selector + WithdrawSummary card (amount, receive, fee, bank, ETA)
- "Confirm Withdrawal" -> PIN -> success

#### Transaction history (`app/(main)/(wallet)/transactions.tsx`)
- TransactionFilter chips: All, Sent, Received, Deposits, Withdrawals, Bills
- Grouped by date: Today, Yesterday, This Week, Earlier
- Each TransactionItem: type icon, name/description, amount (+/- colored), time, status badge
- Pull to refresh + infinite scroll (mock)

#### Transaction detail (`app/(main)/(wallet)/transaction-detail.tsx`)
- Large amount with +/- sign, colored (green/white)
- Status badge (Completed/Pending/Failed)
- Details card: Type, To/From, Amount, Converted, Fee, Date, Reference, Blockchain hash, Note
- "Share Receipt" button + "Report Issue" link

---

### PHASE 5: Services & Bill Payments

#### Services grid (`app/(main)/(services)/index.tsx`)
- 2-column grid: Airtime (green), Data (blue), Electricity (yellow), Cable TV (red), Bill Split (purple), Collections (teal)
- Each card: colored icon circle + label

#### Airtime (`app/(main)/(services)/airtime.tsx`)
- NetworkSelector (horizontal): MTN (yellow), Airtel (red), Glo (green), 9mobile (green)
- Phone number input (defaults to user's number)
- Quick amounts grid (2x3): ₦100, ₦200, ₦500, ₦1,000, ₦2,000, ₦5,000
- "Or enter custom amount" input + "Buy Airtime" button

#### Data bundles (`app/(main)/(services)/data.tsx`)
- NetworkSelector + phone input
- Data plans list (1GB ₦500, 2GB ₦1,200, 5GB ₦2,000, 10GB ₦3,500, 25GB ₦6,000)
- Selected plan highlighted with purple border + "Buy Data" button

#### Electricity (`app/(main)/(services)/electricity.tsx`)
- Provider selector (IKEDC, EKEDC, AEDC, etc.)
- Prepaid/Postpaid toggle + meter number input
- "Verify Meter" -> shows customer name with green check
- Amount input + "Pay" button
- Success shows token: "Token: 1234-5678-9012-3456"

#### Cable TV (`app/(main)/(services)/cable.tsx`)
- Provider selector: DSTV, GOtv, Startimes
- Smartcard input + verify -> customer name
- Package list (DSTV: Padi ₦2,950 to Premium ₦37,000)
- "Subscribe" button

#### Bill split create (`app/(main)/(services)/bill-split.tsx`)
- Total amount input + add participants (contact search)
- Split type chips: Equal, Custom, Percentage
- Preview: "₦18,000 split 6 ways = ₦3,000 each"
- "Create Split" button

#### Bill split detail (`app/(main)/(services)/bill-split-detail.tsx`)
- SplitSummary card: Total ₦18,000, your share ₦3,000, organizer, date
- Participants list with paid/pending status and "Remind" buttons
- Progress: "4/6 paid • ₦12,000 / ₦18,000" + ProgressBar

#### Pool create (`app/(main)/(services)/pool-create.tsx`)
- Title, description, target amount, deadline
- "Create Pool" button

#### Pool detail (`app/(main)/(services)/pool-detail.tsx`)
- Large circular progress (purple ring): "₦180,000 / ₦250,000", "72% of goal", "5 days left"
- "Contribute" button -> amount entry bottom sheet
- Contributors list with amounts + share link

---

### PHASE 6: Profile & Social

#### Profile overview (`app/(main)/(profile)/index.tsx`)
- ProfileHeader: avatar (xl), "Chioma Okafor", "@chioma_unilag", bio, verification badges
- Stats row: Transactions (234), Friends (47), Reliability (98%)
- Menu items: Edit Profile, Friends, Bank Accounts, Request Money, Security, Help, Log Out

#### Edit profile (`app/(main)/(profile)/edit-profile.tsx`)
- Avatar with camera overlay + Full Name, Bio (50 char), Email, University, Location inputs
- Username shown locked + "Save Changes" button

#### Friends list (`app/(main)/(profile)/friends.tsx`)
- Tabs: All Friends, Pending (3), Suggestions
- All: alphabetical FriendItem list with "..." menu
- Pending: Accept/Decline buttons
- Suggestions: mutual friends count + "Add" button

#### Add friend (`app/(main)/(profile)/add-friend.tsx`)
- Search by username or phone + "Add Friend" buttons
- "Invite from Contacts" section with "Invite" buttons

#### Bank accounts (`app/(main)/(profile)/bank-accounts.tsx`)
- BankAccountCards: GTBank (Default, ****6789), Access Bank (****4321)
- "Add Bank Account" button

#### Add bank (`app/(main)/(profile)/add-bank.tsx`)
- Bank selector (searchable bottom sheet, 20+ Nigerian banks)
- Account number input (10 digits) + auto-verify -> "Account Name: Chioma Okafor" with green check
- "Save Account" button

#### Request money (`app/(main)/(profile)/request-money.tsx`)
- Search friend -> enter amount -> add note
- "Send Request" + preview: "Requesting $25.00 from @tunde_lagos for 'Lunch'"

#### Security (`app/(main)/(profile)/security.tsx`)
- Change PIN, biometric toggle, active devices list, privacy settings

---

### PHASE 7: Polish

#### Receipt modal (`app/(modals)/receipt.tsx`)
- Tanda logo, "Payment Receipt", dashed separator, all details, QR code, "Powered by Tanda"
- Share + Download buttons

#### Loading states: Skeleton shimmer on every screen
#### Empty states: Illustrations + CTA for transactions, friends, notifications
#### Error states: "Something went wrong. Tap to retry"
#### Micro-interactions:
- Button press: scale(0.97) spring
- Balance hide/show: blur transition
- Amount keypad: haptic on each press
- Success: haptic pattern
- Card press: subtle elevation
- List items: stagger-in animation on first load
- Balance: count-up animation

---

## 11. Design System Components Spec

### Button.tsx — 4 variants
- `primary`: Purple gradient bg, white text, haptic on press
- `secondary`: Dark bg with purple border, purple text
- `ghost`: Transparent, purple text
- `danger`: Red tint bg, red text
- All: 52px height, 12px radius, press animation (scale 0.97), loading spinner state

### Input.tsx
- Dark bg (#1C1C27), subtle border, 52px height
- Label above, error message below (red)
- Left icon support, right action button
- Focus state: purple border glow

### OTPInput.tsx
- 6 separate boxes, 48x56px each
- Auto-advance on digit, backspace goes back
- Filled: purple border, digit visible
- Animated cursor blink in active box

### PinInput.tsx
- 6 dots, Empty: dark circle outline, Filled: solid purple
- Shake animation on wrong PIN

### Card.tsx
- bg.secondary, 1px border, 16px radius
- Optional gradient border, press animation if onPress

### Avatar.tsx
- Sizes: sm(32), md(40), lg(56), xl(80)
- Image or initials fallback (purple bg + white text)
- Optional online indicator dot

### Badge.tsx
- success (green), pending (yellow), failed (red), info (blue)
- Small pill shape with icon + text

### SearchBar.tsx
- Magnifying glass icon, clear button, dark input style

### Skeleton.tsx
- Shimmer animation (left-to-right gradient sweep)
- Configurable width/height/borderRadius

### Chip.tsx
- Selected: purple bg, Unselected: dark bg with border
- Horizontal scrollable row

### ProgressBar.tsx
- Track: dark bg, Fill: purple gradient, animated fill

### CountryPicker.tsx
- Flag emoji + code (+234), bottom sheet with searchable list
- Countries: Nigeria (+234), UAE (+971), UK (+44), US (+1), Kenya (+254), Ghana (+233)

### Keypad.tsx
- 4x3 grid: 1-9, ".", 0, backspace
- 72px touch targets, haptic feedback

### Screen.tsx (layout)
- SafeAreaView, bg.primary, optional ScrollView (keyboard-aware), 20px padding

### Header.tsx (layout)
- Back arrow (left), title (center), optional right action, 56px height

### CustomTabBar.tsx (layout)
- 5 tabs, active: purple icon + dot, inactive: gray
- Glass/blur background (expo-blur), floating style, rounded corners

---

## 12. Mock Data Specifications

### Current User (`src/mock/users.ts`)
```typescript
export const currentUser = {
  id: '1',
  name: 'Chioma Okafor',
  username: 'chioma_unilag',
  phone: '+234 801 234 5678',
  avatar: null, // Use initials "CO"
  balance: 2450.00,
  balanceNGN: 3675000.00,
  email: 'chioma@gmail.com',
  bio: 'Living my best life',
  university: 'University of Lagos',
  city: 'Lagos',
  joinDate: '2025-09-15',
  transactionCount: 234,
  friendCount: 47,
  reliability: 98,
  kycLevel: 2,
  verified: { phone: true, email: true, student: true, kyc: false },
};
```

### Transactions (`src/mock/transactions.ts`)
- 25+ transactions spanning 2 weeks
- All types: p2p, deposits, withdrawals, airtime, data, electricity, splits, pools
- Realistic Nigerian amounts (₦500 - ₦500,000)
- Status mix: mostly completed, some pending, one failed
- Include: sender/receiver names, usernames, amounts in USDC & NGN, timestamps, tx hashes, memos

### Contacts (`src/mock/contacts.ts`)
- 15 registered with Nigerian names + usernames (Yoruba, Igbo, Hausa diversity)
- 5 unregistered (phone only)
- Example registered: Tunde Okonkwo (@tunde_lagos), Sarah Adeyemi (@sarah_unilag), Mike Obi (@mike_aba), Ada Nwosu (@ada_ph), James Eze (@james_lag)
- Example unregistered: Fatima Ibrahim (+234 803...), Kemi Balogun (+234 810...)

### Notifications (`src/mock/notifications.ts`)
- 15 notifications spanning 3 days, all types, some unread

### Bill Splits (`src/mock/billSplits.ts`)
- 3 splits: one active (4/6 paid), one completed, one just created

### Pools (`src/mock/pools.ts`)
- 2 pools: one at 72% (12 contributors, ₦180k/₦250k), one at 5% (just started)

### Services (`src/mock/services.ts`)
- Nigerian mobile networks (MTN, Airtel, Glo, 9mobile) with data plans and prices
- Electricity providers (IKEDC, EKEDC, AEDC, PHEDC, KEDC, BEDC)
- Cable TV (DSTV, GOtv, Startimes) with package tiers and prices

### Bank Accounts (`src/mock/bankAccounts.ts`)
- 2 saved: GTBank (default, ****6789), Access Bank (****4321)
- Nigerian bank list (20+ banks) for picker

---

## 13. Future Backend Integration (Reference Only — NOT for current phase)

When we move past UI-only, here's what we'll integrate:
- **Privy Expo SDK**: `@privy-io/expo` for SMS OTP auth + embedded wallets
- **Supabase**: Postgres DB + Edge Functions + Realtime
- **Tempo blockchain**: Chain ID 42429, USDC transfers, EscrowPayment.sol smart contract
- **Due Network API**: Fiat on/off-ramp (bank transfer, card, withdrawals)
- **Termii/Twilio**: SMS for claim links to unregistered users

Full backend plan is documented in `/Users/mac/.claude/plans/iridescent-jumping-thunder.md`.

---

## 14. Verification Checklist

When all UI is complete, verify:
1. `npx expo start` — app launches on iOS/Android simulator
2. Auth flow works: welcome -> login -> verify -> username -> PIN -> home
3. Home dashboard shows realistic balance and transactions
4. Send flow: search contact -> enter amount -> confirm -> PIN -> success
5. Wallet: deposit (bank/card), withdraw, full transaction history, transaction detail
6. Each service works: airtime, data, electricity, cable, bill split, pool
7. Profile: all menu items navigate, edit profile, friends, bank accounts, security
8. All loading/empty/error states render
9. Smooth animations: tab bar, screen transitions, button presses, keypad haptics
10. Dark mode consistent everywhere — no white flashes, no light backgrounds
