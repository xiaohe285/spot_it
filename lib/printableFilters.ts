import type {
  PrintableFilterGroup,
  PrintableFilterOption,
  PrintableProduct,
  PrintableTitleSlot,
} from "@/data/printables";

export type SelectedPrintableFilters = Record<string, string[]>;

export type ParsedPrintableFilters = {
  selected: SelectedPrintableFilters;
  unknownSegments: string[];
};

const TITLE_SLOTS: PrintableTitleSlot[] = [
  "prefix",
  "core",
  "resource_noun",
  "format_suffix",
  "context_suffix",
  "price_suffix",
];

function groupBySlug(filterGroups: PrintableFilterGroup[]) {
  return new Map(filterGroups.map((group) => [group.slug, group]));
}

function optionsBySlug(filterGroups: PrintableFilterGroup[]) {
  const options = new Map<string, PrintableFilterOption[]>();
  for (const group of filterGroups) {
    for (const option of group.options) {
      const current = options.get(option.slug) ?? [];
      current.push(option);
      options.set(option.slug, current);
    }
  }
  return options;
}

function optionsById(filterGroups: PrintableFilterGroup[]) {
  return new Map(
    filterGroups.flatMap((group) =>
      group.options.map((option) => [option.id, option] as const),
    ),
  );
}

export function emptyPrintableFilters(): SelectedPrintableFilters {
  return {};
}

export function parsePrintableFilterSegments(
  segments: string[],
  filterGroups: PrintableFilterGroup[],
): ParsedPrintableFilters {
  const selected: SelectedPrintableFilters = {};
  const unknownSegments: string[] = [];
  const optionLookup = optionsBySlug(filterGroups);
  const groups = groupBySlug(filterGroups);

  for (const rawSegment of segments) {
    let segment: string;
    try {
      segment = decodeURIComponent(rawSegment).toLowerCase();
    } catch {
      unknownSegments.push(rawSegment);
      continue;
    }
    const matches = optionLookup.get(segment) ?? [];
    if (matches.length !== 1) {
      unknownSegments.push(rawSegment);
      continue;
    }

    const option = matches[0];
    const group = groups.get(option.groupSlug);
    if (!group) {
      unknownSegments.push(rawSegment);
      continue;
    }

    const current = selected[group.slug] ?? [];
    if (group.selectionMode === "single") {
      selected[group.slug] = [option.slug];
    } else if (!current.includes(option.slug)) {
      selected[group.slug] = [...current, option.slug];
    }
  }

  return { selected, unknownSegments };
}

function optionLineage(
  option: PrintableFilterOption,
  optionLookup: Map<string, PrintableFilterOption>,
) {
  const lineage: PrintableFilterOption[] = [option];
  const seen = new Set([option.id]);
  let current = option;

  while (current.includeParentUrl && current.parentId) {
    const parent = optionLookup.get(current.parentId);
    if (!parent || seen.has(parent.id)) {
      break;
    }
    lineage.unshift(parent);
    seen.add(parent.id);
    current = parent;
  }

  return lineage;
}

export function serializePrintableFilters(
  selected: SelectedPrintableFilters,
  filterGroups: PrintableFilterGroup[],
) {
  const optionLookup = optionsById(filterGroups);
  const segments: string[] = [];
  const included = new Set<string>();

  for (const group of [...filterGroups].sort(
    (a, b) => a.urlOrder - b.urlOrder,
  )) {
    const selectedOptions = group.options
      .filter((option) => selected[group.slug]?.includes(option.slug))
      .sort(
        (a, b) =>
          a.urlOrder - b.urlOrder || a.sortOrder - b.sortOrder,
      );

    for (const option of selectedOptions) {
      for (const lineageOption of optionLineage(option, optionLookup)) {
        if (!included.has(lineageOption.id)) {
          segments.push(lineageOption.slug);
          included.add(lineageOption.id);
        }
      }
    }
  }

  return segments;
}

