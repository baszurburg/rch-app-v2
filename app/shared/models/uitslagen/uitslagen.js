"use strict";
var observable = require("data/observable");
var UitslagModel = (function (_super) {
    __extends(UitslagModel, _super);
    function UitslagModel(source) {
        _super.call(this);
        if (source) {
            this._datum = source.Datum;
            this._thuis = source.Thuis;
            this._uit = source.Uit;
            this._uitslag = source.Uitslag;
            this._newDate = source.newDate;
        }
    }
    Object.defineProperty(UitslagModel.prototype, "Datum", {
        get: function () {
            return this._datum;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UitslagModel.prototype, "Thuis", {
        get: function () {
            return this._thuis;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UitslagModel.prototype, "Uit", {
        get: function () {
            return this._uit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UitslagModel.prototype, "Uitslag", {
        get: function () {
            return this._uitslag;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UitslagModel.prototype, "newDate", {
        get: function () {
            return this._newDate;
        },
        set: function (value) {
            this._newDate = value;
        },
        enumerable: true,
        configurable: true
    });
    return UitslagModel;
}(observable.Observable));
exports.UitslagModel = UitslagModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWl0c2xhZ2VuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidWl0c2xhZ2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFVBQVUsV0FBVyxpQkFBaUIsQ0FBQyxDQUFDO0FBYy9DO0lBQWtDLGdDQUFxQjtJQUNuRCxzQkFBWSxNQUFnQjtRQUN4QixpQkFBTyxDQUFDO1FBQ1IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDbkMsQ0FBQztJQUNMLENBQUM7SUFRRCxzQkFBSSwrQkFBSzthQUFUO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSwrQkFBSzthQUFUO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSw2QkFBRzthQUFQO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSxpQ0FBTzthQUFYO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSxpQ0FBTzthQUFYO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQzthQUNELFVBQVksS0FBYztZQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUMxQixDQUFDOzs7T0FIQTtJQUlMLG1CQUFDO0FBQUQsQ0FBQyxBQXBDRCxDQUFrQyxVQUFVLENBQUMsVUFBVSxHQW9DdEQ7QUFwQ1ksb0JBQVksZUFvQ3hCLENBQUEifQ==