let express = require('express');

let app = express();
let personRoute = require('./routes/person');

app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`);
    // res.send(''); // if you want to send back a response
    next(); // in order for the next request to be called.
});
app.use(personRoute);
app.use(express.static('public'));

// for a 404 handler for resource not found
app.use((req, res, next) => {
    res.status(404).send('We think you are lost');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.info(`Server has started on ${PORT}`));