export function buildPrintableBrowsePath(
  selected: SelectedPrintableFilters,
  filterGroups: PrintableFilterGroup[],
) {
  const segments = serializePrintableFilters(selected, filterGroups);
  return segments.length
    ? `/printables/browse/${segments.map(encodeURIComponent).join("/")}`
    : "/printables";
}

export function updatePrintableFilterSelection(
  current: SelectedPrintableFilters,
  filterGroups: PrintableFilterGroup[],
  groupSlug: string,
  optionSlug: string,
) {
  const group = filterGroups.find((item) => item.slug === groupSlug);
  const option = group?.options.find((item) => item.slug === optionSlug);
  if (!group || !option) {
    return current;
  }

  const currentValues = current[groupSlug] ?? [];
  const isSelected = currentValues.includes(optionSlug);
  const nextValues = isSelected
    ? currentValues.filter((value) => value !== optionSlug)
    : group.selectionMode === "single"
      ? [optionSlug]
      : [...currentValues, optionSlug];

  return {
    ...current,
    [groupSlug]: nextValues,
  };
}

function selectedOptionsForTitle(
  selected: SelectedPrintableFilters,
  filterGroups: PrintableFilterGroup[],
) {
  return [...filterGroups]
    .sort((a, b) => a.titleOrder - b.titleOrder)
    .flatMap((group) =>
      group.options
        .filter((option) => selected[group.slug]?.includes(option.slug))
        .sort(
          (a, b) =>
            a.titleOrder - b.titleOrder || a.sortOrder - b.sortOrder,
        ),
    );
}

function uniqueFragments(fragments: string[]) {
  const seen = new Set<string>();
  return fragments.filter((fragment) => {
    const key = fragment.trim().toLocaleLowerCase("en-US");
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function buildPrintableBrowseTitle(
  selected: SelectedPrintableFilters,
  filterGroups: PrintableFilterGroup[],
) {
  const options = selectedOptionsForTitle(selected, filterGroups);
  if (!options.length) {
    return "Spot the Difference Printables";
  }

  const bySlot = new Map<PrintableTitleSlot, string[]>(
    TITLE_SLOTS.map((slot) => [slot, []]),
  );
  for (const option of options) {
    bySlot.get(option.titleSlot)?.push(option.titleText);
  }

  const resourceNoun =
    bySlot.get("resource_noun")?.at(-1) ??
    "Spot the Difference Printables";
  return uniqueFragments([
    ...(bySlot.get("prefix") ?? []),
    ...(bySlot.get("core") ?? []),
    resourceNoun,
    ...(bySlot.get("format_suffix") ?? []),
    ...(bySlot.get("context_suffix") ?? []),
    ...(bySlot.get("price_suffix") ?? []),
  ]).join(" ");
}

export function buildPrintableBrowseDescription(title: string) {
  const sentenceTitle = title.toLocaleLowerCase("en-US");
  return `Browse ${sentenceTitle} with answer keys for classrooms, families, homeschool, travel, and screen-free fun.`;
}

export function printableFiltersAreIndexable(
  selected: SelectedPrintableFilters,
  filterGroups: PrintableFilterGroup[],
) {
  return filterGroups.every((group) =>
    group.options
      .filter((option) => selected[group.slug]?.includes(option.slug))
      .every((option) => option.isIndexable),
  );
}

export function filterPrintableProducts(
  products: PrintableProduct[],
  selected: SelectedPrintableFilters,
) {
  const activeGroups = Object.entries(selected).filter(
    ([, values]) => values.length,
  );
  return products.filter((product) =>
    activeGroups.every(([groupSlug, optionSlugs]) =>
      optionSlugs.some((optionSlug) =>
        product.filterOptions.some(
          (option) =>
            option.groupSlug === groupSlug && option.slug === optionSlug,
        ),
      ),
    ),
  );
}
