declare class Scraper {
    private scrapOptions;
    private pageCounter;
    execute: (scrapUrl?: string) => void;
    private sanitizeString;
    private scrap;
}
export default Scraper;
