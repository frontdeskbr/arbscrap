const { chromium } = require('playwright');
const fetch = require('node-fetch');
const fs = require('fs');

// Supabase configs
const SUPABASE_URL = 'https://ssrdcsrmifoexueivfls.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcmRjc3JtaWZvZXh1ZWl2ZmxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjgxNjM1OCwiZXhwIjoyMDY4MzkyMzU4fQ.8lK6UKsNPh3Ikll53YBbdpmGv0aWQQKuMYk9zsIiK54';

(async () => {
    console.log('▶️ Acessando arbitragem.bet...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    // Carrega cookies
    const cookies = JSON.parse(fs.readFileSync('./cookies.json', 'utf-8'));
    await context.addCookies(cookies);

    const page = await context.newPage();
    await page.goto('https://arbitragem.bet/', { waitUntil: 'domcontentloaded' });

    // Espera o seletor com timeout seguro
    await page.waitForSelector('.layout-mobile-desktop-and-tablet', { timeout: 20000 });

    // Extrai os dados
    const oportunidades = await page.$$eval('.layout-mobile-desktop-and-tablet', (blocos) => {
        return blocos.map((b) => {
            const get = (sel) => b.querySelector(sel)?.innerText.trim() || '';
            const casas = b.querySelectorAll('.area-bet-home .link-primary');
            const esportes = b.querySelectorAll('.area-bet-home .legenda-2.text-black-50');
            const eventos = b.querySelectorAll('.area-event .text-decoration-underline');
            const descricoes = b.querySelectorAll('.area-event .legenda-2.text-black-50');
            const mercados = b.querySelectorAll('.area-data-market abbr.title');
            const odds = b.querySelectorAll('.area-chance a');

            return {
                lucro: get('.area-profit-desktop .text-success'),
                tempo: get('span.ps-1.m-0.legenda.text-black-50.default-small-font-size'),
                casa1: casas[0]?.innerText.trim() || '',
                esporte1: esportes[0]?.innerText.trim() || '',
                casa2: casas[1]?.innerText.trim() || '',
                esporte2: esportes[1]?.innerText.trim() || '',
                data: get('.area-date-time span:first-child'),
                hora: get('.area-date-time span:nth-child(2)'),
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

    for (const item of oportunidades) {
        // Cria um ID único para evitar duplicação
        item.id = `${item.evento1}-${item.casa1}-${item.casa2}-${item.mercado1}-${item.odd1}`.replace(/\s+/g, '-').toLowerCase();

        try {
            await fetch(`${SUPABASE_URL}/rest/v1/arbs`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    Prefer: 'resolution=merge-duplicates'
                },
                body: JSON.stringify(item)
            });
            console.log('✅ Enviado:', item.id);
        } catch (e) {
            console.error('❌ Erro ao enviar:', item.id, e.message);
        }
    }

    await browser.close();
    console.log(`✅ ${oportunidades.length} oportunidades processadas`);
})();
