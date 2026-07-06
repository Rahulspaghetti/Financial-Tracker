# Category icon mapping — Tally → Lucide

Tally categories map 1:1 to Lucide icons. Always render with `stroke-width="1.75"`, rounded caps and joins, `currentColor` fill (none).

| Tally category | Lucide icon name |
|---|---|
| Dining & drinks | `utensils` |
| Coffee | `coffee` |
| Groceries | `shopping-basket` |
| Transport | `car` |
| Travel & flights | `plane` |
| Rent & housing | `home` |
| Utilities | `zap` |
| Subscriptions | `repeat` |
| Shopping | `shopping-bag` |
| Entertainment | `clapperboard` |
| Health & fitness | `heart-pulse` |
| Education | `book-open` |
| Income / paycheck | `arrow-down-left` |
| Transfer | `arrow-left-right` |
| Investments | `trending-up` |
| Savings | `piggy-bank` |
| Fees | `receipt` |
| Taxes | `landmark` |
| Gifts | `gift` |
| Other | `circle-dashed` |

Use the `Icon` helper in the UI kits (`ui_kits/*/Icon.jsx`) which loads from the Lucide CDN and applies the 1.75 stroke globally.
