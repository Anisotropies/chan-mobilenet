//https://becominghuman.ai/machine-learning-in-the-browser-using-tensorflow-js-3e453ef2c68c

//https://www.tensorflow.org/hub/tutorials/image_retraining
//https://github.com/adwellj/node-tfjs-retrain



window.URL = window.URL || window.webkitURL;

const fileSelect = document.getElementById("fileSelect"),
    fileElem = document.getElementById("fileElem"),
    fileList = document.getElementById("fileList");

fileSelect.addEventListener("click", function (e) {
  if (fileElem) {
    fileElem.click();
  }
  e.preventDefault(); // prevent navigation to "#"
}, false);

function handleFiles(files) {
  if (!files.length) {
    fileList.innerHTML = "<p>No file selected!</p>";
  } else {
    fileList.innerHTML = "";
    for (let i = 0; i < files.length; i++) {
    
      const img = document.createElement("img");
      img.id = "img";
      img.src = window.URL.createObjectURL(files[i]);
      img.height = 300;
      img.onload = function() {
        window.URL.revokeObjectURL(this.src);
      }
      fileList.appendChild(img);
      app();
    }
  }
}


let net;
const classifier = knnClassifier.create();

async function app() {
  console.log('Loading mobilenet..');
  const prediction = document.getElementById("prediction");
  prediction.innerHTML = "<p>Loading mobilenet...</p>";
  
  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  // Make a prediction through the model on our image.
  const imgEl = document.getElementById('img');
  const result = await net.classify(imgEl);
  console.log(result[0]);
  document.getElementById("prediction").innerHTML = "<p>" + "<b>Classification: </b>" + JSON.stringify(result[0].className) + "</p>"+
    "<p>" + "<b>Probability: </b>" + JSON.stringify(result[0].probability) + "</p>";;
  appTransfer();
}

//transfer learning

let net1;

async function appTransfer() {
  console.log('Loading mobilenet..');

  // Load the model.
  net1 = await mobilenet.load();
  console.log('Sucessfully loaded model');

  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    //Cross origin: https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
    //https://stackoverflow.com/questions/30945945/tainted-canvases-may-not-be-loaded-cross-domain-issue-with-webgl-textures
    //tensorflow needs to know width and height of image: https://github.com/tensorflow/tfjs/issues/322
    const imgT = document.createElement("img");
      imgT.id = "imgT";
      imgT.crossOrigin = "anonymous";
      imgT.src = "https://cdn.glitch.com/64b69703-45a7-424d-9acb-5a4f7f75a9ef%2FIMG_2824.jpg?v=1565931709951";
      imgT.height = 300;
      imgT.width = 300;
      imgT.onload = function() {
        window.URL.revokeObjectURL(this.src);
      }
    
    // to the KNN classifier.
    const activation = net1.infer(imgT, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
    //document.getElementById('trainingImg').appendChild(imgT);
  };

  addExample(0);



    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const imgG = document.createElement("img");
      imgG.id = "imgG";
      imgG.crossOrigin = "anonymous";
      imgG.src = "https://cdn.glitch.com/64b69703-45a7-424d-9acb-5a4f7f75a9ef%2FIMG_2824.jpg?v=1565931709951";
      imgG.height = 300;
      imgG.width = 300;
      imgG.onload = function() {
        window.URL.revokeObjectURL(this.src);
      }
      
      document.getElementById('console')
      
      
      const activation2 = net1.infer(imgG, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation2);

      const classes = ['Dog', 'B', 'C'];
      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
      document.getElementById('console').innerHTML = `
        <p><b>Classification:</b> ${classes[result.classIndex]}</p>
       <p> <b>Probability:</b> ${result.confidences[result.classIndex]}</p>
      `;
    };
}