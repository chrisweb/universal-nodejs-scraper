interface IScrapOptions {
    pagination: {
        count: number;
    };
    save: string;
    url: string;
    port: number;
    path: string;
    method: string;
}
interface IScrapResponse {
    statusCode: number;
    headers: unknown;
    body: string;
}
declare class Scraper {
    private scrapOptions;
    private pageCounter;
    execute: (scrapRequestOptions?: IScrapOptions) => Promise<IScrapResponse | Error>;
    private sanitizeString;
}
export default Scraper;
