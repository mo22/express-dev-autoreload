#express-dev-autoreload

## Example Usage

    var app = ...
    app.use(require('express-dev-autoreload')({}));

injects javascript code to returned text/html responses to automatically relaod if file changes
occured at process.cwd()

