import { EcommercePlatform, AffiliateProgram, EcommerceAiTool, CouponDeal } from '../types.ts';

export const ECOMMERCE_PLATFORMS: EcommercePlatform[] = [
  {
    id: 'salla',
    name: 'Salla',
    name_ar: 'سلة',
    slug: 'salla',
    logo_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=128&auto=format&fit=crop&q=80',
    tagline: 'المنصة الرائدة لإنشاء وإدارة المتاجر الإلكترونية في السعودية والخليج',
    description: 'توفر منصة سلة حلاً متكاملاً للتجار في العالم العربي، حيث تمكّن التاجر من إطلاق متجر احترافي متكامل مع بوابات الدفع المحلية (مدى، أبل باي، تابي، تمارا) وشركات الشحن، بالإضافة إلى منظومة تطبيقات ذكاء اصطناعي وأتمتة.',
    rating: 4.9,
    review_count: 3420,
    pricing_model: 'باقة مجانية واشتراكات شهرية/سنوية',
    starting_price: '0 ر.س (مجاناً) / بلس 99 ر.س / برو 299 ر.س',
    starting_price_numeric: 99, // SAR
    transaction_fee: '0% على المبيعات (تطبق رسوم بوابات الدفع فقط)',
    transaction_fee_rate: 0.0,
    fixed_fee_per_order: 1.0, // متوسط رسوم مدى
    payment_gateways: ['مدى (Mada)', 'Apple Pay', 'فيزا / ماستركارد', 'تابي (Tabby)', 'تمارا (Tamara)', 'STC Pay', 'Urpay', 'الدفع عند الاستلام'],
    shipping_partners: ['أرامكس', 'سمسا', 'DHL', 'سلس', 'رد بوكس (Redbox)', 'سبل البريد السعودي', 'أي مكان'],
    target_market: 'السعودية والخليج',
    best_for: 'التجار وأصحاب المشاريع والعلامات التجارية في السعودية والخليج العربي',
    trial_info: 'باقة بيسك مجانية مدى الحياة + تجربة باقة بلس/برو مع كوبون خصم',
    affiliate_url: 'https://salla.sa/?ref=daleelai',
    affiliate_commission: 'حتى 150 ريال سعودي لكل اشتراك نشط أو 20% عمولة متكررة',
    coupon_code: 'DALEELAI',
    coupon_discount: 'خصم 15% على الاشتراكات السنوية',
    badge: 'الأكثر شعبية في الخليج',
    is_popular: true,
    is_featured: true,
    ai_features: [
      'توليد وصف المنتجات والعناوين التسويقية بالذكاء الاصطناعي',
      'تصنيف المنتجات التلقائي واقتراح الكلمات المفتاحية للسيو',
      'روبوتات خدمة العملاء المتصلة بواتساب والمتجر',
      'توصيات ذكية للمنتجات ذات الصلة أثناء الشراء (Upselling)'
    ],
    pros: [
      'لا توجد عمولة على المبيعات للمنصة في باقات بلس وبرو',
      'ربط فوري ومعتمد مع الفوترة الإلكترونية (هيئة الزكاة والضريبة والجمارك ZATCA)',
      'تفعيل بوابات الدفع المحلية (مدى وتابي وتمارا) خلال دقائق دون تعقيدات بنكية',
      'تطبيق جوال ممتاز لإدارة المتجر ومتابعة الطلبات والمخزون',
      'سوق تطبيقات ضخم يوفر مئات الإضافات المخصصة للمنطقة'
    ],
    cons: [
      'تخصيص القوالب البرمجية العميقة يحتاج إلى مطور معتمد في سلة بارتنرز',
      'موجهة أساساً للسوق العربي والخليجي وغير مناسبة للدروب شيبينج الدولي'
    ],
    plans: [
      {
        name: 'سلة بيسك (Basic)',
        price: 'مجاناً مدى الحياة',
        billing: 'مجاني',
        features: ['منتجات غير محدودة', 'عمولة مبيعات للمنصة', 'استقبال المدفوعات الأساسية', 'قالب مجاني معتمد']
      },
      {
        name: 'سلة بلس (Plus)',
        price: '99 ر.س / شهرياً',
        billing: 'شهري أو 990 ر.س سنوياً',
        features: ['0% عمولة على المبيعات', 'دعم دومين خاص', 'تفعيل تابي وتمارا وأبل باي', 'كوبونات وخصومات متقدمة', 'تقارير وتحليلات المبيعات'],
        is_popular: true
      },
      {
        name: 'سلة برو (Pro)',
        price: '299 ر.س / شهرياً',
        billing: 'شهري أو 2990 ر.س سنوياً',
        features: ['جميع ميزات بلس', 'دعم الفروع المتعددة والمستودعات', 'حملات التسويق واسترجاع السلات المتروكة', 'تخصيص CSS للقوالب', 'فريق دعم أولوي لكبار التجار']
      }
    ]
  },
  {
    id: 'zid',
    name: 'Zid',
    name_ar: 'زد',
    slug: 'zid',
    logo_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=128&auto=format&fit=crop&q=80',
    tagline: 'منظومة التجارة الحديثة لتمكين تجار التجزئة والعلامات التجارية الطموحة',
    description: 'تعتبر زد منصة تجارة متكاملة تهدف إلى دعم نمو العلامات التجارية من خلال منظومة متكاملة: زد باي للحلول المالية، زد شيب للشحن والخدمات اللوجستية، وحلول نقاط البيع (POS) لربط المتجر الإلكتروني بالفروع الواقعية.',
    rating: 4.8,
    review_count: 1890,
    pricing_model: 'اشتراكات سنوية / باقات نمو',
    starting_price: 'تبدأ من 230 ر.س / شهرياً (تدفع سنوياً)',
    starting_price_numeric: 230,
    transaction_fee: '0% عمولة للمنصة (تطبق رسوم زد باي فقط)',
    transaction_fee_rate: 0.0,
    fixed_fee_per_order: 1.0,
    payment_gateways: ['زد باي (Zid Pay)', 'مدى', 'Apple Pay', 'فيزا / ماستركارد', 'تمارا', 'تابي', 'STC Pay'],
    shipping_partners: ['زد شيب (Zid Ship)', 'أرامكس', 'DHL', 'سمسا', 'ساعي', 'جوناس', 'برق'],
    target_market: 'السعودية والخليج',
    best_for: 'الشركات وتجار التجزئة الراغبين في ربط الفروع والمخزون ونقاط البيع (POS)',
    trial_info: 'فترة تجريبية مجانية 14 يوماً لاستكشاف المنظومة',
    affiliate_url: 'https://zid.sa/?ref=daleelai',
    affiliate_commission: 'حتى 300 ريال لكل تاجر جديد أو نسبة شهرية من الاشتراكات',
    coupon_code: 'ZIDDALEEL',
    coupon_discount: 'خصم إضافي 20% على باقة نمو السنوية',
    badge: 'الأفضل لربط الفروع والشركات',
    is_popular: false,
    is_featured: true,
    ai_features: [
      'توليد صفحات الهبوط المخصصة تلقائياً',
      'تحليل تنبؤي للمخزون وإعادة الطلب قبل النفاذ',
      'تحسين سيو المتجر بذكاء اصطناعي ومراقبة الكلمات المنافسة',
      'تقسيم العملاء الذكي (Customer Segmentation) للحملات التسويقية'
    ],
    pros: [
      'منظومة زد شيب الموحدة التي تتيح التعامل مع أكثر من 20 شركة شحن بحساب موحد وأسعار مخفضة',
      'ربط ممتاز ومباشر مع أنظمة المحاسبة السحابية مثل قيود ودفترة وأودو',
      'نظام نقاط بيع مدمج (Zid POS) لتوحيد مبيعات المعرض والمتجر الإلكتروني',
      'أكاديمية زد ومجتمع تجار نشط يقدم تدريبات واستشارات تجارية دورية'
    ],
    cons: [
      'تكلفة البداية أعلى قليلاً مقارنة بغيرها (لا توجد باقة مجانية دائمة)',
      'التركيز الأكبر على العقود السنوية بدلاً من الاشتراكات الشهرية المرنة'
    ],
    plans: [
      {
        name: 'باقة الانطلاق',
        price: '230 ر.س / شهرياً (سنوي)',
        billing: '2760 ر.س سنوياً',
        features: ['منتجات غير محدودة', 'ربط الدومين الخاص', 'تفعيل زد باي وزد شيب', 'تقارير المبيعات']
      },
      {
        name: 'باقة النمو',
        price: '460 ر.س / شهرياً (سنوي)',
        billing: '5520 ر.س سنوياً',
        features: ['إدارة الفروع والمستودعات', 'ربط نقاط البيع POS', 'أدوات تسويق واسترجاع السلات', 'دعم فني عبر الهاتف'],
        is_popular: true
      },
      {
        name: 'باقة المحترفين والشركات',
        price: 'تواصل للمبيعات',
        billing: 'مخصص',
        features: ['مدير حساب مخصص', 'تخصيص واجهات برمجية API مفتوحة', 'سيرفرات مخصصة وسرعة فائقة', 'تدريب مباشر للفريق']
      }
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify',
    name_ar: 'شوبيفاي',
    slug: 'shopify',
    logo_url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=128&auto=format&fit=crop&q=80',
    tagline: 'المنصة العالمية رقم 1 في التجارة الإلكترونية والدروب شيبينج الدولي',
    description: 'شوبيفاي هي أضخم منصة تجارة إلكترونية سحابية في العالم، تدير ملايين المتاجر وتدعم البيع متعدد القنوات في أكثر من 175 دولة، وتوفر متجر تطبيقات هائل يضم آلاف أدوات الذكاء الاصطناعي والتسويق الدولي.',
    rating: 4.9,
    review_count: 9850,
    pricing_model: 'اشتراك شهري + عمولة إذا لم تستخدم Shopify Payments',
    starting_price: '$1 للشهر الأول ثم $39 / شهرياً (Basic)',
    starting_price_numeric: 39, // USD (~146 SAR)
    transaction_fee: '0% مع Shopify Payments، أو 2.0% إلى 0.5% عند استخدام بوابات دفع خارجية',
    transaction_fee_rate: 0.02,
    fixed_fee_per_order: 1.1, // ~$0.30
    payment_gateways: ['Shopify Payments', 'Stripe', 'PayPal', 'بوابات محلية (Tap, PayTabs, Moyasar, HyperPay)', 'تابي وتمارا عبر تطبيقات'],
    shipping_partners: ['Shopify Shipping', 'DHL Express', 'UPS', 'FedEx', 'ShipStation', 'تطبيقات الشحن المحلية'],
    target_market: 'عالمي ودولي',
    best_for: 'الدروب شيبينج، التجارة الدولية، التوسع العالمي والماركات الكبرى',
    trial_info: 'فترة تجريبية 3 أيام مجاناً + الشهر الأول بالكامل مقابل $1 فقط',
    affiliate_url: 'https://shopify.pxf.io/daleelai',
    affiliate_commission: 'حتى $150 لكل مشترك تجاري جديد أو 20% عمولة متكررة',
    coupon_code: '1DOLLAR_PROMO',
    coupon_discount: 'احصل على المتجر بـ $1 فقط لأول 3 أشهر',
    badge: 'الأفضل عالمياً والدروب شيبينج',
    is_popular: true,
    is_featured: true,
    ai_features: [
      'Shopify Magic: توليد نصوص المنتجات ورسائل البريد التسويقية مجاناً',
      'Sidekick: مساعد ذكي كامل داخل لوحة التحكم يحلل مبيعاتك ويقترح تحسينات',
      'تعديل وإزالة خلفيات صور المنتجات بالذكاء الاصطناعي بنقرة واحدة',
      'أتمتة تسعير وتحويل العملات حسب بلد الزائر تلقائياً'
    ],
    pros: [
      'أكبر متجر تطبيقات في العالم (أكثر من 8,000 تطبيق لأي وظيفة تتخيلها)',
      'سرعة استضافة خارقة وحماية وأمان لا مثيل لهما تتحمل ملايين الزيارات',
      'حرية كاملة في تعديل قوالب المتجر بواسطة كود Liquid أو السحب والإفلات',
      'سهولة البيع متعدد القنوات (تيك توك، إنستغرام، فيسبوك، أمازون) بضغطة زر واحدة'
    ],
    cons: [
      'تحصيل عمولة إضافية (0.5% - 2%) إذا لم تكن بوابة Shopify Payments متاحة في بلدك',
      'تحتاج اشتراكات إضافية لبعض التطبيقات المدفوعة في متجر App Store',
      'تكامل بوابات الدفع المحلية في الخليج يتطلب استخدام بوابات وسيطة (مثل Tap أو PayTabs)'
    ],
    plans: [
      {
        name: 'Shopify Basic',
        price: '$1 لأول شهر ثم $39 / شهرياً',
        billing: 'شهري (أو $29/شهرياً سنوي)',
        features: ['متجر كامل وبيع عالمي', 'تقارير أساسية', '2 حسابات موظفين', 'أدوات الذكاء الاصطناعي Shopify Magic'],
        is_popular: true
      },
      {
        name: 'Shopify Standard',
        price: '$105 / شهرياً',
        billing: 'شهري (أو $79/شهرياً سنوي)',
        features: ['5 حسابات موظفين', 'تقارير أداء ومبيعات احترافية', 'رسوم معاملات منخفضة 1.0%', 'أتمتة العمليات عبر Shopify Flow']
      },
      {
        name: 'Shopify Advanced',
        price: '$399 / شهرياً',
        billing: 'شهري (أو $299/شهرياً سنوي)',
        features: ['15 حساب موظفين', 'تقارير مخصصة متقدمة', 'أقل رسوم معاملات 0.5%', 'حساب الضرائب والجمارك الدولية عند الدفع']
      }
    ]
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    name_ar: 'ووكومرس (ووردبريس)',
    slug: 'woocommerce',
    logo_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=128&auto=format&fit=crop&q=80',
    tagline: 'الحرية والتحكم الكامل في متجرك الإلكتروني بدون أي عمولات وسيطة',
    description: 'إضافة التجارة الإلكترونية مفتوحة المصدر الأكثر انتشاراً المبنية على ووردبريس. تمنحك السيطرة الكاملة على متجرك وبياناتك وملفات الاستضافة وقواعد البيانات دون التقيد بسياسات أي منصة تجارية خارجية.',
    rating: 4.7,
    review_count: 5400,
    pricing_model: 'برمجية مجانية مفتوحة المصدر (تدفع تكلفة الاستضافة والدومين فقط)',
    starting_price: '0 ر.س (تكلفة استضافة تبدأ من 15 ر.س / شهرياً)',
    starting_price_numeric: 15,
    transaction_fee: '0% للمنصة (أنت تدفع فقط عمولة بوابة الدفع المختارة)',
    transaction_fee_rate: 0.0,
    fixed_fee_per_order: 0.0,
    payment_gateways: ['جميع بوابات الدفع بلا استثناء (مدى، باي بال، سترايب، تاب، ميسر، بتكوين، دفع عند الاستلام)'],
    shipping_partners: ['جميع شركات الشحن المحلية والدولية عبر إضافات ووردبريس المجانية والمدفوعة'],
    target_market: 'شامل',
    best_for: 'المطورين، المتاجر الكبيرة ذات المتطلبات الخاصة، ومن يريد تجنب الرسوم الشهرية',
    trial_info: 'مجاني ومفتوح المصدر بالكامل للأبد',
    affiliate_url: 'https://hostinger.com/daleelai?discount=DALEELAI',
    affiliate_commission: 'عمولة استضافة ووردبريس تصل إلى $65 لكل اشتراك',
    coupon_code: 'WP_DALEEL',
    coupon_discount: 'خصم 75% على أفضل استضافة سريعة لووكومرس + دومين مجاني',
    badge: 'تحكم كامل 100% وبدون عمولات',
    is_popular: false,
    is_featured: true,
    ai_features: [
      'ربط مباشر مع نماذج GPT و Gemini عبر إضافات ووردبريس لتوليد آلاف المنتجات',
      'إضافات تحسين محركات البحث مثل Yoast و RankMath AI لتصدر جوجل',
      'توليد صور المنتجات آلياً عبر إضافات الذكاء الاصطناعي داخل لوحة التحكم'
    ],
    pros: [
      'لا توجد أي عمولات على المبيعات للمنصة نهائياً',
      'أنت المالك الحقيقي 100% لمتجرك وقاعدة بيانات عملائك وملفاتك',
      'آلاف القوالب المجانية والمدفوعة والقدرة على تخصيص كل بكسل وكود',
      'تكلفة تشغيل منخفضة جداً تبدأ من بضعة دولارات للاستضافة'
    ],
    cons: [
      'يتطلب معرفة تقنية لإدارة السيرفر والتحديثات الأمنية والنسخ الاحتياطي',
      'أنت المسؤول عن سرعة المتجر وحمايته من الهجمات واختيار الاستضافة الجيدة'
    ],
    plans: [
      {
        name: 'برمجية ووكومرس',
        price: 'مجاناً 100%',
        billing: 'مفتوح المصدر',
        features: ['منتجات ومبيعات غير محدودة', 'تحكم كامل بالكود', 'دعم جميع العملات واللغات', '0% عمولة للمنصة']
      },
      {
        name: 'استضافة سحابية مدارة',
        price: 'من $3.99 / شهرياً',
        billing: 'سنوي مع دومين مجاني',
        features: ['سيرفرات سريعة SSD', 'شهادة SSL مجانية', 'نسخ احتياطي يومي تلقائي', 'تثبيت ووكومرس بضغطة زر'],
        is_popular: true
      }
    ]
  },
  {
    id: 'youcan',
    name: 'YouCan',
    name_ar: 'يوكان',
    slug: 'youcan',
    logo_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=128&auto=format&fit=crop&q=80',
    tagline: 'المنصة المثالية للدفع عند الاستلام (COD) والمبتدئين بدون مصاريف ثابتة',
    description: 'منصة سريعة جداً ومرنة مصممة خصيصاً لتناسب نموذج الدفع عند الاستلام (Cash On Delivery) في العالم العربي، حيث لا تفرض اشتراكاً شهرياً ثابتاً بل تكتفي باقتطاع نسبة رمزية 0.5% عند نجاح الطلبات.',
    rating: 4.6,
    review_count: 1420,
    pricing_model: 'بدون اشتراك شهري (تدفع فقط عند تحقيق مبيعات)',
    starting_price: '0 ر.س شهرياً + 0.5% لكل طلب ناجح',
    starting_price_numeric: 0,
    transaction_fee: '0.5% فقط للطلبات المكتملة',
    transaction_fee_rate: 0.005,
    fixed_fee_per_order: 0.0,
    payment_gateways: ['الدفع عند الاستلام (COD) المحسّن', 'Stripe', 'PayPal', 'بوابات محلية'],
    shipping_partners: ['شركات شحن الدفع عند الاستلام في الخليج والمغرب العربي'],
    target_market: 'شمال إفريقيا ومحلي',
    best_for: 'المبتدئين، مسوقي الدفع عند الاستلام (COD)، والحملات الإعلانية السريعة',
    trial_info: 'شحن رصيد أولي $10 للبدء بدون أي التزام شهري',
    affiliate_url: 'https://youcan.shop/?ref=daleelai',
    affiliate_commission: '20% عمولة متكررة على كل رصيد يشحنه التاجر المسجل',
    coupon_code: 'YOUCAN_BONUS',
    coupon_discount: 'رصيد مجاني $10 في حسابك عند التسجيل',
    badge: 'الأوفر للمبتدئين ونظام COD',
    is_popular: false,
    is_featured: true,
    ai_features: [
      'توليد صفحات هبوط سريعة للمنتج الواحد (One-Product Store)',
      'أداة كتابة العروض الترويجية المقنعة لزيادة نسبة الشراء',
      'فحص تلقائي لتكرار الطلبات وتفادي الطلبات الوهمية'
    ],
    pros: [
      'لا توجد رسوم اشتراك شهرية إطلاقاً (تدفع فقط إذا بعت)',
      'صفحات هبوط وفورم طلب مخصص بنقرة واحدة فائق السرعة',
      'أدوات مدمجة لتقليل الإرجاع وتأكيد طلبات الدفع عند الاستلام',
      'سيرفرات سريعة جداً معدة لتحمل ضغط إعلانات تيك توك وسناب شات'
    ],
    cons: [
      'تطبيقات وإضافات أقل مقارنة بشوبيفاي وسلة',
      'غير مخصصة للمتاجر الكبرى التي تملك آلاف المنتجات المعقدة'
    ],
    plans: [
      {
        name: 'نظام الدفع حسب النجاح (Pay as you grow)',
        price: '0$ شهرياً (0.5% عمولة)',
        billing: 'بدون اشتراك شهري',
        features: ['استضافة ودومينات غير محدودة', 'فورم شراء فائق السرعة', 'أدوات استرجاع السلات', '0.5% فقط على الطلب الناجح'],
        is_popular: true
      }
    ]
  },
  {
    id: 'wix-ecommerce',
    name: 'Wix eCommerce',
    name_ar: 'ويكس إيكوميرس',
    slug: 'wix-ecommerce',
    logo_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=128&auto=format&fit=crop&q=80',
    tagline: 'بناء متجر إلكتروني جذاب بالذكاء الاصطناعي وبدون أي كود',
    description: 'حل مرن وسريع يجمع بين قوة أداة تصميم المواقع بالسحب والإفلات وقدرات المتجر الإلكتروني، ومزود بميزات Wix Studio الذكية لإنشاء متجر كامل في دقائق.',
    rating: 4.5,
    review_count: 3100,
    pricing_model: 'اشتراك شهري يبدأ من $17',
    starting_price: '$17 / شهرياً (Core Plan)',
    starting_price_numeric: 17,
    transaction_fee: '0% عمولة للمنصة (تطبق رسوم البوابة فقط)',
    transaction_fee_rate: 0.0,
    fixed_fee_per_order: 1.0,
    payment_gateways: ['Wix Payments', 'PayPal', 'Stripe', 'PointCheckout', 'Tap'],
    shipping_partners: ['تكاملات شحن آلية ودولية'],
    target_market: 'شامل',
    best_for: 'المصممين، المتاجر المبتدئة، وبيع المنتجات الرقمية واليدوية والخدمات',
    trial_info: 'ضمان استرداد الأموال لمدة 14 يوماً',
    affiliate_url: 'https://wix.com/?ref=daleelai',
    affiliate_commission: 'تصل إلى $100 لكل ترقية لباقة التجارة الإلكترونية',
    badge: 'الأسهل في التصميم المرئي',
    is_popular: false,
    is_featured: false,
    ai_features: [
      'Wix AI Site Generator: إنشاء المتجر والقوائم والنصوص بالذكاء الاصطناعي في دقيقة',
      'توليد شارات وبانرات المنتجات التسويقية تلقائياً',
      'أداة ذكية لتحسين محركات البحث SEO Wiz'
    ],
    pros: [
      'حرية تصميم غير مسبوقة بالسحب والإفلات بدون قيود قوالب',
      'دعم ممتاز لبيع المنتجات الرقمية، الدورات، وحجز المواعيد بجانب المنتجات الفيزيائية',
      'لوحة تحكم سهلة جداً للمبتدئين'
    ],
    cons: [
      'سرعة التحميل أبطأ قليلاً مقارنة بشوبيفاي وووكومرس',
      'صعوبة نقل المتجر إلى منصة أخرى في حال قررت التغيير لاحقاً'
    ],
    plans: [
      {
        name: 'Core Plan',
        price: '$17 / شهرياً',
        billing: 'سنوي',
        features: ['قبول المدفوعات', 'حتى 50,000 منتج', 'مساحة تخزين 50GB', 'استعادة السلات المتروكة'],
        is_popular: true
      },
      {
        name: 'Business Plan',
        price: '$26 / شهرياً',
        billing: 'سنوي',
        features: ['تخزين 100GB', 'حساب ضرائب تلقائي', 'تقارير متقدمة', 'دعم أولوي']
      }
    ]
  }
];

export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    id: 'amazon-associates',
    name: 'Amazon Associates (أمازون أفلييت)',
    slug: 'amazon-associates',
    logo_url: 'https://images.unsplash.com/photo-1523474255658-4af61b1684c4?w=128&auto=format&fit=crop&q=80',
    category: 'متاجر تجزئة وإلكترونيات',
    commission_rate: 'من 1% حتى 10% (حسب فئة المنتج)',
    cookie_duration: '24 ساعة (أو 90 يوماً إذا أضاف المنتج للسلة)',
    payout_threshold: '$10 للإيداع المباشر / $100 للشيكات',
    payout_methods: ['تحويل بنكي مباشر', 'بطاقات هدايا أمازون Gift Card', 'شيكات مصرفية'],
    description: 'أشهر وأقدم برنامج تسويق بالعمولة في العالم. يمكنك التسجيل في أمازون السعودية (Amazon.sa)، أمازون الإمارات (Amazon.ae)، أو أمازون الأمريكي والدولي لتحقيق عمولات من ملايين المنتجات الموثوقة.',
    target_regions: ['السعودية', 'الإمارات', 'مصر', 'أمريكا وأوروبا'],
    rating: 4.8,
    is_recommended: true,
    pros: [
      'معدل تحويل (Conversion Rate) مرتفع جداً لثقة المستخدمين في اسم أمازون',
      'تكسب عمولة على أي منتج يشتريه العميل خلال 24 ساعة، حتى لو لم يكن المنتج الذي روجت له!',
      'لوحة تحكم وإحصائيات دقيقة وسهولة توليد الروابط عبر أداة SiteStripe'
    ],
    requirements: [
      'امتلاك موقع ويب أو مدونة أو قناة يوتيوب أو حساب تواصل اجتماعي نشط',
      'تحقيق 3 مبيعات مؤهلة على الأقل خلال أول 180 يوماً من التسجيل لتفعيل الحساب نهائياً'
    ],
    affiliate_signup_url: 'https://affiliate-program.amazon.com/'
  },
  {
    id: 'noon-affiliate',
    name: 'Noon Partners (برنامج عمولة نون)',
    slug: 'noon-affiliate',
    logo_url: 'https://images.unsplash.com/photo-1570857502809-08184874388e?w=128&auto=format&fit=crop&q=80',
    category: 'متاجر تجزئة وإلكترونيات',
    commission_rate: 'تصل إلى 10% لكل طلب، أو عمولة ثابتة (CPA) للكوبونات',
    cookie_duration: '30 يوماً عبر شبكات الإفلييت أو عبر كوبونات الخصم المباشرة',
    payout_threshold: '$50 أو ما يعادلها بالعملة المحلية',
    payout_methods: ['تحويل بنكي في دول الخليج ومصر'],
    description: 'أحد أكبر منصات التجارة الإلكترونية في الشرق الأوسط (السعودية، الإمارات، مصر). يتيح التسويق عبر روابط الإحالة أو عبر منحك كود خصم حصري باسمك تمنحه لمتابعيك، وتكسب عمولة عن كل استخدام.',
    target_regions: ['السعودية', 'الإمارات', 'مصر'],
    rating: 4.7,
    is_recommended: true,
    pros: [
      'نظام أكواد الخصم التابعة المحببة جداً في الخليج والمؤثرين',
      'عروض وتخفيضات يومية قوية (الجمعة الصفراء، عروض رمضان) ترفع أرباحك بشكل هائل',
      'سرعة الشحن (نون إكسبريس) تعزز إتمام الشراء وثقة المشتري'
    ],
    requirements: [
      'جمهور مهتم بالتسوق في السعودية أو الإمارات أو مصر',
      'التسجيل المباشر عبر Noon VIP أو عبر شبكات التسويق المعتمدة مثل ArabClicks أو Admitad'
    ],
    affiliate_signup_url: 'https://www.noon.com/'
  },
  {
    id: 'aliexpress-portals',
    name: 'AliExpress Portals (علي إكسبريس أفلييت)',
    slug: 'aliexpress-portals',
    logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=128&auto=format&fit=crop&q=80',
    category: 'متاجر تجزئة وإلكترونيات',
    commission_rate: 'من 3% حتى 9%، وتصل إلى 50% على المنتجات الترويجية (Hot Products)',
    cookie_duration: '30 يوماً من أول نقرة',
    payout_threshold: '$16 دولار أمريكي',
    payout_methods: ['تحويل بنكي دولي (Wire Transfer)'],
    description: 'المنصة المثالية لترويج المنتجات بأسعار الجملة، الأدوات المنزلية الذكية، والأدوات الإلكترونية والملابس. يضم مئات الملايين من المنتجات مع حوافز أرباح إضافية على المنتجات الأكثر مبيعاً.',
    target_regions: ['جميع دول العالم والوطن العربي'],
    rating: 4.6,
    is_recommended: true,
    pros: [
      'مدة كوكي طويلة تصل إلى 30 يوماً كاملة',
      'أسعار منتجات مغرية جداً تجعل قرار الشراء سهلاً للمستخدمين',
      'روابط مخصصة وأدوات لإنشاء متاجر إفلييت مصغرة وبانرات دعائية'
    ],
    requirements: [
      'موقع إلكتروني أو تطبيق أو صفحات سوشيال ميديا تحتوي على محتوى أصلي'
    ],
    affiliate_signup_url: 'https://portals.aliexpress.com/'
  },
  {
    id: 'shopify-affiliate',
    name: 'Shopify Affiliate & Partners',
    slug: 'shopify-affiliate',
    logo_url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=128&auto=format&fit=crop&q=80',
    category: 'منصات ومواقع سحابية',
    commission_rate: 'مكافأة حتى $150 لكل مشترك تجاري جديد، أو 20% عمولة متكررة',
    cookie_duration: '30 يوماً',
    payout_threshold: '$10 دولار أمريكي',
    payout_methods: ['بايبال (PayPal)', 'تحويل بنكي عبر منصة Impact'],
    description: 'أقوى برامج التسويق بالعمولة للبرمجيات السحابية في العالم. إذا كان جمهورك يريد إطلاق متجر، فإن توجيههم لشوبيفاي عبر رابطك يمنحك عوائد ممتازة ومستمرة.',
    target_regions: ['عالمي'],
    rating: 4.9,
    is_recommended: true,
    pros: [
      'أعلى معدل أرباح وعمولات في فئة منصات التجارة الإلكترونية',
      'إدارة البرنامج عبر شبكة Impact.com العالمية الموثوقة مع دفع مرتين شهرياً',
      'مواد تسويقية احترافية جاهزة وعروض شهر بـ $1 تساعدك في الإقناع السريع'
    ],
    requirements: [
      'موقع أو منصة تقدم شروحات تقنية، تجارة إلكترونية، أو ريادة أعمال',
      'خبرة في استخدام المنصة لتقديم محتوى ذي قيمة'
    ],
    affiliate_signup_url: 'https://www.shopify.com/affiliates'
  },
  {
    id: 'salla-partners',
    name: 'Salla Partners (شركاء سلة)',
    slug: 'salla-partners',
    logo_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=128&auto=format&fit=crop&q=80',
    category: 'منصات ومواقع سحابية',
    commission_rate: '100 إلى 200 ريال سعودي أو 20% عن كل تاجر يرقّي لباقة مدفوعة',
    cookie_duration: '30 يوماً',
    payout_threshold: '100 ريال سعودي',
    payout_methods: ['تحويل مباشر للحساب البنكي السعودي (IBAN)'],
    description: 'برنامج شركاء سلة موجه للمؤثرين، صناع المحتوى التقني، والمطورين في السعودية والخليج لترشيح سلة للتجار وكسب عمولات مجزية بالريال السعودي تدفع مباشرة لحسابك البنكي.',
    target_regions: ['السعودية والخليج العربي'],
    rating: 4.8,
    is_recommended: true,
    pros: [
      'سهولة الإقناع نظراً لأن سلة هي الخيار الأول للتجار في المملكة',
      'دفع العمولات بالريال السعودي مباشرة لحسابك بدون وسطاء أو عمولات تحويل عملة',
      'توفير كوبونات خصم خاصة بمسوقي سلة لجذب التجار'
    ],
    requirements: [
      'حساب تاجر أو شريك في سلة وامتلاك قناة ترويجية موثوقة'
    ],
    affiliate_signup_url: 'https://salla.sa/partners'
  },
  {
    id: 'impact-network',
    name: 'Impact.com (شبكة إمباكت العالمية)',
    slug: 'impact-network',
    logo_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&auto=format&fit=crop&q=80',
    category: 'شبكات تسويق بالعمولة',
    commission_rate: 'متنوع (تصل إلى 30-50% على أدوات SaaS ومتاجر كبرى)',
    cookie_duration: 'تصل إلى 30-90 يوماً حسب العلامة التجارية',
    payout_threshold: '$10 أو ما يعادلها',
    payout_methods: ['تحويل بنكي دولي', 'بايبال', 'Payoneer'],
    description: 'أرقى شبكة تسويق بالعمولة تقنية عالمياً. تدير برامج آلاف الشركات العملاقة مثل Shopify, Adidas, Canva, Envato, Namecheap, SEMrush وغيرها في لوحة تحكم واحدة.',
    target_regions: ['شامل عالمياً'],
    rating: 4.9,
    is_recommended: true,
    pros: [
      'حساب واحد يتيح لك التقدم لآلاف الشركات العالمية والمحلية بنقرة واحدة',
      'نظام تتبع فائق الدقة لا يتأثر بموانع التتبع وحظر الكوكيز',
      'دفعات مالية منتظمة في مواعيد محددة بدقة بالغة'
    ],
    requirements: [
      'موقع إلكتروني ذو حركة مرور أو تواجد رقمي احترافي'
    ],
    affiliate_signup_url: 'https://impact.com/'
  },
  {
    id: 'arabclicks',
    name: 'ArabClicks / Admitad (عرب كليكس)',
    slug: 'arabclicks',
    logo_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80',
    category: 'شبكات تسويق بالعمولة',
    commission_rate: 'من 2% حتى 15% على المتاجر الخليجية والعربية الكبرى',
    cookie_duration: '30 يوماً',
    payout_threshold: '$50',
    payout_methods: ['تحويل بنكي محلي ودولي', 'PayPal'],
    description: 'شبكة تسويق بالعمولة متخصصة بالكامل في أسواق الشرق الأوسط والخليج، تجمع برامج المتاجر الشهيرة: نون، نمشي، سيفي، فارفيتش، فورديل، وغيرها في مكان واحد.',
    target_regions: ['الشرق الأوسط، الخليج، مصر'],
    rating: 4.6,
    is_recommended: false,
    pros: [
      'تركيز كامل على المتاجر والعلامات المفضلة في السوق السعودي والإماراتي',
      'أكواد خصم مخصصة بدون الحاجة لروابط نقر (مناسبة لإنستغرام وسناب وتيك توك)',
      'فريق دعم عربي مخصص لمساعدة المسوقين'
    ],
    requirements: [
      'حسابات سوشيال ميديا نشطة أو موقع يخدم الجمهور العربي'
    ],
    affiliate_signup_url: 'https://www.admitad.com/'
  }
];

