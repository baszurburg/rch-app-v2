"use strict";
var observable = require("data/observable");
var ProgrammaModel = (function (_super) {
    __extends(ProgrammaModel, _super);
    function ProgrammaModel(source) {
        _super.call(this);
        if (source) {
            this._datum = source.Datum;
            this._thuis = source.Thuis;
            this._tijd = source.Tijd;
            this._type = source.Type;
            this._uit = source.Uit;
            this._wedNr = source.WedNr;
            this._newDate = source.newDate;
        }
    }
    Object.defineProperty(ProgrammaModel.prototype, "Datum", {
        get: function () {
            return this._datum;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgrammaModel.prototype, "Thuis", {
        get: function () {
            return this._thuis;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgrammaModel.prototype, "Tijd", {
        get: function () {
            return this._tijd;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgrammaModel.prototype, "Type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgrammaModel.prototype, "Uit", {
        get: function () {
            return this._uit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgrammaModel.prototype, "WedNr", {
        get: function () {
            return this._wedNr;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgrammaModel.prototype, "newDate", {
        get: function () {
            return this._newDate;
        },
        set: function (value) {
            this._newDate = value;
        },
        enumerable: true,
        configurable: true
    });
    return ProgrammaModel;
}(observable.Observable));
exports.ProgrammaModel = ProgrammaModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJvZ3JhbW1hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFVBQVUsV0FBVyxpQkFBaUIsQ0FBQyxDQUFDO0FBZ0IvQztJQUFvQyxrQ0FBcUI7SUFDckQsd0JBQVksTUFBa0I7UUFDMUIsaUJBQU8sQ0FBQztRQUNSLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDVCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDbkMsQ0FBQztJQUNMLENBQUM7SUFVRCxzQkFBSSxpQ0FBSzthQUFUO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSxpQ0FBSzthQUFUO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSxnQ0FBSTthQUFSO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSxnQ0FBSTthQUFSO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSwrQkFBRzthQUFQO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSxpQ0FBSzthQUFUO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSxtQ0FBTzthQUFYO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQzthQUNELFVBQVksS0FBYztZQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUMxQixDQUFDOzs7T0FIQTtJQUlMLHFCQUFDO0FBQUQsQ0FBQyxBQTlDRCxDQUFvQyxVQUFVLENBQUMsVUFBVSxHQThDeEQ7QUE5Q1ksc0JBQWMsaUJBOEMxQixDQUFBIn0=