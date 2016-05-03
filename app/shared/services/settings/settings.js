"use strict";
var observable = require("data/observable");
var userModel = require("../../models/users/user");
var localSettings = require("application-settings");
var USER = "USER";
var SettingsModel = (function (_super) {
    __extends(SettingsModel, _super);
    function SettingsModel() {
        _super.call(this);
        console.log('in constructor settings');
        this.getUserFromAppSettings();
    }
    Object.defineProperty(SettingsModel.prototype, "user", {
        get: function () {
            this.getUserFromAppSettings();
            return this._user;
        },
        set: function (value) {
            this._user = value;
            this.updateUserInAppSettings();
            this.notifyPropertyChange("user", value);
        },
        enumerable: true,
        configurable: true
    });
    // functions to get the Application Settings
    // Get user data from application settings
    SettingsModel.prototype.getUserFromAppSettings = function () {
        try {
            this._user = JSON.parse(localSettings.getString(USER));
        }
        catch (error) {
            console.log("Error while retrieveing user: " + error);
            // ToDo: we do not need all the fancy underscore data... !
            this._user = new userModel.UserModel();
            this.updateUserInAppSettings();
        }
    };
    SettingsModel.prototype.updateUserInAppSettings = function () {
        var newValue = JSON.stringify(this._user);
        console.log("settings updateUserInAppSettings user: " + newValue);
        localSettings.setString(USER, newValue);
    };
    SettingsModel.prototype.removeUserInAppSettings = function () {
        console.log("removing user: ");
        localSettings.remove(USER);
        this.user = new userModel.UserModel();
    };
    return SettingsModel;
}(observable.Observable));
exports.SettingsModel = SettingsModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFPLFNBQVMsV0FBVyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3RELElBQU8sYUFBYSxXQUFXLHNCQUFzQixDQUFDLENBQUM7QUFFdkQsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDO0FBRWxCO0lBQW1DLGlDQUFxQjtJQUlwRDtRQUNJLGlCQUFPLENBQUM7UUFFUixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFFbEMsQ0FBQztJQUdELHNCQUFJLCtCQUFJO2FBQVI7WUFDSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO2FBRUQsVUFBUyxLQUEwQjtZQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdDLENBQUM7OztPQU5BO0lBUUQsNENBQTRDO0lBQzVDLDBDQUEwQztJQUNuQyw4Q0FBc0IsR0FBN0I7UUFDSSxJQUFJLENBQUM7WUFDRCxJQUFJLENBQUMsS0FBSyxHQUF3QixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNoRixDQUNBO1FBQUEsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDdEQsMERBQTBEO1lBQzFELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDbkMsQ0FBQztJQUNMLENBQUM7SUFFTSwrQ0FBdUIsR0FBOUI7UUFDSSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1FBQ2xFLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTSwrQ0FBdUIsR0FBOUI7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0IsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFTCxvQkFBQztBQUFELENBQUMsQUFuREQsQ0FBbUMsVUFBVSxDQUFDLFVBQVUsR0FtRHZEO0FBbkRZLHFCQUFhLGdCQW1EekIsQ0FBQSJ9