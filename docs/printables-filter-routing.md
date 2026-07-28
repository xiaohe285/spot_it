# Printable filter URL and title architecture

The printable catalog uses URL-backed filter state inspired by large browse
marketplaces. A filter click updates a structured state object; it never appends
the clicked slug directly to the current URL.

## Routes

- `/printables` is the unfiltered catalog.
- `/printables/browse/[[...segments]]` handles every valid filter combination.
- `/printables/[slug]` remains the individual PDF product route.

The catch-all route parses every known option slug, resolves single-select
conflicts with the last option in the incoming path, and serializes the result
again using each filter group's `url_order`. A non-canonical but valid path gets
a permanent redirect to the canonical path. Unknown slugs return 404.

Examples:

```text
/printables/browse/free/animals/kids
  -> 308 /printables/browse/kids/animals/free

/printables/browse/free/kids/under-5
  -> 308 /printables/browse/kids/under-5
```

## Title composition

URL order and title order are separate. Each option has a `title_slot`:

- `prefix`
- `core`
- `resource_noun`
- `format_suffix`
- `context_suffix`
- `price_suffix`

The title composer renders these slots around the default resource noun,
`Spot the Difference Printables`.

```text
free + kids
  -> Free Kids Spot the Difference Printables

kids + under-5
  -> Kids Spot the Difference Printables Under $5
```

The generated heading is also used for route metadata. Each canonical filtered
page receives its own title, description, canonical URL, Open Graph metadata,
and CollectionPage structured data.

## Taxonomy fields

`printable_filter_groups` controls:

- UI order through `display_order`
- canonical path order through `url_order`
- title fragment order through `title_order`
- selection behavior through `selection_mode`

`printable_filter_options` controls:

- path identity through the globally unique `slug`
- hierarchy through `parent_id` and `include_parent_url`
- option order through `url_order`
- title grammar through `title_text`, `title_slot`, and `title_order`
- search indexing eligibility through `is_indexable`

No `printable_filter_rules` table is used at this stage. Single-select
replacement is handled by `selection_mode`, while parent URL inclusion is
handled by the option hierarchy.
