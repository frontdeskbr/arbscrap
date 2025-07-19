const { chromium } = require('playwright');
const fetch = require('node-fetch');

(async () => {
    console.log("▶️ Acessando arbitragem.bet...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://arbitragem.bet/', { waitUntil: 'networkidle' });

    await page.fill('input[name="email"]', 'contato.frontdesk@gmail.com');
    await page.fill('input[name="password"]', 'Acesso@01');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);

    console.log("✅ Login feito. Aguardando oportunidades...");
    await page.waitForSelector('.layout-mobile-desktop-and-tablet', { timeout: 20000 });

    const oportunidades = await page.$$eval('.layout-mobile-desktop-and-tablet', (blocos) => {
        return blocos.map((b) => {
            const getText = (sel) => b.querySelector(sel)?.innerText.trim() || '';
            const casas = b.querySelectorAll('.area-bet-home .link-primary');
            const esportes = b.querySelectorAll('.area-bet-home .legenda-2.text-black-50');
            const eventos = b.querySelectorAll('.area-event .text-decoration-underline');
            const descricoes = b.querySelectorAll('.area-event .legenda-2.text-black-50');
            const mercados = b.querySelectorAll('.area-data-market abbr.title');
            const odds = b.querySelectorAll('.area-chance a');

            const item = {
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

            item.id = `${item.evento1}-${item.casa1}-${item.casa2}-${item.mercado1}-${item.odd1}`
                .replace(/\s+/g, '-')
                .toLowerCase();

            return item;
        });
    });

    console.log(`📦 Enviando ${oportunidades.length} oportunidades para o Supabase...`);

    for (const item of oportunidades) {
        await fetch('https://ssrdcsrmifoexueivfls.supabase.co/rest/v1/arbs', {
            method: 'POST',
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcmRjc3JtaWZvZXh1ZWl2ZmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjgxNjM1OCwiZXhwIjoyMDY4MzkyMzU4fQ.8lK6UKsNPh3Ikll53YBbdpmGv0aWQQKuMYk9zsIiK54',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcmRjc3JtaWZvZXh1ZWl2ZmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjgxNjM1OCwiZXhwIjoyMDY4MzkyMzU4fQ.8lK6UKsNPh3Ikll53YBbdpmGv0aWQQKuMYk9zsIiK54',
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(item)
        });
    }

    console.log("✅ Envio finalizado.");
    await browser.close();
})();
