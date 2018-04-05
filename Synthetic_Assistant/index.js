'use strict';
var AlexaSkill = require('./AlexaSkill');
const AWS = require ('aws-sdk');
var request = require('request');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
var APP_ID = "amzn1.ask.skill.0ba5476e-139a-44c6-ac47-8bd59a2f5e03";
var step = ['M1'];
var temp;
var ack;
var sid;
var con;
var corr;
var inp;
var prev;
var date;
var current_hour;
var count = 0;
var AssistantRead = function () {
    AlexaSkill.call(this, APP_ID);
    };
AssistantRead.prototype = Object.create(AlexaSkill.prototype);
AssistantRead.prototype.constructor = AssistantRead;

AssistantRead.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("AssistantRead onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
   
};

AssistantRead.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("AssistantRead onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Medical Assistant";
    var repromptText = "You can say Assistant";
    response.ask(speechOutput, repromptText);
};

AssistantRead.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("AssistantRead onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    };

AssistantRead.prototype.intentHandlers = {
    // register custom intent handlers
    "AssistantReadIntent": function (intent, session, response) {
        console.log(intent);
        response.ask("Going Through MarchP Steps!", "Going Through MarchP Steps!", "Going Through MarchP Steps!");
    },
    
    //"MySidIntent": exports.handler = function(e, ctx, callback) { 
	"MySidIntent": function (e, ctx, response) { 
		 
    var stepids = step;

    stepids.forEach(function(element, callback) {
	
	var params = { 
        TableName: 'first_res', 
        Key: { 
        "stepId": element 
        } 
    };
	console.log( "getting record for step id : " + element + "..." );
	console.log('Step 1');
	readDynamoItem(params, function (myResult){
		console.log('Step 2');
		var say = "";
		say = "  " + myResult.Item.acknowledgement;
		response.ask(say, "Please try again.");
		temp = myResult.Item.nextstepno;
		sid = myResult.Item.stepId;
		ack = myResult.Item.acknowledgement;
		con = myResult.Item.condition;
		corr = myResult.Item.currectionid;
		inp = myResult.Item.inputdata;
        prev = myResult.Item.prevstepno;	
        console.log (temp);
		console.log (e);
		date = new Date();
		current_hour = date.getTime();		
		
		var params = { 
        TableName: 'first', 
        Item: { 
        stepId: sid,
		acknowledgement: ack,
		condition: con,
		correctionId: corr,
		inputdata:inp,
		nextstepno: temp,
		prevstepno: prev,
		timeAdded:current_hour
        } 
		};
	
	
		console.log(JSON.stringify(params));
		console.log( "storing record for step id : " + temp + "..." );
		
		docClient.put(params, function(err, data){
		console.log('parasar');
		if (err) console.log (err);
		else console.log (data);	
		});
				
		});
	    });

},

"NextIntent": function (e, ctx, response) { 
console.log (temp);
var stepids = [temp]; 
stepids.forEach(function(element, callback) {
	
	var params = { 
        TableName: 'first_res', 
        Key: { 
        "stepId": element 
        } 
    };
	console.log( "getting record for step id : " + element + "..." );
	
	readDynamoItem(params, function (myResult){
		var say = "";
		if (myResult.Item.stepId == temp) 
		
	    {
		    console.log (myResult.Item.stepId);
	    	console.log (temp);
		    say = "  " + myResult.Item.acknowledgement;
		    response.ask(say, "Please try again.");
		}
		if (myResult.Item.stepId != temp)
		{
		count = count+1;	
		}
		temp = myResult.Item.nextstepno;
		sid = myResult.Item.stepId;
		ack = myResult.Item.acknowledgement;
		con = myResult.Item.condition;
		corr = myResult.Item.currectionid;
		inp = myResult.Item.inputdata;
        prev = myResult.Item.prevstepno;
		console.log (temp);
		console.log (e);
		date = new Date();
		current_hour = date.getTime();
		
		if (myResult.Item.stepId != temp)
		{
		count = count+1;	
		}
        
        console.log("executing put request");	
	    var params = { 
        TableName: 'first', 
        Item: { 
        stepId: sid,
		acknowledgement: ack,
		condition: con,
		correctionId: corr,
		inputdata:inp,
		nextstepno: temp,
		prevstepno: prev,
		timeAdded:current_hour,
		error: count
        } 
    };
	console.log( "storing record for step id : " + temp + "..." );
	console.log(JSON.stringify(params));
	docClient.put(params, function(err, data){ 
		if (err) console.log (err);
		else console.log (data);
		});
		});
	    });
},


 "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },
    
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("Please read manual!", "Please read manual!");
    }
};

exports.handler = function (event, context) {
    var assistantRead = new AssistantRead();
    assistantRead.execute(event, context);
};

function readDynamoItem(params, callback) {
		
		docClient.get(params, function(err, data){ 
        if(err){ 
            console.error("Error:", JSON.stringify(err, null, 2));
            callback(err, null); 
        }else{ 
            console.log("Success:", JSON.stringify(data, null, 2));
            callback(data,null); 
        } 
    }); 
}





