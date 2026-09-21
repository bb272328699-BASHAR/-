import { GoogleGenAI } from '@google/genai';
import { query } from '../db.ts';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

export interface AdvisorRecommendation {
  toolSlug: string;
  toolName: string;
  category: string;
  pricingType: string;
  reason: string;
  keyFeature: string;
  starterPrompt?: string;
}

export interface AdvisorResponse {
  answer: string;
  recommendations: AdvisorRecommendation[];
  actionPlan?: string[];
  suggestedPrompts?: string[];
}

export interface SearchGroundingSource {
  title?: string;
  url?: string;
  snippet?: string;
}

export interface SearchGroundingResponse {
  answer: string;
  sources: SearchGroundingSource[];
  webSearchQueries?: string[];
}

export interface MapsGroundingLocation {
  name?: string;
  address?: string;
  rating?: number;
  uri?: string;
}

export interface MapsGroundingResponse {
  answer: string;
  locations?: MapsGroundingLocation[];
}

export interface SemanticMatchItem {
  toolSlug: string;
  toolName: string;
  confidence: number;
  semanticReason: string;
  matchedTags?: string[];
  keyUseCases?: string[];
}

export interface SemanticSearchResult {
  query: string;
  interpretedIntent: string;
  correctedKeywords: string[];
  matchedTools: any[];
  matchedCategories: any[];
  matchedArticles: any[];
  suggestedQueries: string[];
  isAiPowered: boolean;
}

