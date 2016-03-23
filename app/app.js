"use strict";
var application = require("application");
if (application.android) {
    application.onLaunch = function (intent) {
        console.log("onLaunch");
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
    };
}
// Set the start module for the application
application.mainModule = "views/main-page/main-page";
// Start the application
application.start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFdBQVcsV0FBVyxhQUFhLENBQUMsQ0FBQztBQUU1QyxFQUFFLENBQUEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNyQixXQUFXLENBQUMsUUFBUSxHQUFHLFVBQVUsTUFBTTtRQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hCLFdBQVcsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxRQUFRO1lBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDekIsSUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQy9GLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFBO1FBRUQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLFFBQVE7WUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6QixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDVCxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsQ0FBQztRQUNMLENBQUMsQ0FBQTtJQUNMLENBQUMsQ0FBQTtBQUNMLENBQUM7QUFFRCwyQ0FBMkM7QUFDM0MsV0FBVyxDQUFDLFVBQVUsR0FBRywyQkFBMkIsQ0FBQztBQUVyRCx3QkFBd0I7QUFDeEIsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDIn0=