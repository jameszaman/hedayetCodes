const express = require('express');
const axios = require('axios')


const app = express();


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/images', express.static(__dirname + '/public/images'));
app.set('view engine', 'ejs');

// Function declarations.
function toNum(a) {
   if(isNaN(Number(a))) return a;
   return Number(a);
}

function validate(req, res, codeResult, msg) {
   return new Promise(resolve => {
      setTimeout(() => {
         axios.post('https://emkc.org/api/v1/piston/execute', {
            language: req.body.language,
            source: req.body.code,
            stdin: data.input
         })
         .then(response => {
            console.log('PROMISE');
            if((response.data.output == data.output) && codeResult != 'error' && codeResult != 'failed') {
               codeResult = 'success'
            }
            else if (response.data.output != data.output){
               codeResult = 'failed';
               msg.expected = data.output;
               msg.result = response.data.output;
            }
            else if(response.data.stderr.length > 0) {
               codeResult = 'error';
               msg.error = response.data + " response sent this."
            }
            else {
               codeResult = 'error';
               msg.error = 'SOMETHING IS WRONG'
            }
         })
         .catch(err => {
            console.error(err)
            msg.error = "ERROR Happened";
            codeResult = 'error';
         })
      }, 1000);
   })
}


// Input and output for questions. This should be in a Database.
const dataset = [
   {
      input: '0',
      output: 1
   },
   {
      input: '1',
      output: 1
   },
]

// Routes. Currently in app.js as there are only few routes.
app.get('/', (req, res) => {
   return res.render(__dirname + '/views/index.ejs', {codeResult: undefined});
})

app.post('/', async (req, res) => {
   if(req.body.code) {
      let codeResult = undefined, msg = {};
      for(data of dataset) {
         if(codeResult == undefined || codeResult == 'success') {
            console.log('HEY');
            await validate(req, res, codeResult, msg);
         }
      }
      res.render(__dirname + '/views/index.ejs', {codeResult, msg})
   }
   else res.redirect('/');
})


// Starting the app.
const port = process.env.PORT || 3000;

app.listen(port, () => {
   console.log(`Lisening to port ${port}`);
})
