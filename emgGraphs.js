// AUTHOR: NEJC GALOF; galof.nejc@gmail.com
//This tells Myo.js to create the web sockets needed to communnicate with Myo Connect

//Measurement
var measurement=0;
var number_measurement=0;

//Sample for moving
var orientation=0;
var prev_orientation=0;

//When Myo is connected
Myo.on('connected', function(){
	console.log('connected');
	this.streamEMG(true); //turn stream EMG on

	setInterval(function(){
		updateGraph(rawData);
	}, 25)
})

Myo.connect('com.myojs.fingers');

//Other myo functions
Myo.on('battery_level', function(val){
    console.log('POWER:', val);
});

//Moving hand (looking only yaw)
var center_orientation=true;
var euler = new THREE.Euler();
var quaternion = new THREE.Quaternion();
Myo.on('orientation', function(data) {  
	if(center_orientation){ //first time setting orientation to zero (0,0,0,1)
		this.zeroOrientation();
		center_orientation=false;
	}
    quaternion.set(data.x,data.y,data.z,data.w);
    euler.setFromQuaternion(quaternion); //get euler angles
    orientation=THREE.Math.radToDeg(euler.z); //get angles from rad to deg
});

//Measurement export
var sensor1=[['sensor1']];
var sensor2=[['sensor2']];
var sensor3=[['sensor3']];
var sensor4=[['sensor4']];
var sensor5=[['sensor5']];
var sensor6=[['sensor6']];
var sensor7=[['sensor7']];
var sensor8=[['sensor8']];
var csvRows = [];

//EMG raw data
var rawData = [0,0,0,0,0,0,0,0];

Myo.on('emg', function(data){
	rawData = data;

	if(measurement==1){ //We measurement 3 second and export csv file
		sensor1.push([rawData[0]]);
		sensor2.push([rawData[1]]);
		sensor3.push([rawData[2]]);
		sensor4.push([rawData[3]]);
		sensor5.push([rawData[4]]);
		sensor6.push([rawData[5]]);
		sensor7.push([rawData[6]]);
		sensor8.push([rawData[7]]);

		number_measurement++;
		if(number_measurement==600){//end of measurement
			console.timeEnd('measurement');
			measurement=0;
			number_measurement=0;
			for(var i=0, l=sensor1.length; i<l; ++i){
    			csvRows.push(sensor1[i].join(';'));
			}
			for (var i = 0, l = csvRows.length; i < l; ++i) {
 				csvRows[i] += ";"+sensor2[i];
 				csvRows[i] += ";"+sensor3[i];
 				csvRows[i] += ";"+sensor4[i];
 				csvRows[i] += ";"+sensor5[i];
 				csvRows[i] += ";"+sensor6[i];
 				csvRows[i] += ";"+sensor7[i];
 				csvRows[i] += ";"+sensor8[i];
			}
			var csvString = csvRows.join("%0A");
			var a         = document.createElement('a');
			a.href        = 'data:attachment/csv,' + csvString;
			a.target      = '_blank';
			a.download    = 'EMG_values_on_3_SEC.csv';
			document.body.appendChild(a);
			a.click();
		}
	}
});

