import observable = require("data/observable");
import userModel = require("../../models/users/user");
import localSettings = require("application-settings");

var USER = "USER";

export class SettingsModel extends observable.Observable {
    //export class SettingsModel {
    private _user: userModel.UserModel;

    constructor() {
        super();

        console.log('in constructor settings');

        this.getUserFromAppSettings();

    }


    get user(): userModel.UserModel {
        this.getUserFromAppSettings();
        return this._user;
    }

    set user(value: userModel.UserModel) {
        this._user = value;
        this.updateUserInAppSettings();
        this.notifyPropertyChange("user", value);
    }

    // functions to get the Application Settings
    // Get user data from application settings
    public getUserFromAppSettings() {
        try {
            this._user = <userModel.UserModel>JSON.parse(localSettings.getString(USER));
        }
        catch (error) {
            console.log("Error while retrieveing user: " + error);
            // ToDo: we do not need all the fancy underscore data... !
            this._user = new userModel.UserModel();
            this.updateUserInAppSettings();
        }
    }

    public updateUserInAppSettings() {
        var newValue = JSON.stringify(this._user);
        console.log("settings updateUserInAppSettings user: " + newValue);
        localSettings.setString(USER, newValue);
    }

    public removeUserInAppSettings() {
        console.log("removing user: ");
        localSettings.remove(USER);
        this.user = new userModel.UserModel();
    }

}