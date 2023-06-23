import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './App.css';
function App() {

  function getFile(event){
      event.preventDefault();
      if(event.dataTransfer.items){
          var file=event.dataTransfer.items[0].getAsFile();
          let reader = new FileReader();
          reader.readAsText(file);
          reader.onload = function() {
              console.log(reader.result);
              document.getElementById('result').textContent=reader.result;
          };
      }
  }
  function preventOpen(event) {
    event.preventDefault();
  }
  function getURL(){
  var xhrequest = new XMLHttpRequest();
      xhrequest.open("GET", document.getElementById("url").value, true);
      xhrequest.send(null);
      xhrequest.onreadystatechange = function () {
          if (xhrequest.readyState === 4 && xhrequest.status === 200) {
              var res=xhrequest.responseText;
              if(res!=""){
                document.getElementById('result').textContent=res;
              }
              else{
                document.getElementById('result').textContent="Kein Text ausgewählt";
              }
          }
      }
  }
  function getText(){
        var res=document.getElementById('textc').value;
        if(res!=""){
          document.getElementById('result').textContent=document.getElementById('textc').value;
        }
        else{
          document.getElementById('result').textContent="Kein Text ausgewählt";
        }
  }
  function testtest(){
     var md5=require("md5");
     axios.post("https://authority.hucompute.org/login",{username:"s5398116",password:md5("P(qMS!5e")},{headers: {"Content-Type": "application/x-www-form-urlencoded"}}).
     then((response)=>alert(response.data)).
     catch((error)=>console.log(error))
  }
  function logintest(){
      var ressession;
      var user;
      var i=0;
      var websocket = new WebSocket("ws://textannotator.texttechnologylab.org/uima");
      websocket.onopen = function () {
          console.log("Verbindung wurde erfolgreich aufgebaut");
          var md5=require("md5");
          axios.post("https://authority.hucompute.org/login",{username:"s5398116",password:md5("P(qMS!5e")},{headers: {"Content-Type": "application/x-www-form-urlencoded"}}).
          then((response)=>{
              if(response.data.success){
                  console.log(response.data.result);
                  ressession=response.data.result.session;
                  user=response.data.result.user;
                  websocket.send(JSON.stringify({cmd:"session",data:{session:ressession}}));

              }
              else{
                  alert("Die Verbindung konnte nicht erfolgreich aufgebaut werden");
              }
          })
      };
      websocket.onmessage = function (messageEvent) {
          i+=1;
          console.log("Answer "+i+": "+messageEvent.data);
          if(i==1){
              websocket.send(JSON.stringify({cmd:"open_cas",data:{casId:29084}}));
              console.log("Message sent:"+JSON.stringify({cmd:"open_cas",data:{casId:29084}}));
          }
          else if(i==2){
              websocket.send(JSON.stringify({cmd:"open_view",data:{casId:29084,view:"_initialView"}}));
              console.log("Message sent:"+JSON.stringify({cmd:"open_view",data:{casId:29084,view:"_initialView"}}));
          }
          else{
              websocket.send(JSON.stringify({cmd:"open_tool",data:{casId:29084,view:"_initialView",toolName:"quick"}}));
              console.log("Message sent:"+JSON.stringify({cmd:"open_tool",data:{casId:29084,view:"_initialView",toolName:"quick"}}));
          }
      }
  }

  return (
    <>
        <img src="https://www.texttechnologylab.org/wp-content/uploads/2019/06/a-24.png" alt="TextAnnotator Logo" width="128" height="128"/>
        <h2>Method of Text Selection</h2>
        <p>Select File:</p>
        <div id="filedrop" onDrop={(event)=>getFile(event)} onDragOver={(event)=>preventOpen(event)}></div>
        <label for="url">Select URL:</label>
        <input type="text" id="url" name="url"/>
        <button onClick={getURL}>Select</button><br /><br />
        <label for="textc">Select Text:</label>
        <input type="text" id="textc" name="textc"/>
        <button onClick={getText}>Select</button><br /><br />
        <button onClick={logintest}>Login Test</button><br /><br />
        <h2>Text</h2>
        <p id="result">Kein Text ausgewählt</p>
    </>
  )
}

export default App;
