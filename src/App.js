import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import lodash from 'lodash';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
var websocket = new WebSocket("ws://textannotator.texttechnologylab.org/uima");
var msg_sent;
var currview;
var currmarkcolor="#396664";
var currtype;
var text="";
var editbutton;
var btndict={};
var oritext="";
var a=0;
const colors=["#776d6a","#81436c","#448182","#7d6c42","#f26b6b","#f26baf","#bc6bf2","#6460d6","#ea0b60","#191918","#43774c"];
function App() {
    document.addEventListener("keyup",getSelect);
      function getSelect(event){
        console.log(a);
        a+=1;
        event.preventDefault();
        if(a%2!=0){
            console.log(event.key);
            if(editbutton!=undefined){
                if(event.key.length==1){
                    editbutton.innerText+=event.key;
                }
                else if(event.key=="Backspace"){
                    editbutton.innerText=editbutton.innerText.substring(0,editbutton.innerText.length-1);
                }
            }
        }
      }
  function logintest(){
      var ressession;
      var user;
      var i=0;
      var websocket = new WebSocket("ws://textannotator.texttechnologylab.org/uima");
      function sendview(viewts){
              websocket.send(JSON.stringify({cmd:"open_view",data:{casId:"29084",view:viewts}}));
              console.log("Message sent:"+JSON.stringify({cmd:"open_view",data:{casId:"29084",view:viewts}}));
              msg_sent="view";
              currview=viewts;
      }
      function seltoel(toel2,toccol,data){
            console.log(toel2);
            currtype=toel2;
            currmarkcolor=toccol;
            console.log(data.data.toolElements[toel2]);
            for(var te in data.data.toolElements[toel2]){
                var selbutton=btndict[[data.data.toolElements[toel2][te].features.begin,data.data.toolElements[toel2][te].features.end]];
                console.log(selbutton);
                if(selbutton!=undefined){
                    selbutton.style.backgroundColor=currmarkcolor;
                }
            }
      }
      function newannotate(button){
            button.style.backgroundColor=currmarkcolor;
      }
      function editmenu(event,button){
            event.preventDefault();
            if(button!=editbutton){
                editbutton=button;
            }
            else{
                editbutton=undefined;
            }
            console.log("edit");
      }
      websocket.onopen = function () {
          document.getElementById("Text").innerHTML="";
          document.getElementById("slv").innerHTML="";
          document.getElementById("slt").innerHTML="";
          console.log("Verbindung wurde erfolgreich aufgebaut");
          var md5=require("md5");
          console.log(document.getElementById("username").value)
          axios.post("https://authority.hucompute.org/login",{username:document.getElementById("username").value,password:md5(document.getElementById("pass").value)},{headers: {"Content-Type": "application/x-www-form-urlencoded"}}).
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
                 document.getElementById("slt").innerHTML="";
                 websocket.send(JSON.stringify({cmd:"open_cas",data:{casId:"29084"}}));
                 console.log("Message sent:"+JSON.stringify({cmd:"open_cas",data:{casId:"29084"}}));
                 msg_sent="cas";
            }
            else if(msg_sent=="cas"){
                 const data=JSON.parse(messageEvent.data);
                 document.getElementById("slv").innerHTML="";
                 document.getElementById("slt").innerHTML="";
                 document.getElementById("Text").innerHTML="";
                 text=data.data.text;
                 oritext=text;
                 console.log(data);
                 const selview=document.createElement("h2");
                 selview.innerText="Select View";
                 var count=0;
                 document.getElementById("slv").appendChild(selview);
                 for(var view in data.data.views){
                       count+=1;
                       console.log("View:"+data.data.views[view].view);
                       const button = document.createElement("button");
                       button.innerText=data.data.views[view].view;
                       button.addEventListener('click', () => {sendview(button.innerText)})
                       //button.style.background="rgb(57,102,"+(100+count*5)+")";
                       document.getElementById("slv").appendChild(button);
                 }
            }
            else if(msg_sent=="view"){
                 document.getElementById("slt").innerHTML="";
                 websocket.send(JSON.stringify({cmd:"open_tool",data:{casId:"29084",view:currview,toolName:"Quick"}}));
                 console.log("Message sent:"+JSON.stringify({cmd:"open_tool",data:{casId:"29084",view:currview,toolName:"Quick"}}));
                 msg_sent="tool";
                 text=oritext;

            }
            else if(msg_sent=="tool"){
                text=oritext;
                //console.log(messageEvent.data);
                const data=JSON.parse(messageEvent.data);
                //console.log(data.data.toolElements);
                var count=0;
                const seltool=document.createElement("h2");
                seltool.innerText="Select Tool Element";
                document.getElementById("slt").appendChild(seltool);
                //Text
                var qtnlist=[];
                for(var te2 in data.data.toolElements["org.texttechnologylab.annotation.type.QuickTreeNode"]){
                    qtnlist.push([data.data.toolElements["org.texttechnologylab.annotation.type.QuickTreeNode"][te2].features.begin,data.data.toolElements["org.texttechnologylab.annotation.type.QuickTreeNode"][te2].features.end,data.data.toolElements["org.texttechnologylab.annotation.type.QuickTreeNode"][te2]._addr]);
                }
                qtnlist.sort(function([a,b,c], [a1,b1,c1]) {return a - a1;});
                var lastend=-1;
                var currbutton;
                for(var bg in qtnlist){
                   console.log(qtnlist[bg][0]);
                   const qtnbutton = document.createElement("button");
                   qtnbutton.innerText=text.substring(qtnlist[bg][0],qtnlist[bg][1]);
                   qtnbutton.id=qtnlist[bg][2];
                   qtnbutton.bid=qtnlist[bg][2];
                   qtnbutton.hiddenbuttons=[];
                   console.log(qtnbutton.bid);
                   qtnbutton.addEventListener('click', () => {newannotate(qtnbutton)});
                   qtnbutton.addEventListener('contextmenu',(e) => {editmenu(e,qtnbutton)});
                   const popupmenu= document.createElement("Popover");
                   popupmenu.id=qtnlist[bg][2];
                   currbutton=qtnbutton;
                   btndict[[qtnlist[bg][0],qtnlist[bg][1]]]=qtnbutton;
                   if(qtnlist[bg][0]>lastend){
                        document.getElementById("Text").appendChild(qtnbutton);
                        lastend=qtnlist[bg][1];
                   }
                   else{
                        qtnbutton.hiddenbuttons.push(currbutton);
                   }
                }
                //Tool Element Liste
                console.log(colors.length+"/49")
                for(var toel in data.data.toolElements){
                    console.log(toel);
                    const tbutton = document.createElement("button");
                    tbutton.innerText=toel.split(".")[toel.split(".").length-1]+" ("+Object.keys(data.data.toolElements[toel]).length+")";
                    tbutton.style.backgroundColor=colors[count%colors.length];
                    tbutton.buttoel=toel;
                    tbutton.addEventListener('click', () => {seltoel(tbutton.buttoel,tbutton.style.backgroundColor,data)});
                    document.getElementById("slt").appendChild(tbutton);
                    count+=1;

                }
            }
      }
  }
//Object.keys für Kinder
  return (
    <>
        <img src="https://www.texttechnologylab.org/wp-content/uploads/2019/06/a-24.png" alt="TextAnnotator Logo" width="128" height="128"/><br /><br />
        <label>Username: <input id="username"></input></label><br /><br />
        <label>Passwort: <input id="pass"></input></label><br /><br />
        <button onClick={logintest}>Log In</button><br /><br />
        <h2 id="slv"></h2>
        <h2 id="slt"></h2>
        <h2><mark style={{background:"#00ced1"}}>Text</mark></h2>
        <p id="Text"></p>
    </>
  )
}

export default App;
