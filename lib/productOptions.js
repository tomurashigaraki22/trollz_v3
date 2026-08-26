export const OPTION_LABELS = {
  gender: "Gender",
  storage: "Storage",
  ram: "RAM",
  condition: "Condition",
  skinType: "Skin / Hair Type",
};

export function optionLabel(key) {
  return OPTION_LABELS[key] ?? String(key).replace(/_/g, " ");
}

export function parseOptionMap(value) {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function normalizeOptionMap(value) {
  const parsed = parseOptionMap(value);
  return Object.fromEntries(
    Object.entries(parsed)
      .map(([key, option]) => [String(key), Array.isArray(option) ? option.filter(Boolean).join(", ") : String(option ?? "").trim()])
      .filter(([, option]) => option)
      .sort(([left], [right]) => left.localeCompare(right))
  );
}

export function serializeOptionMap(value) {
  const normalized = normalizeOptionMap(value);
  return Object.keys(normalized).length > 0 ? JSON.stringify(normalized) : null;
}

export function formatOptionMap(value) {
  return Object.entries(normalizeOptionMap(value))
    .map(([key, option]) => `${optionLabel(key)}: ${option}`)
    .join(" · ");
}

export function formatLineVariants({ size, color, options }, separator = " · ") {
  return [
    size && size !== "Standard" ? `Size: ${size}` : "",
    color && color !== "Default" ? `Color: ${color}` : "",
    formatOptionMap(options),
  ]
    .filter(Boolean)
    .join(separator);
}
