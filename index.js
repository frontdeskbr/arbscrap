const { chromium } = require('playwright');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://arbitragem.bet', { waitUntil: 'load' });
    await page.waitForSelector('input.home-input-form[type="email"]', { timeout: 30000 });

    await page.fill('input.home-input-form[type="email"]', 'contato.frontdesk@gmail.com');
    await page.fill('input.home-input-form[type="password"]', 'Acesso@01');
    await page.click('button.home-btn-submit-form');

    await page.waitForSelector('.layout-mobile-desktop-and-tablet', { timeout: 30000 });

    const dados = await page.$$eval('.layout-mobile-desktop-and-tablet', blocos => {
      return blocos.map(b => {
        try {
          const lucro = b.querySelector('.area-profit-desktop .text-success')?.innerText || "";
          const tempo = b.querySelector('span.ps-1.m-0.legenda.text-black-50.default-small-font-size')?.innerText || "";
          const casa1 = b.querySelectorAll('.area-bet-home .link-primary')[0]?.innerText || "";
          const esporte1 = b.querySelectorAll('.area-bet-home .legenda-2.text-black-50')[0]?.innerText || "";
          const casa2 = b.querySelectorAll('.area-bet-home .link-primary')[1]?.innerText || "";
          const esporte2 = b.querySelectorAll('.area-bet-home .legenda-2.text-black-50')[1]?.innerText || "";
          const data = b.querySelectorAll('.area-date-time span')[0]?.innerText || "";
          const hora = b.querySelectorAll('.area-date-time span')[1]?.innerText || "";
          const evento1 = b.querySelectorAll('.area-event .text-decoration-underline')[0]?.innerText || "";
          const desc1 = b.querySelectorAll('.area-event .legenda-2.text-black-50')[0]?.innerText || "";
          const evento2 = b.querySelectorAll('.area-event .text-decoration-underline')[1]?.innerText || "";
          const desc2 = b.querySelectorAll('.area-event .legenda-2.text-black-50')[1]?.innerText || "";
          const mercado1 = b.querySelectorAll('.area-data-market abbr.title')[0]?.innerText || "";
          const odd1 = b.querySelectorAll('.area-chance a')[0]?.innerText || "";
          const link1 = b.querySelectorAll('.area-chance a')[0]?.href || "";
          const mercado2 = b.querySelectorAll('.area-data-market abbr.title')[1]?.innerText || "";
          const odd2 = b.querySelectorAll('.area-chance a')[1]?.innerText || "";
          const link2 = b.querySelectorAll('.area-chance a')[1]?.href || "";

          return {
            lucro, tempo, casa1, esporte1, casa2, esporte2, data, hora,
            evento1, desc1, evento2, desc2, mercado1, odd1, link1,
            mercado2, odd2, link2
          };
        } catch (e) {
          return { erro: 'Erro ao processar bloco' };
        }
      });
    });

    res.json(dados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro geral', detalhes: error.message });
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Rodando em http://localhost:${PORT}`);
});
