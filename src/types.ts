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
  view_count?: number;
  clicks_count?: number;
  shares_count?: number;
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

export interface PriceAlert {
  id: string;
  toolSlug: string;
  toolName: string;
  email: string;
  targetPriceType?: string;
  discountPreference?: string;
  createdAt: string;
}

export interface CustomStack {
  id: string;
  userId?: string;
  title: string;
  targetRole: string;
  description?: string;
  toolSlugs: string[];
  totalMonthlyCost: number;
  isPublic: boolean;
  createdAt: string;
}

export interface ArabicQualityReview {
  id: string;
  toolSlug: string;
  userId?: string;
  userName: string;
  overallScore: number; // 1-10
  rtlSupportScore: number; // 1-10
  dialectSupportScore: number; // 1-10
  grammarScore: number; // 1-10
  testedUseCase: string;
  sampleOutput?: string;
  verdict: string;
  createdAt: string;
}

export interface ToolQuestion {
  id: string;
  toolSlug: string;
  userId?: string;
  userName: string;
  question: string;
  answersCount: number;
  answers?: {
    id: string;
    userName: string;
    answer: string;
    isStaff: boolean;
    createdAt: string;
  }[];
  createdAt: string;
}

export interface EcommercePlatform {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  logo_url: string;
  tagline: string;
  description: string;
  rating: number;
  review_count: number;
  pricing_model: string;
  starting_price: string;
  starting_price_numeric: number; // in USD or SAR equivalent for calculator
  transaction_fee: string;
  transaction_fee_rate: number; // percentage (e.g. 0 or 0.005 or 0.02)
  fixed_fee_per_order: number; // e.g. 1 SAR or $0.30
  payment_gateways: string[];
  shipping_partners: string[];
  target_market: 'السعودية والخليج' | 'عالمي ودولي' | 'شمال إفريقيا ومحلي' | 'شامل';
  best_for: string;
  trial_info: string;
  affiliate_url: string;
  affiliate_commission: string;
  coupon_code?: string;
  coupon_discount?: string;
  pros: string[];
  cons: string[];
  ai_features: string[];
  is_popular?: boolean;
  is_featured?: boolean;
  badge?: string;
  plans: {
    name: string;
    price: string;
    billing: string;
    features: string[];
    is_popular?: boolean;
  }[];
}

export interface AffiliateProgram {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  category: 'متاجر تجزئة وإلكترونيات' | 'منصات ومواقع سحابية' | 'شبكات تسويق بالعمولة' | 'أدوات رقمية وذكاء اصطناعي';
  commission_rate: string;
  cookie_duration: string;
  payout_threshold: string;
  payout_methods: string[];
  description: string;
  target_regions: string[];
  pros: string[];
  requirements: string[];
  affiliate_signup_url: string;
  rating: number;
  is_recommended?: boolean;
}

export interface EcommerceAiTool {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  category: 'تصوير المنتجات والاستوديو' | 'كتابة المحتوى والسيو' | 'شات بوت وخدمة العملاء' | 'تسعير ومنافسين' | 'فيديو وإعلانات';
  tagline: string;
  description: string;
  pricing: string;
  rating: number;
  free_plan: boolean;
  affiliate_url: string;
  key_feature: string;
}

export interface CouponDeal {
  id: string;
  title: string;
  brand_name: string;
  brand_logo: string;
  category: string;
  code: string;
  discount_value: string;
  expiry_date?: string;
  affiliate_url: string;
  is_exclusive: boolean;
  terms?: string;
}

