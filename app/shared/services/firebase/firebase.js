"use strict";
var firebase = require("nativescript-plugin-firebase");
// -----------------------------------------------------------
//  FIREBASE MODEL
// -----------------------------------------------------------
var FirebaseModel = (function () {
    function FirebaseModel() {
        // INIT
        this.doInit = function () {
            firebase.init({
                url: 'https://intense-heat-7311.firebaseio.com/'
            }).then(function (result) {
                console.log("Firebase is ready");
            }, function (error) {
                console.log("firebase.init error: " + error);
            });
        };
        // LOGIN & USER AUTHENTICATION
        this.doLoginAnonymously = function () {
            firebase.login({
                type: firebase.LoginType.ANONYMOUS
            }).then(function (result) {
                console.log(JSON.stringify(result));
            }, function (errorMessage) {
                console.log("Login error");
            });
        };
        this.doCreateUser = function () {
            firebase.createUser({
                email: 'eddyverbruggen@gmail.com',
                password: 'firebase'
            }).then(function (result) {
                console.log("User created");
            }, function (errorMessage) {
                console.log("No user created");
            });
        };
        this.doLoginByPassword = function () {
            firebase.login({
                // note that you need to enable email-password login in your firebase instance
                type: firebase.LoginType.PASSWORD,
                // note that these credentials have been configured in our firebase instance
                email: 'eddyverbruggen@gmail.com',
                password: 'firebase'
            }).then(function (result) {
                console.log("Login OK");
            }, function (errorMessage) {
                console.log("Login error");
            });
        };
        this.doLogout = function () {
            firebase.logout().then(function (result) {
                console.log("Logout OK");
            }, function (error) {
                console.log("Logout error: " + error);
            });
        };
        // EVENT LISTENERS
        this.doAddChildEventListenerForUsers = function () {
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
        this.doAddValueEventListenerForCompanies = function () {
            var path = "/companies";
            var that = this;
            var onValueEvent = function (result) {
                if (result.error) {
                    console.log("Listener error: " + result.error);
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
        this.doUserStoreByPush = function () {
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
        this.doStoreCompaniesBySetValue = function () {
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
        this.doRemoveUsers = function () {
            firebase.remove("/users").then(function () {
                console.log("firebase.remove done");
            }, function (error) {
                console.log("firebase.remove error: " + error);
            });
        };
        this.doRemoveCompanies = function () {
            firebase.remove("/companies").then(function () {
                console.log("firebase.remove done");
            }, function (error) {
                console.log("firebase.remove error: " + error);
            });
        };
        this.doQueryBulgarianCompanies = function () {
            var path = "/companies";
            var that = this;
            var onValueEvent = function (result) {
                // note that the query returns 1 match at a time,
                // in the order specified in the query
                console.log("Query result: " + JSON.stringify(result));
                if (result.error) {
                    console.log("Listener error: " + result.error);
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
                console.log("Login error: " + errorMessage);
            });
        };
        this.doQueryUsers = function () {
            var path = "/users";
            var that = this;
            var onValueEvent = function (result) {
                // note that the query returns 1 match at a time,
                // in the order specified in the query
                console.log("Query result: " + JSON.stringify(result));
                if (result.error) {
                    console.log("Listener error: " + result.error);
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
                console.log("Login error: " + errorMessage);
            });
        };
        // FROM HERE ARE THE RCH FIREBASE FUNCTIONS
        this.doQueryPosts = function () {
            var path = "/posts";
            var that = this;
            var onValueEvent = function (result) {
                // note that the query returns 1 match at a time,
                // in the order specified in the query
                //console.log("Query result: " + JSON.stringify(result));
                if (result.error) {
                    console.log("Listener error: " + result.error);
                }
                else {
                    pushPosts(result.value);
                    appModel.onNewsDataLoaded();
                }
            };
            firebase.query(onValueEvent, path, {
                singleEvent: true,
                // orderBy: {
                //   type: firebase.QueryOrderByType.KEY
                // }
                orderBy: {
                    type: firebase.QueryOrderByType.VALUE,
                    value: 'publishedDate' // mandatory when type is 'child'
                },
            }).then(function () {
                // console.log("firebase.doQueryPosts done; added a listener");
            }, function (errorMessage) {
                console.log("Fout lezen gegevens: " + errorMessage);
            });
        };
        this.doPostInit = function () {
            firebase.init({
                url: 'https://intense-heat-7311.firebaseio.com/'
            }).then(function (result) {
                console.log('in postInit');
                this.doQueryPosts();
            }, function (error) {
                console.log("firebase.init error: " + error);
            });
        };
    }
    return FirebaseModel;
}());
exports.FirebaseModel = FirebaseModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmaXJlYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBTyxRQUFRLFdBQVcsOEJBQThCLENBQUMsQ0FBQztBQUUxRCw4REFBOEQ7QUFDOUQsa0JBQWtCO0FBQ2xCLDhEQUE4RDtBQUU5RDtJQUFBO1FBR0EsT0FBTztRQUVFLFdBQU0sR0FBRztZQUNkLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ1osR0FBRyxFQUFFLDJDQUEyQzthQUNqRCxDQUFDLENBQUMsSUFBSSxDQUNILFVBQVUsTUFBTTtnQkFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDbkMsQ0FBQyxFQUNELFVBQVUsS0FBSztnQkFDYixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQyxDQUFDO1lBQy9DLENBQUMsQ0FDSixDQUFDO1FBQ0osQ0FBQyxDQUFDO1FBRUosOEJBQThCO1FBRXJCLHVCQUFrQixHQUFHO1lBQzFCLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQ2IsSUFBSSxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsU0FBUzthQUNuQyxDQUFDLENBQUMsSUFBSSxDQUNILFVBQVUsTUFBTTtnQkFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0QyxDQUFDLEVBQ0QsVUFBVSxZQUFZO2dCQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzdCLENBQUMsQ0FDSixDQUFDO1FBQ0osQ0FBQyxDQUFDO1FBRUssaUJBQVksR0FBRztZQUNwQixRQUFRLENBQUMsVUFBVSxDQUFDO2dCQUNsQixLQUFLLEVBQUUsMEJBQTBCO2dCQUNqQyxRQUFRLEVBQUUsVUFBVTthQUNyQixDQUFDLENBQUMsSUFBSSxDQUNILFVBQVUsTUFBTTtnQkFDZCxPQUFPLENBQUMsR0FB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