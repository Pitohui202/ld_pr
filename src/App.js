import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './App.css';
var websocket = new WebSocket("ws://textannotator.texttechnologylab.org/uima");
var msg_sent;
var currview;
var currtype;
var text="";
var oritext="";
function App() {
  document.addEventListener("keyup",getSelect);
  function getSelect(event){
    event.preventDefault();
    console.log(event.key);
    if(event.key=="a"){
        console.log(window.getSelection());
        var pos1=window.getSelection().baseOffset;
        var pos2=window.getSelection().extentOffset;
        if(pos2<pos1){
            var ep=pos1;
            pos1=pos2;
            pos2=ep;
        }
        console.log("Neue Annotation | View:"+currview+" | Typ:"+currtype.split("(")[0]+" | Anfang:"+pos1+" | Ende:"+pos2+" | Text:"+window.getSelection().baseNode.data.substring(pos1,pos2))
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
      function seltoel(toel2,data){
               currtype=toel2;
               text=oritext;
               var tkey=data.data.toolElements;
               console.log(tkey);
               for(var te in tkey){
                    //:/
                    if(te.split(".")[te.split(".").length-1]+" ("+Object.keys(data.data.toolElements[te]).length+")"==toel2){
                        var count=0;
                        var beginlist=[];
                        var endlist=[];
                        for(var te2 in tkey[te]){
                            beginlist.push(tkey[te][te2].features.begin);
                            endlist.push(tkey[te][te2].features.end);
                        }
                        beginlist.sort(function(a, b) {return a - b;});
                        endlist.sort(function(a, b) {return a - b;});
                        for(var bg in beginlist){
                           text=text.substring(0,beginlist[count]+44*count)+"<mark style={{background:\"#00ced1\"}}>"+text.substring(beginlist[count]+44*count,endlist[count]+44*count)+"</mark>"+text.substring(endlist[count]+44*count);
                           console.log(count+" "+beginlist[count]+" "+endlist[count]);
                           count++;
                        }
                        break;
                    }
               }
               document.getElementById("Text").innerHTML=text;
      }
      websocket.onopen = function () {
          document.getElementById("Text").innerHTML="";
          document.getElementById("slv").innerHTML="";
          document.getElementById("slt").innerHTML="";
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
                for(var toel in data.data.toolElements){
                    console.log(data.data.toolElements[toel]+" "+toel)
                    const tbutton = document.createElement("button");
                    tbutton.innerText=toel.split(".")[toel.split(".").length-1]+" ("+Object.keys(data.data.toolElements[toel]).length+")";
                    tbutton.addEventListener('click', () => {seltoel(tbutton.innerText,data)})
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
        <button onClick={logintest}>Log In</button><br /><br />
        <h2 id="slv"></h2>
        <h2 id="slt"></h2>
        <h2><mark style={{background:"#00ced1"}}>Text</mark></h2>
        <p id="Text"></p>
    </>
  )
}

export default App;
