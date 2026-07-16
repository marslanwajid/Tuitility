const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// 1. Path to your service account key file
const KEY_FILE = path.join(__dirname, 'service_account.json');
// 2. Fetch sitemap URLs
const SITEMAP_URL = 'https://tuitility.vercel.app/sitemap.xml';
// 3. Path to keep track of already submitted URLs
const PROGRESS_FILE = path.join(__dirname, 'indexing-progress.json');

if (!fs.existsSync(KEY_FILE)) {
  console.log('\n========================================================================');
  console.log('Error: "service_account.json" not found in the scripts folder.');
  console.log('------------------------------------------------------------------------');
  console.log('To set up Google Indexing API, please follow these steps:');
  console.log('1. Go to Google Cloud Console (https://console.cloud.google.com).');
  console.log('2. Create a new project and enable the "Web Search Indexing API".');
  console.log('3. Go to IAM & Admin > Service Accounts.');
  console.log('4. Create a Service Account, generate a JSON Key, and download it.');
  console.log(`5. Save that downloaded JSON file as:`);
  console.log(`   ${KEY_FILE}`);
  console.log('6. Copy the service account email (ends with .gserviceaccount.com).');
  console.log('7. Go to Google Search Console > Settings > Users and Permissions.');
  console.log('8. Add the service account email as an OWNER of the property.');
  console.log('========================================================================\n');
  process.exit(1);
}

// Helper to load already submitted URLs
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

// Helper to save submitted URL state
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
}

async function getUrlsFromSitemap() {
  try {
    console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
    const response = await fetch(SITEMAP_URL);
    const text = await response.text();
    
    // Regex to extract location strings
    const urlRegex = /<loc>(https?:\/\/[^\s<>]+)<\/loc>/g;
    const urls = [];
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      urls.push(match[1]);
    }
    return urls;
  } catch (error) {
    console.error('Error fetching/parsing sitemap:', error.message);
    process.exit(1);
  }
}

async function main() {
  const urls = await getUrlsFromSitemap();
  console.log(`Found ${urls.length} URLs in sitemap.`);

  const progress = loadProgress();
  const pendingUrls = urls.filter(url => !progress[url]);

  console.log(`Already submitted in previous runs: ${urls.length - pendingUrls.length}`);
  console.log(`Pending submission: ${pendingUrls.length}`);

  if (pendingUrls.length === 0) {
    console.log('All URLs are already indexed/submitted! To reset progress, delete scripts/indexing-progress.json');
    return;
  }

  // Load client credentials
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  
  const client = await auth.getClient();

  console.log('Starting Google Indexing API submissions (Daily Limit: ~100 URLs)...');
  
  let successCount = 0;
  let quotaExceeded = false;

  for (const url of pendingUrls) {
    if (quotaExceeded) {
      console.log(`Skipping (Daily quota exceeded): ${url}`);
      continue;
    }

    try {
      const response = await google.indexing({
        version: 'v3',
        auth: client,
      }).urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_UPDATED',
        },
      });
      
      console.log(`✓ Submitted successfully: ${url}`);
      progress[url] = {
        submittedAt: new Date().toISOString(),
        success: true
      };
      saveProgress(progress);
      successCount++;
    } catch (error) {
      const errMsg = error.response?.data?.error?.message || error.message;
      console.error(`✗ Failed to submit: ${url} | Reason: ${errMsg}`);
      
      if (errMsg.includes('Quota exceeded') || error.response?.status === 429) {
        quotaExceeded = true;
        console.log('\n[!] Daily API quota limit hit. Resuming submissions tomorrow.');
      }
    }
    // Respect API quotas by sleeping for 250ms between requests
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  
  console.log(`\nAll operations completed. Successfully submitted ${successCount} new URLs.`);
}

main();
