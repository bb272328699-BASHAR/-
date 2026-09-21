import fs from 'fs';
import path from 'path';
import { generateSitemapXml } from '../src/server/services/sitemapService.ts';

async function main() {
  console.log('Generating static sitemap.xml for static exports and Netlify...');
  try {
    const targetDomain = process.env.SITE_URL || 'ai-toolsar.netlify.app';
    const { xml, count, summary } = await generateSitemapXml(targetDomain);
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml, 'utf8');
    console.log(`Successfully generated public/sitemap.xml with ${count} URLs using domain: ${targetDomain}`);
    console.log('Summary Breakdown:', JSON.stringify(summary.breakdown, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Failed to generate static sitemap:', err);
    process.exit(1);
  }
}

main();
