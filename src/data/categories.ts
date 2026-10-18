import { Preferences } from "@capacitor/preferences";
import { Category } from "./types";
import { trigger } from "../lib/Events";

const CATEGORIES_KEY = "countdate_categories";

/**
 * Built-in categories. These always exist and cannot be deleted, giving users a
 * sensible starting taxonomy. Users can add their own on top.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "general", name: "General", color: "primary", icon: "📅", builtIn: true },
  { id: "birthday", name: "Birthday", color: "tertiary", icon: "🎂", builtIn: true },
  { id: "anniversary", name: "Anniversary", color: "danger", icon: "💖", builtIn: true },
  { id: "travel", name: "Travel", color: "secondary", icon: "✈️", builtIn: true },
  { id: "work", name: "Work", color: "warning", icon: "💼", builtIn: true },
  { id: "health", name: "Health", color: "success", icon: "💪", builtIn: true },
  { id: "experience", name: "Experience", color: "secondary", icon: "🏆", builtIn: true },
];

export async function getCategories(): Promise<Category[]> {
  const { value } = await Preferences.get({ key: CATEGORIES_KEY });
  let custom: Category[] = [];
  if (value) {
    try {
      custom = JSON.parse(value);
    } catch {
      custom = [];
    }
  }
  // Built-ins first, then any custom categories the user added.
  const customOnly = custom.filter(
    (c) => !DEFAULT_CATEGORIES.some((d) => d.id === c.id)
  );
  return [...DEFAULT_CATEGORIES, ...customOnly];
}

async function saveCustom(custom: Category[]): Promise<void> {
  await Preferences.set({ key: CATEGORIES_KEY, value: JSON.stringify(custom) });
  trigger("countdate_categories:change");
}

export async function addCategory(cat: Omit<Category, "id">): Promise<Category> {
  const all = await getCategories();
  const custom = all.filter((c) => !c.builtIn);
  const newCat: Category = {
    ...cat,
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };
  await saveCustom([...custom, newCat]);
  return newCat;
}

export async function deleteCategory(id: string): Promise<void> {
  const all = await getCategories();
  const custom = all.filter((c) => !c.builtIn && c.id !== id);
  await saveCustom(custom);
}

export function findCategory(cats: Category[], id?: string): Category | undefined {
  if (!id) return undefined;
  return cats.find((c) => c.id === id);
}
