interface IScrapOptions {
    saveAs: string;
    documentName: string;
}
interface IEntity {
    first: number;
    second: number;
    third: number;
}
export declare function getDocument(scrapRequestOptions?: IScrapOptions): Promise<string>;
export declare function scrapContent(data: string): Promise<IEntity[]>;
export declare function saveAsCSV(entities: IEntity[]): Promise<string>;
export {};
