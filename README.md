# Beautiful nginx autoindex

This simple project will create a nice looking user interface (ui) for your nginx autoindex.

**Credits**: This work is based on the amazing work by [EthraZa](https://github.com/EthraZa) and his [NGINdeX](https://github.com/EthraZa/NGINdeX.io) project.

**Changes**:
 * simplified  UI
 * render any nginx autoindex in json format
 * deploy alongside autoindex-json endpoint
 * Added a "Back" to move up in the hierarchy
 * single-page: dynamically rendered client-side
 * Simplifications in the code
 * outsources CSS and JS into external file

## Basic functionality

The browser requests the autoindex in json-format from nginx, which is then rendered into html.

## Setup

### Nginx Setup
```
location / {
  autoindex on;
  autoindex_format json;
  add_header Access-Control-Allow-Origin *;  # optionally add CORS, if this frontend is running somewhere else
}

location /frontend {
  alias /data/nginx-autoindex-prettify;
  index index.html
}
```

### Frontend setup

Open main.js and adjust the `cfg` object at the top of the file
* **server_base_url**: URL to the nginx server
* **enpoint**: endpoint, at which the nginx serves the index
* **page_title_base**: Base of the page title, that will be displayed in the browser
