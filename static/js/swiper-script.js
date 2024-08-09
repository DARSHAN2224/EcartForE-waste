// Swiper JS

var swiper = new Swiper(".mySwiper", {
  autoplay: {
    delay: 3000, 
    disableOnInteraction: false
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});


let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];


const addDataToHTML = () => {
  // remove datas default from HTML

      // add new datas
      if(products.length > 0) // if has data
      {
          products.forEach(product => {
              let newProduct = document.createElement('div');
              newProduct.dataset.id = product.id;
              newProduct.classList.add('item');
              newProduct.innerHTML = 
              `<img id="imgg" src="${product.image}" alt="">
              <h2>${product.name}</h2>
              <div class="price">₹${product.price}</div>
              <button class="addCart"><a href="/entry">SELL<a></button>`;
              listProductHTML.appendChild(newProduct);
          });
      }
  }

const initApp = () => {
  // get data product
  fetch('/js/product.json')
  .then(response => response.json())
  .then(data => {
      products = data;
      addDataToHTML();

      // get data cart from memory
      if(localStorage.getItem('cart')){
          cart = JSON.parse(localStorage.getItem('cart'));
          addCartToHTML();
      }
  })
}
initApp();

document.getElementById('logoutButton').addEventListener('click', () => {
  fetch('/logout', {
      method: 'GET',
      credentials: 'same-origin' // Include credentials if needed (e.g., for cookies)
  })
  .then(response => {
      if (response.redirected) {
          // Redirect to the login page
          window.location.href = response.url;
      } else {
          // Handle logout success or failure
      }
  })
  .catch(error => {
      console.error('Error logging out:', error);
  });
});
