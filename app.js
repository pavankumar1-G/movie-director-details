const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const databasePath = path.join(__dirname, "moviesData.db");
const sqlite3 = require("sqlite3");

// Database Connection Process:

let dataBase = null;
const initializingDatabaseAndServer = async () => {
  try {
    dataBase = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (Err) {
    console.log(`DB Error: ${Err.message}`);
    process.exit(1);
  }
};
initializingDatabaseAndServer();

// API's to communicate with Server and Database:

// Get list of movie names in movie table by using API:
const convertDbObjectToResponseObject = (DbObject) => {
  return {
    movieId: DbObject.movie_id,
    directorId: DbObject.director_id,
    movieName: DbObject.movie_name,
    leadActor: DbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesListWithSqlQuery = `
    SELECT 
    movie_name
    FROM
    movie;
    `;
  const movieList = await dataBase.all(getMoviesListWithSqlQuery);
  response.send(
    movieList.map((eachmovie) => convertDbObjectToResponseObject(eachmovie))
  );
});

// Add movie details in movie table by using API:
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addNewMovieDetailsWithSqlQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES
    (
        ${directorId},
        "${movieName}",
        "${leadActor}"

    );


    `;
  await dataBase.run(addNewMovieDetailsWithSqlQuery);
  response.send("Movie Successfully Added");
});

// Get Movie by using API:
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieWithSqlQuery = `
    SELECT *
    FROM
    movie
    WHERE
    movie_id = ${movieId};
    `;
  const movie = await dataBase.get(getMovieWithSqlQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

//Update MovieDetails by using API:
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetals = request.body;
  const { directorId, movieName, leadActor } = movieDetals;
  const updateMovieDetailsWithSqlQuery = `
    UPDATE
    movie
    SET
        director_id = ${directorId},
        movie_name = "${movieName}",
        lead_actor = "${leadActor}"

    WHERE
        movie_id = ${movieId};
    `;
  await dataBase.run(updateMovieDetailsWithSqlQuery);
  response.send("Movie Details Updated");
});

//Delete Movie Details by using API:
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetailsWithSqlQuery = `
    DELETE
    FROM
    movie
    WHERE
    movie_id = ${movieId};
    `;
  await dataBase.run(deleteMovieDetailsWithSqlQuery);
  response.send("Movie Removed");
});

// Get DirectorsList by using API:
const convertDirectorListDBObjectToResponseObject = (DbObject) => {
  return {
    directorId: DbObject.director_id,
    directorName: DbObject.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorsListWithSqlQuery = `
    SELECT *
    FROM
    director;
    `;
  const directorList = await dataBase.all(getDirectorsListWithSqlQuery);
  response.send(
    directorList.map((eachDirector) =>
      convertDirectorListDBObjectToResponseObject(eachDirector)
    )
  );
});

// Get Specific Director Movies by using API:
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getSpecificDirectorMoviesWithSqlQuery = `
    SELECT
    movie.movie_name as movieName
    FROM
    director NATURAL JOIN movie
    WHERE
    director.director_id = ${directorId};
    `;
  const directorsMovieList = await dataBase.all(
    getSpecificDirectorMoviesWithSqlQuery
  );
  response.send(directorsMovieList);
});
module.exports = app;
