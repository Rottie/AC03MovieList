/***************************************************************************************/ 
/*I.Params settings*/  
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'


const MOVIES_PER_PAGE = 12  
const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') 
const searchPanel = document.querySelector('#search-panel')

let page= '1'
let mode = 'card'
/***************************************************************************************/ 
/*II.API data + event function*/  

axios.get(INDEX_URL).then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length) 
   //因爲 mode變數預設值為 card ，所以第一次打開網頁時，呈現樣式為card 模式
   //因爲 page 變數預設值為1 ，所以第一次打開網頁時，呈現電影資料數量為第一頁12筆資料而已
    displayTypeList()
  })
  .catch((err) => console.log(err))


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
      showMovieModal(event.target.dataset.id) 
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  
 
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  //搜尋顯示資料模式修改為displayTypeList,這樣篩選資料依據其mode值做顯示樣式
  displayTypeList()
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

   page = Number(event.target.dataset.page)
  // 第三階段：切換顯示模式時，維持現有分頁
  // !!帶入page值,其值取自當下點擊的 page 值
  // !!因爲之前已經有 mode做切換的flag,不管點擊那個分頁,都會依據mode值做相對應樣式來顯示
   displayTypeList()
})


//1.第一階段 點擊 list 按鈕時會出現列表模式
//1A.監聽切換模式事件
searchPanel.addEventListener('click', function onPanelClicked(event) {

  //1B.當點擊到有 class 為 card 的元素時，將參數mode設爲 card
  //!!使用變數做為切換 flag 因爲使用者不定時切換不同模式，所以變數比較適合此情景  
  if (event.target.matches('.card')) {
    mode = 'card'    
  }

  //2.第二階段：可以切換list 模式 和 card 模式
  //2A. 當點擊到有 class 為 list 的元素時，將參數mode設爲 list
  //!! 因爲切換card 模式或 list 模式都在同個父元素進行，所以合并成一個監聽事件就可以了
  //!! 用 if else 來控制顯示樣板的模式
  else if (event.target.matches('.list' )) {
    mode='list'
  }
  //1C.將點擊后產生的mode 變數值以及 page值(之前已設定為全區域變數)帶入此函式
  //   產生結果就是電影資料第一頁的12筆資料，至於展現樣式則決定於當下點擊的mode 值
  // !!解決了第一階段點擊list 按鈕出現列表模式
  displayTypeList()
})

/***************************************************************************************/ 
/*III.Function settings*/  


//1D. 此函式負責,依照mode不同渲染不同樣式

function displayTypeList() { 
  // 此函式會根據Page變數的值，回傳該頁的資料，比如page值是5，那回傳是第五頁的12電影筆資料而已
  const movieList = getMoviesByPage(page)
  //若mode 值為 card 就執行顯示card模式的函式，若不是則執行顯示list模式的函式當
  mode === 'card' ? renderMovieCard(movieList) : renderMovieList(movieList)
}

//1E.此此函式負責，將電影資料以 card 模式呈現
//!!撰寫兩種函式，一個函式只負責顯示一種樣式，這樣就解決顯示2種不同樣式的電影資料問題
function renderMovieCard(data) {
  let rawHTML = ''
  data.forEach((item) => {

    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//1F.此此函式負責，將電影資料以 list 模式呈現
//!!撰寫兩種函式，一個函式只負責顯示一種樣式，這樣就解決顯示2種不同樣式的電影資料問
function renderMovieList(data) {
  let rawHTML = ''
  rawHTML += '<table class="table"><tbody>'
  data.forEach((item) => {
    rawHTML += `
       <tr>
          <td>
           <h5 class="card-title  ">${item.title}</h5>
          </td>
          <td>
           <button class="btn btn-primary btn-show-movie " data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>

           <button class="btn btn-info btn-add-favorite " data-id="${item.id}">+</button>
          </td>
       </tr>   
   `
  })
  rawHTML += '</tbody></table>'
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link " href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}






