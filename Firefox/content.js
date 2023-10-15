/**
 * Copyright 2023 Tamás Szabó
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * This script creates the ability to save books from www.antikvarium.hu to the favorite list by creating a star icon
 * next to the book's title. It also creates the "KEDVENCEIM" menu item in the navbar, which opens the favorite list in
 * a new tab, and also creates a popup window in the chrome.s menu bar. The script uses the chrome.storage API, which
 * means that the list is stored on the cloud, if available for the user, or locally.
 *
 * @author Tamás Szabó
 * @version 1.0
 */

/** Appends the hyperlink "KEDVENCEIM" to the navbar. */
function appendMenu() {
    const kedvenceimPath = chrome.runtime.getURL("kedvenceim.html")

    const menuText = document.createTextNode('KEDVENCEIM');
    const a = document.createElement('a');
    a.appendChild(menuText);
    a.onclick = function () {
        chrome.tabs.create({url: "chrome://kedvenceim.html"});
    }
    a.href = kedvenceimPath;
    a.target = "_blank";

    const ul = document.getElementsByClassName('navbar-right');
    const li = document.createElement("li");
    li.appendChild(a);
    ul[0].appendChild(li);
}

/** Stores the book to the favorite list locally, or to the cloud if available. */
async function storeFav() {
    let author = "";
    if (document.getElementById('konyvAdatlapSzerzoNeveLink')) {
        author = document.getElementById('konyvAdatlapSzerzoNeveLink').innerText;
    }
    let publisher = "";
    if (document.getElementsByClassName('t2')[0].innerText) {
        publisher = document.getElementsByClassName('t2')[0].innerText;
    }

    let releaseDate = "";
    const timeTagQuantity = document.getElementsByTagName('time').length;
    if (timeTagQuantity >= 1) {
        releaseDate = document.getElementsByTagName('time')[1].innerText;
    }

    const title = document.getElementsByClassName('book-data-title-height')[0].innerText;
    const URL = window.location.pathname;
    const objFavBook = {
        title: title,
        author: author,
        publisher: publisher,
        releaseDate: releaseDate,
        URL: URL
    };

    const count = await getBookQuantity();
    let keyName = "favBook_1";
    if (count !== undefined) {
        keyName = "favBook_" + (count + 1);
    }
    //needed to save the book with chrome.storage
    const objBook = {};
    objBook[keyName] = objFavBook;

    //if the book is not in the list, add it, else delete it
    const bookKey = await isAlreadyFav(URL);
    if (bookKey === 0) {
        chrome.storage.sync.set(objBook, function () {
            if (count === undefined) {
                chrome.storage.sync.set({"count": 1});
            } else {
                chrome.storage.sync.set({"count": (count + 1)});
            }
        });
    } else {
        await deleteBook(bookKey);
    }
}

/** Appends the corresponding star icon to the title. */
async function appendFav() {
    const isFav = await isAlreadyFav(window.location.pathname);
    const starImg = document.createElement('img');
    starImg.setAttribute("id", "imgStar");
    const starPlus = chrome.runtime.getURL("res/images/star-plus-30.png");
    const starMinus = chrome.runtime.getURL("res/images/star-minus-30.png");
    if (isFav === 0) {
        starImg.src = starPlus;
    } else {
        starImg.src = starMinus;
    }

    starImg.style.cursor = 'pointer';
    starImg.addEventListener('click', async function () {
        await storeFav();
        await chrome.runtime.sendMessage({listReload: "true"});
        console.log("clickety clackity");
    });

    const title = document.getElementsByClassName('book-data-title-height');
    title[0].appendChild(starImg);
}

/** Changes the star icon according to the book's status in the favorite list.
 *  This function is used with storage.onChanged.addListener() to update the star icon when the list is changed.
 */
async function changeStar() {
    const starImg = document.getElementById('imgStar');
    const starPlus = chrome.runtime.getURL("res/images/star-plus-30.png");
    const starMinus = chrome.runtime.getURL("res/images/star-minus-30.png");
    const isFav = await isAlreadyFav(window.location.pathname);
    if (isFav === 0) {
        starImg.src = starPlus;
    } else {
        starImg.src = starMinus;
    }
}

/** Checks if a book is already in the favorite list by comparing the URL.
 * @return {number} Returns the key of the book if it is in the list, 0 if it is not.
 */
async function isAlreadyFav(URL) {
    const count = await getBookQuantity();
    if (count !== undefined) {
        for (let i = 1; i <= count; i++) {
            const keyName = "favBook_" + i;
            const objBook = {};
            objBook[keyName] = null;
            const p = new Promise(function (resolve, reject) {
                chrome.storage.sync.get(objBook, function (a) {
                    resolve(a[keyName]);
                })
            });
            const search = await p;

            if (search !== null && search["URL"] === URL) {
                return i;
            }
        }
    }
    return 0;
}

/** Gets the quantity of books in the favorite list stored with the "count" key.
 * @return {number} Returns the number of books in the favorite list.
 */
async function getBookQuantity() {
    const quantity = new Promise(function (resolve, reject) {
        chrome.storage.sync.get("count", function (a) {
            resolve(a.count);
        })
    });
    return await quantity;
}

/** Deletes the selected book, then replaces its key with the last one.
 * @param {number} bookKey - Key of the book to be deleted.
 */
