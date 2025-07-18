const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log("▶️ Acessando arbitragem.bet...");
  await page.goto('https://arbitragem.bet/', { waitUntil: 'networkidle' });

  // Login
  await page.fill('input[name="email"]', 'contato.frontdesk@gmail.com');
  await page.fill('input[name="password"]', 'Acesso@01');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click('button[type="submit"]')
  ]);

  await page.waitForTimeout(3000);

  console.log("✅ Login feito. Aguardando oportunidades...");
  await page.waitForSelector('.layout-mobile-desktop-and-tablet', { timeout: 20000 });

  const oportunidades = await page.$$eval('.layout-mobile-desktop-and-tablet', (blocos) => {
    return Array.from(blocos).map((b) => {
      const getText = (sel) => b.querySelector(sel)?.innerText.trim() || '';
      const casas = b.querySelectorAll('.area-bet-home .link-primary');
      const esportes = b.querySelectorAll('.area-bet-home .legenda-2.text-black-50');
      const eventos = b.querySelectorAll('.area-event .text-decoration-underline');
      const descricoes = b.querySelectorAll('.area-event .legenda-2.text-black-50');
      const mercados = b.querySelectorAll('.area-data-market abbr.title');
      const odds = b.querySelectorAll('.area-chance a');

      return {
        lucro: getText('.area-profit-desktop .text-success'),
        tempo: getText('span.ps-1.m-0.legenda.text-black-50.default-small-font-size'),
        esporte1: esportes[0]?.innerText.trim() || '',
        casa1: casas[0]?.innerText.trim() || '',
        casa2: casas[1]?.innerText.trim() || '',
        esporte2: esportes[1]?.innerText.trim() || '',
        data: getText('.area-date-time span:first-child'),
        hora: getText('.area-date-time span:nth-child(2)'),
        evento1: eventos[0]?.innerText.trim() || '',
        descEv1: descricoes[0]?.innerText.trim() || '',
        evento2: eventos[1]?.innerText.trim() || '',
        descEv2: descricoes[1]?.innerText.trim() || '',
        mercado1: mercados[0]?.innerText.trim() || '',
        odd1: odds[0]?.innerText.trim() || '',
        mercado2: mercados[1]?.innerText.trim() || '',
        odd2: odds[1]?.innerText.trim() || '',
        linkCasa1: odds[0]?.href || '',
        linkCasa2: odds[1]?.href || '',
      };
    });
  });

  console.log(`✅ ${oportunidades.length} oportunidades salvas:`);
  console.log(oportunidades);

  await browser.close();
})();
