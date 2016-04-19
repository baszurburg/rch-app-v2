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
    return ProgrammaModel;
}(observable.Observable));
exports.ProgrammaModel = ProgrammaModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJvZ3JhbW1hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFPLFVBQVUsV0FBVyxpQkFBaUIsQ0FBQyxDQUFDO0FBZS9DO0lBQW9DLGtDQUFxQjtJQUNyRCx3QkFBWSxNQUFrQjtRQUMxQixpQkFBTyxDQUFDO1FBQ1IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUM7WUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQy9CLENBQUM7SUFDTCxDQUFDO0lBU0Qsc0JBQUksaUNBQUs7YUFBVDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksaUNBQUs7YUFBVDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksZ0NBQUk7YUFBUjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksZ0NBQUk7YUFBUjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksK0JBQUc7YUFBUDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksaUNBQUs7YUFBVDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7OztPQUFBO0lBQ0wscUJBQUM7QUFBRCxDQUFDLEFBdENELENBQW9DLFVBQVUsQ0FBQyxVQUFVLEdBc0N4RDtBQXRDWSxzQkFBYyxpQkFzQzFCLENBQUEifQ==