import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

function normalizeMeal(meal) {
  const ingredients = [];

  for (let index = 1; index <= 20; index += 1) {
    const value = meal[`strIngredient${index}`]?.trim();
    if (value) {
      ingredients.push(value);
    }
  }

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory || 'Uncategorized',
    area: meal.strArea || 'Unknown',
    image: meal.strMealThumb,
    instructions: meal.strInstructions || 'No instructions available.',
    ingredients: ingredients.slice(0, 6)
  };
}

function getInitialTheme() {
  const storedTheme = localStorage.getItem('recipefinder-theme');
  if (storedTheme === 'dark') {
    return true;
  }
  if (storedTheme === 'light') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getInitialFavorites() {
  const storedFavorites = localStorage.getItem('recipefinder-favorites');
  if (!storedFavorites) {
    return [];
  }

  try {
    return JSON.parse(storedFavorites);
  } catch {
    return [];
  }
}

function toIngredientSlug(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '_');
}

function getMealThumb(url, size) {
  if (!url) {
    return '';
  }
  if (size === 'original') {
    return url;
  }
  return `${url}/${size}`;
}

function getIngredientThumb(name, size) {
  const slug = toIngredientSlug(name);
  if (!slug) {
    return '';
  }
  if (size === 'original') {
    return `https://www.themealdb.com/images/ingredients/${slug}.png`;
  }
  return `https://www.themealdb.com/images/ingredients/${slug}-${size}.png`;
}

