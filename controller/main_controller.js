const axios = require("axios");
const NodeCache = require("node-cache");

// Initialize cache with 12-hour TTL
const movieCache = new NodeCache({ stdTTL: 43200 });

exports.getMovies = async (req, res) => {
  const page = req.query.page || 1;
  const cacheKey = `movies_page_${page}`;

  // Check cache first
  if (movieCache.has(cacheKey)) { // Use `movieCache` instead of `cache`
    console.log(`Serving page ${page} from cache`);
    return res.render('index', movieCache.get(cacheKey)); // Use `movieCache.get`
  }

  const url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${process.env.TMDB_API_KEY}&page=${page}`;

  try {
    const response = await axios.get(url);
    const payload = {
      movies: response.data.results,
      currentPage: parseInt(page),
      totalPages: Math.min(100, response.data.total_pages), // Limit pages to 100 for performance
    };

    // Store in cache
    movieCache.set(cacheKey, payload); // Use `movieCache.set`

    res.render('index', payload);
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to fetch movies', error });
  }
};

exports.searchMovies = async (req, res) => {
  const query = req.query.title || '';
  const page = req.query.page || 1;
  const cacheKey = `search_${query}_page_${page}`;

  // Check cache first
  if (movieCache.has(cacheKey)) { // Use `movieCache.has`
    console.log(`Serving search results for "${query}" from cache`);
    return res.render('search', movieCache.get(cacheKey)); // Use `movieCache.get`
  }

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}&page=${page}`;

  try {
    const response = await axios.get(url);
    const payload = {
      movies: response.data.results,
      query,
      currentPage: parseInt(page),
      totalPages: Math.min(100, response.data.total_pages),  // Limit pages to 100
    };

    // Store in cache
    movieCache.set(cacheKey, payload); // Use `movieCache.set`

    res.render('search', payload);
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to fetch search results', error });
  }
};

exports.getMovieDetails = async (req, res) => {
  const movieId = req.params.id;
  const cacheKey = `movie_${movieId}`;

  // Check cache first
  if (movieCache.has(cacheKey)) { // Use `movieCache.has`
    console.log(`Serving movie ${movieId} from cache`);
    return res.render('movie_details', { movie: movieCache.get(cacheKey) }); // Use `movieCache.get`
  }

  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits,videos`;

  try {
    const response = await axios.get(url);
    const movie = response.data;

    // Store in cache
    movieCache.set(cacheKey, movie); // Use `movieCache.set`

    res.render('movie_details', { movie });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to fetch movie details', error });
  }
};
