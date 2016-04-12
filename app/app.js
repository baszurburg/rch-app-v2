"use strict";
var application = require("application");
var firebase = require("nativescript-plugin-firebase");
application.onLaunch = function (intent) {
    console.log("onLaunch");
    firebase.init({
        url: 'https://intense-heat-7311.firebaseio.com/'
    }).then(function (result) {
        console.log('in doInit');
    }, function (error) {
        console.log("firebase.init error: " + error);
    });
    if (application.android) {
        application.android.onActivityCreated = function (activity) {
            console.log("onCreated");
            var id = activity.getResources().getIdentifier("AppTheme", "style", activity.getPackageName());
            activity.setTheme(id);
        };
        application.android.onActivityStarted = function (activity) {
            console.log("onStarted");
            var window = activity.getWindow();
            if (window) {
                window.setBackgroundDrawable(null);
            }
        };
    }
};
// Set the start module for the application
application.mainModule = "views/main-page/main-page";
// Start the application
application.start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFdBQVcsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUM1QyxJQUFPLFFBQVEsV0FBVyw4QkFBOEIsQ0FBQyxDQUFDO0FBRzFELFdBQVcsQ0FBQyxRQUFRLEdBQUcsVUFBUyxNQUFNO0lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFeEIsUUFBUSxDQUFDLElBQUksQ0FBQztRQUNWLEdBQUcsRUFBRSwyQ0FBMkM7S0FDbkQsQ0FBQyxDQUFDLElBQUksQ0FDSCxVQUFTLE1BQU07UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzdCLENBQUMsRUFDRCxVQUFTLEtBQUs7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDO0lBRVAsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFFdEIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsR0FBRyxVQUFTLFFBQVE7WUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6QixJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDL0YsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUE7UUFFRCxXQUFXLENBQUMsT0FBTyxDQUFDLGlCQUFpQixHQUFHLFVBQVMsUUFBUTtZQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3pCLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNsQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNULE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0wsQ0FBQyxDQUFBO0lBQ0wsQ0FBQztBQUdMLENBQUMsQ0FBQTtBQUdELDJDQUEyQztBQUMzQyxXQUFXLENBQUMsVUFBVSxHQUFHLDJCQUEyQixDQUFDO0FBRXJELHdCQUF3QjtBQUN4QixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMifQ==