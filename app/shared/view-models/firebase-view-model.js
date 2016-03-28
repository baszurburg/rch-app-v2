"use strict";
var observable = require("data/observable");
var dialogs = require("ui/dialogs");
var firebase = require("nativescript-plugin-firebase");
// INIT
exports.FirebaseModel.prototype.doInit = function () {
    firebase.init({
        url: 'https://intense-heat-7311.firebaseio.com/'
    }).then(function (result) {
        dialogs.alert({
            title: "Firebase is ready",
            okButtonText: "Merci!"
        });
    }, function (error) {
        console.log("firebase.init error: " + error);
    });
};
// LOGIN & USER AUTHENTICATION
exports.FirebaseModel.prototype.doLoginAnonymously = function () {
    firebase.login({
        type: firebase.LoginType.ANONYMOUS
    }).then(function (result) {
        dialogs.alert({
            title: "Login OK",
            message: JSON.stringify(result),
            okButtonText: "Nice!"
        });
    }, function (errorMessage) {
        dialogs.alert({
            title: "Login error",
            message: errorMessage,
            okButtonText: "OK, pity"
        });
    });
};
exports.FirebaseModel.prototype.doCreateUser = function () {
    firebase.createUser({
        email: 'eddyverbruggen@gmail.com',
        password: 'firebase'
    }).then(function (result) {
        dialogs.alert({
            title: "User created",
            message: "userId: " + result.key,
            okButtonText: "Nice!"
        });
    }, function (errorMessage) {
        dialogs.alert({
            title: "No user created",
            message: errorMessage,
            okButtonText: "OK, got it"
        });
    });
};
exports.FirebaseModel.prototype.doLoginByPassword = function () {
    firebase.login({
        // note that you need to enable email-password login in your firebase instance
        type: firebase.LoginType.PASSWORD,
        // note that these credentials have been configured in our firebase instance
        email: 'eddyverbruggen@gmail.com',
        password: 'firebase'
    }).then(function (result) {
        dialogs.alert({
            title: "Login OK",
            message: JSON.stringify(result),
            okButtonText: "Nice!"
        });
    }, function (errorMessage) {
        dialogs.alert({
            title: "Login error",
            message: errorMessage,
            okButtonText: "OK, pity"
        });
    });
};
exports.FirebaseModel.prototype.doLogout = function () {
    firebase.logout().then(function (result) {
        dialogs.alert({
            title: "Logout OK",
            okButtonText: "OK, bye!"
        });
    }, function (error) {
        dialogs.alert({
            title: "Logout error",
            message: error,
            okButtonText: "Hmmkay"
        });
    });
};
// EVENT LISTENERS
exports.FirebaseModel.prototype.doAddChildEventListenerForUsers = function () {
    var that = this;
    var onChildEvent = function (result) {
        that.set("path", '/users');
        that.set("type", result.type);
        that.set("key", result.key);
        that.set("value", JSON.stringify(result.value));
    };
    firebase.addChildEventListener(onChildEvent, "/users").then(function () {
        console.log("firebase.addChildEventListener added");
    }, function (error) {
        console.log("firebase.addChildEventListener error: " + error);
    });
};
exports.FirebaseModel.prototype.doAddValueEventListenerForCompanies = function () {
    var path = "/companies";
    var that = this;
    var onValueEvent = function (result) {
        if (result.error) {
            dialogs.alert({
                title: "Listener error",
                message: result.error,
                okButtonText: "Darn!"
            });
        }
        else {
            that.set("path", path);
            that.set("type", result.type);
            that.set("key", result.key);
            that.set("value", JSON.stringify(result.value));
        }
    };
    firebase.addValueEventListener(onValueEvent, path).then(function () {
        console.log("firebase.addValueEventListener added");
    }, function (error) {
        console.log("firebase.addValueEventListener error: " + error);
    });
};
// DATBASE ACTIONS
exports.FirebaseModel.prototype.doUserStoreByPush = function () {
    firebase.push('/users', {
        'first': 'Eddy',
        'last': 'Verbruggen',
        'birthYear': 1977,
        'isMale': true,
        'address': {
            'street': 'foostreet',
            'number': 123
        }
    }).then(function (result) {
        console.log("firebase.push done, created key: " + result.key);
    }, function (error) {
        console.log("firebase.push error: " + error);
    });
};
exports.FirebaseModel.prototype.doStoreCompaniesBySetValue = function () {
    firebase.setValue('/companies', 
    // you can store a JSON object
    //{'foo':'bar'}
    // or even an array of JSON objects
    [
        {
            name: 'Telerik',
            country: 'Bulgaria'
        },
        {
            name: 'Google',
            country: 'USA'
        }
    ]).then(function () {
        console.log("firebase.setValue done");
    }, function (error) {
        console.log("firebase.setValue error: " + error);
    });
};
exports.FirebaseModel.prototype.doRemoveUsers = function () {
    firebase.remove("/users").then(function () {
        console.log("firebase.remove done");
    }, function (error) {
        console.log("firebase.remove error: " + error);
    });
};
exports.FirebaseModel.prototype.doRemoveCompanies = function () {
    firebase.remove("/companies").then(function () {
        console.log("firebase.remove done");
    }, function (error) {
        console.log("firebase.remove error: " + error);
    });
};
exports.FirebaseModel.prototype.doQueryBulgarianCompanies = function () {
    var path = "/companies";
    var that = this;
    var onValueEvent = function (result) {
        // note that the query returns 1 match at a time,
        // in the order specified in the query
        console.log("Query result: " + JSON.stringify(result));
        if (result.error) {
            dialogs.alert({
                title: "Listener error",
                message: result.error,
                okButtonText: "Darn!"
            });
        }
        else {
            that.set("path", path);
            that.set("type", result.type);
            that.set("key", result.key);
            that.set("value", JSON.stringify(result.value));
        }
    };
    firebase.query(onValueEvent, path, {
        // order by company.country
        orderBy: {
            type: firebase.QueryOrderByType.CHILD,
            value: 'country' // mandatory when type is 'child'
        },
        // but only companies named 'Telerik'
        // (this range relates to the orderBy clause)
        range: {
            type: firebase.QueryRangeType.EQUAL_TO,
            value: 'Bulgaria'
        },
        // only the first 2 matches (not that there's only 1 in this case anyway)
        limit: {
            type: firebase.QueryLimitType.LAST,
            value: 2
        }
    }).then(function () {
        console.log("firebase.doQueryBulgarianCompanies done; added a listener");
    }, function (errorMessage) {
        dialogs.alert({
            title: "Login error",
            message: errorMessage,
            okButtonText: "OK, pity"
        });
    });
};
exports.FirebaseModel.prototype.doQueryUsers = function () {
    var path = "/users";
    var that = this;
    var onValueEvent = function (result) {
        // note that the query returns 1 match at a time,
        // in the order specified in the query
        console.log("Query result: " + JSON.stringify(result));
        if (result.error) {
            dialogs.alert({
                title: "Listener error",
                message: result.error,
                okButtonText: "Darn!!"
            });
        }
        else {
            that.set("path", path);
            that.set("type", result.type);
            that.set("key", result.key);
            that.set("value", JSON.stringify(result.value));
        }
    };
    firebase.query(onValueEvent, path, {
        singleEvent: true,
        orderBy: {
            type: firebase.QueryOrderByType.KEY
        }
    }).then(function () {
        console.log("firebase.doQueryUsers done; added a listener");
    }, function (errorMessage) {
        dialogs.alert({
            title: "Login error",
            message: errorMessage,
            okButtonText: "OK, pity!"
        });
    });
};
// FROM HERE ARE THE RCH FUNCTIONS
exports.FirebaseModel.prototype.doQueryPosts = function () {
    var path = "/posts";
    var that = this;
    var onValueEvent = function (result) {
        // note that the query returns 1 match at a time,
        // in the order specified in the query
        //console.log("Query result: " + JSON.stringify(result));
        if (result.error) {
            dialogs.alert({
                title: "Listener error",
                message: result.error,
                okButtonText: "Darn!!"
            });
        }
        else {
            that.set("path", path);
            that.set("type", result.type);
            that.set("key", result.key);
            that.set("value", JSON.stringify(result.value));
            //
            that.set("path", path);
            that.set("type", result.type);
            that.set("key", result.key);
            that.set("value", JSON.stringify(result.value));
            console.log("path: " + path);
            console.log("type: " + result.type);
            console.log("key: " + result.key);
            console.log("value: " + JSON.stringify(result.value));
        }
    };
    firebase.query(onValueEvent, path, {
        singleEvent: true,
        orderBy: {
            type: firebase.QueryOrderByType.KEY
        }
    }).then(function () {
        console.log("firebase.doQueryPosts done; added a listener");
    }, function (errorMessage) {
        dialogs.alert({
            title: "Login error",
            message: errorMessage,
            okButtonText: "OK, pity!"
        });
    });
};
//return FirebaseModel;
// })(observable.Observable);
exports.FirebaseModel = exports.FirebaseModel;
exports.firebaseViewModel = new exports.FirebaseModel();
// exports.FirebaseModel = FirebaseModel;
// exports.firebaseViewModel = new FirebaseModel(); 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZWJhc2Utdmlldy1tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZpcmViYXNlLXZpZXctbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUVwQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQXlDdkQsT0FBTztBQUVMLHFCQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRztJQUMvQixRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ1osR0FBRyxFQUFFLDJDQUEyQztLQUNqRCxDQUFDLENBQUMsSUFBSSxDQUNILFVBQVUsTUFBTTtRQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDWixLQUFLLEVBQUUsbUJBQW1CO1lBQzFCLFlBQVksRUFBRSxRQUFRO1NBQ3ZCLENBQUMsQ0FBQztJQUNMLENBQUMsRUFDRCxVQUFVLEtBQUs7UUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUMsQ0FDSixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUosOEJBQThCO0FBRTVCLHFCQUFhLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHO0lBQzNDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDYixJQUFJLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTO0tBQ25DLENBQUMsQ0FBQyxJQUFJLENBQ0gsVUFBVSxNQUFNO1FBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUNaLEtBQUssRUFBRSxVQUFVO1lBQ2pCLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUMvQixZQUFZLEVBQUUsT0FBTztTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDLEVBQ0QsVUFBVSxZQUFZO1FB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