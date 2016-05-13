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
        this._name = "";
        this._oldPassword = "";
        this._newPassword = "";
        this._confirmPassword = "";
        this.logOut = function () {
            firebase.logout().then(function (result) {
                settings.removeUserInAppSettings();
                dialogModel.alert({
                    title: "Je bent uitgelogd",
                    okButtonText: "OK, bye!"
                });
            }, function (error) {
                dialogModel.alert({
                    title: "Logout error",
                    message: error,
                    okButtonText: "OK"
                });
            });
        };
        console.log("in constructor user view model");
        this._user = settings.user;
        this._email = this._user.email;
        this._name = this._user.name;
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
    Object.defineProperty(UserViewModel.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserViewModel.prototype, "oldPassword", {
        get: function () {
            return this._oldPassword;
        },
        set: function (value) {
            this._oldPassword = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserViewModel.prototype, "newPassword", {
        get: function () {
            return this._newPassword;
        },
        set: function (value) {
            this._newPassword = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserViewModel.prototype, "confirmPassword", {
        get: function () {
            return this._confirmPassword;
        },
        set: function (value) {
            this._confirmPassword = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserViewModel.prototype, "password", {
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
            password: this._password
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
                okButtonText: "OK"
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
    UserViewModel.prototype.changePassword = function () {
        var that = this;
        return firebase.changePassword({
            email: this._email,
            oldPassword: this._oldPassword,
            newPassword: this._newPassword
        }).then(function (response) {
            that._user.name = that._name;
            settings.user = that._user;
            console.log("pw change settings.user: " + settings.user);
            console.log("pw change  settings.user.email: " + settings.user.email);
        }, function (errorMessage) {
            dialogModel.alert({
                title: "Wijziging niet gelukt",
                message: errorMessage,
                okButtonText: "OK"
            });
        });
    };
    return UserViewModel;
}(observable.Observable));
exports.UserViewModel = UserViewModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci12aWV3LW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXNlci12aWV3LW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFVBQVUsV0FBVyxpQkFBaUIsQ0FBQyxDQUFDO0FBRS9DLElBQU8sV0FBVyxXQUFXLFlBQVksQ0FBQyxDQUFDO0FBRTNDLElBQU8sYUFBYSxXQUFXLHlDQUF5QyxDQUFDLENBQUM7QUFDMUUsSUFBTyxRQUFRLFdBQVcsOEJBQThCLENBQUMsQ0FBQztBQUUxRCxJQUFJLFFBQVEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUVqRDtJQUFtQyxpQ0FBcUI7SUFVcEQ7UUFDSSxpQkFBTyxDQUFDO1FBVEosV0FBTSxHQUFHLEVBQUUsQ0FBQztRQUNaLGNBQVMsR0FBRyxFQUFFLENBQUM7UUFFZixVQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ1gsaUJBQVksR0FBRyxFQUFFLENBQUM7UUFDbEIsaUJBQVksR0FBRyxFQUFFLENBQUM7UUFDbEIscUJBQWdCLEdBQUcsRUFBRSxDQUFDO1FBOEl2QixXQUFNLEdBQUc7WUFDWixRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUNsQixVQUFVLE1BQU07Z0JBQ1osUUFBUSxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQ25DLFdBQVcsQ0FBQyxLQUFLLENBQUM7b0JBQ2QsS0FBSyxFQUFFLG1CQUFtQjtvQkFDMUIsWUFBWSxFQUFFLFVBQVU7aUJBQzNCLENBQUMsQ0FBQztZQUNQLENBQUMsRUFDRCxVQUFVLEtBQUs7Z0JBQ1gsV0FBVyxDQUFDLEtBQUssQ0FBQztvQkFDZCxLQUFLLEVBQUUsY0FBYztvQkFDckIsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsWUFBWSxFQUFFLElBQUk7aUJBQ3JCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FDSixDQUFDO1FBQ04sQ0FBQyxDQUFDO1FBMUpFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFFM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBRWpDLENBQUM7SUFFRCxzQkFBSSwrQkFBSTthQUFSO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQzthQWlCRCxVQUFTLEtBQTBCO1lBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLENBQUM7OztPQW5CQTtJQUNELHNCQUFJLGdDQUFLO2FBQVQ7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN2QixDQUFDO2FBaUJELFVBQVUsS0FBYTtZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDOzs7T0FuQkE7SUFDRCxzQkFBSSwrQkFBSTthQUFSO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQzthQXFCRCxVQUFTLEtBQWE7WUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDdkIsQ0FBQzs7O09BdkJBO0lBQ0Qsc0JBQUksc0NBQVc7YUFBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzdCLENBQUM7YUFxQkQsVUFBZ0IsS0FBYTtZQUN6QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUM5QixDQUFDOzs7T0F2QkE7SUFDRCxzQkFBSSxzQ0FBVzthQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDN0IsQ0FBQzthQXFCRCxVQUFnQixLQUFhO1lBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzlCLENBQUM7OztPQXZCQTtJQUNELHNCQUFJLDBDQUFlO2FBQW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUNqQyxDQUFDO2FBcUJELFVBQW9CLEtBQWE7WUFDN0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztRQUNsQyxDQUFDOzs7T0F2QkE7SUFRRCxzQkFBSSxtQ0FBUTthQUFaLFVBQWEsS0FBYTtZQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUMzQixDQUFDOzs7T0FBQTtJQWVNLDZCQUFLLEdBQVo7UUFDSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFDaEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDbEIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUTtZQUNqQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbEIsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTO1NBQzNCLENBQUMsQ0FBQyxJQUFJLENBQ0gsVUFBVSxRQUFRO1lBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQy9CLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUUzQixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxFQUNELFVBQVUsWUFBWTtZQUNsQixXQUFXLENBQUMsS0FBSyxDQUFDO2dCQUNkLEtBQUssRUFBRSxZQUFZO2dCQUNuQixPQUFPLEVBQUUsWUFBWTtnQkFDckIsWUFBWSxFQUFFLElBQUk7YUFDckIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRU0sZ0NBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQ3ZCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNsQixRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVM7U0FDM0IsQ0FBQyxDQUFDLElBQUksQ0FDSCxVQUFVLFFBQVE7WUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDcEIsQ0FBQyxFQUNELFVBQVUsWUFBWTtZQUNsQixXQUFXLENBQUMsS0FBSyxDQUFDO2dCQUNkLEtBQUssRUFBRSx5QkFBeUI7Z0JBQ2hDLE9BQU8sRUFBRSxZQUFZO2dCQUNyQixZQUFZLEVBQUUsWUFBWTthQUM3QixDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFTSxxQ0FBYSxHQUFwQjtRQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO1lBQzFCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTTtTQUNyQixDQUFDLENBQUMsSUFBSSxDQUNILFVBQVUsTUFBTTtZQUNaLFdBQVcsQ0FBQyxLQUFLLENBQUM7Z0JBQ2QsS0FBSyxFQUFFLG1DQUFtQztnQkFDMUMsWUFBWSxFQUFFLElBQUk7YUFDckIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxFQUNELFVBQVUsS0FBSztZQUNYLFdBQVcsQ0FBQyxLQUFLLENBQUM7Z0JBQ2QsS0FBSyxFQUFFLHVCQUF1QjtnQkFDOUIsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsWUFBWSxFQUFFLFdBQVc7YUFDNUIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztJQUVNLHNDQUFjLEdBQXJCO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO1lBQzNCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNsQixXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDOUIsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZO1NBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQ0gsVUFBVSxRQUFRO1lBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUM3QixRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFFM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFFLENBQUMsRUFDRCxVQUFVLFlBQVk7WUFDbEIsV0FBVyxDQUFDLEtBQUssQ0FBQztnQkFDZCxLQUFLLEVBQUUsdUJBQXVCO2dCQUM5QixPQUFPLEVBQUUsWUFBWTtnQkFDckIsWUFBWSxFQUFFLElBQUk7YUFDckIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBc0JMLG9CQUFDO0FBQUQsQ0FBQyxBQXpLRCxDQUFtQyxVQUFVLENBQUMsVUFBVSxHQXlLdkQ7QUF6S1kscUJBQWEsZ0JBeUt6QixDQUFBIn0=