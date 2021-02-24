const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
let filteredMovies = []

let MOVIES_PER_PAGE = 12


const dataPanel = document.querySelector('#data-panel')

const searchForm = document.querySelector('#search-form')

const searchInput = document.querySelector('#search-input')

const paginator = document.querySelector('#paginator')

const cardButton = document.querySelector('.fa-th')

const listButton = document.querySelector('.fa-bars')

const firstPage = document.querySelector('.page-item')

axios
  .get(INDEX_URL).then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length, "Card")
    renderMovieList(getMoviesByPage(1), "Card")
    firstPage.classList.add('active')
  })
  .catch((err) => console.log(err))


// 產生電影資料 卡片式 或著 條列式
function renderMovieList(data, howDisplay) {

  let rawHTML = ''

  if (howDisplay === "Card") {
    // processing
    data.forEach(item => {
      // title, image
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
              <button class="btn btn-info btn-add-favorite" data-id = "${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`})

  } else if (howDisplay === 'List') {

    rawHTML = "<ul class='list-group'>";
    // processing
    data.forEach(item => {
      // title, image
      rawHTML += `
    <li class="list-group-item font-weight-bold d-flex justify-content-between align-middle ">${item.title}
    
    <div class='but'>
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-id= "${item.id}"
                data-target="#movie-modal">More</button>
              <button class="btn btn-info btn-add-favorite" data-id = "${item.id}">+</button>
            </div>
    </li>
    `;

    });

    rawHTML += "</ul>";

  }


  dataPanel.innerHTML = rawHTML

}


// 根據data數量 產生頁碼
function renderPaginator(amount, howDisplay) {


  // 80/12 = 6 ... 8 => 7
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page = "${page}" data-display ="${howDisplay}"  href="#">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML

}



// 根據頁碼數量  擷取其中某一頁的資訊
function getMoviesByPage(page) {

  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE



  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)

}

// 加入最愛
function addToFavorite(id) {


  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('already favorite')
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// show Modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {

    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = `Release date: ${data.release_date}`
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
         <img src="${POSTER_URL + data.image}" alt="movie-poster"
              class="img-fluid">
    `
  })
}


// 設置監聽器  可加入最愛 可顯示modal
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


// -------搜尋功能-------


// 在 fa 上面 綁上標籤 這樣點擊fa-icon的時候 就可以知道現在是哪一頁
function faIconPage(page) {
  cardButton.dataset.page = page
  listButton.dataset.page = page
}


// 確認現在是在 Card 或 List 的模式 並呈現出搜尋資料
function checkDisplayMode(event) {

  // 按照模式 呈現資料
  const displayType = event.target.dataset.display
  renderPaginator(filteredMovies.length, displayType)
  renderMovieList(getMoviesByPage(1), displayType)

  // 在 fa 上面 綁上標籤 這樣點擊fa-icon的時候 可以顯示第一頁
  faIconPage(1)
}



searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {

  event.preventDefault() // 請瀏覽器不要做預設動作 交給jS 來運作
  const keyword = searchInput.value.trim().toLowerCase()


  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert(`Can't find movie with keyword : ${keyword}`)
  }


  // 現在是card 還是 list 模式
  checkDisplayMode(event)

})


// 立即顯示結果
searchInput.addEventListener('input', function instantShow(event) {

  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  if (!filteredMovies.length) {
    dataPanel.innerHTML = ''
    paginator.innerHTML = ''

  } else {
    // let displayType = event.target.parentElement.dataset.display
    // console.log(displayType)
    // renderPaginator(filteredMovies.length, displayType)
    // renderMovieList(getMoviesByPage(1), displayType)
    checkDisplayMode(event)
  }


})



// 分頁

paginator.addEventListener('click', function onPaginatorClicked(event) {


  if (!event.target.matches('a')) return

  const page = Number(event.target.dataset.page)
  const displayType = event.target.dataset.display
  renderMovieList(getMoviesByPage(page), displayType)

  // 在 fa 上面 綁上標籤 這樣點擊的時候 就可以知道現在是哪一頁
  faIconPage(page)

  const allPage = document.querySelectorAll('li')
  allPage.forEach(page => page.classList.remove('active'))

  event.target.parentElement.classList.add('active')


})



// ------ 切換顯式方法 --------


// 為搜尋列加上標籤 說明現在是甚麼模式
function searchMode(mode) {
  searchForm.dataset.display = mode
  searchInput.dataset.display = mode
}

// Card模式

cardButton.addEventListener('click', function ListToCard(event) {

  const data = filteredMovies.length ? filteredMovies : movies
  // const which = filteredMovies.length ? true : false
  renderPaginator(data.length, "Card")

  // if (!which) {

  //   renderMovieList(getMoviesByPage(event.target.dataset.page), 'Card')
  // } else {

  //   renderMovieList(getMoviesByPage(event.target.dataset.page), 'Card')
  // }

  renderMovieList(getMoviesByPage(event.target.dataset.page), 'Card')


  // let nowPage = document.querySelector(`.page-link[data-page="${event.target.dataset.page}"]`)
  // nowPage.parentElement.classList.add('active')


  searchMode('Card')


})





// list模式 

listButton.addEventListener('click', function CardToList(event) {

  const data = filteredMovies.length ? filteredMovies : movies
  const which = filteredMovies.length ? true : false

  // console.log('toList')
  renderPaginator(data.length, 'List')

  // if (!which) {

  //   renderMovieList(getMoviesByPage(event.target.dataset.page), 'List')
  // } else {

  //   renderMovieList(getMoviesByPage(event.target.dataset.page), 'List')
  // }

  renderMovieList(getMoviesByPage(event.target.dataset.page), 'List')

  // let nowPage = document.querySelector(`.page-link[data-page="${event.target.dataset.page}"]`)
  // nowPage.parentElement.classList.add('active')

  searchMode('List')




})


// 建立分頁





//如何防止點選不同display的時候 會改變