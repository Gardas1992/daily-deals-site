const fs = require('fs');
const path = require('path');
const axios = require('axios');
const day = new Date().toISOString().slice(0, 10);

const AMZ_TOKEN = process.env.AMZ_TOKEN;
const AMZ_TAG = process.env.AMZ_TAG;
const CJ_KEY = process.env.CJ_KEY;
const CJ_WEBSITE = process.env.CJ_WEBSITE;

async function amazonDeals(browseNode) {
  const body = {
    PartnerTag: AMZ_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com',
    Resources: ['Images.Primary.Large','ItemInfo.Title','Offers.Listings.Price'],
    BrowseNode: browseNode,
    Condition: 'New',
    MinPercentageOff: 30
  };
  const { data } = await axios.post('https://webservices.amazon.com/paapi5/getitems', body, {
    headers: { 'x-amz-access-token': AMZ_TOKEN, 'Content-Type': 'application/json' }
  });
  return (data.ItemsResult?.Items || []).slice(0,6).map(i => ({
    title: i.ItemInfo.Title.DisplayValue,
    price: i.Offers.Listings[0].Price.DisplayAmount,
    url: `${i.DetailPageURL}?tag=${AMZ_TAG}`
  }));
}

async function cjDeals(keyword) {
  const { data } = await axios.get('https://product-search.api.cj.com/v2/product-search', {
    params: { 'website-id': CJ_WEBSITE, keywords: keyword, 'low-price': 10 },
    headers: { Authorization: CJ_KEY }
  });
  const list = data?.products?.product || [];
  return list.slice(0,6).map(p => ({
    title: p.name,
    price: `$${p.price}`,
    url: p.buyUrl
  }));
}

function md(niche, items) {
  return `---\ntitle: "${day} ${niche} Deals"\ndate: ${day}\n---\n\n## ${niche} Deals\n\n${items.map(i => `- **${i.title}** — ${i.price}  \\👉 [Buy here](${i.url})`).join('\n')}\n`;
}

(async () => {
  const tech = [...await amazonDeals('172282'), ...await cjDeals('tech')];
  const home = [...await amazonDeals('1055398'), ...await cjDeals('kitchen')];
  if (!fs.existsSync('posts')) fs.mkdirSync('posts');
  fs.writeFileSync(path.join('posts', `${day}-tech.md`), md('Tech', tech));
  fs.writeFileSync(path.join('posts', `${day}-home.md`), md('Home & Kitchen', home));
})();
