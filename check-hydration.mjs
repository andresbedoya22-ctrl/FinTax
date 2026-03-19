import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });

  try {
    await page.goto("http://localhost:3000/en", { waitUntil: "networkidle0" });
    console.log("Page loaded. Check output above for hydration errors.");
  } catch(e) {
    console.error("Navigation failed:", e);
  }
  
  await browser.close();
})();
