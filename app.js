let express = require('express')
let app = express()
let path = require('path')

let {open} = require('sqlite')
let sqlite3 = require('sqlite3')

let dbPath = path.join(__dirname, 'moviesData.db')

let dataBase = null
let initializeDBAndServer = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(error.message)
  }
}

initializeDBAndServer()

let convertQuery = each => {
  return `{ directorId: ${each.director_id},
  movieName: ${each.movie_name},
  leadActor: ${each.lead_actor}
  };`
}

// get all movie names

app.get('/movies/', async (request, response) => {
  try {
    let getQuery = `SELECT movie_name FROM movie;`
    let dbGetResponse = await dataBase.all(getQuery)
    response.send(dbGetResponse.map(each => ({movieName: each.movie_name})))
  } catch (error) {
    console.log('error in fetching movies')
    console.log(error.message)
  }
})

//POST : create a new movie
app.use(express.json())

app.post('/movies/', async (request, response) => {
  try {
    let detailsBody = request.body
    let {directorId, movieName, leadActor} = detailsBody
    let postQuery = `
    INSERT INTO 
      movie (director_id , movie_name , lead_actor)
    VALUES
      ('${directorId}','${movieName}' , '${leadActor}');
    `
    let dbResponse = await dataBase.run(postQuery)
    response.send('Movie Successfully Added')
  } catch (error) {
    console.log(error.message)
  }
})

//GET Returns a movie

app.get('/movies/:movieId/', async (request, response) => {
  let {movieId} = request.params
  let getQUery2 = `
  SELECT * 
  FROM movie
  WHERE movie_id = ${movieId};
  `
  let getMovieRes = await dataBase.get(getQUery2)
  response.send(convertQuery(getMovieRes))
})

// 4 Update movie detais

app.post('/movies/:movieId/', async (request, response) => {
  let {movieId} = request.params
  let updateBody = request.body
  let {directorId, movieName, leadActor} = updateBody
  let updateQuery = `
  UPDATE TABLE
    movie
  SET 
    director_id = ${directorId},
    movie_name = ${movieName},
    lead_actor = ${leadActor} 
  WHERE
    movir_id = ${movieId};
  `
  let dbPostRes = await dataBase.run(updateQuery)
  response.send('Movie Details Updated')
})

// 5. Delete a Movie

app.delete('/movies/:movieId/', async (request, response) => {
  let {movieId} = request.params
  let deleteQuery = `
  DELETE FROM
    movie
  WHERE 
    movie_id = ${movieId};
  `
  await dataBase.run(deleteQuery)
  response.send('Movie Removed')
})

//6.get from directors table

app.get('/directors/', async (request, response) => {
  try {
    let getDirectorQuery = `
    SELECT * FROM director ;
    `
    let dbDirectorRes = await app.all(getDirectorQuery)
    response.send(dbDirectorRes.map(each => convertQuery(each)))
  } catch (error) {
    console.log(error.message)
  }
})

returnMovie = movie => {
  return {
    'movieName: ': movie.movie_name,
  }
}
//7. get all movies of a director
app.get('/directors/:directorId/movies/', async (request, response) => {
  let directorId = request.params
  let getDirectorMovies = `SELECT * FROM movie WHERE director_id = ${directorId} ;`
  let queryResponse = await dataBase.all(getDirectorMovies)
  response.send(queryResponse.map(movie => returnMovie(movie)))
})

//module.exports = app
