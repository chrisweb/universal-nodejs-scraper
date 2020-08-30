interface IScrapOptions {
    saveAs: string;
    documentName: string;
}
interface IEntity {
    [key: string]: string;
}
export declare function getDocument(scrapRequestOptions?: IScrapOptions): Promise<string>;
export declare function scrapContent(data: string): Promise<IEntity[]>;
export declare function fetchImage(url: string, filename: string, extension: string, delayTime?: number): Promise<void>;
export declare function saveAsCSV(entities: IEntity[]): Promise<string>;
export {};
