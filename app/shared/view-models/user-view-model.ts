import observable = require("data/observable");
import appModule = require("application");
import dialogModel = require("ui/dialogs");
import userModel = require("../../shared/models/users/user");
import settingsModel = require("../../shared/services/settings/settings");
import firebase = require("nativescript-plugin-firebase");

var settings = new settingsModel.SettingsModel();

export class UserViewModel extends observable.Observable {
    private _user: userModel.UserModel;
    private _email = "";
    private _password = "";

    constructor() {
        super();

        console.log("in constructor user view model");

        this._user = settings.user;

        this._email = this._user.email;

    }

    get user(): userModel.UserModel {
        return this._user;
    }
    get email(): string {
        return this._email;
    }
    get password(): string {
        return this._password;
    }

    set user(value: userModel.UserModel) {
        this._user = value;
    }
    set email(value: string) {
        this._email = value;
    }
    set password(value: string) {
        this._password = value;
    }

    public login() {
        var that = this;
        return firebase.login({
            type: firebase.LoginType.PASSWORD,
            email: this._email,
            password: this.password
        }).then(
            function (response) {
                that._user.userId = response.uid;
                that._user.email = that._email;
                settings.user = that._user;

                console.log("settings.user: " + settings.user);
                console.log("settings.user.email: " + settings.user.email);
                console.log(response.uid);
            },
            function (errorMessage) {
                dialogModel.alert({
                    title: "Login fout",
                    message: errorMessage,
                    okButtonText: "OK, pity"
                });
            });
    }

    public register() {
        return firebase.createUser({
            email: this._email,
            password: this._password
        }).then(
            function (response) {
                console.log(response);
                return response;
            },
            function (errorMessage) {
                dialogModel.alert({
                    title: "Registreren niet gelukt",
                    message: errorMessage,
                    okButtonText: "OK, got it"
                });
            });
    }

    public resetPassword() {
        return firebase.resetPassword({
            email: this._email
        }).then(
            function (result) {
                dialogModel.alert({
                    title: "Wachtwoord gereset, check je mail",
                    okButtonText: "OK"
                });
            },
            function (error) {
                dialogModel.alert({
                    title: "Wachtwoord reset fout",
                    message: error,
                    okButtonText: "Hmmkay :("
                });
            });
    };

    public logOut = function () {
        firebase.logout().then(
            function (result) {
                settings.removeUserInAppSettings();
                dialogModel.alert({
                    title: "Je bent uitgelogd",
                    okButtonText: "OK, bye!"
                });
            },
            function (error) {
                dialogModel.alert({
                    title: "Logout error",
                    message: error,
                    okButtonText: "OK"
                });
            }
        );
    };

}