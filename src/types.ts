export interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  overview?: string;
  logo_url?: string;
  cover_image_url?: string;
  website_url: string;
  affiliate_url?: string;
  pricing_type: 'Free' | 'Freemium' | 'Paid' | 'Free Trial' | 'Contact' | string;
  starting_price?: string;
  rating: number;
  review_count: number;
  upvotes_count?: number;
  has_upvoted?: boolean;
  is_verified: boolean;
  is_trending: boolean;
  is_popular: boolean;
  is_featured: boolean;
  status: string;
  who_is_it_for?: string;
  arabic_support?: string;
  developer_org?: string;
  release_year?: number;
  categories?: { id: string; name: string; slug: string; color?: string }[];
  features?: { title: string; description: string; icon?: string }[];
  pros?: string[];
  cons?: string[];
  pricingPlans?: { plan_name: string; price: string; period: string; features: string[]; is_popular: boolean }[];
  faqs?: { question: string; answer: string }[];
  similarTools?: Partial<Tool>[];
  relatedArticles?: any[];
  relatedTutorials?: any[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image_url?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  robots_directive?: string;
  last_updated?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  parent_id?: string | null;
  name: string;
  name_en?: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_featured?: boolean;
  tools_count?: number;
  subcategories?: Category[];
  tools?: Tool[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url?: string;
  author_name: string;
  read_time: string;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image_url?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  robots_directive?: string;
  published_at: string;
  categories?: { id: string; name: string; slug: string }[];
  relatedArticles?: Article[];
  relatedTools?: Tool[];
}

export interface PageSEO {
  id: string;
  type: 'tool' | 'article' | 'category' | 'comparison' | 'tutorial' | 'review';
  title?: string;
  slug: string;
  name: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image_url?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  robots_directive?: string;
  cover_image_url?: string;
  logo_url?: string;
  tagline?: string;
  excerpt?: string;
  updated_at?: string;
}

export interface SEOAuditIssue {
  id: string;
  type: string;
  name: string;
  slug: string;
  path: string;
  meta_title?: string;
  meta_description?: string;
  og_image_url?: string;
  canonical_url?: string;
  issues: {
    code: string;
    message: string;
    severity: 'critical' | 'warning' | 'info';
  }[];
  highestSeverity: 'critical' | 'warning' | 'info';
}

export interface SEOAuditSummary {
  totalPages: number;
  pagesWithIssues: number;
  criticalIssuesCount: number;
  warningIssuesCount: number;
  missingTitleCount: number;
  missingDescCount: number;
  shortDescCount: number;
  shortTitleCount: number;
  longDescCount: number;
  missingOgImageCount: number;
  missingCanonicalCount: number;
  seoHealthScore: number;
}

export interface Review {
  id: string;
  tool_id: string;
  tool_name: string;
  tool_slug: string;
  tool_logo?: string;
  tool_rating?: number;
  slug: string;
  title: string;
  author_name: string;
  rating: number;
  summary: string;
  detailed_review: string;
  pros: string[];
  cons: string[];
  verdict: string;
  created_at: string;
}

export interface Comparison {
  id: string;
  slug: string;
  title: string;
  description: string;
  summary: string;
  verdict: string;
  tools: any[];
  created_at: string;
}

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  difficulty: string;
  read_time: string;
  steps?: { title: string; desc: string }[];
  tool_name?: string;
  tool_slug?: string;
  created_at: string;
}

export interface Resource {
  id: string;
  slug: string;
  title: string;
  type: string;
  description: string;
  download_url?: string;
  icon?: string;
  is_free: boolean;
}
