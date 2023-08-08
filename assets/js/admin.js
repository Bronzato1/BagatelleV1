document.addEventListener("DOMContentLoaded", function() {
  'use strict';

    const
    fileButton = document.querySelector("#fileButton"),
    fileInput = document.querySelector("#fileInput"),
    fillTableButton = document.querySelector("#fillTableButton"),
    processAllButton = document.querySelector("#processAllButton"),
    downloadFileButton = document.querySelector("#downloadFileButton"),
    resetButton = document.querySelector("#resetButton"),
    optimiseButton = document.querySelector("#optimiseButton"),
    progressBar = document.querySelector("#progressBar"),

    FAILED_STATUS = 0,
    SUCCEED_STATUS = 1,
    SKIPPED_STATUS = 2,
    RETRY_STATUS = 3,

    FAILED_COLOR = '#F11414',
    SUCCEED_COLOR = '#39B642',
    SKIPPED_COLOR = '#129885',
    RETRY_COLOR = '#000000';

    var zip = new JSZip();
    var promises = [];
    var totalItems = 0;
    var currentItem = 0;
    var optimiseImages = true;

    if (fileButton) {
        fileButton.addEventListener("click", () => {
            fileInput.click();
        });
    }
    if (fileInput)
    {
        fileInput.addEventListener("change", (e) =>
        {
      });
    }
    if (fillTableButton)
    {
        fillTableButton.addEventListener("click", () =>
        {
            readFile().then((fileContent) =>
            {
                populateTable(fileContent);
            });
        });
    }
    if (processAllButton)
    {
      processAllButton.addEventListener("click", () => {
          readFile().then((fileContent) => {
              processAll(fileContent);
          });
      });
    }
    if (downloadFileButton)
  {
      downloadFileButton.addEventListener("click", () => {
          downloadFile();
      });
    }
    if (optimiseButton) {
        optimiseButton.addEventListener("click", () =>
        {
            const offValue = 'ion-ios-radio-button-off';
            const onValue = 'ion-ios-radio-button-on';
            var oldValue = optimiseButton.innerHTML.includes('off') ? offValue : onValue;
            var newValue = optimiseButton.innerHTML.includes('off') ? onValue : offValue;
            optimiseButton.innerHTML = optimiseButton.innerHTML.replace(oldValue, newValue);
            optimiseImages = (newValue == onValue) ? true : false;
        });
    }
    if (resetButton) {
        resetButton.addEventListener("click", () =>
        {
            progressBar.value = 0;
            progressBar.style.visibility = "hidden";
            totalItems = 0;
            currentItem = 0;
            zip = new JSZip();
            // Empty the table
            const tableRows = document.querySelectorAll('#tableData tbody tr');
            if (tableRows.length > 0)
                tableRows.forEach(elm => elm.remove());
            // Hide the table
            const table = document.querySelector('#tableData');
            table.style.display = "none";
        });
    }

    function parseCSVWithNewlines(csvString) 
  {
      const rows = [];
      let currentRow = "";
      let insideQuotes = false;

      csvString.split("\n").forEach((line) =>
      {
            if (insideQuotes) {
                currentRow += "\n" + line;
            } else {
                currentRow = line;
            }

            // Count the number of quotes in the line to determine if we are inside a quoted field.
            const quoteCount = (currentRow.match(/"/g) || []).length;
            insideQuotes = quoteCount % 2 !== 0;

            if (!insideQuotes) {
                rows.push(currentRow);
            }
      });

      // Process each row and split the fields using the delimiter (e.g., colom).
      const parsedRows = rows.map((row) => parseRowWithSemiColon(row));
      return parsedRows;
  }
    function parseRowWithSemiColon(rowString)
    {
        const columns = [];
        let currentColumn = "";
        let insideQuotes = false;

        rowString.split(";").forEach((column) => {
            if (insideQuotes) {
                currentColumn += ";" + column;
            } else {
                currentColumn = column;
            }

            // Count the number of quotes in the line to determine if we are inside a quoted field.
            const quoteCount = (currentColumn.match(/"/g) || []).length;
            insideQuotes = quoteCount % 2 !== 0;

            if (!insideQuotes) {
                columns.push(currentColumn.replaceAll('"', ''));
            }
        });

        return columns;
    }
    function parseOpeningHoursWithComma(openingHoursString) 
  {
      const rows = [];
      let currentRow = "";
      let insideBrackets = false;

      openingHoursString.split(",").forEach((line) =>
      {
            if (insideBrackets) {
                currentRow += "," + line;
            } else {
                currentRow = line;
            }

            // Count the number of brackets in the line to determine if we are inside a bracket field.
            const openingAndClosingbrackets = (currentRow.match(/\[.*\]/) || []).length;
            insideBrackets = openingAndClosingbrackets == 0;

            if (!insideBrackets) {
                rows.push(currentRow.replace('[', '').replace(']','').replace(':','#').trim());
            }
      });
      return rows.join(';');
  }
    function populateTable(fileContent)
    {
        const table = document.querySelector('#tableData');
        const tableBody = document.querySelector('#tableData tbody');
        const tableRows = document.querySelectorAll('#tableData tbody tr');

        // Empty table
        if (tableRows.length > 0)
            tableRows.forEach(elm => elm.remove());

        const rows = parseCSVWithNewlines(fileContent);

      // Remove empty last element
      var lastElement = rows.slice(-1);
      if (lastElement == "") rows.pop();

      for (let i = 1; i < rows.length; i++)
      {
          const columns = rows[i];
          const row = tableBody.insertRow();

          console.log('Populate table for: ' + columns[0]);
          // Image
          const cell25 = row.insertCell();
          cell25.style = 'background-color: var(--background-color); border: none;';

          if (columns[25])
          {
              const element25 = document.createElement('img');
              element25.style = 'width: 40px; height: 40px; max-width: none; border-radius: 10px; object-fit: cover;';
              element25.src = columns[25];
              element25.setAttribute('crossorigin', 'anonymous');
              cell25.appendChild(element25);
          }
          
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
          const cell10 = row.insertCell();
          cell10.textContent = columns[10];

          // Check (si il existe une image)
          if (columns[25])
          {
              const cell99 = row.insertCell();
              cell99.style = 'background-color: var(--background-color); border: none;';
              const element99 = document.createElement("i");
              element99.setAttribute("data-image-url", columns[25]);
              element99.classList.add('ion', 'ion-ios-checkmark-circle');
              element99.style = 'color: var(--tr-color); font-size: 20px;';
              cell99.appendChild(element99);
          }
      }

      console.log(rows.length - 1 + " éléments");
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
    function showProgression(status, imageUrl) {
        const elm = document.querySelector('i[data-image-url="' + imageUrl + '"]');
        if (elm) elm.style.color = (status == SUCCEED_STATUS) ? SUCCEED_COLOR : (status == FAILED_STATUS) ? FAILED_COLOR : (status == SKIPPED_STATUS) ? SKIPPED_COLOR : (status == RETRY_STATUS) ? RETRY_COLOR : 'none';
        progressBar.value = parseInt(currentItem / totalItems * 100);
    }
    function downloadFile()
    {
        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                let dateObj = new Date();
                let month = (dateObj.getUTCMonth() + 1).toString().padStart(2, "0");;
                let day = dateObj.getUTCDate().toString().padStart(2, "0");;
                let year = dateObj.getUTCFullYear().toString().padStart(4, "0");;
                let hour = dateObj.getHours().toString().padStart(2, "0");;
                let min = dateObj.getMinutes().toString().padStart(2, "0");;
                saveAs(content, `G-Maps-Extractor-${totalItems}-${year}-${month}-${day}-${hour}-${min}.zip`);
            });
    }

    async function processAll(fileContent) 
    {
        const rows = parseCSVWithNewlines(fileContent);

        progressBar.style.visibility = "visible";

        // Remove empty last element
        var lastElement = rows.slice(-1);
        if (lastElement == "") rows.pop();

        totalItems = rows.length - 1;
        currentItem = 1; // Skip item 0 which is the header of the columns

        for (currentItem; currentItem <= totalItems; currentItem++)
        {
            const columns = rows[currentItem];
            const socialMedias = columns[14].split('\n');
            const facebook = socialMedias.find((str) => str.substring(0, 'facebook'.length) === 'facebook');
            const twitter = socialMedias.find((str) => str.substring(0, 'twitter'.length) === 'twitter');
            const instagram = socialMedias.find((str) => str.substring(0, 'instagram'.length) === 'instagram');
            const openingHours = columns[24];
            const folderName = columns[0].toLowerCase().replaceAll('œ','oe').replaceAll('’','-').replaceAll('\'', '-').replaceAll(' ', '-').replaceAll('\'', '-').replaceAll('à', 'a').replaceAll('é', 'e').replaceAll('/', '-').replaceAll('.', '-').replaceAll('!', '').replaceAll('?', '').replaceAll('(', '-').replaceAll(')', '-').replaceAll('â', 'a').replaceAll('ô', 'o').replaceAll('û', 'u').replaceAll('ê', 'e').replaceAll('é', 'e').replaceAll('è', 'e').replaceAll('ç', 'c').replaceAll('&', '-').replace(/-{2,}/g, '-').replace(/[-]$/, "");
            let aryContent = [];

            aryContent.push(`---`);
            aryContent.push(`name: ${columns[0]}`);
            aryContent.push(`tag: ${columns[4].toLowerCase()}`);
            aryContent.push(`address: ${columns[1]}`);
            aryContent.push(`phone: ${columns[10]}`);
            aryContent.push(`mail: ${columns[13]}`);
            aryContent.push(`location: ${columns[18]}`);
            aryContent.push(`website: ${columns[22]}`);

            if (facebook)
                aryContent.push(facebook);
            if (twitter)
                aryContent.push(twitter);
            if (instagram)
                aryContent.push(instagram);

            if (openingHours) {
                const stringOpeningHours = parseOpeningHoursWithComma(columns[24]);
                aryContent.push(`schedule: '${stringOpeningHours}'`);
            }
        
            aryContent.push(`image: '0.jpg'`);
            aryContent.push(`layout: store`);
            aryContent.push(`---`);
        
            const fileContent = aryContent.join('\n');
            const imageUrl = columns[25];

            zip.folder(`${folderName}`).file(`index.md`, fileContent);
            
            if (optimiseImages && imageUrl)
            {
              //await zip.folder(`${folderName}`).file(`0.jpg`, getPredictionFromUrl(imageUrl).then(getBinaryContentFromUrl), { binary: true });
                await delay(500);
                var promise = getPredictionFromUrl(imageUrl).then(getBinaryContentFromUrl).then((data) => {
                    zip.folder(`${folderName}`).file(`0.jpg`, data, { binary: true });
                    showProgression(SUCCEED_STATUS, imageUrl);
                }).catch(error => {
                    debugger;
                    if (error.response && error.response.status == 429) {
                        console.error('Error:', error.message);
                        showProgression(FAILED_STATUS, imageUrl);
                        const elm = document.querySelector('i[data-image-url="' + imageUrl + '"]');
                        elm.onclick = () => { processSingle(columns) };
                    } else {
                        // Handle errors here
                        console.error('Error:', error.message);
                        showProgression(FAILED_STATUS, imageUrl);
                    }
                });
                promises.push(promise);
            }
            else
            {
                showProgression(SKIPPED_STATUS, null);
            }
        };
        Promise.all(promises).then(() => 
        {
            alert('finished');
        }).catch((error) =>
        {
            console.error("An error occurred:", error);
        });



    }
    async function processSingle(columns)
    {
        var imageUrl = columns[25];
        showProgression(RETRY_STATUS, imageUrl);
        var promise = getPredictionFromUrl(imageUrl).then(getBinaryContentFromUrl).then((data) => {
            debugger;
            var folderName = columns[0].toLowerCase().replaceAll('\'', '-').replaceAll(' ', '-').replaceAll('\'', '-').replaceAll('à', 'a').replaceAll('é', 'e').replaceAll('/', '-').replaceAll('.', '-').replaceAll('!', '').replaceAll('?', '').replaceAll('(', '-').replaceAll(')', '-').replaceAll('â', 'a').replaceAll('ô', 'o').replaceAll('û', 'u').replaceAll('ê', 'e').replaceAll('é', 'e').replaceAll('è', 'e').replaceAll('ç', 'c').replaceAll('&', '-').replace(/-{2,}/g, '-').replace(/[-]$/, "");
            zip.folder(`${folderName}`).file(`0.jpg`, data, { binary: true });
            showProgression(SUCCEED_STATUS, imageUrl);
        }).catch(error => {
            debugger;
            // Handle errors here
            console.error('Error:', error.message);
            showProgression(FAILED_STATUS, imageUrl);
        });
        promises.push(promise);
    }
    async function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
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
    //const apiUrl = 'https://cors-anywhere.herokuapp.com/https://api.replicate.com/v1/predictions';
    //const apiUrl = 'https://proxy.cors.sh/https://api.replicate.com/v1/predictions'; // permanent key ?
      const apiUrl = 'https://corsproxy.io/?https://api.replicate.com/v1/predictions'; // 
    //const apiUrl = 'https://corsproxy.org/?https://api.replicate.com/v1/predictions'; // non fonctionnel ?
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
              'x-cors-api-key': 'temp_00e06d45fb9f69da4549e34586b971e9', // utile pour proxy.cors.sh
              'Content-Type': 'application/json',
              'Authorization': `Token ${apiToken}`,
          },
      };
     
      return new Promise(function (resolve, reject) {
          getBase64FromUrl(imageUrl)
              .then((base64Data) => {
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
                                              clearInterval(pollingId);
                                              resolve(response.data.output);
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
});

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};