export const ECOMMERCE_AI_TOOLS: EcommerceAiTool[] = [
  {
    id: 'pebblely',
    name: 'Pebblely AI',
    slug: 'pebblely',
    logo_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=128&auto=format&fit=crop&q=80',
    category: 'تصوير المنتجات والاستوديو',
    tagline: 'تحويل صور المنتجات العادية إلى صور استوديو إعلانية مبهرة بالذكاء الاصطناعي',
    description: 'أداة ذكاء اصطناعي رائدة للمتاجر الإلكترونية، تقوم بإزالة خلفية صور المنتجات وتوليد خلفيات استوديو إعلانية سينمائية وطبيعية وموضوعية في ثوانٍ معدودة، مما يوفر آلاف الدولارات التي تصرف على جلسات التصوير.',
    pricing: 'خطة مجانية (40 صورة شهرياً) / تبدأ من $19 شهرياً',
    rating: 4.8,
    free_plan: true,
    affiliate_url: 'https://pebblely.com/?via=daleelai',
    key_feature: 'توليد خلفيات متعددة المناسبات (رمضان، عطلات، شواطئ، استوديو فخم) للمنتج نفسه'
  },
  {
    id: 'flair-ai',
    name: 'Flair.ai',
    slug: 'flair-ai',
    logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=128&auto=format&fit=crop&q=80',
    category: 'تصوير المنتجات والاستوديو',
    tagline: 'أداة تصميم جلسات تصوير المنتجات الإعلانية بالذكاء الاصطناعي التوليدي',
    description: 'تتيح سحب وإسقاط منتجاتك في بيئات ثلاثية الأبعاد خيالية، مع تحكم دقيق في الإضاءة، الظلال، وضعيات الكاميرا، وإضافة عناصر تزيين واقعية تناسب العطور، مستحضرات التجميل، والإلكترونيات.',
    pricing: 'خطة مجانية تجريبية / اشتراك محترف $10 شهرياً',
    rating: 4.7,
    free_plan: true,
    affiliate_url: 'https://flair.ai/?ref=daleelai',
    key_feature: 'لوحة عمل ذكية تفاعلية للتحكم في زوايا الإضاءة والظلال الطبيعية للمنتج'
  },
  {
    id: 'chatbase-ecommerce',
    name: 'Chatbase AI',
    slug: 'chatbase',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    category: 'شات بوت وخدمة العملاء',
    tagline: 'شات بوت مبيعات ذكي مدرب على كتالوج متجرك وسياسات التوصيل',
    description: 'يقوم بقراءة رابط متجرك وكتالوج المنتجات وملفات الأسئلة الشائعة وسياسة الإرجاع، ويتحول إلى بائع خبير يرد على استفسارات العملاء بلباقة، ويرشح لهم المنتجات المناسبة ويساعدهم على إتمام الشراء 24/7.',
    pricing: 'تجربة مجانية / تبدأ من $19 شهرياً',
    rating: 4.8,
    free_plan: true,
    affiliate_url: 'https://www.chatbase.co/?via=daleelai',
    key_feature: 'دعم كامل للغة العربية واللهجات والإجابة الدقيقة من معلومات متجرك فقط'
  },
  {
    id: 'tidio-lyro',
    name: 'Tidio (Lyro AI)',
    slug: 'tidio',
    logo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    category: 'شات بوت وخدمة العملاء',
    tagline: 'أتمتة خدمة عملاء المتاجر الإلكترونية وربط المحادثات بواتساب',
    description: 'يجمع بين الدردشة الحية، الشات بوت المدعوم بنموذج Lyro AI، ورسائل واتساب وإنستغرام في لوحة تحكم واحدة، مما يحل حتى 70% من استفسارات العملاء الشائعة فوراً وبدون تدخل بشري.',
    pricing: 'خطة مجانية متاحة / تبدأ من $29 شهرياً',
    rating: 4.7,
    free_plan: true,
    affiliate_url: 'https://www.tidio.com/?ref=daleelai',
    key_feature: 'تتبع حالة الشحن والطلبات آلياً للعميل بمجرد إدخال رقم الطلب'
  },
  {
    id: 'copysmith-ecommerce',
    name: 'Copysmith E-Commerce',
    slug: 'copysmith',
    logo_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=128&auto=format&fit=crop&q=80',
    category: 'كتابة المحتوى والسيو',
    tagline: 'كتابة وتوليد آلاف أوصاف المنتجات وعناوين السيو في دقائق',
    description: 'أداة متخصصة لفرق التجارة الإلكترونية لإعادة صياغة وتوليد أوصاف المنتجات الجذابة المتوافقة مع معايير السيو (SEO)، والربط المباشر مع شوبيفاي وووكومرس لتحديث الكتالوج دفعة واحدة.',
    pricing: 'تبدأ من $19 شهرياً',
    rating: 4.6,
    free_plan: false,
    affiliate_url: 'https://copysmith.ai/?ref=daleelai',
    key_feature: 'توليد أوصاف جماعية (Bulk Product Description Generation) لمئات المنتجات دفعة واحدة'
  },
  {
    id: 'prisync',
    name: 'Prisync',
    slug: 'prisync',
    logo_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&auto=format&fit=crop&q=80',
    category: 'تسعير ومنافسين',
    tagline: 'مراقبة أسعار المنافسين في السوق وتطبيق التسعير الديناميكي الذكي',
    description: 'يقوم بتتبع أسعار المنافسين في متجرك وحساباتهم في المتاجر الأخرى على مدار الساعة، مع إمكانية تعديل أسعارك آلياً وفق قواعد ذكية لضمان بقائك الأفضل سعراً مع حماية هامش الربح.',
    pricing: 'تجربة مجانية 14 يوماً / خطط مخصصة',
    rating: 4.7,
    free_plan: false,
    affiliate_url: 'https://prisync.com/?ref=daleelai',
    key_feature: 'تنبيهات فورية عند تغيير أي منافس لأسعاره وتعديل ذكي لسعر متجرك'
  }
];

