const isFirefox = typeof browser !== "undefined" && typeof browser.runtime !== "undefined";
const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
document.body.classList.add(isFirefox ? "firefox" : "chrome");

if (isChrome)
    var browser = chrome;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

let pageAction = urlParams.get('action') ?? 'add';
let listId = urlParams.get('list_id') ?? '';

const maxLists = 10;

const progressRing = document.querySelector('#progress-holder');
const detailsElement = document.querySelector('#parsed-details');
const errorHolder = document.querySelector('#error-holder');
const errorText = document.querySelector('#error-text');
const messageHolder = document.querySelector('#message-holder');

const scrapeButton = document.querySelector('#scrape-button');
const saveButton = document.querySelector('#save-button');

const listUrlPattern = new RegExp(/https:\/\/letterboxd\.com\/.+\/list\/.+\//);

var listData = {
    id: '',
    label: '',
    totalRank: 0,
    list: {},
    listUrl: '',
    icon: null,
    image: null,
    isRanked: null,
};

async function InitPage(){
    switch(pageAction){
        case 'add':
            document.querySelector('#header-add').classList.remove('hidden');
            break;

        case 'edit':
            document.querySelector('#header-edit').classList.remove('hidden');
            await collectExistingList();
            populateListData();
            break;
    }

    validateInputs();
}
InitPage();

document.addEventListener('click', event => {
    switch (event.target.id) {
        case "scrape-button":
            let url = document.querySelector('#list-url')?.value ?? '';
            scrapeLetterboxdList(url);
            break;

        case "save-button":
            saveList();
            break;

        case "refresh-button":
            scrapeLetterboxdList(listData.listUrl);
            break;
    }
});

document.addEventListener('change', event => {
    validateInputs();
});
document.addEventListener('input', event => {
    validateInputs();
});

function validateInputs(){
    // Scrape/Collect Button:
    scrapeButton.disabled = document.querySelector('#list-url').value == '';

    // Save Button
    let hasTitle = document.querySelector('#input-label').value != '';
    let iconType = document.querySelector('input[name="icon_type"]:checked')?.value ?? '';
    let hasIcon = (iconType == 'text' && document.querySelector('#input-icon').value != '') || (iconType == 'url' && document.querySelector('#input-iconurl').value != '');
    saveButton.disabled = !hasTitle || !hasIcon;
}


function parseHTML(html) {
    var parser = new DOMParser();
    return parser.parseFromString(html, "text/html");
}

async function scrapeLetterboxdList(url) {
    if (url == '') {
        showError('The list URL is missing.');
        return;
    }

    if (!url.match(listUrlPattern) && !url.match(listShortPattern)) {
        showError('The list URL is invalid.');
        return;
    }

    // Set the page action here again
    // this is because we set the action to edit after saving to prevent duplicate lists
    // But if we scrape a list again, we are going to be adding a new list
    pageAction = urlParams.get('action') ?? 'add';

    // Init the listData
    if (pageAction == 'add'){
        listId = self.crypto.randomUUID();

        listData.id = listId;
        listData.label = '';
        listData.totalRank = 0;
        listData.list = {};
        listData.listUrl = url;
        listData.icon = null;
        listData.isRanked = null;
    }
    else{
        listData.totalRank = 0;
        listData.list = {};
        listData.isRanked = null;
    }

    progressRing.classList.remove('hidden');
    detailsElement.classList.add('hidden');
    messageHolder.classList.add('hidden');
    scrapeButton.enabled = false;

    const request = {
        name: 'GETDATA',
        url: url
    };
    let response = await browser.runtime.sendMessage(request);
    if (response.status != 200 || response.response == null){
        showError('There was an error calling the Letterboxd page.');
        return;
    }

    // Parse the first page of the list
    //***********************************************************
    let html = parseHTML(response.response);

    const titleElement = html.querySelector('.list-title-intro .title-1');
    let listTitle = '';
    if (titleElement != null) {
        listTitle = titleElement.innerText;

        for (let i = 0; i < titleElement.childNodes.length; i++) {
            listTitle = listTitle.replace(titleElement.childNodes[i].innerText, '');
        }
        listData.label = listTitle.trim();
    }

    let pageCount = 1;
    const pageElements = html.querySelectorAll('.paginate-pages ul li.paginate-page');
    if (pageElements != null && pageElements.length > 0) {
        pageCount = pageElements[pageElements.length - 1]?.innerText ?? '0';
        pageCount = parseInt(pageCount);
    }
    pageCount = Math.min(pageCount, 10);

    if (listData.label == '' || pageCount == 0) {
        showError('There was an error parsing the Letterboxd list.');
        progressRing.classList.add('hidden');
        return;
    }
    listData.isRanked = html.querySelector('.posteritem.numbered-list-item') != null;

    // Collect the first page
    collectFilmsFromPage(listData, html);

    // Parse any additional pages
    //***********************************************************
    for (let page = 2; page <= pageCount; page++) {
        let pageUrl = `${url}page/${page}/`;
        html = null;

        const request = {
            name: 'GETDATA',
            url: pageUrl
        };
        response = await browser.runtime.sendMessage(request);
        if (response.status != 200 || response.response == null){
            showError('There was an error calling the Letterboxd page.');
            return;
        }

        html = parseHTML(response.response);
        collectFilmsFromPage(listData, html);

        // Be nice to letterboxd by avoiding too many quick calls
        if (page < pageCount)
            await new Promise(r => setTimeout(r, 5000));
    }

    progressRing.classList.add('hidden');
    populateListData();
    validateInputs();
}

function collectFilmsFromPage(listData, html) {

    let posters = html.querySelectorAll('.poster-list .posteritem .react-component');

    for (let i = 0; i < posters.length; i++) {
        listData.totalRank++;

        let slug = posters[i].getAttribute('data-item-slug');

        listData.list[slug] = { rank: listData.totalRank, index: listData.totalRank };
    }
}

async function saveList() {
    // Recollect data that the user may change
    listData.label = document.querySelector('#input-label').value;
    listData.isRanked = document.querySelector('#input-ranked').checked
    
    let iconType = document.querySelector('input[name="icon_type"]:checked')?.value ?? '';
    if (iconType == 'text') {
        listData.icon = document.querySelector('#input-icon').value;
        listData.image = null;
    } else {
        listData.image = document.querySelector('#input-iconurl').value; 
        listData.icon = null;
    }

    // Verify nothing is missing or invalid
    if (listData.id == '' || listData.label == '' || listData.totalRank == 0) {
        showError('Invalid list data. Unable to save to storage');
        return;
    }

    // Get the existing array
    let { custom_lists } = await browser.storage.local.get({ custom_lists: [] });

    if (pageAction == 'add'){
        if (custom_lists != null && custom_lists.length >= maxLists){
            showError('You have too many custom lists');
            return;
        }

        // And save the new list to the array
        custom_lists.push(listData);
    } 
    else if (pageAction == 'edit') {
        const temp = custom_lists.filter(x => x.id == listId);
        const index = custom_lists.indexOf(temp[0]);

        // And replace the existing item with the new one
        custom_lists[index] = listData;
    }

    await browser.storage.local.set({ custom_lists: custom_lists });

    // Show message
    messageHolder.classList.remove('hidden');
    pageAction = 'edit';
}

function showError(error){
    console.error(error);

    errorText.innerText = error;
    errorHolder.classList.remove('hidden');
}

async function collectExistingList(){
    let { custom_lists } = await browser.storage.local.get({ custom_lists: [] });
    if (custom_lists == null) return;

    let temp = custom_lists.filter(x => {
        return x.id === listId
    });

    if (temp.lenth == 0){
        showError('Unable to locate the list in the extension storage.');
        return;
    }
    
    listData = temp[0];
}

function populateListData(){
    document.querySelector('#input-url').innerText = listData.listUrl;
    document.querySelector('#input-label').value = listData.label;
    document.querySelector('#input-ranked').checked = listData.isRanked;
    document.querySelector('#input-total').innerText = `${listData.totalRank}`;

    if (listData.image != null && listData.image != ''){
        document.querySelector('#radio-image').checked = true;
        document.querySelector('#input-iconurl').value = listData.image;
    } else {
        document.querySelector('#radio-text').checked = true;
        document.querySelector('#input-icon').value = listData.icon ?? '';
    }

    detailsElement.classList.remove('hidden');
}