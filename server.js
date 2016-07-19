// nodejs request module
var request = require('request');
// nodejs request module
var fs = require('fs');
// https://github.com/cheeriojs/cheerio
var cheerio = require('cheerio');
// https://github.com/zemirco/json2csv
var json2csv = require('json2csv');
// https://github.com/lodash/lodash
var _ = require('lodash');
// https://github.com/chrisweb/chrisweb-utilities.js
var utilities = require('chrisweb-utilities');
var scrapDetails = function (urlToScrap, callback) {
    request(urlToScrap, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            utilities.log('finished harvesting details, now extracting metadata ...', 'fontColor:yellow');
            var $ = cheerio.load(html);
            var result = {};
            var $body = $('body');
            var $mainContent = $body.find('.maincontent');
            var $rowsChildren = $mainContent.children('.row');
            var $thirdRow = $rowsChildren.eq(2);
            var $detailsTable = $thirdRow.find('table');
            //let $detailsTableBody = $detailsTable.find('tbody');
            var $tableRows = $detailsTable.children('tr');
            $tableRows.each(function (index, element) {
                var $element = $(element);
                var $columns = $element.find('td');
                var $secondColumn = $columns.eq(1);
                var secondColumnContent = $secondColumn.text().replace(/\\t/g, '').replace(/\s+/g, '').trim();
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
        }
        else {
            callback(error, '');
        }
    });
};
var pageCounter = 1;
var scrap = function (urlToScrap, callback) {
    request(urlToScrap, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            utilities.log('finished harvesting page ' + pageCounter + ' now extracting metadata ...', 'fontColor:blue');
            pageCounter++;
            var $ = cheerio.load(html);
            var domainToScrap = 'http://www.gamescom-cologne.com';
            var parsedResults = [];
            var $body = $('body');
            var $elementWithId = $body.find('#ausform');
            var $table = $('#ausform').find('table');
            var $tableBody = $table.find('tbody');
            var $allRows = $tableBody.children('tr');
            var allRowsLength = $allRows.length;
            $allRows.each(function (index, element) {
                // wait 2 seconds then do next call
                setTimeout(function () {
                    var $element = $(element);
                    var $titleColumn = $element.find('.cspacer.ca3');
                    var $countryColumn = $element.find('.cspacer.ca4');
                    var $hallsColumn = $element.find('.cspacer.ca5');
                    var $boothsColumn = $element.find('.cspacer.ca6');
                    var $titleColumnLink = $titleColumn.find('a');
                    var detailsUrl = domainToScrap + $titleColumnLink.prop('href');
                    var name = $titleColumnLink.text().trim();
                    var country = $countryColumn.text().trim();
                    var halls = $hallsColumn.html().trim().replace(/<br>/g, ' / ').replace(/&#xA0;/g, ' ');
                    var booths = $boothsColumn.html().trim().replace(/<br>/g, ' / ').replace(/&#xA0;/g, ' ');
                    // metadata
                    var coreMetadata = {
                        name: name,
                        country: country,
                        halls: halls,
                        booths: booths
                    };
                    // now scrap the details page
                    // TODO: there should only be one scrapper
                    scrapDetails(detailsUrl, function (error, detailsMetadata) {
                        if (!error) {
                            var metadata = _.assign(coreMetadata, detailsMetadata);
                            parsedResults.push(metadata);
                            if (index === allRowsLength - 1) {
                                // find links to other pages (through pagination)
                                var $pager = $body.find('.pager');
                                var $lastLinkElement = $pager.find('a').last();
                                var lastLinkUrl = $lastLinkElement.prop('href');
                                var nextPageUrl = null;
                                var lastLinkContent = parseInt($lastLinkElement.text().trim());
                                // if the content of the last link last link is NaN it means that
                                // it contains an arrow image, so we have a next page, otherweise
                                // if it is numeric it means we have reached the end
                                if (_.isNaN(lastLinkContent)) {
                                    nextPageUrl = domainToScrap + lastLinkUrl;
                                }
                                callback(null, parsedResults, nextPageUrl);
                            }
                        }
                        else {
                            callback(error, []);
                        }
                    });
                }, index * 2000);
            });
        }
        else {
            callback(error, []);
        }
    });
};
var saveAsCSV = function (results, fields) {
    json2csv({ data: results, fields: fields }, function (error, csv) {
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
    //let fields = ['name', 'country', 'halls', 'booths', 'website', 'email'];
    var fields = _.keys(results[0]);
    saveAsCSV(results, fields);
};
var results = [];
var execute = function (startUrlToScrap) {
    scrap(startUrlToScrap, function (error, parsedResults, nextPageUrl) {
        if (!error) {
            results = _.union(results, parsedResults);
            if (!_.isNull(nextPageUrl)) {
                // wait 2 seconds then do next call
                setTimeout(function () {
                    execute(nextPageUrl);
                }, 2000);
            }
            else {
                createFile(results);
            }
        }
    });
};
utilities.log('scrapping started', 'fontColor:green');
var startUrlToScrap = 'http://www.gamescom-cologne.com/gamescom/exhibitor-search/index.php';
execute(startUrlToScrap);
//# sourceMappingURL=server.js.map