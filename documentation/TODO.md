# TODOs

## open

* to make the tool really universal the first step would be to make a visual js frontend tool (using react or vuejs) to let a user enter a URL, visualize the page, select the data to be scrapped and assign the data to a source, so that no programming skills are required to use this tool
* offer option to change output file format (not only csv)
* offer option (through adapters) to save scraped data into a database
* to make a tool like this one less controversial, it would be nice to add way to first fetch robots.txt files before scrapping  content from a website so that this harvester can honor the robots.txt rules
* extend the hacker news example, so that it doesn't just scrap content from the homepage (first page) but also follows the pagination to scrap a defined amount of pages (bonus: add an interval the script waits before fetching the next page)

## done

* create first prototype, use hacker news website / articles for testing
* check out these alternatives: http://blog.webkid.io/nodejs-scraping-libraries/
* rename project to "nodejs universal web scrapper"
* use typescript 2 beta / visual studio update 3 2015 after visual studio got updated