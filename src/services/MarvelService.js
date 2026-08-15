import { useHttp } from "../hooks/http.hook";

/**
 * Data sources.
 *
 * The official Marvel API (gateway.marvel.com) went down and answers 5xx to
 * everything — including requests with no key at all, which a healthy API
 * rejects with 409. Nothing in this app could work around that, so it now
 * reads from two public, keyless, CORS-enabled sources instead:
 *
 *  - characters: akabab/superhero-api, a static JSON dataset. 563 heroes, of
 *    which 269 are published by Marvel Comics — those are the ones shown here.
 *  - comics: the Open Library search API.
 *
 * Neither needs an API key or a registered referrer.
 */
const HEROES_URL = "https://akabab.github.io/superhero-api/api/all.json";
const OPENLIBRARY_URL = "https://openlibrary.org";
const COMICS_QUERY = "marvel comics";
const PUBLISHER = "Marvel Comics";

const CHARACTERS_PER_PAGE = 9;
const COMICS_PER_PAGE = 8;

// The hero dataset is one 900 KB file, so it is fetched once per session and
// then paged in memory. The old version made a request per character click.
let heroesCache = null;
let heroesRequest = null;

const coverUrl = (coverId, size = "M") =>
  coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null;

const useMarvelService = () => {
  const { loading, request, error, clearError } = useHttp();

  const loadHeroes = async () => {
    if (heroesCache) return heroesCache;

    if (!heroesRequest) {
      heroesRequest = request(HEROES_URL)
        .then((all) => {
          heroesCache = all
            .filter((hero) => hero.biography?.publisher === PUBLISHER)
            .sort((a, b) => a.name.localeCompare(b.name));
          return heroesCache;
        })
        .catch((e) => {
          // Let the next attempt retry instead of caching the failure.
          heroesRequest = null;
          throw e;
        });
    }

    return heroesRequest;
  };

  const getAllCharacters = async (offset = 0) => {
    const heroes = await loadHeroes();
    return heroes
      .slice(offset, offset + CHARACTERS_PER_PAGE)
      .map(_transformCharacter);
  };

  const getCharacter = async (id) => {
    const heroes = await loadHeroes();
    const hero = heroes.find((item) => item.id === Number(id));
    if (!hero) throw new Error(`Character ${id} not found`);
    return _transformCharacter(hero);
  };

  const getRandomCharacter = async () => {
    const heroes = await loadHeroes();
    const hero = heroes[Math.floor(Math.random() * heroes.length)];
    return _transformCharacter(hero);
  };

  const getAllComics = async (offset = 0) => {
    const params = new URLSearchParams({
      q: COMICS_QUERY,
      limit: String(COMICS_PER_PAGE),
      offset: String(offset),
      fields:
        "key,title,author_name,first_publish_year,cover_i,number_of_pages_median,edition_count",
    });
    const res = await request(`${OPENLIBRARY_URL}/search.json?${params}`);
    return res.docs.map(_transformComics);
  };

  const getComic = async (id) => {
    const work = await request(`${OPENLIBRARY_URL}/works/${id}.json`);
    return _transformWork(id, work);
  };

  const _transformCharacter = (hero) => {
    const { biography = {}, appearance = {}, work = {}, connections = {} } = hero;

    const facts = [
      biography.fullName && biography.fullName !== hero.name
        ? `Real name: ${biography.fullName}.`
        : null,
      appearance.race && appearance.race !== "null"
        ? `Race: ${appearance.race}.`
        : null,
      biography.firstAppearance && biography.firstAppearance !== "-"
        ? `First appearance: ${biography.firstAppearance}.`
        : null,
      work.occupation && work.occupation !== "-"
        ? `Occupation: ${work.occupation}.`
        : null,
      connections.groupAffiliation && connections.groupAffiliation !== "-"
        ? `Affiliation: ${connections.groupAffiliation}`
        : null,
    ].filter(Boolean);

    return {
      id: hero.id,
      name: hero.name,
      description: facts.length
        ? facts.join(" ")
        : "There is no description for this character",
      thumbnail: hero.images?.md,
      alignment: biography.alignment,
      // The dataset carries no official links, so these search the two places
      // a reader would actually look the character up.
      homepage: `https://www.marvel.com/search?query=${encodeURIComponent(hero.name)}`,
      wiki: `https://marvel.fandom.com/wiki/Special:Search?query=${encodeURIComponent(hero.name)}`,
      powerstats: Object.entries(hero.powerstats || {}).map(([name, value]) => ({
        name,
        value: typeof value === "number" ? value : 0,
      })),
    };
  };

  const _transformComics = (doc) => ({
    id: doc.key.replace("/works/", ""),
    title: doc.title,
    description: doc.author_name ? doc.author_name.join(", ") : "Unknown author",
    thumbnail: coverUrl(doc.cover_i),
    year: doc.first_publish_year || "—",
    pageCount: doc.number_of_pages_median
      ? `${doc.number_of_pages_median} p.`
      : "No information about the number of pages",
    editions: doc.edition_count,
  });

  const _transformWork = (id, work) => {
    const description =
      typeof work.description === "string"
        ? work.description
        : work.description?.value;

    return {
      id,
      title: work.title,
      // Subjects are rendered on their own line, so they must not double as
      // the description too.
      description: description || "There is no description for this edition",
      thumbnail: coverUrl(work.covers?.[0], "L"),
      subjects: work.subjects?.slice(0, 6) || [],
    };
  };

  return {
    loading,
    error,
    clearError,
    getAllCharacters,
    getCharacter,
    getRandomCharacter,
    getAllComics,
    getComic,
  };
};

export default useMarvelService;
