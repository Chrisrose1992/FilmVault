const router = require("express").Router();

const main_controller = require("../controller/main_controller");

router.get('/', main_controller.getMovies);

router.get('/search', main_controller.searchMovies);

router.get('/movie/:id', main_controller.getMovieDetails);

module.exports = router;