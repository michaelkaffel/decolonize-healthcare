// Run from repo root: node scripts/patch-article-images.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'content/articles';

const images = {
  'pathological-normativity-theory':
    '/images/articles/pathological-normativity-theory.png',
  'the-power-of-sound-and-energy-healing':
    '/images/articles/the-power-of-sound-and-energy-healing.jpg',
  'borderline-personality-disorder':
    '/images/articles/borderline-personality-disorder.jpg',
  'acupuncture-for-migraine-relief':
    '/images/articles/acupuncture-for-migraine-relief.png',
  'ancient-wisdom-meets-modern-science':
    '/images/articles/ancient-wisdom-meets-modern-science.jpg',
  'dissociative-identity-disorder':
    '/images/articles/dissociative-identity-disorder.jpg',
  'chinese-medicine-for-metabolic-disorders':
    '/images/articles/chinese-medicine-for-metabolic-disorders.jpg',
  'adhd-your-misunderstood-superpower':
    '/images/articles/adhd-your-misunderstood-superpower.jpg',
  'understanding-empty-heat-in-chinese-medicine':
    '/images/articles/understanding-empty-heat-in-chinese-medicine.jpg',
  'mental-health-effects-of-vision-issues':
    '/images/articles/mental-health-effects-of-vision-issues.jpg',
  'dance-the-ancient-solution-for-modern-mental-health':
    '/images/articles/dance-the-ancient-solution-for-modern-mental-health.jpg',
  'a-whole-lotta-nada':
    '/images/articles/a-whole-lotta-nada.jpg',
  'losing-your-mind-get-it-back':
    '/images/articles/losing-your-mind-get-it-back.jpg',
};

for (const [slug, url] of Object.entries(images)) {
  const path = join(dir, `${slug}.md`);
  const content = readFileSync(path, 'utf8');
  // Replace either an empty coverImage or an existing Wix CDN URL
  const patched = content.replace(/coverImage: ".*?"/, `coverImage: "${url}"`);
  writeFileSync(path, patched, 'utf8');
  console.log(`patched ${slug}`);
}

console.log('\nDone — all 13 articles updated with local image paths.');