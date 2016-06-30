// AUTHOR: NEJC GALOF; galof.nejc@gmail.com
//This tells Myo.js to create the web sockets needed to communnicate with Myo Connect

//sample for moving
var moving=0;
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
    console.log('POWER:', val);
});

//Using gyroscope for detect moving
Myo.on('gyroscope', function(data) {  
    //ignorance minimal changes
    if(data.x>15 || data.x<-15){
    		moving=moving-(data.x);
    }
    //ignorance abnormal changes. set min and max
    if(moving>9000){
    	moving=100;
    }
    else if(moving<-9000){
    	moving=-100;
    }
});

Myo.on('orientation', function(data) {  
    orientation=data;
});

var rawData = [0,0,0,0,0,0,0,0];
Myo.on('emg', function(data){
	rawData = data;
});

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

//piano moving
var posit=notes.length/2;
var mov=0;

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
			//dividing all filters - got average value from all cycles
			filter0/=st;
			filter3/=st;
			filter4/=st;
			filter6/=st;
			filter7/=st;
			//set default octave
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
      				//set key on active and play a note
      				$('.key[data-note="' + notes[posit-1] + '"]').addClass("active");
					beeplay().play(notes[posit-1]+octave, tempo);
				}
			}
			else{
				document.getElementsByClassName("finger")[3].innerHTML = "";
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
      			//set key on active and play a note
      			$('.key[data-note="' + notes[posit] + '"]').addClass("active");
				beeplay().play(notes[posit]+octave, tempo);
			}
			else{
				document.getElementsByClassName("finger")[2].innerHTML = "";
			}
			if(filter4>400){
				document.getElementsByClassName("finger")[4].innerHTML = "MEZINEC";
				//second left finger from middle finger - checking if out of piano
				if(posit-2>=0){
					if(notes[posit-2] === "B"){
        				octave = octave_def - 1;
      				}
      				if(notes[posit-2] === "C"){
        				octave = octave_def + 1;
      				}
      				//set key on active and play a note
      				$('.key[data-note="' + notes[posit-2] + '"]').addClass("active");
					beeplay().play(notes[posit-2]+octave, tempo);
				}
			}
			else{
				document.getElementsByClassName("finger")[4].innerHTML = "";
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
      				//set key on active and play a note
      				$('.key[data-note="' + notes[posit+1] + '"]').addClass("active");
					beeplay().play(notes[posit+1]+octave, tempo);
				}
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
		
		//and draw positions of middle finger:
		mov=mov+moving;
		//if out of key (0 is center -3000 to 3000 is one key on keyboard) move position
		if(mov<=-3000){
			$('.key[ data-note=' + notes[posit] + ']').removeClass('move');
			posit=posit-1;
			//end of piano
			if(posit<0){
				posit=0;
			}
			mov=0;
			moving=0;
			$( '.key[ data-note=' + notes[posit] + ']' ).addClass('move');
		}
		else if(mov>=3000){
			$('.key[ data-note=' + notes[posit] + ']').removeClass('move');
			posit=posit+1;
			//end of piano
			if(posit>=notes.length){
				posit=posit-1;
			}
			mov=0;
			moving=0;
			$('.key[ data-note=' + notes[posit] + ']').addClass('move');
		}
	})
}