//For graphs
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

	//Minimalize graphs box
	$("#min_button").click(function(){
    	if($(this).html() == "-"){
        	$(this).html("+");
    	}
    	else{
        	$(this).html("-");
    	}
    	$("#graph_box").slideToggle();
	});

	//Minimalize finger box
	$("#fin_button").click(function(){
    	if($(this).html() == "-"){
        	$(this).html("+");
    	}
    	else{
        	$(this).html("-");
    	}
    	$("#finger_box").slideToggle();
	});

	//Minimalize piano box
	$("#piano_button").click(function(){
    	if($(this).html() == "-"){
        	$(this).html("+");
    	}
    	else{
        	$(this).html("-");
    	}
    	$("#piano_box").slideToggle();
	});

	//Minimalize about box
	$("#about_button").click(function(){
    	if($(this).html() == "-"){
        	$(this).html("+");
    	}
    	else{
        	$(this).html("-");
    	}
    	$("#about_box").slideToggle();
	});

	//scrolling to content
	$("#G").click(function() {
		jQuery('html,body').animate({ scrollTop: $('.emgGraphs').offset().top}, 1000);
		return false;
    });

    $("#P").click(function() {
		jQuery('html,body').animate({ scrollTop: $('.piano').offset().top}, 1000);
		return false;
    });

    $("#F").click(function() {
		jQuery('html,body').animate({ scrollTop: $('.fingers').offset().top}, 1000);
		return false;
    });

    $("#A").click(function() {
		jQuery('html,body').animate({ scrollTop: $('.about').offset().top}, 1000);
		return false;
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

//Only one note in one press 
//var finger1_sound=false; //not have thumb
var finger2_sound=false;
var finger3_sound=false;
var finger4_sound=false;
var finger5_sound=false;

//Piano moving
var posit=notes.length/2;


var updateGraph = function(emgData){
	graphData.map(function(data, index){
		graphData[index] = graphData[index].slice(1); //clean last data
		graphData[index].push(emgData[index]); //add new data
		emgGraphs[index].setData(formatFlotData(graphData[index]));
		//We have data. What now? I try make own filter for each finger

		//Each cycle, got 50 samples <- get sum of positive variables for each sensor
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
			//Dividing all filters - got average value from all cycles
			filter0/=st;
			filter3/=st;
			filter4/=st;
			filter6/=st;
			filter7/=st;
			//Set default octave
			octave=octave_def;
			$(".key").removeClass("active").unbind("mouseover"); //remove all active keys on piano
			if(filter0>10 && filter0<60 && filter7<40 && filter3<300 && filter4<300 && filter6<30){
				document.getElementsByClassName("finger")[3].innerHTML = "PRSTANEC";
				//Left finger from middle finger - checking if out of piano
				if(posit-1>=0){
					if(notes[posit-1] === "B"){
        				octave = octave_def - 1;
      				}
      				if(notes[posit-1] === "C"){
        				octave = octave_def + 1;
      				}
      				//Set key on active and play a note
      				$('.key[data-note="' + notes[posit-1] + '"]').addClass("active");
      				//only first time play sound
      				if(!finger4_sound){
						beeplay().play(notes[posit-1]+octave, tempo);
						finger4_sound=true;
					}
				}
			}
			else{
				document.getElementsByClassName("finger")[3].innerHTML = "";
				finger4_sound=false; //reset
			}
			/*If we simulate for thumb too, but it's too hard
			if(filter3<500 && filter0>50 && filter4<300){
				document.getElementsByClassName("finger")[0].innerHTML = "PALEC";
			}
			else{
				document.getElementsByClassName("finger")[0].innerHTML = "";
			}*/
			if(filter3>500){
				document.getElementsByClassName("finger")[2].innerHTML = "SREDINEC";
				if(notes[posit] === "B"){
        			octave = octave_def - 1;
      			}
      			if(notes[posit] === "C"){
        			octave = octave_def + 1;
      			}
      			//Set key on active and play a note
      			$('.key[data-note="' + notes[posit] + '"]').addClass("active");
      			//Only first time play sound
      			if(!finger3_sound){
					beeplay().play(notes[posit]+octave, tempo);
					finger3_sound=true;
				}
			}
			else{
				document.getElementsByClassName("finger")[2].innerHTML = "";
				finger3_sound=false; //reset
			}
			if(filter4>400){
				document.getElementsByClassName("finger")[4].innerHTML = "MEZINEC";
				//Second left finger from middle finger - checking if out of piano
				if(posit-2>=0){
					if(notes[posit-2] === "B"){
        				octave = octave_def - 1;
      				}
      				if(notes[posit-2] === "C"){
        				octave = octave_def + 1;
      				}
      				//Set key on active and play a note
      				$('.key[data-note="' + notes[posit-2] + '"]').addClass("active");
      				//Only first time play sound
      				if(!finger5_sound){
						beeplay().play(notes[posit-2]+octave, tempo);
						finger5_sound=true;
					}
				}
			}
			else{
				document.getElementsByClassName("finger")[4].innerHTML = "";
				finger5_sound=false; //reset
			}
			if(filter6>60 && filter0<60){
				document.getElementsByClassName("finger")[1].innerHTML = "KAZALEC";
				if(posit+1<notes.length){
					if(notes[posit+1] === "B"){
        				octave = octave_def - 1;
      				}
      				else if(notes[posit+1] === "C"){
        				octave = octave_def + 1;
      				}
      				//Set key on active and play a note
      				$('.key[data-note="' + notes[posit+1] + '"]').addClass("active");
      				//Only first time play sound
      				if(!finger2_sound){
						beeplay().play(notes[posit+1]+octave, tempo);
						finger2_sound=true;
					}
				}
			}
			else{
				document.getElementsByClassName("finger")[1].innerHTML = "";
				finger2_sound=false;
			}
			//Reset variables
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
		
		//And draw positions of middle finger:
		//We turn hand 45deg right and 45deg to left. We change in 90deg 14 keys.
		if(orientation>(prev_orientation+(90/14))){
			prev_orientation=orientation;
			$('.key[ data-note=' + notes[posit] + ']').removeClass('move');
			posit=posit-1;
			//End of piano
			if(posit<0){
				posit=0;
			}
			$( '.key[ data-note=' + notes[posit] + ']' ).addClass('move');

			//All keys can play again-because tap on different keys
			finger2_sound=false;
			finger3_sound=false;
			finger4_sound=false;
			finger5_sound=false;
		}
		else if(orientation<(prev_orientation-(90/14))){
			prev_orientation=orientation;
			$('.key[ data-note=' + notes[posit] + ']').removeClass('move');
			posit=posit+1;
			//End of piano
			if(posit>=notes.length){
				posit=posit-1;
			}
			$('.key[ data-note=' + notes[posit] + ']').addClass('move');

			//All keys can play again-because tap on different keys
			finger2_sound=false;
			finger3_sound=false;
			finger4_sound=false;
			finger5_sound=false;
		}
	})
}

//Measurement
$(document).keydown(function(e){
    var pressed = String.fromCharCode(e.which);
    if(pressed=='M' && measurement==0){
    	console.log('measurement');
    	measurement=1;
    	console.time('measurement');
    }
});