async function deleteBook(bookKey) {
    //decreasing the quantity of books in the list
    const bookQuantity = await getBookQuantity();
    const newBookQuantity = bookQuantity - 1;
    await chrome.storage.sync.set({"count": newBookQuantity});

    //deleting the selected book
    const keyNameToDelete = "favBook_" + bookKey;
    await chrome.storage.sync.remove(keyNameToDelete);

    //if the deleted book was not the last one, replace its key with the last one
    if (bookKey !== bookQuantity) {
        //getting the last book
        const keyNameLast = "favBook_" + (newBookQuantity + 1);
        const objBook = {};
        objBook[keyNameLast] = null;
        const pTemp = new Promise(function (resolve, reject) {
            chrome.storage.sync.get(objBook, function (a) {
                resolve(a[keyNameLast]);
            })
        });
        const objLast = await pTemp;
        const objBookLast = {};
        objBookLast[keyNameToDelete] = objLast;

        //replace the selected item with the last one
        chrome.storage.sync.set(objBookLast, function () {
            chrome.storage.sync.remove(keyNameLast, function (data) {
            });
        });
    }
}

/** Deletes multiple books, where the checkbox is checked, then calls listBooks(). */
async function deleteBooks() {
    const tableWrapper = document.getElementById('elojegyzesTabla_wrapper');
    const checkBoxes = tableWrapper.querySelectorAll('input[type="checkbox"]');
    for (const item of checkBoxes) {
        if (item.checked) {
            await deleteBook(item.value);
            console.log("deleted: " + item.value);
        }
    }
    await updateList();
}

/** Resets the DataTable. Simply updating the table with new data would break the sorting (both paging and ordering), so
 * it's necessary to destroy and re-initialize the DataTable.
 * (Not the most elegant, because it's slightly noticeable to the user, but it's by far the most simple and the
 * shortest way to implement. Probably will rewrite in future version.)
 */
async function updateList() {
    if ($.fn.dataTable.isDataTable('#kedvenceimTabla')) {
        $('#kedvenceimTabla').DataTable().destroy();
    }
    await listBooks();
    $('#kedvenceimTabla').DataTable({
        paging: 1,
        "lengthMenu": [[4, 8, 12, -1], [4, 8, 12, "Összes"]],
        "lengthChange": true,
        order: [[1, 'asc']],
        info: !1,
        searching: !1,
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.1/i18n/hu.json'
        }
    });
}

/** Lists the favorite books in the kedvencek.html page in table favTable. */
async function listBooks() {
    const quantity = await getBookQuantity();
    console.log("listBooks called");
    document.getElementById("favTable").innerHTML = "";
    if (!(quantity === undefined || quantity === 0)) {
        for (let i = 1; i <= quantity; i++) {
            const keyName = "favBook_" + i;
            const objBook = {};
            objBook[keyName] = null;
            const pTemp = new Promise(function (resolve, reject) {
                chrome.storage.sync.get(objBook, function (a) {
                    resolve(a[keyName]);
                })
            });
            const search = await pTemp;

            let tr = document.createElement("tr");
            tr.id = "favCreated";
            tr.class = "odd";
            tr.style.height = "64px";

            let tdDel = document.createElement("td");
            tdDel.class = "sorting_1";
            let inputDel = document.createElement("input");
            inputDel.type = "checkbox";
            inputDel.value = i.toString();
            inputDel.name = "delBook";
            tdDel.appendChild(inputDel);
            tr.appendChild(tdDel);

            let tdTitle = document.createElement("td");
            let aTitle = document.createElement("a");
            aTitle.href = "https://www.antikvarium.hu" + search["URL"];
            aTitle.target = "_blank";
            aTitle.textContent = search["title"];
            tdTitle.appendChild(aTitle);
            tr.appendChild(tdTitle);

            let tdAuthor = document.createElement("td");
            tdAuthor.textContent = search["author"];
            tdAuthor.class = "hidden-xxs hidden-xs hidden-sm";
            tr.appendChild(tdAuthor);

            let tdRelease = document.createElement("td");
            tdRelease.textContent = search["releaseDate"];
            tdRelease.class = "hidden-xxs hidden-xs hidden-sm";
            tr.appendChild(tdRelease);

            let tdPublisher = document.createElement("td");
            tdPublisher.textContent = search["publisher"];
            tdPublisher.class = "hidden-xxs hidden-xs hidden-sm";
            tr.appendChild(tdPublisher);

            document.getElementById("favTable").appendChild(tr);
        }
    } else {
        let tr = document.createElement("tr");
        tr.id = "favCreated";
        tr.class = "odd";
        tr.style.height = "64px";

        let td = document.createElement("td");
        td.colspan = 'classNamelass="dataTcolSpanmpty"';
        td.classNamegn = "top";
        td.textContent = "Nincsenek kedvencek";
        tr.appendChild(td);
		
		let td2 = document.createElement("td");
        td2.colspan = 'classNamelass="dataTcolSpanmpty"';
        td2.classNamegn = "top";
        td2.textContent = "";
        tr.appendChild(td2);
		
		let td3 = document.createElement("td");
        td3.colspan = 'classNamelass="dataTcolSpanmpty"';
        td3.classNamegn = "top";
        td3.textContent = "";
        tr.appendChild(td3);
		
		let td4 = document.createElement("td");
        td4.colspan = 'classNamelass="dataTcolSpanmpty"';
        td4.classNamegn = "top";
        td4.textContent = "";
        tr.appendChild(td4);
		
		let td5 = document.createElement("td");
        td5.colspan = 'classNamelass="dataTcolSpanmpty"';
        td5.classNamegn = "top";
        td5.textContent = "";
        tr.appendChild(td5);
		
        document.getElementById("favTable").appendChild(tr);
    }
    document.getElementById('kedvenceimTorleseButton').addEventListener('click', deleteBooks);
}

if (window.location.pathname !== "/kedvenceim.html") {
    appendMenu();
    appendFav();
    chrome.storage.onChanged.addListener(async function (changes, namespace) {
        await changeStar();
    });
} else {
    $(document).ready(async function () {
        await updateList();
    });
}

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        setTimeout(async function () {
            await updateList();
        }, 1);
    }
);