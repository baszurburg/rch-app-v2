"use strict";
var observable = require("data/observable");
var dialogModel = require("ui/dialogs");
var settingsModel = require("../../shared/services/settings/settings");
var firebase = require("nativescript-plugin-firebase");
var settings = new settingsModel.SettingsModel();
var UserViewModel = (function (_super) {
    __extends(UserViewModel, _super);
    function UserViewModel() {
        _super.call(this);
        this._email = "";
        this._password = "";
        this.logOut = function () {
            firebase.logout().then(function (result) {
                settings.removeUserInAppSettings();
                dialogModel.alert({
                    title: "Logout OK",
                    okButtonText: "OK, bye!"
                });
            }, function (error) {
                dialogModel.alert({
                    title: "Logout error",
                    message: error,
                    okButtonText: "Hmmkay"
                });
            });
        };
        this._user = settings.user;
        this._email = this._user.email;
    }
    Object.defineProperty(UserViewModel.prototype, "user", {
        get: function () {
            return this._user;
        },
        set: function (value) {
            this._user = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserViewModel.prototype, "email", {
        get: function () {
            return this._email;
        },
        set: function (value) {
            this._email = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserViewModel.prototype, "password", {
        get: function () {
            return this._password;
        },
        set: function (value) {
            this._password = value;
        },
        enumerable: true,
        configurable: true
    });
    UserViewModel.prototype.login = function () {
        var that = this;
        return firebase.login({
            type: firebase.LoginType.PASSWORD,
            email: this._email,
            password: this.password
        }).then(function (response) {
            that._user.userId = response.uid;
            that._user.email = that._email;
            settings.user = that._user;
            console.log("settings.user: " + settings.user);
            console.log("settings.user.email: " + settings.user.email);
            console.log(response.uid);
        }, function (errorMessage) {
            dialogModel.alert({
                title: "Login fout",
                message: errorMessage,
                okButtonText: "OK, pity"
            });
        });
    };
    UserViewModel.prototype.register = function () {
        return firebase.createUser({
            email: this._email,
            password: this._password
        }).then(function (response) {
            console.log(response);
            return response;
        }, function (errorMessage) {
            dialogModel.alert({
                title: "Registreren niet gelukt",
                message: errorMessage,
                okButtonText: "OK, got it"
            });
        });
    };
    UserViewModel.prototype.resetPassword = function () {
        return firebase.resetPassword({
            email: this._email
        }).then(function (result) {
            dialogModel.alert({
                title: "Wachtwoord gereset, check je mail",
                okButtonText: "OK"
            });
        }, function (error) {
            dialogModel.alert({
                title: "Wachtwoord reset fout",
                message: error,
                okButtonText: "Hmmkay :("
            });
        });
    };
    ;
    return UserViewModel;
}(observable.Observable));
exports.UserViewModel = UserViewModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci12aWV3LW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXNlci12aWV3LW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFVBQVUsV0FBVyxpQkFBaUIsQ0FBQyxDQUFDO0FBRS9DLElBQU8sV0FBVyxXQUFXLFlBQVksQ0FBQyxDQUFDO0FBRTNDLElBQU8sYUFBYSxXQUFXLHlDQUF5QyxDQUFDLENBQUM7QUFDMUUsSUFBTyxRQUFRLFdBQVcsOEJBQThCLENBQUMsQ0FBQztBQUUxRCxJQUFJLFFBQVEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUVqRDtJQUFtQyxpQ0FBcUI7SUFLcEQ7UUFDSSxpQkFBTyxDQUFDO1FBSkosV0FBTSxHQUFHLEVBQUUsQ0FBQztRQUNaLGNBQVMsR0FBRyxFQUFFLENBQUM7UUE2RmhCLFdBQU0sR0FBRztZQUNaLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQ2xCLFVBQVUsTUFBTTtnQkFDWixRQUFRLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztnQkFDbkMsV0FBVyxDQUFDLEtBQUssQ0FBQztvQkFDZCxLQUFLLEVBQUUsV0FBVztvQkFDbEIsWUFBWSxFQUFFLFVBQVU7aUJBQzNCLENBQUMsQ0FBQztZQUNQLENBQUMsRUFDRCxVQUFVLEtBQUs7Z0JBQ1gsV0FBVyxDQUFDLEtBQUssQ0FBQztvQkFDZCxLQUFLLEVBQUUsY0FBYztvQkFDckIsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsWUFBWSxFQUFFLFFBQVE7aUJBQ3pCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FDSixDQUFDO1FBQ04sQ0FBQyxDQUFDO1FBekdFLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztRQUUzQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0lBRW5DLENBQUM7SUFFRCxzQkFBSSwrQkFBSTthQUFSO1lBQ0ks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