/**
 * Shared types for the documentation system
 * Centralized type definitions to avoid duplication across the codebase
 */

/**
 * Table of contents item for document navigation
 */
export interface TocItem {
  /** Unique identifier for the heading (used for anchor links) */
  id: string;
  /** Display text of the heading */
  text: string;
  /** Heading level (2 = h2, 3 = h3, etc.) */
  level: number;
}

/**
 * Document metadata extracted from frontmatter
 */
export interface DocMeta {
  /** Document title */
  title: string;
  /** Optional document description */
  description?: string;
  /** Optional sidebar label (alternative display name) */
  sidebarLabel?: string;
  /** Optional sidebar position for ordering */
  sidebarPosition?: number;
}

/**
 * Search result returned by the search API
 */
export interface SearchResult {
  /** Document title */
  title: string;
  /** Document description */
  description: string;
  /** URL path to the document */
  href: string;
  /** Content snippet for search matching */
  content: string;
  /** Category label for grouping results */
  category: string;
}

/**
 * Transformed sidebar item for API responses
 */
export interface TransformedSidebarItem {
  /** Resolved title (from translation key) */
  title: string;
  /** URL path or null for category headers */
  href: string | null;
  /** Whether the document is verified/tested */
  verified: boolean;
  /** Nested items (recursive) */
  items?: TransformedSidebarItem[];
}
