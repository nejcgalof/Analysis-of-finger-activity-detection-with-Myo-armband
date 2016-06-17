// AUTHOR: NEJC GALOF; galof.nejc@gmail.com
//This tells Myo.js to create the web sockets needed to communnicate with Myo Connect

//create sound buffers for notes:
var snd_a = new Audio("piano_a.wav");
var snd_b = new Audio("piano_b.wav");
var snd_c = new Audio("piano_c.wav"); 
var snd_d = new Audio("piano_d.wav");
var snd_e = new Audio("piano_e.wav");
var snd_f = new Audio("piano_f.wav");
var snd_g = new Audio("piano_g.wav");


//sample for moving
var moving=203;
var orientation=0;

Myo.on('connected', function(){
	console.log('connected');
	this.streamEMG(true);

	setInterval(function(){
		updateGraph(rawData);
	}, 25)
})

Myo.connect('com.myojs.fingers');

//Other myo functions
Myo.on('battery_level', function(val){
    console.log('Much power', val);
});

Myo.on('gyroscope', function(data) {  
    console.log(data.x);
    if(data.x>5 || data.x<-5){
    		moving=moving-(data.x);
    }
    if(moving>406){
    	moving=406;
    }
    else if(moving<0){
    	moving=0;
    }
});

Myo.on('orientation', function(data) {  
    orientation=data;
});

//Drawing functions
function draw_square(position) {
	var canvas = document.getElementById('piano_canvas');
  	var context = canvas.getContext('2d');
  	context.clearRect(0, 0, canvas.width, canvas.height);//delete square
  	context.beginPath();
  	context.rect(position, 90, 10, 10);
  	context.fillStyle = 'red';
  	context.fill();
  	context.stroke();
}

var rawData = [0,0,0,0,0,0,0,0];
Myo.on('emg', function(data){
	rawData = data;
})

var range = 150;
var resolution = 50;
var emgGraphs;

var graphData= [
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0),
	Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0)
]

$(document).ready(function(){
	emgGraphs = graphData.map(function(podData, podIndex){
		return $('#pod' + podIndex).plot(formatFlotData(podData), {
			colors: ['#8aceb5'],
			xaxis: {
				show: false,
				min : 0,
				max : resolution
			},
			yaxis : {
				min : -range,
				max : range,
			},
			grid : {
				borderColor : "#427F78",
				borderWidth : 1
			}
		}).data("plot");
	});

	//Minimalize graphs
	$("#min_button").click(function(){
		console.log("min_button!!!!!!!!!");
    	if($(this).html() == "-"){
        	$(this).html("+");
    	}
    	else{
        	$(this).html("-");
    	}
    	$("#box").slideToggle();
	});

	//Minimalize finger box
	$("#fin_button").click(function(){
		console.log("fin_button!!!!!!!!!");
    	if($(this).html() == "-"){
        	$(this).html("+");
    	}
    	else{
        	$(this).html("-");
    	}
    	$("#finger_box").slideToggle();
	});
});

var formatFlotData = function(data){
		return [data.map(function(val, index){
				return [index, val]
			})]
}

var st=0;
var n;
var filter0=0;
var filter3=0;
var filter4=0;
var filter6=0;
var filter7=0;
var sum0=0;
var sum3=0;
var sum4=0;
var sum6=0;
var sum7=0;
var updateGraph = function(emgData){
	graphData.map(function(data, index){
		graphData[index] = graphData[index].slice(1);
		graphData[index].push(emgData[index]);
		emgGraphs[index].setData(formatFlotData(graphData[index]));
		//We have data. What now? I try make own filter for each finger

		//Each cycle, got 150 samples <- get sum of positive variables for each sensor
		sum0=0;
   		for(var i=0; i < graphData[0].length; i++) 
   		{ 
   			if(graphData[0][i]>0){
   				sum0+=graphData[0][i];
   			}
   		}
		sum3=0;
   		for(var i=0; i < graphData[3].length; i++) 
   		{ 
   			if(graphData[3][i]>0){
   				sum3+=graphData[3][i];
   			}
   		}
   		sum4=0;
   		for(var i=0; i < graphData[4].length; i++) 
   		{ 
   			if(graphData[4][i]>0){
   				sum4+=graphData[4][i];
   			}
   		}
   		sum6=0;
   		for(var i=0; i < graphData[6].length; i++) 
   		{ 
   			if(graphData[6][i]>0){
   				sum6+=graphData[6][i];
   			}
   		}
   		sum7=0;
   		for(var i=0; i < graphData[7].length; i++) 
   		{ 
   			if(graphData[7][i]>0){
   				sum7+=graphData[7][i];
   			}
   		}
   		st++;
   		if(st>100){//OK. We have 100 cycles sum positive samples -> Final value, tell me which finger is up (Filers is best result from my hand)
			//console.log("0: " +filter0/st);
			//console.log("7: " +filter7/st);
			if(filter0/st>10 && filter0/st<60 && filter7/st<40 && filter3/st<300 && filter4/st<300 && filter6/st<30){
				document.getElementsByClassName("finger")[3].innerHTML = "PRSTANEC";
				//snd_d.play();
			}
			else{
				document.getElementsByClassName("finger")[3].innerHTML = "";
			}
			/*If we simulate for thumb too, but it's too hard
			if(filter3/st<500 && filter0/st>50 && filter4/st<300){
				document.getElementsByClassName("finger")[0].innerHTML = "PALEC";
			}
			else{
				document.getElementsByClassName("finger")[0].innerHTML = "";
			}*/
			//console.log("3: " +filter3/st);
			if(filter3/st>500){
				document.getElementsByClassName("finger")[2].innerHTML = "SREDINEC";
				beeplay().play("C5", 1/1);
				//snd_e.play();
			}
			else{
				document.getElementsByClassName("finger")[2].innerHTML = "";
			}
			//console.log("4: " +filter4/st);
			if(filter4/st>400){
				document.getElementsByClassName("finger")[4].innerHTML = "MEZINEC";
				//snd_c.play();
			}
			else{
				document.getElementsByClassName("finger")[4].innerHTML = "";
			}
			//console.log("6: " +filter6/st);
			if(filter6/st>60 && filter0/st<60){
				document.getElementsByClassName("finger")[1].innerHTML = "KAZALEC";
				//snd_f.play();
				beeplay().play("B4", 3/4);
			}
			else{
				document.getElementsByClassName("finger")[1].innerHTML = "";
			}
			//reset variables
			st=0;
			filter0=0;
			filter3=0;
			filter4=0;
			filter6=0;
			filter7=0;
   		}
   		else{//Need more samples
   			filter0+=sum0;
			filter3+=sum3;
			filter4+=sum4;
			filter6+=sum6;
			filter7+=sum7;
   		}
		emgGraphs[index].draw();
		//and draw positions:
		draw_square(moving);
	})
}




/*




*/