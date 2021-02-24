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

app.get('/', (req, res) => {
   return res.render(__dirname + '/views/index.ejs', {codeResult: undefined});
})

const dataset = [
   {
      input: "0",
      output: "1"
   },
   {
      input: "5",
      output: "120"
   },
   {
      input: "6",
      output: "720"
   },
   {
      input: "7",
      output: "5040"
   },
]

app.post('/', async (req, res) => {
   if(req.body.code) {
      let codeResult = undefined, msg = {};
      for(data of dataset) {
         await axios.post('https://emkc.org/api/v1/piston/execute', {
            language: req.body.language,
            source: req.body.code,
            stdin: data.input
         })
         .then(response => {
            // console.log(response.data.output)
            console.log(response.data);
            if((response.data.output == data.output) && codeResult != 'error' && codeResult != 'failed') {
               // console.log('here');
               codeResult = 'success'
            }
            else if(response.data.stderr.length > 0) {
               // console.log(response.data)
               codeResult = 'error';
               msg.error = response.data.stderr
            }
            else {
               codeResult = 'failed';
               msg.expected = data.output;
               msg.result = response.data.output;
            }
         })
         .catch(err => {
            console.error(err)
            codeResult = 'error';
         })
      }
      res.render(__dirname + '/views/index.ejs', {codeResult, msg})
   }
   else res.redirect('/');
})



const port = process.env.PORT || 3000;

app.listen(port, () => {
   console.log(`Lisening to port ${port}`);
})
