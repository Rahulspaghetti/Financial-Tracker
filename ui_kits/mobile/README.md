# Tally · Mobile UI Kit

The daily-use Tally app. Click-thru prototype tying together onboarding, the spending dashboard, the AI chat, and a transaction detail view.

## Files

| File | What's in it |
|---|---|
| `index.html` | Click-thru runner. Mounts the iOS frame and routes between screens. |
| `ios-frame.jsx` | Device chrome (status bar, home indicator, keyboard). Provided starter component. |
| `Icon.jsx` | Lucide-derived rounded-stroke icon set. Inline SVG, currentColor, 1.75 stroke. |
| `TallyKit.jsx` | Shared primitives: `Button`, `Card`, `Chip`, `CategoryAvatar`, `TransactionRow`, `BottomTabBar`, `TallyHeader`, `IconButton`, `SectionHeader`. Plus the `tally` color token shortcut and the `CATEGORY_COLORS` map. |
| `LoginScreen.jsx` | Welcome → bank picker → "connecting via Plaid" loader. |
| `HomeScreen.jsx` | Hero amount, period chips, by-category breakdown, AI prompt card, recent transactions list. |
| `ChatScreen.jsx` | AI chat with suggested prompts, simulated thinking state, scripted replies that cite their data. |
| `TransactionDetail.jsx` | Single transaction view with category, AI note, and actions. |

## Routes / interactions

- Welcome screen → tap **Connect a bank**
- Bank picker → tap any bank
- Connecting loader → tap **Skip to demo →**
- Home → tap any transaction (opens detail) · tap the green AI card or the centered tab (opens chat)
- Chat → tap a suggested prompt or type a question; replies are mocked but cite source counts
- Bottom tab bar lets you switch home ↔ chat at any time

## Design context

This kit is a fresh recreation, not lifted from an existing codebase. All visual decisions are driven by the tokens in `../../colors_and_type.css` and the rules in the root `README.md`. If a real Tally codebase becomes available, swap component implementations here against it.
