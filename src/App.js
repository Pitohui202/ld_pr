import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './App.css';
var websocket = new WebSocket("ws://textannotator.texttechnologylab.org/uima");
var msg_sent;
function App() {
  function logintest(){
      var ressession;
      var user;
      var i=0;
      var currview;
      var websocket = new WebSocket("ws://textannotator.texttechnologylab.org/uima");
      function sendview(viewts){
              websocket.send(JSON.stringify({cmd:"open_view",data:{casId:"29084",view:viewts}}));
              console.log("Message sent:"+JSON.stringify({cmd:"open_view",data:{casId:"29084",view:viewts}}));
              msg_sent="view";
              currview=viewts;
      }
      websocket.onopen = function () {
          document.getElementById("Text").innerHTML="";
          document.getElementById("btf").innerHTML="";
          console.log("Verbindung wurde erfolgreich aufgebaut");
          var md5=require("md5");
          axios.post("https://authority.hucompute.org/login",{username:"s5398116",password:md5("P(qMS!5e")},{headers: {"Content-Type": "application/x-www-form-urlencoded"}}).
          then((response)=>{
              if(response.data.success){
                  console.log(response.data.result);
                  ressession=response.data.result.session;
                  user=response.data.result.user;
                  websocket.send(JSON.stringify({cmd:"session",data:{session:ressession}}));
                  msg_sent="session";
              }
              else{
                  alert("Die Verbindung konnte nicht erfolgreich aufgebaut werden");
              }
          })
      };
      websocket.onmessage = function (messageEvent) {
           console.log(msg_sent);
          //console.log("Answer "+i+": "+messageEvent.data);
          if(msg_sent=="session"){
              document.getElementById("Text").innerHTML="";
              websocket.send(JSON.stringify({cmd:"open_cas",data:{casId:"29084"}}));
              console.log("Message sent:"+JSON.stringify({cmd:"open_cas",data:{casId:"29084"}}));
              msg_sent="cas";
          }
          else if(msg_sent=="cas"){
              const data=JSON.parse(messageEvent.data);
              document.getElementById("btf").innerHTML="";
              document.getElementById("Text").innerHTML="";
              const selview=document.createElement("h2");
              selview.innerText="Select View";
              document.getElementById("btf").appendChild(selview);
              for(var view in data.data.views){
                    console.log("View:"+data.data.views[view].view);
                    const button = document.createElement("button");
                    button.innerText=data.data.views[view].view;
                    button.addEventListener('click', () => {sendview(button.innerText)})
                    document.getElementById("btf").appendChild(button);
              }
          }
          else if(msg_sent=="view"){
              websocket.send(JSON.stringify({cmd:"open_tool",data:{casId:"29084",view:currview,toolName:"Quick"}}));
              console.log("Message sent:"+JSON.stringify({cmd:"open_tool",data:{casId:"29084",view:currview,toolName:"Quick"}}));
              msg_sent="tool";
          }
          else if(msg_sent=="tool"){
                document.getElementById("Text").innerHTML=messageEvent.data;
          }
      }
  }

  return (
    <>
        <img src="https://www.texttechnologylab.org/wp-content/uploads/2019/06/a-24.png" alt="TextAnnotator Logo" width="128" height="128"/><br /><br />
        <button onClick={logintest}>Log In</button><br /><br />
        <h2 id="btf"></h2>
        <p id="Text"></p>
    </>
  )
}

export default App;