export const COUPON_DEALS: CouponDeal[] = [
  {
    id: 'deal-shopify-1',
    title: 'متجر شوبيفاي كامل بـ $1 فقط لأول 3 أشهر',
    brand_name: 'Shopify',
    brand_logo: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=128&auto=format&fit=crop&q=80',
    category: 'منصات المتاجر',
    code: 'SHOPIFY1DOLLAR',
    discount_value: 'اشتراك $1 للشهر بدلاً من $39',
    affiliate_url: 'https://shopify.pxf.io/daleelai',
    is_exclusive: true,
    terms: 'عرض مخصص للتجار الجدد، يشمل خطة Basic'
  },
  {
    id: 'deal-salla-annual',
    title: 'خصم 15% إضافي على باقات سلة السنوية (بلس / برو)',
    brand_name: 'Salla (سلة)',
    brand_logo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=128&auto=format&fit=crop&q=80',
    category: 'منصات المتاجر',
    code: 'DALEELAI',
    discount_value: 'خصم 15% فوري على الفاتورة',
    affiliate_url: 'https://salla.sa/?ref=daleelai',
    is_exclusive: true,
    terms: 'يطبق على أول اشتراك أو ترقية سنوية في منصة سلة'
  },
  {
    id: 'deal-pebblely',
    title: 'خصم 20% على اشتراك تصوير المنتجات الذكي Pebblely',
    brand_name: 'Pebblely AI',
    brand_logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=128&auto=format&fit=crop&q=80',
    category: 'أدوات الذكاء الاصطناعي',
    code: 'AI20COMMERCE',
    discount_value: 'خصم 20% للشهر الأول',
    affiliate_url: 'https://pebblely.com/?via=daleelai',
    is_exclusive: false,
    terms: 'صالح للخطة الشهرية أو السنوية'
  },
  {
    id: 'deal-hostinger-wp',
    title: 'خصم 78% على استضافة ووكومرس فائقة السرعة + دومين مجاني',
    brand_name: 'Hostinger WooCommerce',
    brand_logo: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=128&auto=format&fit=crop&q=80',
    category: 'استضافة ومتاجر',
    code: 'DALEELWP',
    discount_value: 'خصم 78% + 3 أشهر إضافية مجاناً',
    affiliate_url: 'https://hostinger.com/daleelai?discount=DALEELAI',
    is_exclusive: true,
    terms: 'يشمل شهادة أمان SSL مجانية ودومين .com مجاني للسنة الأولى'
  }
];
