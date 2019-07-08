let express = require('express');
let router = express.Router();

// QueryString => query property on the request object
// e.g. localhost:5000/person?name=Mncedi&age=20
router.get('/person', (req, res) => {

   if(req.query.name){
      res.send(`You have requested a person ${req.query.name}`);
   }
   else{
      res.send('You have requested a person');
   }

});

// params property on the request object
// e.g. loclhost:5000/person/Mncedi
router.get('/person/:name', (req, res) => {

   res.send(`You have requested a person ${req.params.name}`);
});

module.exports = router;