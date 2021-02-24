const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

const dataPanel = document.querySelector('#data-panel')

const searchForm = document.querySelector('#search-form')

const searchInput = document.querySelector('#search-input')


// 輸入電影資料
function renderMovieList(data) {
  let rawHTML = ''
  // processing
  data.forEach(item => {
    // title, image
    // console.log(item)
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img class="card-img-top"
              src="${POSTER_URL + item.image}"
              alt="Movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer ">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-id= "${item.id}"
                data-target="#movie-modal">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id = "${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}


function removeFromFavorite(id) {

  if (!movies) return  // 若已經沒有內容了 終止運作

  //搜尋電影
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return // 沒有搜尋到則終止運作

  //刪除電影
  movies.splice(movieIndex, 1)

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)

}


// 設置監聽器  更改modal 

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    console.log(event.target.dataset)
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})



renderMovieList(movies)