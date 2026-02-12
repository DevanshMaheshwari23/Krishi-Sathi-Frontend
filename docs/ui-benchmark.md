# UI Benchmark Pack

This benchmark pack captures practical patterns from products with similar constraints: multi-step transactions, data visualization, and assistant-driven support.

## Reference Products and Pattern Notes

1. **DeHaat (Agri commerce and advisory)**
- Pattern used: clear hero + quick actions + category-first exploration.
- Takeaway for Krishi Sathi: keep marketplace entry and forecast entry above the fold on dashboard.

2. **Ninjacart (Supply chain marketplace)**
- Pattern used: logistics and freshness details surfaced near price and quantity.
- Takeaway for Krishi Sathi: listing cards should prioritize crop name, quantity, location, price, and freshness date in one compact block.

3. **KisanSuvidha (Farmer utility app)**
- Pattern used: high-contrast readability and icon-backed utility cards.
- Takeaway for Krishi Sathi: outdoor-friendly contrast, larger tap targets, and icon-coded information blocks.

4. **Google Finance / modern analytics dashboards**
- Pattern used: filter chips + range controls + compact insights near charts.
- Takeaway for Krishi Sathi: forecast should pair chart area with quick insights and recommendation panels.

5. **Perplexity / modern AI assistant interfaces**
- Pattern used: clean chat lane with context chips and fast prompt starters.
- Takeaway for Krishi Sathi: Sathi page should expose quick ask prompts and structured assistant replies.

6. **Notion / Linear command experience**
- Pattern used: command palette grouped by navigation and actions.
- Takeaway for Krishi Sathi: keep command palette keyboard-first with grouped results and clear shortcuts.

7. **Airbnb host listing forms (multi-step completion)**
- Pattern used: progress indicators, chunked fields, and sticky next/previous controls.
- Takeaway for Krishi Sathi: create-listing wizard should keep 3-step structure with stronger validation feedback and review summary.

8. **Stripe dashboard theming and density**
- Pattern used: semantic token system + consistent component density.
- Takeaway for Krishi Sathi: move to a tokenized light/dark system and eliminate ad-hoc one-off class combinations.

## Consolidated Design Decisions

- Information hierarchy: page header > action row > core content > supporting widgets.
- Mobile behavior: filters become collapsible panels; primary actions remain sticky and thumb-reachable.
- Cards and feeds: one visual rhythm (radius, shadow, border, spacing) across dashboard, marketplace, and profile.
- Form completion: strong field labels, inline errors, progressive disclosure, and review before submit.
- Motion: meaningful transitions only (page reveal, panel expand, card hover), with reduced-motion fallback.
