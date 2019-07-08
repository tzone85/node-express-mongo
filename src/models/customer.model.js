let mongoose = require('mongoose');

// don't have the db but following along

const server = '';
const database = '';
const user = '';
const password = '';

mongoose.connect(`mongodb://${user}:${password}@${server}/${database}`);

let CustomerSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('Customer', CustomerSchema);