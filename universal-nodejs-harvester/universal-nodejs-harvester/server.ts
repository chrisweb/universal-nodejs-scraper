// nodejs request module
let request = require('request');

// nodejs request module
let fs = require('fs');

// https://github.com/cheeriojs/cheerio
let cheerio = require('cheerio');

// https://github.com/zemirco/json2csv
let json2csv = require('json2csv');

// https://github.com/lodash/lodash
let _ = require('lodash');

// https://github.com/chrisweb/chrisweb-utilities.js
let utilities = require('chrisweb-utilities');

let scrapDetails = function (urlToScrap, callback) {

    request(urlToScrap, function (error, response, html) {

        if (!error && response.statusCode == 200) {

            utilities.log('finished harvesting details, now extracting metadata ...', 'fontColor:yellow');

            let $ = cheerio.load(html);

            let result = {};

            let $body = $('body');
            let $mainContent = $body.find('.maincontent');
            let $rowsChildren = $mainContent.children('.row');
            let $thirdRow = $rowsChildren.eq(2);
            let $detailsTable = $thirdRow.find('table');
            //let $detailsTableBody = $detailsTable.find('tbody');
            let $tableRows = $detailsTable.children('tr');

            $tableRows.each(function (index, element) {

                let $element = $(element);
                let $columns = $element.find('td');
                let $secondColumn = $columns.eq(1);

                let secondColumnContent = $secondColumn.text().replace(/\\t/g, '').replace(/\s+/g, '').trim();

                switch (index) {
                    case 1:
                        result['address'] = secondColumnContent || '';
                        break;
                    case 2:
                        result['telephone'] = secondColumnContent || '';
                        break;
                    case 3:
                        result['mobile'] = secondColumnContent || '';
                        break;
                    case 4:
                        result['email'] = secondColumnContent || '';
                        break;
                    case 5:
                        result['website'] = secondColumnContent || '';
                        break;
                }

            });

            callback(null, result);

        } else {

            callback(error, '');

        }


    });

};

let pageCounter = 1;

let scrap = function (urlToScrap, callback) {

    request(urlToScrap, function (error, response, html) {

        if (!error && response.statusCode == 200) {

            utilities.log('finished harvesting page ' + pageCounter + ' now extracting metadata ...', 'fontColor:blue');

            pageCounter++;

            let $ = cheerio.load(html);

            let domainToScrap = 'http://www.gamescom-cologne.com';

            let parsedResults = [];

            let $body = $('body');

            let $elementWithId = $body.find('#ausform');
            let $table = $('#ausform').find('table');
            let $tableBody = $table.find('tbody');
            let $allRows = $tableBody.children('tr');

            let allRowsLength = $allRows.length;

            $allRows.each(function (index, element) {

                // wait 2 seconds then do next call
                setTimeout(() => {

                    let $element = $(element);

                    let $titleColumn = $element.find('.cspacer.ca3');
                    let $countryColumn = $element.find('.cspacer.ca4');
                    let $hallsColumn = $element.find('.cspacer.ca5');
                    let $boothsColumn = $element.find('.cspacer.ca6');
                
                    let $titleColumnLink = $titleColumn.find('a');
                    let detailsUrl = domainToScrap + $titleColumnLink.prop('href');
                    let name = $titleColumnLink.text().trim();

                    let country = $countryColumn.text().trim();

                    let halls = $hallsColumn.html().trim().replace(/<br>/g, ' / ').replace(/&#xA0;/g, ' ');

                    let booths = $boothsColumn.html().trim().replace(/<br>/g, ' / ').replace(/&#xA0;/g, ' ');

                    // metadata
                    let coreMetadata = {
                        name: name,
                        country: country,
                        halls: halls,
                        booths: booths
                    };

                    // now scrap the details page
                    // TODO: there should only be one scrapper
                    scrapDetails(detailsUrl, (error, detailsMetadata) => {

                        if (!error) {

                            let metadata = _.assign(coreMetadata, detailsMetadata);

                            parsedResults.push(metadata);

                        }

                        if (index === allRowsLength - 1) {
                        
                            // find links to other pages (through pagination)
                            let $pager = $body.find('.pager');
                            let $lastLinkElement = $pager.find('a').last();
                            let lastLinkUrl = $lastLinkElement.prop('href');

                            let nextPageUrl = null;
                            let lastLinkContent = parseInt($lastLinkElement.text().trim());

                            // if the content of the last link last link is NaN it means that
                            // it contains an arrow image, so we have a next page, otherweise
                            // if it is numeric it means we have reached the end
                            if (_.isNaN(lastLinkContent)) {
                                nextPageUrl = domainToScrap + lastLinkUrl;
                            }

                            
                            callback(null, parsedResults, nextPageUrl);


                        }

                    });

                }, 2000);

            });

        } else {

            callback(error, []);

        }

    });

};

let saveAsCSV = function (results, fields) {

    json2csv({ data: results, fields: fields }, function (error, csv) {

        if (error) {

            console.log(error);

        } else {

            fs.writeFile('output.csv', csv, function (err) {

                if (error) {

                    utilities.log(error, 'fontColor:red');

                } else {

                    utilities.log('file saved / job done :)', 'fontColor:green');

                }

            });

        }

    });

};

let createFile = function (results) {

    //let fields = ['name', 'country', 'halls', 'booths', 'website', 'email'];
    let fields = _.keys(results[0]);

    saveAsCSV(results, fields);

};

let results = [];

let execute = function (startUrlToScrap) {
    
    scrap(startUrlToScrap, function (error, parsedResults, nextPageUrl) {

        if (!error) {

            results = _.union(results, parsedResults);

            if (!_.isNull(nextPageUrl)) {

                // wait 2 seconds then do next call
                setTimeout(() => {
                    execute(nextPageUrl);
                }, 2000);

            } else {

                createFile(results);

            }

        }

    });

};

utilities.log('scrapping started', 'fontColor:green');

let startUrlToScrap = 'http://www.gamescom-cologne.com/gamescom/exhibitor-search/index.php';

execute(startUrlToScrap);