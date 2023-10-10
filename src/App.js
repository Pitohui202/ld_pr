import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import lodash from 'lodash';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Input } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme } from '@mui/material/styles'
import './App.css';
const theme = createTheme({
  palette: {
    ochre: {main: '#E3D026',},
  },
});
var websocket = new WebSocket("ws://textannotator.texttechnologylab.org/uima");
var msg_sent;
var currview;
var currmarkcolor="#396664";
var currtype="";
var batchidentifier="";
var currinput;
var bcounter=0;
var currbid=0;
var chqueue=[];
var text="";
var rbid;
var editbutton;
var docid="";
var btndict={};
var popover;
var oritext="";
var a=0;
var b=0;
var oldtext="";
const arrstyle = {height: "17px",marginTop: 'auto'};
const box1st= {width:window.innerWidth,height:2,backgroundColor:"#2e5250"}
const colors=["#776d6a","#81436c","#448182","#7d6c42","#f26b6b","#f26baf","#bc6bf2","#6460d6","#ea0b60","#191918","#43774c"];
const toplvlbuttons=[];
const toelbuttons=[];
var docnodelist={};
var docshnodelist=[];
var docnamelist=[];
var toellist=[];
var qtnlist=[];
var qtnshlist=[];

var lastend=-1;
var currbutton;
function App() {
    //console.warn = () => {};

  /**
  *Main function,starts when login button is pressed
  */
  function logintest(){
      var ressession;
      var user;
      var i=0;
      var websocket = new WebSocket("ws://textannotator.texttechnologylab.org/uima");
      /**
      *Sends given view to the websocket
      */
      function sendview(viewts){
              websocket.send(JSON.stringify({cmd:"open_view",data:{casId:docid,view:viewts}}));
              console.log("Message sent:"+JSON.stringify({cmd:"open_view",data:{casId:docid,view:viewts}}));
              msg_sent="view";
              currview=viewts;
      }
      /**
      *Sends given file path to websocket,also takes depth of path to format tree structure correctly(origin node depth=0,next =1 etc.)
      */
      function sendrepo(repobt,depth){
            console.log("sendrepo")
            var repoid=repobt.id;
            var docurl="https://resources.hucompute.org/repositories?node="+repoid+"&documents=true&session="+ressession.split(".")[0];
            document.getElementById("untext").innerHTML="";
            axios.get(docurl).
            then((response)=>{
                var rcounter=0;
                for(var repo in response.data.data){
                    if(docnamelist.indexOf(response.data.data[repo].text)==-1){
                        if(response.data.data[repo].type=="file"){
                            docnodelist.splice(docshnodelist.indexOf(repoid)+1,0,[response.data.data[repo].id,depth,true]);
                        }
                        else{
                            docnodelist.splice(docshnodelist.indexOf(repoid)+1,0,[response.data.data[repo].id,depth,false]);
                        }
                        docshnodelist.splice(docshnodelist.indexOf(repoid)+1,0,response.data.data[repo].id);
                        docnamelist.splice(docshnodelist.indexOf(repoid)+1,0,response.data.data[repo].text);
                    }
                    /*createDiv("repo");
                    var rb=document.getElementById(rbid);
                    rb.innerText=response.data.data[repo].id;
                    rb.addEventListener('click', () => {sendrepo(rb.innerText)});
                    rcounter++;*/
                }
                document.getElementById("untext").innerHTML="";
                for(var docnode in docnodelist){
                   var addtext="";
                    for(let i=0;i<docnamelist[docnode].length+docnodelist[docnode][1]*20;i++){
                        addtext+="\xA0";
                    }
                    var divel=document.createElement("div");
                    rbid="name"+bcounter;
                    if(docnodelist[docnode][2]){
                        ReactDOM.render(<p id={docnodelist[docnode][0]} opened="false" style={{height: "17px",width:window.innerWidth,overflow:"hidden",textAlign:"center",marginTop: 'auto'}}>{addtext}{docnamelist[docnode]} &#x25B6;</p>,divel);
                        divel.addEventListener('click', (event) => {seldoc(event.target)});
                    }
                    else{
                        ReactDOM.render(<p id={docnodelist[docnode][0]} opened="false" style={{height: "17px",width:window.innerWidth,overflow:"hidden",textAlign:"center",marginTop: 'auto'}}>{addtext}{docnamelist[docnode]} &#x25BC;</p>,divel);
                        divel.addEventListener('click', (event) => {sendrepo(event.target,depth+1)});
                    }
                    document.getElementById("untext").appendChild(divel);
                    divel.addEventListener('click', (event) => {sendrepo(event.target,depth+1)});
                    bcounter++;
                }
            });
      }
      /**
      *Sends changes contained in array chqueue to the websocket
       */
      function sendchanges(){
            console.log("sendchanges");
            websocket.send(JSON.stringify({cmd:"work_batch",data:{casId:docid,toolName:"Quick",view:currview,perspective:"default",queue:chqueue,options: [{privateSession: false}]}}));
            console.log("Message sent: "+JSON.stringify({cmd:"work_batch",data:{casId:docid,toolName:"Quick",view:currview,perspective:"default",queue:chqueue,options: [{privateSession: false}]}}));
            chqueue=[];
            msg_sent="changes";
      }
      /**
      *Reloads text and text buttons to show changes
       */
      function loadtext(){
        document.getElementById("Text").innerHTML="";
        lastend=-1;
        qtnshlist=[];
        for(var bg in qtnlist){
          const qtnbutton = document.createElement("button");
          qtnbutton.innerText=text.substring(qtnlist[bg][0],qtnlist[bg][1]);
          qtnbutton.id=qtnlist[bg][2];
          qtnbutton.hiddenbuttons=[];
          qtnbutton.bid=qtnlist[bg][2];
          qtnbutton.startidx=qtnlist[bg][0];
          qtnbutton.endidx=qtnlist[bg][1];
          qtnbutton.addEventListener('click', (e) => {newannotate(e,qtnbutton)});
          qtnbutton.addEventListener('contextmenu',(e) => {editmenu(e,qtnbutton)});
          currbutton=qtnbutton;
          qtnshlist.push(""+qtnlist[bg][2]);
          qtnbutton.tlbid=toplvlbuttons.length;
          toplvlbuttons.push(qtnbutton);
          btndict[[qtnlist[bg][0],qtnlist[bg][1]]]=qtnbutton;
          if(qtnlist[bg][0]>=lastend){
               document.getElementById("Text").appendChild(qtnbutton);
               lastend=qtnlist[bg][1];
          }
          else{
               currbutton.hiddenbuttons.push(qtnbutton);
               qtnlist.splice(bg,1);
               qtnshlist.splice(bg,1);
               toplvlbuttons.splice(bg,1);
          }
        }
      }
      /**
      *Selects which tool element to mark in the text. This tool element is also used to create new annotations
      */
      function seltoel(toel2,toccol,data){
            currtype=toel2;
            currmarkcolor=colors[toccol.id%colors.length];
            for(var te in data.data.toolElements[toel2]){
                var selbutton=btndict[[data.data.toolElements[toel2][te].features.begin,data.data.toolElements[toel2][te].features.end]];
                if(selbutton!=undefined){
                    selbutton.style.backgroundColor=currmarkcolor;
                }
            }
      }
      /**
      *Adds a new annotation to the change queue. Takes the button representing the quick tree node that is annotated
      */
      function newannotate(event,button){
            if(currtype!=""){
                if(button!=editbutton){
                    chqueue=[];
                    chqueue.push({cmd:"create",data:{bid:"_b1_",_type:currtype,features:{begin:button.startidx,end:button.endidx}}});
                    currbid=button.id;
                    sendchanges();
                }
            }
            else{
                editmenu(event,button);
            }
      }
      /**
      *Displays a new annotation by changing the color of the button in question.
      */
      function showanno(button){
            console.log("showanno")
            if(button!=undefined){
                button.style.backgroundColor=currmarkcolor;
            }
      }
      /**
      *Creates a div element with button child with given name,with option to set button color and margin
      */
      function createDiv(name,bucolor="#396664",bmargin=0.172){
        console.log("createDiv")
        var divel=document.createElement("div");
        rbid=name+bcounter;
        ReactDOM.render(<Button id={rbid} variant="contained" sx={{bgcolor: bucolor, textTransform: "none",margin: bmargin }}> </Button>,divel);
        bcounter++;
        return divel;
      }
      /**
      *Triggered when a button is pressed in a button field, used for merging and splitting QTNs.
      */
      function bkey(event,button,input){
        console.log("bkey")

        if(event.key=="Control"){
            chqueue.push({cmd:"create",data:{bid:"_b2_",_type:"org.texttechnologylab.annotation.type.QuickTreeNode",features:{begin:button.startidx,end:button.startidx+input.selectionStart,parent:button.id}}});
            chqueue.push({cmd:"create",data:{bid:"_b3_",_type:"org.texttechnologylab.annotation.type.QuickTreeNode",features:{begin:button.startidx+input.selectionStart,end:button.endidx,parent:button.id}}});

            sendchanges();
        }
        if(event.key=="ArrowRight"){
            if(b%2==0){
                merge(button,input.value,1);
            }
            b++;
        }
        if(event.key=="ArrowLeft"){
            if(b%2==0){
                merge(button,input.value,-1);
            }
            b++;
        }
      }
      /**
      *Takes a numerical id and send a command to open the corresponding document to the websocket
      */
      function seldoc(idb){
         docid=idb.id;
         document.getElementById("Text").innerHTML="";
         document.getElementById("ovtext").innerHTML="Dokument ausgewählt! Lädt...";
         websocket.send(JSON.stringify({cmd:"open_cas",data:{casId:docid}}));
         console.log("Message sent:"+JSON.stringify({cmd:"open_cas",data:{casId:docid}}));
         msg_sent="cas";
      }
      /**
      *Opens the edit menu of a button and sends the changes on the last edited button to the websocket
      */
      function editmenu(event,button){
            console.log("start:"+button.startidx+",end:"+button.endidx+",id:"+button.id);
            console.log("editmenu");
            event.preventDefault();
            if(button!=editbutton){
                if(currinput!=undefined&&editbutton!=undefined){
                    //Save changes to the button that was edited last
                    console.log("old")
                    var a=0;
                    if(editbutton!=undefined){
                        console.log(editbutton.innerText)
                        batchidentifier="_b"+chqueue.length+"_"
                        chqueue.push({cmd:"create",data:{bid:batchidentifier,_type:"org.texttechnologylab.annotation.token.Correction",features:{begin:editbutton.startidx,end:editbutton.endidx,value:currinput.value}}});
                        sendchanges();
                    }
                }
                //select new button for edits
                if(button!=undefined){
                    var bit=button.innerText;
                    console.log(bit)
                    button.innerText="";
                    editbutton=button;
                    currinput=document.createElement("input");
                    currinput.value=bit;
                    currinput.addEventListener("keyup",(event)=>bkey(event,button,currinput));
                    console.log(currinput.value);
                    button.appendChild(currinput);
                }

            }
            else{
                editbutton=undefined;
            }
            console.log("edit");
      }
      /**
      *Deletes two buttons and creates a new one that combines the two
      */
      function merge(button,inText,targetoffset){
                console.log("merge"+button.tlbid)
                var secbutton=toplvlbuttons[button.tlbid+targetoffset];
                chqueue=[];
                batchidentifier="_b"+chqueue.length+"_";
                chqueue.push({cmd:"remove",data:{bid:batchidentifier,addr:button.id}});
                batchidentifier="_b"+chqueue.length+"_";
                chqueue.push({cmd:"remove",data:{bid:batchidentifier,addr:secbutton.id}});
                batchidentifier="_b"+chqueue.length+"_";
                chqueue.push({cmd:"create",data:{bid:batchidentifier,_type:"de.tudarmstadt.ukp.dkpro.core.api.segmentation.type.Sentence",features:{begin:Math.min(button.startidx,secbutton.startidx),end:Math.max(button.endidx,secbutton.endidx)}}});
                sendchanges();
        }
      websocket.onopen = function () {
          document.getElementById("Text").innerHTML="";
          document.getElementById("ovtext").innerHTML="";
          document.getElementById("untext").innerHTML="";
          console.log("Verbindung wurde erfolgreich aufgebaut");
          var md5=require("md5");
          axios.post("https://authority.hucompute.org/login",{username:document.getElementById("username").value,password:md5(document.getElementById("pass").value)},{headers: {"Content-Type": "application/x-www-form-urlencoded"}}).
          then((response)=>{
              if(response.data.success){
                  console.log(response.data.result);
                  ressession=response.data.result.session;
                  user=response.data.result.user;
                  var repourl="https://resources.hucompute.org/repositories?session="+ressession.split(".")[0];
                    axios.get(repourl).
                    then((response)=>{
                      document.getElementById("ovtext").innerText="Dokumente-Auswahl";
                      docnodelist=[];
                      docshnodelist=[];
                      docnamelist=[];
                      for(var repo in response.data.data){
                        console.log(response);
                        var divel=document.createElement("div");
                        rbid="name"+bcounter;
                        ReactDOM.render(<p id={response.data.data[repo].id} opened="false" style={{height: "17px",width:window.innerWidth,textAlign:"center",marginTop: 'auto'}}>{response.data.data[repo].text} &#x25BC;</p>,divel);
                        document.getElementById("untext").appendChild(divel);
                        bcounter++;
                        docnodelist.push([response.data.data[repo].id,0]);
                        docnamelist.push(response.data.data[repo].text);
                        docshnodelist.push(response.data.data[repo].id);
                        divel.addEventListener('click', (event) => {sendrepo(event.target,1)});
                        var lnbr=document.createElement("span");
                        document.getElementById("untext").appendChild(lnbr);
                      }
                    })
                  websocket.send(JSON.stringify({cmd:"session",data:{session:ressession}}));
                  msg_sent="session";
              }
              else{
                  alert("Die Verbindung konnte nicht erfolgreich aufgebaut werden");
              }
          })
      };
      websocket.onmessage = function (messageEvent) {
             //console.log("Answer "+i+": "+messageEvent.data);
            if(msg_sent=="cas"){
                 const data=JSON.parse(messageEvent.data);
                 document.getElementById("ovtext").innerHTML="View auswählen";
                 document.getElementById("untext").innerHTML="";
                 document.getElementById("Text").innerHTML="";
                 text=data.data.text;
                 oritext=text;
                 var count=0;
                 for(var view in data.data.views){
                       count+=1;
                       var divel=createDiv("view");
                       document.getElementById("untext").appendChild(divel);
                       var viewb=document.getElementById(rbid);
                       viewb.innerText=data.data.views[view].view;
                       viewb.addEventListener('click', () => {sendview(viewb.innerText)})
                 }
            }
            else if(msg_sent=="view"){
                 websocket.send(JSON.stringify({cmd:"open_tool",data:{casId:docid,view:currview,toolName:"Quick"}}));
                 console.log("Message sent:"+JSON.stringify({cmd:"open_tool",data:{casId:docid,view:currview,toolName:"Quick"}}));
                 msg_sent="tool";
                 text=oritext;

            }
            else if(msg_sent=="tool"){
                text=oritext;
                const data=JSON.parse(messageEvent.data);
                var count=0;
                document.getElementById("ovtext").innerHTML="Select Tool Element";
                document.getElementById("untext").innerHTML="";
                //Text
                for(var te2 in data.data.toolElements["org.texttechnologylab.annotation.type.QuickTreeNode"]){
                    if(te2!=undefined){
                        qtnlist.push([data.data.toolElements["org.texttechnologylab.annotation.type.QuickTreeNode"][te2].features.begin,data.data.toolElements["org.texttechnologylab.annotation.type.QuickTreeNode"][te2].features.end,data.data.toolElements["org.texttechnologylab.annotation.type.QuickTreeNode"][te2]._addr]);
                        }
                }
                qtnlist.sort(function([a,b,c], [a1,b1,c1]) {return a - a1;});
                a=0;
                document.getElementById("txt").innerText="Text";
                loadtext();
                //Tool Element List
                bcounter=0;
                for(var toel in data.data.toolElements){
                    if(toel.split(".")[toel.split(".").length-1].indexOf('_')<0){
                        divel=createDiv("",colors[count%colors.length]);
                        document.getElementById("untext").appendChild(divel);
                        toelbuttons.push(document.getElementById(rbid));
                        toelbuttons[toelbuttons.length-1].innerText=toel.split(".")[toel.split(".").length-1]+" ("+Object.keys(data.data.toolElements[toel]).length+")";
                        toelbuttons[toelbuttons.length-1].buttoel=toel;
                        toellist.push(toel);
                        toelbuttons[toelbuttons.length-1].addEventListener('click', (event) => {seltoel(event.target.buttoel,event.target,data)});
                        count+=1;
                    }
                }
            }
            else if(msg_sent=="changes"){
                const data=JSON.parse(messageEvent.data);
                var newload=false;
                for(var update in data.data.updates){
                    //SPLIT
                    if(update=="org.texttechnologylab.annotation.type.QuickTreeNode"){
                        for(var id in data.data.updates[update]){
                            //delete parent
                            if(data.data.updates[update][id].features!=undefined){
                                if(qtnshlist.indexOf(""+data.data.updates[update][id].features.parent)!=-1){
                                    qtnlist.splice(qtnshlist.indexOf(""+data.data.updates[update][id].features.parent),1);
                                    qtnshlist.splice(qtnshlist.indexOf(""+data.data.updates[update][id].features.parent),1);
                                }
                            //add new text
                                qtnlist.push([data.data.updates[update][id].features.begin,data.data.updates[update][id].features.end,data.data.updates[update][id]._addr]);
                                qtnshlist.push(""+data.data.updates[update][id]._addr);
                                newload=true;
                            }
                            else{
                                //remove deleted buttons
                                qtnlist.splice(qtnshlist.indexOf(""+id),1);
                                qtnshlist.splice(qtnshlist.indexOf(""+id),1);
                                newload=true;
                            }
                        }
                    }
                    //MERGE
                    else if(update=="de.tudarmstadt.ukp.dkpro.core.api.segmentation.type.Sentence"){
                        for(var id in data.data.updates[update]){
                            qtnlist.push([data.data.updates[update][id].features.begin,data.data.updates[update][id].features.end,data.data.updates[update][id]._addr]);
                            qtnshlist.push(""+data.data.updates[update][id]._addr);
                            console.log(qtnshlist);
                        }
                        newload=true;
                    }
                    //CORRECTIONS
                    else if(update=="org.texttechnologylab.annotation.token.Correction"){
                        for(var id in data.data.updates[update]){
                            console.log("corr");
                            btndict[[data.data.updates[update][id].features.begin,data.data.updates[update][id].features.end]].innerHTML=data.data.updates[update][id].features.value;
                        }
                    }
                    //NEW ANNOTATION
                    else if(toellist.includes(update)){
                        showanno(document.getElementById(currbid));
                    }
                }
                //relaod text if text has changed
                if(newload==true){
                    qtnlist.sort(function([a,b,c], [a1,b1,c1]) {return a - a1;});
                    loadtext();
                }
            }
      }
  }
//Object.keys für Kinder
  return (
    <>
        <br /><br />
        <h1 style={{position: 'absolute', left: '50%',transform: 'translate(-50%, -0%)'}} id="TA">TextAnnotator</h1><br/><br/><br/><br/>
        <label style={{position: 'absolute', left: '50%',transform: 'translate(-50%, -0%)'}}>Username: <Input id="username" sx={{bgcolor: "#396664",borderBottomColor: "#e7f0f0"}}></Input></label><br /><br />
        <label style={{position: 'absolute', left: '50%',transform: 'translate(-50%, -0%)'}}>Passwort:&nbsp; <Input id="pass" type="password" sx={{bgcolor: "#396664",borderBottomColor: "#e7f0f0"}}></Input></label><br /><br />
        <Button style={{position: 'absolute', left: '50%',transform: 'translate(-50%, -0%)'}} id="login" variant="contained" sx={{bgcolor: "#396664"}} onClick={logintest}>Log In</Button><br /><br />
        <Box sx={{width:window.innerWidth,height:2,backgroundColor:"#396664"}}></Box>
        <h2 style={{textAlign:"center",width:window.innerWidth}} id="ovtext"></h2><br/>
        <div style={{justifyContent:"center",display:"flex",minWidth: 0,overflow:"auto",flexFlow:"row wrap"}} id="untext"></div><br/><br/><br/><br/><br/>
        <h2 style={{textAlign:"center",width:window.innerWidth}} id="txt"></h2><br/>
        <p id="Text"></p>
    </>
  )
}

export default App;