export default function App() {
  const [mode, setMode] = useState('name');
  const [queryInput, setQueryInput] = useState('Arrabiata');
  const [category, setCategory] = useState('All');
  const [areaFilter, setAreaFilter] = useState('Canadian');
  const [ingredientFilter, setIngredientFilter] = useState('chicken_breast');
  const [showFilters, setShowFilters] = useState(false);
  const [showApiRequest, setShowApiRequest] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [lastEndpoint, setLastEndpoint] = useState(`${API_BASE}/search.php?s=Arrabiata`);
  const [isDark, setIsDark] = useState(getInitialTheme);
  const [favoriteIds, setFavoriteIds] = useState(getInitialFavorites);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchRecipes(endpointPath) {
    const endpoint = `${API_BASE}${endpointPath}`;
    setLoading(true);
    setError('');
    setLastEndpoint(endpoint);

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Unable to load recipes right now.');
      }

      const data = await response.json();
      const nextRecipes = (data.meals || []).map(normalizeMeal);
      setRecipes(nextRecipes);
    } catch (fetchError) {
      setRecipes([]);
      setError(fetchError.message || 'Something went wrong while fetching recipes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecipes('/search.php?s=Arrabiata');
    // Run once on first load with default endpoint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchLists() {
      try {
        const [categoryRes, areaRes, ingredientRes] = await Promise.all([
          fetch(`${API_BASE}/list.php?c=list`),
          fetch(`${API_BASE}/list.php?a=list`),
          fetch(`${API_BASE}/list.php?i=list`)
        ]);

        if (!categoryRes.ok || !areaRes.ok || !ingredientRes.ok) {
          throw new Error('Unable to load list data.');
        }

        const [categoryData, areaData, ingredientData] = await Promise.all([
          categoryRes.json(),
          areaRes.json(),
          ingredientRes.json()
        ]);

        const categoryNames = (categoryData.meals || []).map((item) => item.strCategory).filter(Boolean);
        const areaNames = (areaData.meals || []).map((item) => item.strArea).filter(Boolean);
        const ingredientNames = (ingredientData.meals || []).map((item) => item.strIngredient).filter(Boolean);

        setAllCategories(categoryNames);
        setAllAreas(areaNames);
        setAllIngredients(ingredientNames);

        if (areaNames.length > 0 && !areaNames.includes(areaFilter)) {
          setAreaFilter(areaNames[0]);
        }

        const ingredientSlugs = ingredientNames.map((name) => toIngredientSlug(name));
        if (ingredientSlugs.length > 0 && !ingredientSlugs.includes(ingredientFilter)) {
          setIngredientFilter(ingredientSlugs[0]);
        }
      } catch {
        setAllCategories([]);
        setAllAreas([]);
        setAllIngredients([]);
      }
    }

    fetchLists();
    // Run once for list endpoints.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('recipefinder-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('recipefinder-favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const categories = useMemo(() => {
    if (allCategories.length > 0) {
      return ['All', ...allCategories];
    }
    const unique = new Set(recipes.map((recipe) => recipe.category));
    return ['All', ...unique];
  }, [allCategories, recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => category === 'All' || recipe.category === category);
  }, [category, recipes]);

  const favoriteRecipes = useMemo(() => {
    return recipes.filter((recipe) => favoriteIds.includes(recipe.id));
  }, [favoriteIds, recipes]);

  function toggleFavorite(id) {
    setFavoriteIds((current) =>
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id]
    );
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const value = queryInput.trim();

    if (mode === 'name') {
      if (!value) {
        return;
      }
      fetchRecipes(`/search.php?s=${encodeURIComponent(value)}`);
      return;
    }

    if (mode === 'letter') {
      if (!value) {
        return;
      }
      fetchRecipes(`/search.php?f=${encodeURIComponent(value.slice(0, 1).toLowerCase())}`);
      return;
    }

    if (mode === 'id') {
      if (!value) {
        return;
      }
      fetchRecipes(`/lookup.php?i=${encodeURIComponent(value)}`);
      return;
    }

    fetchRecipes('/random.php');
  }

  function handleApplyIngredientFilter() {
    if (!ingredientFilter) {
      return;
    }
    fetchRecipes(`/filter.php?i=${encodeURIComponent(ingredientFilter)}`);
    setShowFilters(false);
  }

  function handleApplyAreaFilter() {
    if (!areaFilter) {
      return;
    }
    fetchRecipes(`/filter.php?a=${encodeURIComponent(areaFilter)}`);
    setShowFilters(false);
  }

  function currentInputLabel() {
    if (mode === 'letter') {
      return 'First Letter';
    }
    if (mode === 'id') {
      return 'Meal ID';
    }
    if (mode === 'random') {
      return 'Random';
    }
    return 'Meal Name';
  }

  return (
    <main className="min-h-screen bg-[#121212] px-4 py-8 text-[#FFFFFF] transition-colors">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-xl border border-[#3A3A42] bg-[#1E1E24] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A0A0A5]">Recipe Finder</p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[#FFFFFF] md:text-5xl">Discover real meals in seconds</h1>
              <p className="mt-3 max-w-2xl text-base text-[#A0A0A5] md:text-lg">
                Search by meal name, first letter, meal id, or jump to something random with a focused, clutter-free experience.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDark((current) => !current)}
              className="rounded-full border border-[#3A3A42] bg-[#121212] p-2 text-[#A0A0A5] transition hover:border-[#FCA311] hover:text-[#FFFFFF]"
              aria-label="Toggle color mode"
            >
              {isDark ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3c0 0 0 0 0 0A7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 grid gap-3 rounded-xl border border-[#3A3A42] bg-[#121212] p-3 md:grid-cols-[190px_1fr_190px_140px]"
          >
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              className="h-12 rounded-lg border border-[#3A3A42] bg-[#1E1E24] px-3 text-sm font-medium text-[#FFFFFF] outline-none focus:border-[#FCA311]"
            >
              <option value="name">Search by Name</option>
              <option value="letter">By First Letter</option>
              <option value="id">Lookup by ID</option>
              <option value="random">Random Meal</option>
            </select>

            <input
              type="text"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              disabled={mode === 'random'}
              placeholder={mode === 'random' ? 'Random meal does not require input' : `Enter ${currentInputLabel()}`}
              className="h-12 rounded-lg border border-[#3A3A42] bg-[#1E1E24] px-4 text-sm text-[#FFFFFF] outline-none placeholder:text-[#A0A0A5] focus:border-[#FCA311] disabled:opacity-60"
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-12 rounded-lg border border-[#3A3A42] bg-[#1E1E24] px-3 text-sm font-medium text-[#FFFFFF] outline-none focus:border-[#FCA311]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button type="submit" className="h-12 rounded-lg bg-[#FCA311] px-5 text-sm font-bold text-[#121212] transition hover:brightness-110">
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="rounded-lg border border-[#3A3A42] bg-[#121212] px-4 py-2 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#FCA311]"
            >
              Filters
            </button>
            <button
              type="button"
              onClick={() => setShowApiRequest((current) => !current)}
              className="text-sm text-[#A0A0A5] underline decoration-[#3A3A42] underline-offset-4 hover:text-[#FFFFFF]"
            >
              {showApiRequest ? 'Hide API Request' : 'View API Request'}
            </button>
          </div>

          {showApiRequest ? (
            <pre className="mt-3 overflow-x-auto rounded-lg border border-[#3A3A42] bg-[#121212] px-3 py-2 text-xs text-[#A0A0A5]">
              {lastEndpoint}
            </pre>
          ) : null}
        </header>

        <section className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.slice(0, 14).map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'border-[#FCA311] bg-[#FCA311]/10 text-[#FFFFFF]'
                      : 'border-[#3A3A42] bg-[#1E1E24] text-[#A0A0A5] hover:border-[#FCA311] hover:text-[#FFFFFF]'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-[#3A3A42] bg-[#1E1E24] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A0A0A5]">Saved Meals</p>
          <p className="mt-2 text-sm text-[#A0A0A5]">
            {favoriteRecipes.length > 0
              ? `${favoriteRecipes.length} saved: ${favoriteRecipes
                  .slice(0, 3)
                  .map((recipe) => recipe.name)
                  .join(', ')}`
              : 'No favorites yet. Save a meal from the grid below.'}
          </p>
        </section>

        {loading ? (
          <div className="rounded-xl border border-[#3A3A42] bg-[#1E1E24] p-8 text-center text-lg font-medium text-[#FFFFFF]">
            Loading recipes...
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-xl border border-red-800/60 bg-red-900/30 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        {!loading && !error ? (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => {
                const isFavorite = favoriteIds.includes(recipe.id);
                return (
                  <article
                    key={recipe.id}
                    className="overflow-hidden rounded-xl border border-[#3A3A42] bg-[#1E1E24] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(0,0,0,0.45)]"
                  >
                    <img
                      src={getMealThumb(recipe.image, 'medium')}
                      alt={recipe.name}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        if (event.currentTarget.dataset.fallback === 'done') {
                          return;
                        }
                        event.currentTarget.dataset.fallback = 'done';
                        event.currentTarget.src = recipe.image;
                      }}
                    />
                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-xl font-bold text-[#FFFFFF]">{recipe.name}</h2>
                          <p className="mt-1 text-xs text-[#A0A0A5]">
                            {(recipe.category || 'Meal')} {recipe.area ? `• ${recipe.area}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(recipe.id)}
                          className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
                            isFavorite
                              ? 'border-[#FCA311] bg-[#FCA311]/20 text-[#FFFFFF]'
                              : 'border-[#3A3A42] text-[#A0A0A5] hover:border-[#FCA311] hover:text-[#FFFFFF]'
                          }`}
                        >
                          {isFavorite ? 'Saved' : 'Save'}
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {recipe.ingredients.map((ingredient) => (
                          <div
                            key={`${recipe.id}-${ingredient}`}
                            className="flex items-center gap-2 rounded-md border border-[#3A3A42] bg-[#121212] px-2 py-1 text-xs font-medium text-[#A0A0A5]"
                          >
                            <img
                              src={getIngredientThumb(ingredient, 'small')}
                              alt={ingredient}
                              className="h-4 w-4 rounded-full bg-[#1E1E24] object-cover"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                              }}
                            />
                            <span>{ingredient}</span>
                          </div>
                        ))}
                      </div>

                      <p className="mt-4 max-h-24 overflow-hidden text-sm leading-relaxed text-[#A0A0A5]">
                        {recipe.instructions}
                      </p>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-full rounded-xl border border-[#3A3A42] bg-[#1E1E24] p-10 text-center">
                <p className="text-lg font-semibold text-[#FFFFFF]">No recipes found for this filter</p>
                <p className="mt-1 text-[#A0A0A5]">Try a different keyword, category, area, or ingredient.</p>
              </div>
            )}
          </section>
        ) : null}

        {showFilters ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-xl rounded-xl border border-[#3A3A42] bg-[#1E1E24] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#FFFFFF]">Advanced Filters</h2>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="rounded-lg border border-[#3A3A42] px-3 py-1 text-sm text-[#A0A0A5] hover:border-[#FCA311] hover:text-[#FFFFFF]"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="area-filter" className="mb-2 block text-sm font-semibold text-[#FFFFFF]">
                    Filter by Area
                  </label>
                  <select
                    id="area-filter"
                    value={areaFilter}
                    onChange={(event) => setAreaFilter(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[#3A3A42] bg-[#121212] px-3 text-sm text-[#FFFFFF] outline-none focus:border-[#FCA311]"
                  >
                    {allAreas.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleApplyAreaFilter}
                    className="mt-3 w-full rounded-lg border border-[#3A3A42] px-3 py-2 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#FCA311]"
                  >
                    Apply Area
                  </button>
                </div>

                <div>
                  <label htmlFor="ingredient-filter" className="mb-2 block text-sm font-semibold text-[#FFFFFF]">
                    Filter by Ingredient
                  </label>
                  <select
                    id="ingredient-filter"
                    value={ingredientFilter}
                    onChange={(event) => setIngredientFilter(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[#3A3A42] bg-[#121212] px-3 text-sm text-[#FFFFFF] outline-none focus:border-[#FCA311]"
                  >
                    {allIngredients.map((item) => {
                      const value = toIngredientSlug(item);
                      return (
                        <option key={item} value={value}>
                          {item}
                        </option>
                      );
                    })}
                  </select>
                  <button
                    type="button"
                    onClick={handleApplyIngredientFilter}
                    className="mt-3 w-full rounded-lg border border-[#3A3A42] px-3 py-2 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#FCA311]"
                  >
                    Apply Ingredient
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
