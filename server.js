const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1eSdWF9hpBcnLAVdjOKAURKnNp-z27g3henvrUh3vtKU';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  // TODO(you): Finish onGet.
  var re=[];
  var key=rows[0][0],value=rows[0][1];

  //console.log(cols);
  for(let ptr of rows){
    //console.log(ptr);
    if(ptr[0]!==key && ptr[1]!==value){
      let tmp={};
      tmp[key]=ptr[0];
      tmp[value]=ptr[1];
      re.push(tmp);
    }
  }
  //re.push({name:'A',email:'aa@AAA'});
  console.log(re);
  res.json(re);
}
app.get('/api', onGet);

async function onPost(req, res) {
  const messageBody = req.body;

  // TODO(you): Implement onPost.
  console.log(messageBody);
  const result = await sheet.getRows();
  const rows = result.rows;
  let cnt1=0,cnt2=0;
  for(let p in messageBody) cnt1++;
  if(cnt1!==rows[0].length){
    res.json({status:'ERROR! WRONG NUMBER OF ARGUMENTS'});
  }

  var tmp=[],data=[];
  for(let ptr of rows[0]) tmp[ptr]='';
  for(let ptr in messageBody){
    //console.log(ptr);
    tmp[ptr]=messageBody[ptr];
  }
  //console.log(tmp);
  for(let p in tmp){
    data[cnt2]=tmp[p];
    cnt2++;
  }
  console.log(data);
  await sheet.appendRow(data);

  res.json( { status: 'success'} );
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;

  // TODO(you): Implement onPatch.

  res.json( { status: 'unimplemented'} );
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;

  // TODO(you): Implement onDelete.
  console.log(column+'/'+value);
  const result = await sheet.getRows();
  const rows = result.rows;

  var index;
  for(index=0;index<rows[0].length;index++){
    if(rows[0][index]===column) break;
  }
  if(index===rows[0].length) res.json({status:'ERROR! DOES NOT FIND 2th argument'});

  for(let i=0;i<rows.length;i++){
    if(rows[i][index]===value){
      await sheet.deleteRow(i);
      break;
    }
  }

  res.json( { status: 'success'} );
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});
