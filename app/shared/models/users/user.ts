import observable = require("data/observable");

// -----------------------------------------------------------
//  USER MODEL
// -----------------------------------------------------------

export interface User {
    userId: string;
    email: string;
    password: string;
}

export class UserModel extends observable.Observable implements User {
    constructor(source?: User) {
        super();
        if (source) {
            this._userId = source.userId;
            this._email = source.email;
            this._password = source.password;
        }
    }
    
    private _userId: string = '';
    private _email: string = '';
    private _password: string = '';

    // GETTERS
    get userId(): string {
        return this._userId;
    }
    get email(): string {
        return this._email;
    }
    get password(): string {
        return this._password;
    }
    
    //SETTERS
    set userId(value: string) {
        this._userId = value;
    }
    set email(value: string) {
        this._email = value;
    }
    set password(value: string) {
        this._password = value;
    }
}