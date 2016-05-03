"use strict";
//export class UserModel extends observable.Observable implements User {
var UserModel = (function () {
    function UserModel(source) {
        this._userName = '';
        this._userId = '';
        this._email = '';
        this._role = 'user';
        this._teams = [];
        this._password = '';
        //super();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQW9CQSx3RUFBd0U7QUFDeEU7SUFVSSxtQkFBWSxNQUFhO1FBUmpCLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFDdkIsWUFBTyxHQUFXLEVBQUUsQ0FBQztRQUNyQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLFVBQUssR0FBVyxNQUFNLENBQUM7UUFDdkIsV0FBTSxHQUFnQixFQUFFLENBQUM7UUFDekIsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUkzQixVQUFVO1FBQ1YsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ3JDLENBQUM7SUFDTCxDQUFDO0lBSUQsc0JBQUksK0JBQVE7UUFEWixVQUFVO2FBQ1Y7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDO1FBaUJELFNBQVM7YUFDVCxVQUFhLEtBQWE7WUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDM0IsQ0FBQzs7O09BcEJBO0lBQ0Qsc0JBQUksNkJBQU07YUFBVjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUM7YUFrQkQsVUFBVyxLQUFhO1lBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLENBQUM7OztPQXBCQTtJQUNELHNCQUFJLDRCQUFLO2FBQVQ7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN2QixDQUFDO2FBa0JELFVBQVUsS0FBYTtZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDOzs7T0FwQkE7SUFDRCxzQkFBSSwyQkFBSTthQUFSO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQzthQWtCRCxVQUFTLEtBQWE7WUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDdkIsQ0FBQzs7O09BcEJBO0lBQ0Qsc0JBQUksNEJBQUs7YUFBVDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7YUFrQkQsVUFBVSxLQUFrQjtZQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDOzs7T0FwQkE7SUFDRCxzQkFBSSwrQkFBUTthQUFaO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzthQWtCRCxVQUFhLEtBQWE7WUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDM0IsQ0FBQzs7O09BcEJBO0lBcUJMLGdCQUFDO0FBQUQsQ0FBQyxBQTNERCxJQTJEQztBQTNEWSxpQkFBUyxZQTJEckIsQ0FBQSJ9