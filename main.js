const cfg = {
    server_base_url: "https://giv-geofs.uni-muenster.de",  // Specify URL to server here
    endpoint: "protokolle_json",  // specify endpoint to render
    page_title_base: "Protokolle"
}

window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);
Node.prototype.on = window.on = function (name, fn) {
    this.addEventListener(name, fn);
}
NodeList.prototype.__proto__ = Array.prototype;
NodeList.prototype.on = NodeList.prototype.addEventListener = function (name, fn) {
    this.forEach(function (elem, i) {
        elem.on(name, fn);
    });
}

const server = cfg.server_base_url;
const endpoint = cfg.endpoint;
const title_base = cfg.page_title_base

const directories_path = []  // dont touch this, will be used to navigate between pages!!!

function construct_directory_url() {
    return server + "/" + endpoint + "/" + directories_path.join("/")
}

function construct_file_url(filename) {
    return construct_directory_url() + "/" + filename
}

/**
 * Format bytes as human-readable text.
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * @return Formatted string.
 */
function humanFileSize(bytes, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + ' ' + units[u];
}

function filterTable(v = '', l = 0, c = 'table tbody tr', e = 'td') {
    const tr = $$(c);
    let cc = 0;
    v = v.toLowerCase();

    if (l && v && v.length < l) { return; }

    while (cc < tr.length) {
        let td = tr[cc].getElementsByTagName(e),
            dpl = 'none';
        ccc = 0;

        while (ccc < td.length) {
            let txt = (td[ccc].textContent || td[ccc].innerText).toLowerCase();
            if (txt.indexOf(v) > -1) {
                dpl = '';
            }
            ++ccc;
        }
        tr[cc].style.display = dpl;
        ++cc;
    }
}

async function getData(c = '#idx-json') {
    req = await fetch(construct_directory_url(), {
        method: "GET",
        headers: { "Accept": "application/json" }
    })
    json = await req.json()
    return json
}

function filterListenerCallback(e){
    filterTable(e.target.value, 3);
}

function setEnv(s = '#idx-filter') {

    document.removeEventListener('DOMContentLoaded', main);

    window.language = 'de-DE';

    let pageTitle = title_base;
    if (directories_path.length > 0){
        pageTitle += ": " + directories_path.join("-")
    }
    document.title = pageTitle;

    $(s).addEventListener('keyup', filterListenerCallback);

    
    const breadcrumbs = ["ROOT", ...directories_path]
    breadcrumbs[0] = `<a onclick=onBackClick(${breadcrumbs.length-1})>${breadcrumbs[0]}</a>`
    $('#idx-path').innerHTML = '<small>' +
        breadcrumbs.reduce(function (a, v, i, o) {
            return a += ` / <a onclick=onBackClick(${o.length-i-1})>${v}</a> `;
        }); +
            '</small>'
    
}

// resets the page to its original state
function resetPage(c = 'table tbody', s='#idx-filter') {
    const load_div = document.createElement("div")
    load_div.classList.add("load")

    lds_div = document.createElement("div")
    lds_div.classList.add("lds")

    load_div.appendChild(lds_div)

    document.body.appendChild(load_div)

    $(s).removeEventListener("keyup", filterListenerCallback)

    // remove all previous entries
    const tbody = $(c);
    while (tbody.firstChild) {
        tbody.removeChild(tbody.lastChild);
    }
}

function onDirectoryClick(directoryName) {
    resetPage();
    directories_path.push(directoryName);
    main();
}

/**
 * Go back in the file directory hierarchy
 * @param {*} levels Define hos many levels to go back
 */
function onBackClick(levels=1) {
    resetPage();
    for(var i = 0; i<levels; i++){
        directories_path.pop();
    }
    main()
}

function onFileClick(fileName) {
    url = construct_file_url(fileName)
    window.open(url, "_blank")
}

function setData(a = [], n = [0, 0, 0, 0], p = 15000, m = 1, c = 'table tbody', f = 'footer') {
    let tblHtm = '';

    const directories = a.filter(entry => entry.type === "directory").sort().reverse()
    const files = a.filter(entry => entry.type === "file").sort().reverse()

    // add a back button, if we are currently not in the top-most directory
    if (directories_path.length > 0) {
        tblHtm += `<tr onclick=onBackClick()>
            <td><span class="material-icons" title="arrow_back">arrow_back</span><span style="display:none">arrow_back</span></td>
            <td>Back</td>
            <td></td>
            <td></td>
        </tr>`
    }

    // add entries for directories
    for (i in directories) {
        type = directories[i].type
        dir_name = directories[i].name
        dir_date = new Date(directories[i].mtime).toLocaleString(window.language)

        tblHtm += `<tr onclick=onDirectoryClick(${dir_name})>
                    <td><span class="material-icons" title="Folder">folder</span><span style="display:none">${type}</span></td>
                    <td>${dir_name}</td>
                    <td>${dir_date}</td>
                    <td></td>
                </tr>`;
    }

    // add entries for files
    for (i in files) {
        type = files[i].type
        file_name = files[i].name
        file_date = new Date(files[i].mtime).toLocaleString(window.language)
        file_size = files[i].size

        tblHtm += `<tr onclick=onFileClick("${file_name}")>
                    <td><span class="material-icons" title="File">insert_drive_file</span><span style="display:none">${type}</span></td>
                    <td>${file_name}</td>
                    <td>${file_date}</td>
                    <td>${humanFileSize(file_size, true, 2)}</td>
                </tr>`;
    }

    // remove loader
    $('.load').remove();

    // insert new elemnts
    $(c).innerHTML += tblHtm;

    $(f).innerHTML = `<span class="material-icons">folder_open</span><span>${directories.length}</span>
            <span class="material-icons">description</span><span>${files.length}</span>
            <span class="material-icons">account_tree</span><span>${directories.length + files.length}<strong>`;
    a = null;

}

async function main() {
    const jsn = await getData();
    setEnv();
    if (jsn) {
        setData(jsn);
    } else if (window.location.pathname.endsWith('.html')) {
        alert('Is NGINX autoindexing?');
    }
}

document.addEventListener('DOMContentLoaded', main);