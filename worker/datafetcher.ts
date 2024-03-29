import { load as LoadHtml } from "cheerio";

async function getHtml(url: string) {
  const response = await fetch(url);
  const data = await response.text();

  return data;
}

async function getCategories() {
  const $ = LoadHtml(
    await getHtml("https://rnm.franceagrimer.fr/prix?SAINOMPRODUIT")
  );

  const cats = $(".signet_A")
    .map((_, e) => {
      return $(e).attr("href");
    })
    .toArray();

  return cats;
}

async function getFoods(category: string) {
  const $ = LoadHtml(await getHtml("https://rnm.franceagrimer.fr/" + category));

  const foods = $(".listunproduit > a")
    .map((_, e) => {
      return {
        id: $(e).attr("href")!,
        name: $(e).text(),
      };
    })
    .toArray();

  return foods;
}

export default async function rnm() {
  const categories = await getCategories();

  const foods = (
    await Promise.all(categories.map((cat) => getFoods(cat)))
  ).flat();

  return foods;
}

Bun.write("data.json", JSON.stringify((await rnm()).map((f) => f.name)));
