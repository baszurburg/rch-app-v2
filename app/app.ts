import application = require("application");
import firebase = require("nativescript-plugin-firebase");


application.onLaunch = function(intent) {
    console.log("onLaunch");

    firebase.init({
        url: 'https://intense-heat-7311.firebaseio.com/'
    }).then(
        function(result) {
            console.log('in doInit');
        },
        function(error) {
            console.log("firebase.init error: " + error);
        });

    if (application.android) {

        application.android.onActivityCreated = function(activity) {
            console.log("onCreated");
            var id = activity.getResources().getIdentifier("AppTheme", "style", activity.getPackageName());
            activity.setTheme(id);
        }

        application.android.onActivityStarted = function(activity) {
            console.log("onStarted");
            var window = activity.getWindow();
            if (window) {
                window.setBackgroundDrawable(null);
            }
        }
    }


}


// Set the start module for the application
application.mainModule = "views/main-page/main-page";

// Start the application
application.start();
