import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './App.css';
function App() {
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
        <img src="https://www.texttechnologylab.org/wp-content/uploads/2019/06/a-24.png" alt="TextAnnotator Logo" width="128" height="128"/><br /><br />
        <button onClick={logintest}>Login Test</button><br /><br />
    </>
  )
}

export default App;
