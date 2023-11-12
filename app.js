const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "moviesData.db");

let database = null;

const initializeDatabaseServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error : ${error.message}`);
    process.exit(1);
  }
};

initializeDatabaseServer();

const convertSnakeCaseToCamelCase = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//Returns a list of all movie names in the movie table
//Here we use get method for return all movie names
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT movie_name FROM movie;`;
  const allMovies = await database.all(getAllMoviesQuery);
  response.send(
    allMovies.map((eachMovies) => ({ movieName: eachMovies.movie_name }))
  );
});

//Creates a new movie in the movie table. movie_id is auto-incremented
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES(${directorId}, '${movieName}', '${leadActor}');`;
  await database.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Returns a movie based on the movie ID
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsBasedOnMovieId = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieDetails = await database.get(getMovieDetailsBasedOnMovieId);
  response.send(convertSnakeCaseToCamelCase(movieDetails));
});

//Updates the details of a movie in the movie table based on the movie ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
            UPDATE 
               movie
            SET
               director_id=${directorId},
               movie_name='${movieName}',
               lead_actor='${leadActor}'
            WHERE
               movie_id = ${movieId};
            `;
  database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
            DELETE FROM 
                movie
            WHERE 
                movie_id = ${movieId};
           `;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertSnakeCaseToCamelCaseInDirectorTable = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//Returns a list of all directors in the director table
app.get("/directors/", async (request, response) => {
  const getAllDirectorDetails = `
             SELECT
                 *
             FROM 
                director;
             `;
  const directorDetails = await database.all(getAllDirectorDetails);
  response.send(
    directorDetails.map((eachDirector) =>
      convertSnakeCaseToCamelCaseInDirectorTable(eachDirector)
    )
  );
});

//Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieName = `
          SELECT 
              movie_name
          FROM
              movie
          WHERE
              director_id = ${directorId};
          `;
  const movieNameDetails = await database.all(getMovieName);
  response.send(
    movieNameDetails.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
