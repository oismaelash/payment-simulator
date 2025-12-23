export interface WebhookTemplate {
  id: string;
  name: string;
  gateway: string;
  event: string;
  payload: any; // Parsed JSON object
  updatedAt: string;
}

const STORAGE_KEY = "webhookTemplates";

/**
 * Get all templates from localStorage
 */
export function getAllTemplates(): WebhookTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get templates for a specific gateway and event
 */
export function getTemplatesForEvent(
  gateway: string,
  event: string
): WebhookTemplate[] {
  return getAllTemplates().filter(
    (t) => t.gateway === gateway && t.event === event
  );
}

/**
 * Save a template
 */
export function saveTemplate(template: Omit<WebhookTemplate, "id" | "updatedAt">): WebhookTemplate {
  const templates = getAllTemplates();
  const newTemplate: WebhookTemplate = {
    ...template,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    updatedAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return newTemplate;
}

/**
 * Delete a template by ID
 */
export function deleteTemplate(id: string): boolean {
  const templates = getAllTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): WebhookTemplate | null {
  return getAllTemplates().find((t) => t.id === id) || null;
}

