import observable = require("data/observable");

// -----------------------------------------------------------
//  USER MODEL
// -----------------------------------------------------------

export interface Team {
    teamName: string;
    teamTag: string;
}

export interface User {
    userName: string;
    userId: string;
    email: string;
    role: string;
    teams: Array<Team>;
    password: string;
}

//export class UserModel extends observable.Observable implements User {
export class UserModel implements User {
    
    private _userName: string = '';
    private _userId: string = '';
    private _email: string = '';
    private _role: string = 'user';
    private _teams: Array<Team> = [];
    private _password: string = '';


    constructor(source?: User) {
        //super();
        
        console.log("in constructor user model");

        
        if (source) {
            this._userId = source.userId;
            this._email = source.email;
            this._password = source.password;
        }
    }


    // GETTERS
    get userName(): string {
        return this._userName;
    }
    get userId(): string {
        return this._userId;
    }
    get email(): string {
        return this._email;
    }
    get role(): string {
        return this._role;
    }
    get teams(): Array<Team> {
        return this._teams;
    }
    get password(): string {
        return this._password;
    }
    
    //SETTERS
    set userName(value: string) {
        this._userName = value;
    }
    set userId(value: string) {
        this._userId = value;
    }
    set email(value: string) {
        this._email = value;
    }
    set role(value: string) {
        this._role = value;
    }
    set teams(value: Array<Team>) {
        this._teams = value;
    }    
    set password(value: string) {
        this._password = value;
    }
}