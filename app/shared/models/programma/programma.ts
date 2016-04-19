import observable = require("data/observable");

// -----------------------------------------------------------
//  PROGRAMMA MODEL
// -----------------------------------------------------------

export interface Programma {
    Datum: string;
    Thuis: string;
    Tijd: string;
    Type: string;
    Uit: string;
    WedNr: string;
}

export class ProgrammaModel extends observable.Observable implements Programma {
    constructor(source?: Programma) {
        super();
        if (source) {
            this._datum = source.Datum;
            this._thuis = source.Thuis;
            this._tijd = source.Tijd;
            this._type = source.Type;
            this._uit = source.Uit;
            this._wedNr = source.WedNr;
        }
    }
    
    private _datum: string;
    private _thuis: string;
    private _tijd: string;
    private _type: string;
    private _uit: string;
    private _wedNr: string;

    get Datum(): string {
        return this._datum;
    }
    get Thuis(): string {
        return this._thuis;
    }
    get Tijd(): string {
        return this._tijd;
    }
    get Type(): string {
        return this._type;
    }
    get Uit(): string {
        return this._uit;
    }
    get WedNr(): string {
        return this._wedNr;
    }
}