export const AiService = {
  /**
   * Semantic Search Engine powered by Gemini 3.8 Flash.
   * Understands ambiguous natural language, Arabic synonyms, typos, and use-case descriptions.
   */
  async semanticSearch(userQuery: string): Promise<SemanticSearchResult> {
    const cleanQuery = (userQuery || '').trim();
    if (!cleanQuery) {
      return {
        query: '',
        interpretedIntent: '',
        correctedKeywords: [],
        matchedTools: [],
        matchedCategories: [],
        matchedArticles: [],
        suggestedQueries: [],
        isAiPowered: false,
      };
    }

    // 1. Fetch available tools, categories, and articles catalog from database
    let allTools: any[] = [];
    let allCategories: any[] = [];
    let allArticles: any[] = [];

    try {
      const [toolsDb, catsDb, artsDb] = await Promise.all([
        query(`
          SELECT id, name, slug, tagline, description, pricing_type, arabic_support, 
                 rating, review_count, logo_url, is_verified, is_featured, is_trending,
                 website_url, affiliate_url
          FROM tools 
          WHERE status = 'published'
          ORDER BY rating DESC
          LIMIT 80
        `),
        query(`SELECT id, name, slug, description FROM categories ORDER BY tool_count DESC`),
        query(`SELECT id, title, slug, excerpt, read_time FROM articles ORDER BY published_at DESC LIMIT 20`)
      ]);
      allTools = toolsDb.rows;
      allCategories = catsDb.rows;
      allArticles = artsDb.rows;
    } catch (e) {
      console.warn('DB query error during semantic search catalog fetch:', e);
    }

    const toolsContext = allTools
      .map(t => `ID: ${t.slug} | Name: ${t.name} | Pricing: ${t.pricing_type} | Arabic: ${t.arabic_support || 'نعم'} | Tagline: ${t.tagline} | Desc: ${t.description?.slice(0, 100) || ''}`)
      .join('\n');

    const categoriesContext = allCategories
      .map(c => `Category: ${c.name} (slug: ${c.slug})`)
      .join(' | ');

    const ai = getAiClient();
    if (ai) {
      try {
        const systemInstruction = `
أنت "محرك البحث الدلالي الذكي باللغة العربية لدليل الذكاء الاصطناعي (Daleel AI Semantic Search Engine)".
مهمتك: تحليل استعلام المستخدم مهما كان غير دقيق، أو يحوي أخطاء إملائية، أو كُتب بلهجة عامية، أو كان وصفاً لاحتياج (مثال: "أبي أداة تسوي لي فيديو بدون ما أظهر"، "برنامج يرتب لي الأكواد"، "محرر صور مجاني ذكي").

قائمة الأدوات المتاحة في قاعدة البيانات:
${toolsContext}

قائمة التصنيفات:
${categoriesContext}

المطلوب:
1. فهم نية المستخدم الدلالية (Interpreted Intent) وصياغتها في جملة عربية واضحة ومباشرة.
2. تصحيح الكلمات وتوليد كلمات مفتاحية مرادفة دقيقة (Corrected Keywords).
3. اختيار وترتيب الأدوات الأكثر مطابقة لنية المستخدم من القائمة أعلاه فقط، مع إعطاء:
   - toolSlug: نفس الـ slug المذكور في القائمة أعلاه تماماً.
   - confidence: نسبة الثقة والمطابقة من 70 إلى 99.
   - semanticReason: شرح موجز جداً باللغة العربية (جملة واحدة) يوضح للمستخدم لماذا تم ترشيح هذه الأداة بناءً على ما يقصده.
   - keyUseCases: من 1 إلى 2 حالة استخدام رئيسية.
4. ترشيح التصنيفات ذات الصلة (categorySlugs).
5. اقتراح من 2 إلى 3 عبارات بحث بديلة وذكية قد تفيد المستخدم.

أرجع النتيجة بتنسيق JSON حصراً:
{
  "interpretedIntent": "فهم الذكاء الاصطناعي لما يقصده المستخدم باللغة العربية الفصحى",
  "correctedKeywords": ["كلمة 1", "كلمة 2"],
  "matchedTools": [
    {
      "toolSlug": "slug-here",
      "toolName": "اسم الأداة",
      "confidence": 95,
      "semanticReason": "سبب المطابقة الدلالية باختصار",
      "keyUseCases": ["حالة استخدام 1"]
    }
  ],
  "matchedCategorySlugs": ["slug-here"],
  "suggestedQueries": ["استعلام مقترح 1", "استعلام مقترح 2"]
}
`;

        const result = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `استعلام البحث الصوتي أو النصي للمستخدم: "${cleanQuery}"`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const text = result.text;
        if (text) {
          const parsed = JSON.parse(text);
          const aiToolsList: SemanticMatchItem[] = parsed.matchedTools || [];
          
          // Hydrate with full DB tool records
          const hydratedTools: any[] = [];
          const seenSlugs = new Set<string>();

          for (const item of aiToolsList) {
            const foundTool = allTools.find(t => t.slug === item.toolSlug || t.name.toLowerCase() === (item.toolName || '').toLowerCase());
            if (foundTool && !seenSlugs.has(foundTool.slug)) {
              seenSlugs.add(foundTool.slug);
              hydratedTools.push({
                ...foundTool,
                semanticMatch: {
                  confidence: item.confidence || 90,
                  reason: item.semanticReason || 'مطابقة دلالية عالية لطلبك',
                  useCases: item.keyUseCases || [],
                  isAiMatched: true,
                }
              });
            }
          }

          // If AI matched tools is small, append keyword fallbacks that aren't already included
          if (hydratedTools.length < 5) {
            const lower = cleanQuery.toLowerCase();
            const keywordMatches = allTools.filter(t => 
              !seenSlugs.has(t.slug) && (
                t.name.toLowerCase().includes(lower) || 
                t.tagline.toLowerCase().includes(lower) || 
                (t.description && t.description.toLowerCase().includes(lower))
              )
            );
            for (const kwTool of keywordMatches.slice(0, 5 - hydratedTools.length)) {
              seenSlugs.add(kwTool.slug);
              hydratedTools.push({
                ...kwTool,
                semanticMatch: {
                  confidence: 78,
                  reason: 'مطابقة نصية للكلمات المفتاحية',
                  useCases: [],
                  isAiMatched: false,
                }
              });
            }
          }

          const matchedCategories = (parsed.matchedCategorySlugs || [])
            .map((slug: string) => allCategories.find(c => c.slug === slug))
            .filter(Boolean);

          const matchedArticles = allArticles.filter(a => {
            const lower = cleanQuery.toLowerCase();
            return a.title.toLowerCase().includes(lower) || (a.excerpt && a.excerpt.toLowerCase().includes(lower));
          }).slice(0, 3);

          return {
            query: cleanQuery,
            interpretedIntent: parsed.interpretedIntent || `البحث الدلالي حول: "${cleanQuery}"`,
            correctedKeywords: parsed.correctedKeywords || [cleanQuery],
            matchedTools: hydratedTools,
            matchedCategories: matchedCategories.length > 0 ? matchedCategories : allCategories.slice(0, 3),
            matchedArticles,
            suggestedQueries: parsed.suggestedQueries || [],
            isAiPowered: true,
          };
        }
      } catch (err) {
        console.error('Gemini semantic search error, using intelligent fallback:', err);
      }
    }

    // Heuristic Fallback with smart synonyms & token normalization
    const norm = cleanQuery
      .toLowerCase()
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ىي]/g, 'ي')
      .replace(/[\u064B-\u065F]/g, '');

    let detectedIntent = `البحث عن أدوات وخدمات الذكاء الاصطناعي المرتبطة بـ "${cleanQuery}"`;
    let catHint = '';

    if (norm.includes('صور') || norm.includes('رسم') || norm.includes('تصميم') || norm.includes('شعار') || norm.includes('image') || norm.includes('art') || norm.includes('design')) {
      detectedIntent = 'أنت تبحث عن أدوات توليد الصور، التعديل البصري، وتصميم الشعارات والجرافيك.';
      catHint = 'image-generation';
    } else if (norm.includes('كود') || norm.includes('برمج') || norm.includes('تطبيق') || norm.includes('موقع') || norm.includes('code') || norm.includes('dev')) {
      detectedIntent = 'أنت تبحث عن مساعدات برمجية ذكية لكتابة الأكواد وتصحيح الأخطاء وبناء التطبيقات.';
      catHint = 'coding-development';
    } else if (norm.includes('نص') || norm.includes('كتاب') || norm.includes('مقال') || norm.includes('محتو') || norm.includes('شات') || norm.includes('write')) {
      detectedIntent = 'أنت تبحث عن نماذج لغوية ومساعدات كتابة المحتوى وصياغة المقالات.';
      catHint = 'content-writing';
    } else if (norm.includes('فيديو') || norm.includes('مونتاج') || norm.includes('video')) {
      detectedIntent = 'أنت تبحث عن أدوات توليد ومونتاج الفيديو التوليدي والمؤثرات البصرية.';
      catHint = 'video-generation';
    } else if (norm.includes('صوت') || norm.includes('تفريغ') || norm.includes('دبلج') || norm.includes('audio') || norm.includes('voice')) {
      detectedIntent = 'أنت تبحث عن حلول التعليق الصوتي وتوليد النبرات وتفريغ التسجيلات الصوتية.';
      catHint = 'audio-voice';
    }

    const matchedTools = allTools.filter(t => {
      const tNorm = (t.name + ' ' + t.tagline + ' ' + (t.description || ''))
        .toLowerCase()
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/[ىي]/g, 'ي');
      return tNorm.includes(norm);
    }).map((t, idx) => ({
      ...t,
      semanticMatch: {
        confidence: Math.max(75, 95 - idx * 4),
        reason: 'مطابقة دلالية ذكية للاحتياج المطلوب',
        useCases: [],
        isAiMatched: true,
      }
    }));

    return {
      query: cleanQuery,
      interpretedIntent: detectedIntent,
      correctedKeywords: [cleanQuery],
      matchedTools: matchedTools.length > 0 ? matchedTools : allTools.slice(0, 6).map(t => ({
        ...t,
        semanticMatch: {
          confidence: 82,
          reason: 'أداة رائدة ومقترحة لاحتياجاتك العامة',
          useCases: [],
          isAiMatched: false,
        }
      })),
      matchedCategories: allCategories.filter(c => catHint ? c.slug.includes(catHint) : true).slice(0, 4),
      matchedArticles: allArticles.slice(0, 3),
      suggestedQueries: [
        'أفضل أدوات الذكاء الاصطناعي المجانية',
        'مقارنة بين ChatGPT و Claude 3.5',
        'أدوات تدعم اللغة العربية بدقة عالية'
      ],
      isAiPowered: false,
    };
  },
  /**
   * Search Grounding: Live Google Search Data integration using Gemini 3.8 Flash.
   */
  async searchGrounding(userQuery: string): Promise<SearchGroundingResponse> {
    const ai = getAiClient();
    if (ai) {
      try {
        const systemInstruction = `
أنت "المساعد الذكي لبحث الويب الحي لدليل الذكاء الاصطناعي (Daleel AI Live Search)".
مهمتك: الإجابة على استفسارات المستخدمين حول أحدث التطورات، الأخبار، الإطلاق الجديد، وأسعار وتخفيضات أدوات الذكاء الاصطناعي مع الاعتماد المباشر والربط مع نتائج بحث Google المباشرة (Search Grounding).
قدم الإجابة باللغة العربية الفصحى بأسلوب مهني، دقيق ومباشر، وقسّم الإجابة إلى أفكار رئيسية ونقاط واضحة.
`;
        const result = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userQuery,
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
          },
        });

        const text = result.text || 'لم يتم استرجاع معلومات كافية.';
        const candidate = result.candidates?.[0];
        const groundingMetadata = candidate?.groundingMetadata;

        const sources: SearchGroundingSource[] = [];
        if (groundingMetadata?.groundingChunks) {
          for (const chunk of groundingMetadata.groundingChunks) {
            if (chunk.web) {
              const webData = chunk.web as any;
              sources.push({
                title: webData.title || 'المصدر',
                url: webData.uri,
                snippet: webData.snippet || webData.title,
              });
            }
          }
        }

        const webSearchQueries = groundingMetadata?.webSearchQueries || [];

        return {
          answer: text,
          sources,
          webSearchQueries,
        };
      } catch (err) {
        console.error('Search grounding API error:', err);
      }
    }

    return {
      answer: `نتائج البحث المباشر لـ "${userQuery}":\n\nتجري متابعة أحدث أخبار وتحديثات الذكاء الاصطناعي بشكل فوري عبر محرك بحث Google (Google Search Grounding). يرجى التأكد من ضبط GEMINI_API_KEY للحصول على الربط الحي.`,
      sources: [
        { title: 'Google AI Studio News', url: 'https://ai.google.dev' },
        { title: 'Daleel AI Realtime', url: 'https://daleel.ai' }
      ],
      webSearchQueries: [userQuery]
    };
  },

  /**
   * Maps Grounding: Google Maps Data integration using Gemini 3.8 Flash for tech hubs, AI centers, & events.
   */
  async mapsGrounding(userQuery: string): Promise<MapsGroundingResponse> {
    const ai = getAiClient();
    if (ai) {
      try {
        const systemInstruction = `
أنت "مكتشف المقرات والفعاليات التقنية لمستكشف الذكاء الاصطناعي (Daleel AI Maps Finder)".
مهمتك: مساعدة المستخدمين في تحديد أماكن ومقرات شركات الذكاء الاصطناعي، مراكز الابتكار، حاضنات الأعمال، والمعارض والمؤتمرات التقنية ومختبرات الأبحاث باستخدام بيانات خرائط قوقل المباشرة (Google Maps Grounding).
قدم إجابة مفصلة باللغة العربية مع توضيح أسماء المواقع وعناوينها وتقييماتها وكيفية الوصول إليها.
`;
        const result = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userQuery,
          config: {
            systemInstruction,
            tools: [{ googleMaps: {} }],
          },
        });

        const text = result.text || 'لم يتم العثور على مواقع مطابقة.';
        const candidate = result.candidates?.[0];
        const groundingMetadata = candidate?.groundingMetadata;

        const locations: MapsGroundingLocation[] = [];
        if (groundingMetadata?.groundingChunks) {
          for (const chunk of groundingMetadata.groundingChunks) {
            if (chunk.web) {
              locations.push({
                name: chunk.web.title,
                address: chunk.web.uri,
              });
            }
          }
        }

        return {
          answer: text,
          locations,
        };
      } catch (err) {
        console.error('Maps grounding API error:', err);
      }
    }

    return {
      answer: `نتائج استكشاف الخرائط لـ "${userQuery}":\n\nيمكنك البحث عن مراكز الذكاء الاصطناعي ومجمعات التقنية في الرياض، دبي، القاهرة، وسيليكون فالي مع الخرائط التفاعلية (Google Maps Grounding).`,
      locations: [
        { name: 'مجمع كافد التقني بالرياض - KAFD AI Hub', address: 'الرياض، المملكة العربية السعودية' },
        { name: 'مركز دبي للذكاء الاصطناعي - AREA 2071', address: 'دبي، الإمارات العربية المتحدة' }
      ]
    };
  },

  /**
   * AI Tool Advisor: Analyzes user needs and recommends the most matching tools from database.
   */
  async consultAdvisor(userMessage: string, history: Array<{ role: string; text: string }> = []): Promise<AdvisorResponse> {
    // 1. Fetch current catalog snapshot from DB to ground the AI with real platform tools
    let availableTools: any[] = [];
    try {
      const dbRes = await query(`
        SELECT id, name, slug, tagline, pricing_type, arabic_support, starting_price, rating, review_count
        FROM tools
        ORDER BY rating DESC
        LIMIT 40
      `);
      availableTools = dbRes.rows;
    } catch (e) {
      console.warn('Could not query tools for AI grounding:', e);
    }

    const toolsContext = availableTools
      .map((t) => `- ${t.name} (slug: "${t.slug}", pricing: ${t.pricing_type}, arabic: ${t.arabic_support || 'ممتاز'}, tagline: "${t.tagline}")`)
      .join('\n');

    const systemInstruction = `
أنت "المستشار الذكي لدليل الذكاء الاصطناعي (Daleel AI Advisor)"، الخبير العربي المتخصص والأكثر دراية بمساعدات وأدوات الذكاء الاصطناعي في الوطن العربي والعالم.
مهمتك: مساعدة المستخدمين ورواد الأعمال، المبرمجين، الكتاب، والمصممين في اختيار أفضل الأدوات والحلول المناسبة لاحتياجاتهم وميزانياتهم بدقة وشفافية باللغة العربية.

قائمة الأدوات المتاحة حالياً في قاعدة بيانات المنصة:
${toolsContext}

قواعد الإجابة الإلزامية:
1. قدم تحليلاً دقيقاً وموجزاً باللغة العربية الفصحى مع نبرة احترافية وودودة.
2. رشح من 2 إلى 4 أدوات محددة ومناسبة تماماً لطلب المستخدم من القائمة أعلاه (استخدم دائماً نفس الـ slug المذكور).
3. وضح سبب الترشيح وميزة كل أداة وخطة تسعيرها.
4. أرجع النتيجة بتنسيق JSON حصراً بالهيكل التالي:
{
  "answer": "فقرة تقديمية شارحة للحل والنهج الأمثل للمستخدم باللغة العربية",
  "recommendations": [
    {
      "toolSlug": "slug-here",
      "toolName": "اسم الأداة",
      "category": "تصنيف الأداة",
      "pricingType": "مجاني / مدفوع / Freemium",
      "reason": "شرح لماذا هذه الأداة هي الأنسب له",
      "keyFeature": "أبرز ميزة يستفيد منها",
      "starterPrompt": "أمر أو برومبت مقترح للبدء في استخدامها"
    }
  ],
  "actionPlan": [
    "الخطوة الأولى للبدء",
    "الخطوة الثانية",
    "الخطوة الثالثة"
  ],
  "suggestedPrompts": [
    "سؤال متابعة مقترح 1",
    "سؤال متابعة مقترح 2"
  ]
}
`;

    const ai = getAiClient();
    if (ai) {
      try {
        const prompt = `طلب واستفسار المستخدم: "${userMessage}"`;
        const result = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const text = result.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            answer: parsed.answer || 'إليك أفضل الأدوات والتوصيات المناسبة لطلبك:',
            recommendations: parsed.recommendations || [],
            actionPlan: parsed.actionPlan || [],
            suggestedPrompts: parsed.suggestedPrompts || [],
          };
        }
      } catch (err) {
        console.error('Gemini advisor API error, falling back to smart heuristic:', err);
      }
    }

    // Heuristic Fallback when Gemini key is not set or temporary network issue
    const lowerQuery = userMessage.toLowerCase();
    const matches: AdvisorRecommendation[] = [];

    if (lowerQuery.includes('برمج') || lowerQuery.includes('كود') || lowerQuery.includes('تطوير') || lowerQuery.includes('code')) {
      matches.push({
        toolSlug: 'cursor-ai',
        toolName: 'Cursor AI',
        category: 'البرمجة والأكواد',
        pricingType: 'Freemium',
        reason: 'أفضل محرر أكواد ذكي ومساعد برمجي متكامل يدعم إكمال الأكواد وإصلاح الأخطاء تلقائياً.',
        keyFeature: 'تعديل المشاريع الضخمة والشات البرمجي المباشر مع كامل مستودع الكود.',
        starterPrompt: 'قم بفحص هذا الكود وتحسين أدائه وإضافة معالجة الأخطاء والتوثيق.',
      });
      matches.push({
        toolSlug: 'github-copilot',
        toolName: 'GitHub Copilot',
        category: 'البرمجة والأكواد',
        pricingType: 'مدفوع / تجربة مجانية',
        reason: 'رفيق برمجي موثوق من مايكروسوفت يدعم جميع بيئات التطوير.',
        keyFeature: 'الإكمال التلقائي فائق السرعة لكافة اللغات البرمجية.',
      });
    } else if (lowerQuery.includes('صور') || lowerQuery.includes('تصميم') || lowerQuery.includes('شعار') || lowerQuery.includes('image') || lowerQuery.includes('design')) {
      matches.push({
        toolSlug: 'midjourney',
        toolName: 'Midjourney v6',
        category: 'توليد الصور والتصميم',
        pricingType: 'مدفوع',
        reason: 'الرائد عالمياً في دقة التفاصيل، الواقعية الفائقة، والإخراج البصري السينمائي.',
        keyFeature: 'توليد صور واقعية وجودة إضاءة وتفاصيل سينمائية مبهرة.',
        starterPrompt: 'A photorealistic modern workspace in Dubai, cinematic lighting, 8k resolution --v 6.0',
      });
      matches.push({
        toolSlug: 'dall-e-3',
        toolName: 'DALL-E 3',
        category: 'توليد الصور والتصميم',
        pricingType: 'Freemium',
        reason: 'فهم دقيق للأوامر باللغة العربية والإنجليزية وتكامل سلس مع ChatGPT.',
        keyFeature: 'التوليد الدقيق للنصوص داخل الصور والرسومات التوضيحية.',
      });
    } else {
      matches.push({
        toolSlug: 'chatgpt',
        toolName: 'ChatGPT (GPT-4o)',
        category: 'روبوتات المحادثة والمساعدين',
        pricingType: 'Freemium',
        reason: 'المساعد الأكثر شمولية وكفاءة في كتابة المحتوى، التحليل، والترجمة المتقدمة.',
        keyFeature: 'الرؤية الحاسوبية، المحادثة الصوتية الحية، والتحليل المتقدم للبيانات.',
        starterPrompt: 'ساعدني في وضع خطة عمل استراتيجية لزيادة الإنتاجية لرواد الأعمال.',
      });
      matches.push({
        toolSlug: 'claude-3-5-sonnet',
        toolName: 'Claude 3.5 Sonnet',
        category: 'روبوتات المحادثة والمساعدين',
        pricingType: 'Freemium',
        reason: 'الأقوى في الكتابة الطبيعية الدقيقة، البرمجة، والتحليل العميق للنصوص الطويلة.',
        keyFeature: 'خاصية Artifacts التفاعلية وسعة سياق ضخمة تبلغ 200 ألف رمز.',
      });
    }

    return {
      answer: `بناءً على تحليلي لطلبك ("${userMessage}")، قمت بمطابقة أفضل الأدوات المتاحة في قاعدة بيانات المنصة التي تحقق لك أعلى جودة وأفضل عائد على وقتك واستثمارك:`,
      recommendations: matches,
      actionPlan: [
        'ابدأ بتجربة الخطة المجانية للأداة الأولى للتحقق من توافقها مع طبيعة عملك.',
        'استخدم البرومبت المقترح لتوجيه النموذج بدقة والحصول على نتائج فورية.',
        'قارن بين الأداء وسرعة الاستجابة ودعم اللغة العربية قبل الترقية للباقات المدفوعة.',
      ],
      suggestedPrompts: [
        'ما هي الفروق الجوهرية في الأسعار بين هذه الأدوات؟',
        'هل تتوفر بدائل مجانية بالكامل ومفتوحة المصدر؟',
        'كيف يمكنني كتابة أوامر برومبت احترافية للحصول على أفضل نتيجة؟',
      ],
    };
  },

  /**
   * AI Prompt Generator: Generates professional prompts for specific models & tasks.
   */
  async generateCustomPrompt(task: string, targetModel: string, language: string = 'ar'): Promise<{
    prompt: string;
    tips: string[];
    variables: string[];
  }> {
    const ai = getAiClient();
    if (ai) {
      try {
        const systemInstruction = `
أنت خبير هندسة الأوامر (Prompt Engineering Specialist).
مهمتك: صياغة أمر (Prompt) احترافي، دقيق، ومركب وفق أحدث المعايير وموجّه لنموذج الذكاء الاصطناعي المحدد.
يجب أن يتضمن الأمر:
1. تحديد الدور والخبرة (Persona / Role).
2. سياق المهمة بوضوح (Context).
3. الخطوات والشروط المحددة (Instructions & Constraints).
4. صيغة المخرجات المطلوبة (Output Format).
5. متغيرات ديناميكية بين أقواس معقوفة مثل [اسم المشروع] أو [المجال] لكي يملأها المستخدم بسهولة.

أرجع النتيجة بصيغة JSON فقط:
{
  "prompt": "النص الكامل والمحكم للأمر",
  "tips": ["نصيحة 1 للحصول على نتيجة أفضل", "نصيحة 2"],
  "variables": ["اسم المتغير 1", "اسم المتغير 2"]
}
`;

        const result = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `المهمة المطلوبة: "${task}"\nالنموذج المستهدف: "${targetModel}"\nاللغة: "${language}"`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const text = result.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            prompt: parsed.prompt || '',
            tips: parsed.tips || [],
            variables: parsed.variables || [],
          };
        }
      } catch (err) {
        console.error('Prompt generator API error:', err);
      }
    }

    // Heuristic fallback prompt
    return {
      prompt: `بصفتك خبيراً متخصصاً في [المجال المحدد]، أريدك أن تساعدني في تنفيذ المهمة التالية: "${task}".

المتطلبات والشروط الإلزامية:
1. تقديم خطة واضحة ومباشرة قابلة للتنفيذ الفوري.
2. التركيز على الجودة والاحترافية ومراعاة أفضل الممارسات المتبعة عالمياً.
3. التنسيق على هيئة نقاط منظمة وجداول إذا تطلب الأمر.
4. اللغة: العربية الفصحى الواضحة والمهنية.

البيانات والمدخلات الخاصة بي:
- الهدف الأساسي: [اكتب هدفك هنا]
- الجمهور المستهدف: [حدد جمهورك]
- النبرة والأسلوب: [مهني / إبداعي / تقني]`,
      tips: [
        'املأ المتغيرات بين الأقواس المعقوفة [ ] بتفاصيلك الحقيقية قبل الإرسال.',
        'كلما كانت المدخلات والبيانات واضحة، كلما جاءت النتيجة مطابقة لتوقعاتك بدقة.',
        'يمكنك طلب التعديل أو إعادة الصياغة من النموذج بعد استلام المسودة الأولى.',
      ],
      variables: ['المجال المحدد', 'اكتب هدفك هنا', 'حدد جمهورك', 'النبرة والأسلوب'],
    };
  },
};
