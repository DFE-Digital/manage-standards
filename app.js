// app.js
const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const compression = require('compression'); 
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logger = require('./utils/logger'); // Import the Winston logger
const appRoutes = require('./app/routes.js');
var markdown = require('nunjucks-markdown')
var dateFilter = require('nunjucks-date-filter')
var marked = require('marked')
const pg = require('pg'); 
const airtable = require('airtable');
const base = new airtable({ apiKey: process.env.airtableFeedbackKey }).base(process.env.airtableFeedbackBase);

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const app = express();

// Use compression middleware for performance
app.use(compression());

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});


// async function ensureSessionTable() {
//     const createTableQuery = `
//         CREATE TABLE IF NOT EXISTS sessions (
//             sid VARCHAR NOT NULL PRIMARY KEY,
//             sess JSON NOT NULL,
//             expire TIMESTAMP(6) NOT NULL
//         );
//         CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions (expire);
//     `;

//     try {
//         const client = await pool.connect();
//         await client.query(createTableQuery);
//         client.release();
//         console.log("Sessions table ensured in database.");
//     } catch (error) {
//         console.error("Error ensuring sessions table:", error);
//     }
// }

// // Call this function before setting up your session middleware
// ensureSessionTable();


app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'sessions'
    }),
    secret: process.env.SESSION_KEY,
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Configure Morgan to use Winston for HTTP request logging
// app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// Configure Nunjucks to use .html templates and new directory structure
var nunjuckEnv = nunjucks.configure([
    'app/views',
    'app/views/layouts',
    'node_modules/govuk-frontend/dist/',
    'node_modules/dfe-frontend/packages/components',
], {
    autoescape: true,
    express: app,
    watch: true,
    extension: 'html',
    noCache: false
});

nunjuckEnv.addFilter('date', dateFilter)
markdown.register(nunjuckEnv, marked.parse)

// Create a nunjucks filter to format version numbers to 2 dp
nunjuckEnv.addFilter('formatVersion', function (num) {
    return parseFloat(num).toFixed(2);
});

app.locals.serviceName = process.env.serviceName;
app.locals.cmsEnabled = process.env.cmsEnabled;
app.locals.staging = process.env.staging === 'true' ? true : false;
app.locals.manualURL = process.env.manualURL;


// Serve static files from govuk-frontend and dfe-frontend
app.use('/govuk', express.static(path.join(__dirname, 'node_modules/govuk-frontend/govuk/assets')));
app.use('/dfe', express.static(path.join(__dirname, 'node_modules/dfe-frontend/dist')));



// Serve custom static files
app.use('/assets', express.static('public/assets'));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Set view engine to Nunjucks with .html extension
app.set('view engine', 'html');


// Route for handling Yes/No feedback submissions
app.post('/form-response/helpful', (req, res) => {
    const { response } = req.body;
    const pageURL = req.headers.referer || 'Unknown';
    const date = new Date().toISOString();


    base('Data').create([
        {
            "fields": {
                "Response": response,
                "Service": 'Create and manage standards',
                "URL": pageURL
            }
        }
    ], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving to Airtable');
        }
        res.json({ success: true, message: 'Feedback submitted successfully' });
    });
});

// New route for handling detailed feedback submissions
app.post('/form-response/feedback', (req, res) => {
    const { response } = req.body;


    console.log(req)

    // Example service name
    const pageURL = req.headers.referer || 'Unknown'; // Attempt to capture the referrer URL
    const date = new Date().toISOString();

    base('Feedback').create([{
        "fields": {
            "Feedback": response,
            "Service": 'Create and manage standards',
            "URL": pageURL
        }
    }], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving to Airtable');
        }
        res.json({ success: true, message: 'Feedback submitted successfully' });
    });
});


// Use application routes
app.use('/', appRoutes);

// Redirect URLs ending with .html to clean URLs
app.get(/\.html?$/i, function (req, res) {
    let urlPath = req.path;
    const parts = urlPath.split('.');
    parts.pop();
    urlPath = parts.join('.');
    res.redirect(urlPath);
});

// Dynamic Route Matching for URLs without extensions
app.get(/^([^.]+)$/, function (req, res, next) {
    matchRoutes(req, res, next);
});


// Function to render paths
function renderPath(path, res, next) {
    // Try to render the path
    res.render(path, function (error, html) {
        if (!error) {
            // Success - send the response
            res.set({ 'Content-type': 'text/html; charset=utf-8' });
            res.end(html);
            return;
        }
        if (!error.message.startsWith('template not found')) {
            // We got an error other than template not found - call next with the error
            next(error);
            return;
        }
        if (!path.endsWith('/index')) {
            // Maybe it's a folder - try to render [path]/index.html
            renderPath(path + '/index', res, next);
            return;
        }
        // We got template not found both times - call next to trigger the 404 page
        next();
    });
}

// Function to match routes dynamically
function matchRoutes(req, res, next) {
    let path = req.path;

    // Remove the first slash, render won't work with it
    path = path.startsWith('/') ? path.slice(1) : path;

    // If it's blank, render the root index
    if (path === '') {
        path = 'index';
    }

    renderPath(path, res, next);
}

// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).render('error', { title: 'Page Not Found' });
});

// General Error Handler
app.use((err, req, res, next) => {
    logger.error(`Unhandled Error: ${err.message}`);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3084;
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
