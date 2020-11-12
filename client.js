//This code was written by Kenan Arica
//Followed from this tutorial: https://blog.addpipe.com/using-webaudiorecorder-js-to-record-audio-on-your-website/


//getting HTML elements
const aud = document.getElementById("audio")
const downloadLink = document.getElementById('download');
var startButton = document.getElementById("startButton")
var stopButton = document.getElementById("stopButton")

//AudioContext node is required for the WebAudioRecorder object
var audioContext = new AudioContext;
//Creating a global copy of the GetUserMedia() stream so we can stop it from anywhere. 
var stream_copy;
var rec_obj;

//Button declarations
startButton.addEventListener("click", function(){
  console.log("Start pressed")
  startRecording();
});

stopButton.addEventListener("click", function() {
  console.log("Stop pressed");
  startButton.disabled = false;
  stopRecording()
});


function startRecording() {

  //Request access to record w/ mic
  navigator.mediaDevices.getUserMedia( {audio : true, video : false } ).then(stream =>  { 
    
    //Make our stream copy
    stream_copy = stream;

    input = audioContext.createMediaStreamSource(stream);
    input.connect(audioContext.destination)

    //I hard-coded mp3, but it can use .ogg as well. 

    rec_obj = new WebAudioRecorder(input, {
      workerDir    : "javascripts/",
      encoding     : "mp3",
      
      //Diagnostic event listeners
      onEncoderLoading: function(rec_obj, encoding) {
        // show "loading encoder..." display 
        console.log("Loading " + encoding + " encoder...");
      },

      onEncoderLoaded: function(rec_obj, encoding) {
        // hide "loading encoder..." display 
        console.log(encoding + " encoder loaded");
      }
      
    } ); //end constructor for rec_obj

    // This is where the trouble begins. When onComplete fires, it returns a blob. 
    // However, the blob does not contain any recorded audio. I couldn't figure this out. 

    rec_obj.onComplete = function(rec_obj, blob) {
      console.log("onComplete called");
      //Create our download link
      createDownload(blob, rec_obj.encoding)
    }

    // Set the options for the encoding. This is going to be hard-coded for now.
    rec_obj.setOptions({
      
      //5 minutes is the max for now, but just temporarily.
      timeLimit: 300,
      encodeAfterRecord: true, 
      ogg: {
          quality: 0.5
      },
      mp3: {
          bitRate: 160
      }
    });
    rec_obj.startRecording()

    startButton.disabled = true;
    
  }); //end getUserMedia()
  
} // end startRecording()

function createDownload(blob, encoding) { 
  
  console.log("createDownload called")
  //create download link
  var url = URL.createObjectURL(blob);
  downloadLink.href = url;

  var fname = new Date().getDate() + "_WebAudioRecorderTest.mp3";
  downloadLink.download = fname;

} //end createDownload()

function stopRecording() { 

  console.log("Stop pressed")
  //stop our stream
  stream_copy.getAudioTracks()[0].stop()
  //call our recorder's stop function
  rec_obj.finishRecording()

} //end stopRecording()