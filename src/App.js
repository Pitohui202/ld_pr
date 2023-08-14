import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import lodash from 'lodash';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
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
var currinput;
var text="";
var editbutton;
var btndict={};
var popover;
var oritext="";
var a=0;
const colors=["#776d6a","#81436c","#448182","#7d6c42","#f26b6b","#f26baf","#bc6bf2","#6460d6","#ea0b60","#191918","#43774c"];
function App() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const status=Boolean(anchorEl);
  function handleClose(){
        setAnchorEl(null);
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
      function split(event,button,input){
        if(event.key=="Control"){
            console.log(input.selectionStart);
            var val=input.value;
            input.value=val.substring(0,input.selectionStart);
            const qtnsubbutton = document.createElement("button");
            qtnsubbutton.innerText=val.substring(input.selectionStart);
            qtnsubbutton.addEventListener('click', () => {newannotate(qtnsubbutton)});
            qtnsubbutton.addEventListener('contextmenu',(e) => {editmenu(e,qtnsubbutton)});
            button.appendChild(qtnsubbutton);
        }
      }
      function editmenu(event,button){
            event.preventDefault();
            if(button!=editbutton){
                if(currinput!=undefined){
                    editbutton.innerText=currinput.value;
                }
                var bit=button.innerText;
                button.innerText="";
                console.log("hi")
                editbutton=button;
                setAnchorEl(button);
                const letext=document.createElement("button");
                letext.innerText="<=";
                button.appendChild(letext);
                for(var hdb in button.hiddenbuttons){
                    button.appendChild(hdb);
                }
                if(button.hiddenbuttons.length==0){
                    currinput=document.createElement("input");
                    currinput.value=bit;
                    currinput.addEventListener("keyup",(event)=>split(event,button,currinput));
                    button.appendChild(currinput);
                }
                const ritext=document.createElement("button");
                ritext.innerText="=>";
                button.appendChild(ritext);

            }
            else{
                editbutton=undefined;
                handleClose();
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
          axios.get("https://resources.hucompute.org/repositories",{extraParams: {documents: true,recursive: false},reader: {type: 'json',rootProperty: 'data'}}).
          then((response)=>{
            console.log(response.data.result);
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
                a=0;
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
                   currbutton=qtnbutton;
                   btndict[[qtnlist[bg][0],qtnlist[bg][1]]]=qtnbutton;
                   if(qtnlist[bg][0]>lastend){
                        document.getElementById("Text").appendChild(qtnbutton);
                        lastend=qtnlist[bg][1];
                   }
                   else{
                        currbutton.hiddenbuttons.push(qtnbutton);
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
        <h2>Text</h2>
        <p id="Text"></p>
    </>
  )
}

export default App;
