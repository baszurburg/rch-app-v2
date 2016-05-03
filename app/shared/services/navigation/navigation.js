"use strict";
var frameModule = require("ui/frame");
module.exports = {
    goToMainPage: function () {
        frameModule.topmost().navigate("views/main-page/main-page");
    },
    goToLoginPage: function () {
        frameModule.topmost().navigate("views/account/login/login-page");
    },
    goToPasswordPage: function () {
        frameModule.topmost().navigate("views/password/password");
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5hdmlnYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQU8sV0FBVyxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBRXpDLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDaEIsWUFBWSxFQUFFO1FBQ2IsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFDRCxhQUFhLEVBQUU7UUFDZCxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUNELGdCQUFnQixFQUFFO1FBQ2pCLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMzRCxDQUFDO0NBRUQsQ0FBQyJ9