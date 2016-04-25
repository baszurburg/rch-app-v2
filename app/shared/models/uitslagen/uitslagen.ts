import observable = require("data/observable");

// -----------------------------------------------------------
//  UITSLAGEN MODEL
// -----------------------------------------------------------

export interface Uitslag {
    Datum: string;
    Thuis: string;
    Uit: string;
    Uitslag: string;
    newDate: boolean;
}

export class UitslagModel extends observable.Observable implements Uitslag {
    constructor(source?: Uitslag) {
        super();
        if (source) {
            this._datum = source.Datum;
            this._thuis = source.Thuis;
            this._uit = source.Uit;
            this._uitslag = source.Uitslag;
            this._newDate = source.newDate;
        }
    }
    
    private _datum: string;
    private _thuis: string;
    private _uit: string;
    private _uitslag: string;
    private _newDate: boolean;

    get Datum(): string {
        return this._datum;
    }
    get Thuis(): string {
        return this._thuis;
    }
    get Uit(): string {
        return this._uit;
    }
    get Uitslag(): string {
        return this._uitslag;
    }
    get newDate(): boolean {
        return this._newDate;
    }
    set newDate(value: boolean) {
        this._newDate = value;
    }
}