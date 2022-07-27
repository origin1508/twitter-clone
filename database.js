//The require('mongoose') call above returns a Singleton object.\
//It means that the first time you call require('mongoose'), it
//is creating an instance of the Mongoose class and returning it.
//On subsequent calls. it will return the same instance that was
//created adn returned to you the first time beacuse of how module
//import/export works in ES6
const mongoose = require('mongoose');
// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);
// useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer supported options.
// Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, 
// and useFindAndModify is false. Please remove these options from your code.


class database {

    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect('mongodb+srv://admin:!00Entks12ok@twitterclonecluster.9xdhupm.mongodb.net/?retryWrites=true&w=majority')
        .then(() => {
            console.log("database connection successful");
        })
        .catch((err) => {
            console.log("database connection error " + err);
        })
    }
}

module.exports = new database();