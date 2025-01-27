
const axios = require('axios');
const { JSDOM } = require('jsdom');
const xml2js = require('xml2js');

// Function to fetch URLs from sitemap.xml
async function fetchSitemapUrls(sitemapUrl) {
    try {
        const response = await axios.get(sitemapUrl);
        const parsedData = await xml2js.parseStringPromise(response.data);
        return parsedData.urlset.url.map(entry => entry.loc[0]);
    } catch (error) {
        console.error(`Error fetching sitemap: ${error.message}`);
        throw new Error('Failed to fetch sitemap.');
    }
}

// Function to check links within a page
async function checkLinksInPage(url) {
    try {
        const response = await axios.get(url);
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        const links = document.querySelectorAll('a');

        let issues = [];
        let brokenLinks = [];

        for (const link of links) {
            const href = link.href;
            const linkText = link.textContent.trim();

            if (href.includes('educationgovuk.sharepoint')) {
                if (!linkText.includes('(DfE Intranet)')) {
                    issues.push({
                        pageUrl: url,
                        standard: getStandardSlug(url),
                        linkUrl: href,
                        linkText: linkText || 'No text found',
                    });
                }
            } else {
                // Check for 404 errors on non-SharePoint links
                const status = await checkLinkStatus(href);
                if (status === 404) {
                    brokenLinks.push({
                        pageUrl: url,
                        standard: getStandardSlug(url),
                        linkUrl: href,
                        linkText: linkText || 'No text found',
                        status: status,
                    });
                }
            }
        }

        return { issues, brokenLinks };
    } catch (error) {
        console.error(`Error processing page ${url}: ${error.message}`);
        return { issues: [], brokenLinks: [] };
    }
}

// Function to check link status
async function checkLinkStatus(link) {
    try {
        const response = await axios.head(link, { timeout: 5000 });
        return response.status;
    } catch (error) {
        return error.response ? error.response.status : 500;
    }
}

// Extract the standard slug from the URL
function getStandardSlug(url) {
    const urlParts = url.split('/');
    return urlParts.filter(part => part.trim() !== '').pop() || 'N/A';
}

// Controller function to handle the request and return an HTML report
exports.checkSitemapLinks = async (req, res) => {
    const sitemapUrl = req.query.sitemap || 'https://standards.education.gov.uk/sitemap.xml'; // Default sitemap URL

    try {
        const urls = await fetchSitemapUrls(sitemapUrl);
        if (!urls.length) {
            return res.status(404).send('<h2>No URLs found in the sitemap.</h2>');
        }

        let report = [];
        let brokenLinksReport = [];

        for (const url of urls) {
            console.log(`Checking page: ${url}`);
            const { issues, brokenLinks } = await checkLinksInPage(url);
            report = report.concat(issues);
            brokenLinksReport = brokenLinksReport.concat(brokenLinks);
        }

        let htmlReport = `
            <html>
            <head>
                <title>Sharepoint links without (DfE Intranet) in link text</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                </style>
            </head>
            <body>
                <h2>Issues Found in Sitemap Pages</h2>
                ${report.length > 0 ? `
                <table>
                    <tr>
                        <th>Page URL</th>
                        <th>Standard</th>
                        <th>Link URL</th>
                        <th>Link Text</th>
                    </tr>` +
                report.map(issue => `
                    <tr>
                        <td><a href="${issue.pageUrl}" target="_blank">${issue.pageUrl}</a></td>
                        <td>${issue.standard}</td>
                        <td><a href="${issue.linkUrl}" target="_blank">${issue.linkUrl}</a></td>
                        <td>${issue.linkText}</td>
                    </tr>`).join('') + `
                </table>` : '<p>No SharePoint link issues found.</p>'}
                
                <h2>Broken Links Report (Non-SharePoint)</h2>
                ${brokenLinksReport.length > 0 ? `
                <table>
                    <tr>
                        <th>Page URL</th>
                        <th>Standard</th>
                        <th>Broken Link</th>
                        <th>Link Text</th>
                        <th>Status</th>
                    </tr>` +
                brokenLinksReport.map(link => `
                    <tr>
                        <td><a href="${link.pageUrl}" target="_blank">${link.pageUrl}</a></td>
                        <td>${link.standard}</td>
                        <td><a href="${link.linkUrl}" target="_blank">${link.linkUrl}</a></td>
                        <td>${link.linkText}</td>
                        <td>${link.status}</td>
                    </tr>`).join('') + `
                </table>` : '<p>No broken links found.</p>'}
            </body>
            </html>`;

        return res.status(200).send(htmlReport);

    } catch (error) {
        res.status(500).send(`<h2>Error processing sitemap: ${error.message}</h2>`);
    }
};
