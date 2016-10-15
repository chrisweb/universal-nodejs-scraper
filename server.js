/// <reference path="node_modules/json2csv/index.d.ts" />
/// <reference path="node_modules/@types/cheerio/index.d.ts" />
/// <reference path="node_modules/@types/lodash/index.d.ts" />
"use strict";
// nodejs request module
var request = require('request');
// nodejs request module
var fs = require('fs');
// https://github.com/cheeriojs/cheerio
var cheerio = require('cheerio');
// https://github.com/zemirco/json2csv
var json2csv = require('json2csv');
//import * as json2csv from 'json2csv';
// https://github.com/lodash/lodash
var _ = require('lodash');
// https://github.com/chrisweb/chrisweb-utilities.js
var utilities = require('chrisweb-utilities');
/*
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

                let secondColumnContentRaw = $secondColumn.text();

                let secondColumnContent = sanitizeString(secondColumnContentRaw);

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
*/
var sanitizeString = function santizeStringFunction(input) {
    // 1) remove all spaces and tabs but keep \r and \n
    // 2) remove multiple spaces and keep just one
    // 3) trim removes spaces and line breaks if they are at the beginning or end,
    // so no regex needed for this
    var inputNoSpace = input.replace(/[\t]/g, '').replace(/  +/g, ' ').trim();
    // apple uses \r for linebreaks, linux \n and windows \r\n
    // replace all \n, all \r and all \r\n by <br>
    // replace multiple <br> with an optional space in front or after them with \u2028
    // json stringify won't escape \u2028 (which is LS)
    // if we would use \n it would get escaped
    // below before writing the csv we will convert the \u2028 back to \n
    var output = inputNoSpace.replace(/(\r\n?|\n)/g, '<br>').replace(/( ?<br\s*\/?> ?){1,}/gi, '\u2028');
    return output;
};
var pageCounter = 1;
var scrap = function (urlToScrap, callback) {
    request(urlToScrap, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            utilities.log('finished harvesting page ' + pageCounter + ' now extracting metadata ...', 'fontColor:blue');
            pageCounter++;
            var $ = cheerio.load(html);
            var parsedResults = [];
            var $body = $('body');
        }
        else {
            callback(error, []);
        }
    });
};
var saveAsCSV = function (results, fields) {
    json2csv({ data: results, fields: fields }, function (error, csv) {
        // now we need to convert the \u2028 to \n
        // in json we used \u2028 because JSON.stringify won't escape it
        // but now we use \n before writing the csv to disk
        // TODO: would it be better to use os.EOL instead of hardcoded \n ?
        csv = csv.replace(/\u2028/g, '\n');
        if (error) {
            console.log(error);
        }
        else {
            fs.writeFile('output.csv', csv, function (err) {
                if (error) {
                    utilities.log(error, 'fontColor:red');
                }
                else {
                    utilities.log('file saved / job done :)', 'fontColor:green');
                }
            });
        }
    });
};
var createFile = function (results) {
    var fields = _.keys(results[0]);
    saveAsCSV(results, fields);
};
var save = function saveFunction(results) {
    // save the scrapping result
    switch (scrapOptions.save) {
        case 'csv':
            createFile(results);
            break;
    }
};
var results = [];
var pagesCount = 0;
var execute = function (scrapUrl) {
    scrap(scrapOptions.url, function (error, parsedResults, nextPageUrl) {
        if (!error) {
            results = _.union(results, parsedResults);
            // if there is no next page no need to go on scrapping
            if (!_.isNull(nextPageUrl)) {
                pagesCount++;
                var scrapOn = false;
                // continue scrapping if the amount of scrapped pages
                // is below the amount defined in the options or if 
                // no limit got defined at all
                if ('count' in scrapOptions.pagination
                    && pagesCount < scrapOptions.pagination.count) {
                    scrapOn = true;
                }
                else if (!('count' in scrapOptions.pagination)) {
                    scrapOn = true;
                }
                if (scrapOn) {
                    // wait 1 second then do next call
                    setTimeout(function () {
                        execute(nextPageUrl);
                    }, 1000);
                }
                else {
                    save(results);
                }
            }
            else {
                save(results);
            }
        }
    });
};
utilities.log('scrapping started', 'fontColor:green');
var scrapOptions = {
    url: 'https://news.ycombinator.com/',
    pagination: {
        count: 10
    },
    save: 'csv'
};
execute(scrapOptions.url);
//# sourceMappingURL=server.js.map