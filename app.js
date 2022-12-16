const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dBPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());
let database = null;

const initializeDbSever = async () => {
  try {
    database = await open({
      filename: dBPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Database error is ${error}.`);
  }
};

initializeDbSever();

// convert SnakeCase to CamelCase
const convertSnToCam = (objectMovie) => {
  return {
    movieName: objectMovie.movie_name,
  };
};

//Get the details of Movie
app.get("/movies/", async (request, response) => {
  const getMovieDetails = `SELECT * FROM movie;`;
  const getMovieInfo = await database.all(getMovieDetails);
  response.send(getMovieInfo.map((eachMovie) => convertSnToCam(eachMovie)));
});

//Create new Movie Details
app.post("/movies/", async (request, response) => {
  const getMovie = request.body;
  const { directorId, movieName, leadActor } = getMovie;
  const createMovie = `INSERT INTO movie (director_id,movie_name,lead_actor)
        VALUES(${directorId}, '${movieName}','${leadActor}');`;
  const movieResponse = await database.run(createMovie);
  response.send("Movie Successfully Added");
});

const ConvertMovieDb = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};
//get a movie from movieId
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesFromId = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieInfo = await database.get(getMoviesFromId);
  response.send(ConvertMovieDb(movieInfo));
});

//update Movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = request.body;
  const { directorId, movieName, leadActor } = getMovieDetails;
  const updateMovieDetails = `UPDATE movie SET director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE director_id = ${directorId};`;
  await database.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

//Delete Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetails = `delete from movie where movie_id = ${movieId};`;
  const deleteMovieResponse = await database.run(deleteMovieDetails);
  response.send("Movie Removed");
});

// directorsList
const convertDirectorDetails = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

//get Director Details
app.get("/directors/", async (request, response) => {
  const getDirectorDetails = `SELECT * FROM director;`;
  const directorDetails = await database.all(getDirectorDetails);
  response.send(
    directorDetails.map((eachDirector) => convertDirectorDetails(eachDirector))
  );
});

//get the specific director movie
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovie = `SELECT movie_name as movieName FROM movie WHERE director_id = ${directorId};`;
  const getSpecificDiMo = await database.all(getMovie);
  response.send(getSpecificDiMo);
});

module.exports = app;
