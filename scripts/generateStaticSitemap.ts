import { generateDynamicSitemap } from '../src/utils/sitemapGenerator.ts';

async function main() {
  console.log('🚀 Generating dynamic sitemap.xml querying PostgreSQL database...');
  try {
    const targetDomain = process.env.SITE_URL || 'https://ai-toolsar.netlify.app';
    const result = await generateDynamicSitemap({ domain: targetDomain });
    console.log(`✅ Successfully generated ${result.outputPath} with ${result.totalUrls} indexable URLs.`);
    console.log('Breakdown:', JSON.stringify(result.breakdown, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to generate sitemap.xml:', err);
    process.exit(1);
  }
}

main();
