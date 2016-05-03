"use strict";
//export class UserModel extends observable.Observable implements User {
var UserModel = (function () {
    function UserModel(source) {
        //super();
        this._userName = '';
        this._userId = '';
        this._email = '';
        this._role = 'user';
        this._teams = [];
        this._password = '';
        console.log("in constructor user model");
        if (source) {
            this._userId = source.userId;
            this._email = source.email;
            this._password = source.password;
        }
    }
    Object.defineProperty(UserModel.prototype, "userName", {
        // GETTERS
        get: function () {
            return this._userName;
        },
        //SETTERS
        set: function (value) {
            this._userName = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserModel.prototype, "userId", {
        get: function () {
            return this._userId;
        },
        set: function (value) {
            this._userId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserModel.prototype, "email", {
        get: function () {
            return this._email;
        },
        set: function (value) {
            this._email = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserModel.prototype, "role", {
        get: function () {
            return this._role;
        },
        set: function (value) {
            this._role = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserModel.prototype, "teams", {
        get: function () {
            return this._teams;
        },
        set: function (value) {
            this._teams = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UserModel.prototype, "password", {
        get: function () {
            return this._password;
        },
        set: function (value) {
            this._password = value;
        },
        enumerable: true,
        configurable: true
    });
    return UserModel;
}());
exports.UserModel = UserModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQW9CQSx3RUFBd0U7QUFDeEU7SUFVSSxtQkFBWSxNQUFhO1FBQ3JCLFVBQVU7UUFUTixjQUFTLEdBQVcsRUFBRSxDQUFDO1FBQ3ZCLFlBQU8sR0FBVyxFQUFFLENBQUM7UUFDckIsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixVQUFLLEdBQVcsTUFBTSxDQUFDO1FBQ3ZCLFdBQU0sR0FBZ0IsRUFBRSxDQUFDO1FBQ3pCLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFNM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBR3pDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDVCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNyQyxDQUFDO0lBQ0wsQ0FBQztJQUlELHNCQUFJLCtCQUFRO1FBRFosVUFBVTthQUNWO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQztRQWlCRCxTQUFTO2FBQ1QsVUFBYSxLQUFhO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQzNCLENBQUM7OztPQXBCQTtJQUNELHNCQUFJLDZCQUFNO2FBQVY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDO2FBa0JELFVBQVcsS0FBYTtZQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUN6QixDQUFDOzs7T0FwQkE7SUFDRCxzQkFBSSw0QkFBSzthQUFUO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzthQWtCRCxVQUFVLEtBQWE7WUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDeEIsQ0FBQzs7O09BcEJBO0lBQ0Qsc0JBQUksMkJBQUk7YUFBUjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7YUFrQkQsVUFBUyxLQUFhO1lBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLENBQUM7OztPQXBCQTtJQUNELHNCQUFJLDRCQUFLO2FBQVQ7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN2QixDQUFDO2FBa0JELFVBQVUsS0FBa0I7WUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDeEIsQ0FBQzs7O09BcEJBO0lBQ0Qsc0JBQUksK0JBQVE7YUFBWjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7YUFrQkQsVUFBYSxLQUFhO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQzNCLENBQUM7OztPQXBCQTtJQXFCTCxnQkFBQztBQUFELENBQUMsQUEvREQsSUErREM7QUEvRFksaUJBQVMsWUErRHJCLENBQUEifQ==