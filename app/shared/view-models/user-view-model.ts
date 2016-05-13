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
    
    private _name = "";
    private _oldPassword = "";
    private _newPassword = "";
    private _confirmPassword = "";

    constructor() {
        super();

        console.log("in constructor user view model");

        this._user = settings.user;

        this._email = this._user.email;
        this._name = this._user.name;

    }

    get user(): userModel.UserModel {
        return this._user;
    }
    get email(): string {
        return this._email;
    }
    get name(): string {
        return this._name;
    }
    get oldPassword(): string {
        return this._oldPassword;
    }
    get newPassword(): string {
        return this._newPassword;
    }
    get confirmPassword(): string {
        return this._confirmPassword;
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

    set name(value: string) {
        this._name = value;
    }
    set oldPassword(value: string) {
        this._oldPassword = value;
    }
    set newPassword(value: string) {
        this._newPassword = value;
    }
    set confirmPassword(value: string) {
        this._confirmPassword = value;
    }

    public login() {
        var that = this;
        return firebase.login({
            type: firebase.LoginType.PASSWORD,
            email: this._email,
            password: this._password
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
                    okButtonText: "OK"
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

    public changePassword() {
        var that = this;
        return firebase.changePassword({
            email: this._email,
            oldPassword: this._oldPassword,
            newPassword: this._newPassword
        }).then(
            function (response) {
                that._user.name = that._name;
                settings.user = that._user;

                console.log("pw change settings.user: " + settings.user);
                console.log("pw change  settings.user.email: " + settings.user.email);
            },
            function (errorMessage) {
                dialogModel.alert({
                    title: "Wijziging niet gelukt",
                    message: errorMessage,
                    okButtonText: "OK"
                });
            });
    }


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