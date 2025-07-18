const { chromium } = require('playwright');
const fetch = require('node-fetch');

const SUPABASE_URL = 'https://ssrdcsrmifoexueivfls.supabase.co/rest/v1/arbs';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcmRjc3JtaWZvZXh1ZWl2ZmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjgxNjM1OCwiZXhwIjoyMDY4MzkyMzU4fQ.8lK6UKsNPh3Ikll53YBbdpmGv0aWQQKuMYk9zsIiK54';

(async () => {
  console.log('▶️ Acessando arbitragem.bet...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://arbitragem.bet/nav/arb/prong/0/abcdef/if', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForSelector('.layout-mobile-desktop-and-tablet', { timeout: 20000 });

  const dados = await page.evaluate(() => {
    const blocos = document.querySelectorAll('.layout-mobile-desktop-and-tablet');
    const oportunidades = [];

    blocos.forEach(b => {
      try {
        const lucro = b.querySelector('.area-profit-desktop .text-success')?.innerText.trim() || "";
        const tempo = b.querySelector('span.ps-1.m-0.legenda.text-black-50.default-small-font-size')?.innerText.trim() || "";

        const casas = b.querySelectorAll('.area-bet-home .link-primary');
        const casa1 = casas[0]?.innerText.trim() || "";
        const casa2 = casas[1]?.innerText.trim() || "";

        const esportes = b.querySelectorAll('.area-bet-home .legenda-2.text-black-50');
        const esporte1 = esportes[0]?.innerText.trim() || "";
        const esporte2 = esportes[1]?.innerText.trim() || "";

        const data = b.querySelectorAll('.area-date-time span')[0]?.innerText.trim() || "";
        const hora = b.querySelectorAll('.area-date-time span')[1]?.innerText.trim() || "";

        const eventos = b.querySelectorAll('.area-event .text-decoration-underline');
        const evento1 = eventos[0]?.innerText.trim() || "";
        const evento2 = eventos[1]?.innerText.trim() || "";

        const descricoes = b.querySelectorAll('.area-event .legenda-2.text-black-50');
        const descEv1 = descricoes[0]?.innerText.trim() || "";
        const descEv2 = descricoes[1]?.innerText.trim() || "";

        const mercados = b.querySelectorAll('.area-data-market abbr.title');
        const mercado1 = mercados[0]?.innerText.trim() || "";
        const mercado2 = mercados[1]?.innerText.trim() || "";

        const odds = b.querySelectorAll('.area-chance a');
        const odd1 = odds[0]?.innerText.trim() || "";
        const odd2 = odds[1]?.innerText.trim() || "";

        const linkCasa1 = odds[0]?.href || "";
        const linkCasa2 = odds[1]?.href || "";

        oportunidades.push({
          data_scrap: new Date().toISOString(),
          lucro,
          tempo,
          casa1,
          esporte1,
          casa2,
          esporte2,
          data,
          hora,
          evento1,
          descEv1,
          evento2,
          descEv2,
          mercado1,
          odd1,
          mercado2,
          odd2,
          linkCasa1,
          linkCasa2
        });
      } catch (e) {
        console.warn("Erro ao processar bloco", e);
      }
    });

    return oportunidades;
  });

  for (const item of dados) {
    item.id = `${item.evento1}-${item.casa1}-${item.casa2}-${item.mercado1}-${item.odd1}`.replace(/\s+/g, '-').toLowerCase();

    try {
      const res = await fetch(SUPABASE_URL, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify([item])
      });

      const json = await res.json();
      console.log('✅ Enviado para Supabase:', item.id);
    } catch (e) {
      console.error('❌ Erro ao enviar para Supabase:', e);
    }
  }

  await browser.close();
})();
