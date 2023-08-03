document.addEventListener("DOMContentLoaded", function() {
  'use strict';

  const html = document.querySelector('html'),
    globalWrap = document.querySelector('.global-wrap'),
    body = document.querySelector('body'),
    menuToggle = document.querySelector(".hamburger"),
    menuList = document.querySelector(".main-nav"),
    searchOpenButton = document.querySelector(".search-button"),
    searchCloseIcon = document.querySelector(".icon__search__close"),
    searchOverlay = document.querySelector(".search__overlay"),
    searchInput = document.querySelector(".search__text"),
    search = document.querySelector(".search"),
    toggleTheme = document.querySelector(".toggle-theme"),
    btnScrollToTop = document.querySelector(".top"),
    fileInput = document.querySelector("#fileInput"),
    uploadFileButton = document.querySelector("#uploadFileButton"),
    downloadFileButton = document.querySelector("#downloadFileButton"),
    resetButton = document.querySelector("#resetButton");

  // =======================================================
  // Menu + Search + Theme Switcher
  // =======================================================

  menuToggle.addEventListener("click", () => {
    menu();
  });

  searchOpenButton.addEventListener("click", () => {
    searchOpen();
  });

  searchCloseIcon.addEventListener("click", () => {
    searchClose();
  });

  searchOverlay.addEventListener("click", () => {
    searchClose();
  });


  // Menu
  function menu() {
    menuToggle.classList.toggle("is-open");
    menuList.classList.toggle("is-visible");
  }


  // Search
  function searchOpen() {
    search.classList.add("is-visible");
    body.classList.add("search-is-visible");
    globalWrap.classList.add("is-active");
    menuToggle.classList.remove("is-open");
    menuList.classList.remove("is-visible");
    setTimeout(function () {
      searchInput.focus();
    }, 250);
  }

  function searchClose() {
    search.classList.remove("is-visible");
    body.classList.remove("search-is-visible");
    globalWrap.classList.remove("is-active");
  }

  document.addEventListener('keydown', function(e){
    if (e.key == 'Escape') {
      searchClose();
    }
  });


  // Theme Switcher
  if (toggleTheme) {
    toggleTheme.addEventListener("click", () => {
      darkMode();
    });
  };

  function darkMode() {
    if (html.classList.contains('dark-mode')) {
      html.classList.remove('dark-mode');
      localStorage.removeItem("theme");
      document.documentElement.removeAttribute("dark");
    } else {
      html.classList.add('dark-mode');
      localStorage.setItem("theme", "dark");
      document.documentElement.setAttribute("dark", "");
    }
  };

  // ================================================================
  // Stop Animations During Window Resizing and Switching Theme Modes
  // ================================================================

  let disableTransition;

  if (toggleTheme) {
    toggleTheme.addEventListener("click", () => {
      stopAnimation();
    });
  }

  window.addEventListener("resize", () => {
    stopAnimation();
  });

  function stopAnimation() {
    document.body.classList.add("disable-animation");
    clearTimeout(disableTransition);
    disableTransition = setTimeout(() => {
      document.body.classList.remove("disable-animation");
    }, 100);
  };

  // =================
  // Responsive Videos
  // =================

  reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off)");

  // ===============
  // LazyLoad Images
  // ===============

  var lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy"
  })

  // ==========
  // Zoom Image
  // ==========

  const lightense = document.querySelector(".page__content img, .post__content img, .gallery__image img"),
  imageLink = document.querySelectorAll(".page__content a img, .post__content a img, .gallery__image a img");

  if (imageLink) {
    for (const i = 0; i < imageLink.length; i++) imageLink[i].parentNode.classList.add("image-link");
    for (const i = 0; i < imageLink.length; i++) imageLink[i].classList.add("no-lightense");
  };

  if (lightense) {
    Lightense(".page__content img:not(.no-lightense), .post__content img:not(.no-lightense), .gallery__image img:not(.no-lightense)", {
    padding: 60,
    offset: 30
    });
  };

  // ===============
  // Load More Posts
  // ===============

  var load_posts_button = document.querySelector('.load-more-posts');

  load_posts_button&&load_posts_button.addEventListener("click",function(e){e.preventDefault();var o=document.querySelector(".pagination"),e=pagination_next_url.split("/page")[0]+"/page/"+pagination_next_page_number+"/";fetch(e).then(function(e){if(e.ok)return e.text()}).then(function(e){var n=document.createElement("div");n.innerHTML=e;for(var t=document.querySelector(".grid"),a=n.querySelectorAll(".article--grid"),i=0;i<a.length;i++)t.appendChild(a.item(i));new LazyLoad({elements_selector:".lazy"});pagination_next_page_number++,pagination_next_page_number>pagination_available_pages_number&&(o.style.display="none")})});

  // =================
  // Scroll Top Button
  // =================

  btnScrollToTop.addEventListener("click", function () {
    if (window.scrollY != 0) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      })
    }
  });

  // ===========================================
  // Upload/download CSV file and populate table
  // ===========================================

  let totalItems = 0;
  let currentItem = 0;

  if (fileInput)
  {
      fileInput.addEventListener("change", (e) => {
          var filename = e.target.files[0].name;
          const fileLabel = document.querySelector('#fileLabel');
          fileLabel.textContent = filename;
      });
  }
    
  if (uploadFileButton)
  {
      uploadFileButton.addEventListener("click", () => {
          readFile().then((fileContent) => {
              populateTable(fileContent);
          });
      });
  }

  if (downloadFileButton)
  {
      downloadFileButton.addEventListener("click", () => {
          readFile().then((fileContent) => {
              downloadFile(fileContent);
          });
      });
  }

  if (resetButton) {
      resetButton.addEventListener("click", () => {
        // Clear all text contents
        fileLabel.textContent = '';
        countLabel.textContent = '';
        elementLabel.textContent = '';
        progressLabel.textContent = '';
        totalItems = 0;
        currentItem = 0;
        // Empty the table
        const tableRows = document.querySelectorAll('#tableData tbody tr');
        if (tableRows.length > 0)
            tableRows.forEach(elm => elm.remove());
        // Hide the table
        const table = document.querySelector('#tableData');
        table.style.display = "none";
    });
  }

  function populateTable(fileContent)
  {
      const table = document.querySelector('#tableData');
      const tableBody = document.querySelector('#tableData tbody');
      const tableRows = document.querySelectorAll('#tableData tbody tr');

      // Empty table
      if (tableRows.length > 0)
          tableRows.forEach(elm => elm.remove());

      const rows = fileContent.split('\n');

      // Remove empty last element
      var lastElement = rows.slice(-1);
      if (lastElement == "") rows.pop();

      for (let i = 1; i < rows.length; i++)
      {
          const columns = rows[i].split(';');
          const row = tableBody.insertRow();

          // Image
          const cell18 = row.insertCell();
          cell18.style = 'background-color: white; border: none;';
          const element18 = document.createElement('img');
          element18.style = 'width: 40px; height: 40px; border-radius: 10px; object-fit: cover; ';
          element18.src = columns[18];
          element18.setAttribute('crossorigin', 'anonymous');
          cell18.appendChild(element18);
          
          // Name
          const cell0 = row.insertCell();
          cell0.textContent = columns[0];

          // Full address
          const cell1 = row.insertCell();
          cell1.textContent = columns[1];

          // Category
          const cell4 = row.insertCell();
          cell4.textContent = columns[4];

          // Phone
          const cell6 = row.insertCell();
          cell6.textContent = columns[6];

          // Check
          const cell99 = row.insertCell();
          cell99.style = 'background-color: white; border: none;';
          const element99 = document.createElement("i");
          element99.setAttribute("data-image-url", columns[18]);
          element99.classList.add('ion', 'ion-ios-checkmark-circle');
          element99.style = 'color: #e2e2e2; font-size: 20px;';
          cell99.appendChild(element99);
      }

      const countLabel = document.querySelector('#countLabel');
      const elementLabel = document.querySelector('#elementLabel');
      countLabel.textContent = rows.length - 1;
      elementLabel.textContent = "éléments";
      table.style.display = "";
  }

  function getBase64FromImageSrc(image) 
  {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg").split(';base64,')[1];
        return dataUrl;
  }
    
  function downloadFile(fileContent) 
  {
    const rows = fileContent.split('\n');
    const result = [];
    //const imageURLs = [];

    // Remove empty last element
    var lastElement = rows.slice(-1);
    if (lastElement == "") rows.pop();

    var zip = new JSZip();

    totalItems = rows.length - 1;
    currentItem = 0;

    for (let i = 1; i < rows.length; i++)
    {
        const columns = rows[i].split(';');
        const folderName = columns[0].replaceAll('\'', '-').replaceAll(' ', '-').replaceAll('â', 'a').replaceAll('û','u').toLowerCase();
        const fileContent = `---\nname: ${columns[0]}\ntag: ${columns[4].toLowerCase()}\naddress: ${columns[1]}\nwebsite: ${columns[15]}\nlocation: ${columns[12]}\nimage: '0.jpg'\n---\n`;
        const imageUrl = columns[18];
        zip.folder(`${folderName}`).file(`_index.md`, fileContent);

        //debugger;
        //const elm = document.querySelector('img[src="' + imageUrl + '"]');
        //const base64Data = getBase64FromImageSrc(elm);

        zip.folder(`${folderName}`).file(`0.jpg`, getPredictionFromUrl(imageUrl).then(getBinaryContentFromUrl), { binary: true });
        //imageURLs.push(imageUrl);
    };

    zip.generateAsync({type:"blob"})
    .then(function(content) {
        saveAs(content, "example.zip");
    });
  }
  
  async function readFile()
  {
      return new Promise(function (resolve, reject) {
          const fileInput = document.getElementById('fileInput');
          const file = fileInput.files[0];
          if (!file) {
              alert('Please select a file.');
              return;
          }

          const reader = new FileReader();
          reader.onload = function (event) {
              resolve(event.target.result);
          };

          reader.readAsText(file);
      });
  }

  async function getBinaryContentFromUrl(url) {
    return new Promise(function(resolve, reject) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
  }

  async function getBase64FromUrl(imageUrl) {
      try {
          return axios.get(imageUrl, {
              responseType: 'arraybuffer',
          })
              .then((response) => {
                  return new Promise((resolve, reject) => {
                      const buffer = response.data;
                      let base64 = '';
                      const bytes = new Uint8Array(buffer);
                      const len = bytes.byteLength;
                      for (let i = 0; i < len; i++) {
                          base64 += String.fromCharCode(bytes[i]);
                      }
                      resolve(btoa(base64));
                  });
              });
      } catch (error) {
          console.error('Error:', error.message);
          return null;
      }
  }

  async function getPredictionFromUrl(imageUrl)
  {
      const apiUrl = 'https://cors-anywhere.herokuapp.com/https://api.replicate.com/v1/predictions';
      const apiToken = 'r8_WsSrh8w9Qp9YQwahxuiNnbWnF47T8rj3ZQ9vx';
      const version = '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b';
      const progressLabel = document.querySelector('#progressLabel');
      const requestData = {
          version: version,
          input: {
              image: 'data:image/jpeg;base64,', // will be set after base64 conversion
              scale: 4,
              face_enhance: false
          },
      };

      const requestOptions = {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${apiToken}`,
          },
      };

      progressLabel.textContent = "Traitement en cours...";
      
      return new Promise(function (resolve, reject) {
          getBase64FromUrl(imageUrl)
              .then((base64Data) => {
                  debugger;
                  if (base64Data) {
                      requestData.input.image += base64Data;
                      axios.post(apiUrl, requestData, requestOptions)
                          .then(response => {
                              // Handle the API response here
                              console.log(response.data);

                              function pollData() {
                                  console.log("Polling data...");
                                  var apiUrlBis = apiUrl + '/' + response.data.id;
                                  axios.get(apiUrlBis, requestOptions)
                                      .then(response => {
                                          // Handle the API response here
                                          console.log(response.data);

                                          if (response.data.status == 'succeeded') {
                                              resolve(response.data.output);
                                              clearInterval(pollingId);
                                              currentItem++;

                                              const elm = document.querySelector('i[data-image-url="' + imageUrl + '"]');
                                              if (elm)
                                                  elm.style.color = '#39B642';
                                              else
                                              {
                                                  console.log('elm: ' + imageUrl);
                                                  alert('elm not found');
                                              }
                                                  
                                              if (currentItem == totalItems) {
                                                    progressLabel.textContent = "Fin du traitement";
                                              } else {      
                                                    progressLabel.textContent = "Traitement en cours... " + currentItem / totalItems * 100 + '%';
                                            }  
                                            console.log(progressLabel.textContent);
                                        }
                                      })
                                      .catch(error => {
                                          debugger;
                                          // Handle errors here
                                          console.error('Error:', error.message);
                                          reject(error);
                                      });
                              }
                              const pollingInterval = 5000;
                              const pollingId = setInterval(pollData, pollingInterval);
                          })
                          .catch(error => {
                              debugger;
                              // Handle errors here
                              console.error('Error:', error.message);
                              reject(error);
                          });
                  }
              });
      });
  }

  function test1()
  {
      debugger;
      const apiUrl = 'http://cors-anywhere.herokuapp.com/https://api.replicate.com/v1/predictions';
      const apiToken = 'r8_WsSrh8w9Qp9YQwahxuiNnbWnF47T8rj3ZQ9vx';
      const version = '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b';
      const imageUrl = 'https://lh5.googleusercontent.com/p/AF1QipOBysSiH-1Kj62y72s-q1-hHhr27p9lTtoAzV0g=w138-h92-k-no';

      const requestData = {
          version: version,
          input: {
              image: 'data:image/jpeg;base64,', // will be set after base64 conversion
              scale: 4,
              face_enhance: false
          },
      };

      const requestOptions = {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${apiToken}`,
          },
      };

      getBase64FromUrl(imageUrl)
          .then((base64Data) => {
              if (base64Data) {
                  console.log('Base64 image data:');
                  console.log(base64Data);
                  requestData.input.image += base64Data;

                  axios.post(apiUrl, requestData, requestOptions)
                      .then(response => {
                          // Handle the API response here
                          console.log(response.data);
                          replicate_token_id = response.data.id;
                      })
                      .catch(error => {
                          // Handle errors here
                          console.error('Error:', error.message);
                      });
              }
          });
      
  }

  function test2()
  {
      debugger;
      const apiUrl = 'http://cors-anywhere.herokuapp.com/https://api.replicate.com/v1/predictions/' + tid;
      const apiToken = 'r8_WsSrh8w9Qp9YQwahxuiNnbWnF47T8rj3ZQ9vx';

      const requestOptions = {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${apiToken}`,
          },
      };

      axios.get(apiUrl, requestOptions)
      .then(response => {
        debugger;
        // Handle the API response here
        console.log(response.data);
      })
      .catch(error => {
        debugger;
        // Handle errors here
        console.error('Error:', error.message);
      });
  }

});