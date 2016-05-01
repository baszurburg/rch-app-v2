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
            console.log('this._user !== value:' + (this._user !== value));
            console.log('this._user === value:' + (this._user === value));
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
    };
    return SettingsModel;
}(observable.Observable));
exports.SettingsModel = SettingsModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxVQUFVLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUMvQyxJQUFPLFNBQVMsV0FBVyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3RELElBQU8sYUFBYSxXQUFXLHNCQUFzQixDQUFDLENBQUM7QUFFdkQsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDO0FBRWxCO0lBQW1DLGlDQUFxQjtJQUlwRDtRQUNJLGlCQUFPLENBQUM7UUFFUixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFFbEMsQ0FBQztJQUVELHNCQUFJLCtCQUFJO2FBQVI7WUFDSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO2FBRUQsVUFBUyxLQUEwQjtZQUUvQixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFOUQsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU3QyxDQUFDOzs7T0FYQTtJQWFELDRDQUE0QztJQUM1QywwQ0FBMEM7SUFDbkMsOENBQXNCLEdBQTdCO1FBQ0ksSUFBSSxDQUFDO1lBQ0QsSUFBSSxDQUFDLEtBQUssR0FBd0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDaEYsQ0FDQTtRQUFBLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDbkMsQ0FBQztJQUNMLENBQUM7SUFFTSwrQ0FBdUIsR0FBOUI7UUFDSSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1FBQ2xFLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTSwrQ0FBdUIsR0FBOUI7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0IsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUwsb0JBQUM7QUFBRCxDQUFDLEFBckRELENBQW1DLFVBQVUsQ0FBQyxVQUFVLEdBcUR2RDtBQXJEWSxxQkFBYSxnQkFxRHpCLENBQUEifQ==