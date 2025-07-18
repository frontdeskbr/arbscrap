const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://arbitragem.bet', { timeout: 60000 });

  // Login
  await page.fill('input[type="email"]', 'SEU_EMAIL_AQUI');
  await page.fill('input[type="password"]', 'SUA_SENHA_AQUI');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  // Espera carregamento
  await page.waitForSelector('.layout-mobile-desktop-and-tablet', { timeout: 20000 });

  const oportunidades = await page.evaluate(() => {
    const blocos = document.querySelectorAll('.layout-mobile-desktop-and-tablet');
    return Array.from(blocos).map(b => {
      const lucro = b.querySelector('.area-profit-desktop .text-success')?.innerText || '';
      const evento = b.querySelector('.area-event .text-decoration-underline')?.innerText || '';
      return { lucro, evento };
    });
  });

  console.log("✅ Oportunidades:", oportunidades);
  await browser.close();
})();