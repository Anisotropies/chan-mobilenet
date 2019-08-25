//https://becominghuman.ai/machine-learning-in-the-browser-using-tensorflow-js-3e453ef2c68c

//https://www.tensorflow.org/hub/tutorials/image_retraining
//https://github.com/adwellj/node-tfjs-retrain



window.URL = window.URL || window.webkitURL;

const listFiles = ["https://cdn.glitch.com/64b69703-45a7-424d-9acb-5a4f7f75a9ef%2FIMG_2824.jpg?v=1565931709951",
                   "https://cdn.glitch.com/64b69703-45a7-424d-9acb-5a4f7f75a9ef%2FIMG_2873.jpg?v=1566178175594"];
let imgIndex = 0;

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
  appTransfer(imgEl);
}

//transfer learning

//DISPLAY NEW IMAGE TO TRAIN ON
const displayNewImage = index =>{
  
      console.log("index "+index);
      const imgT = document.createElement("img");
      imgT.id = "imgT";
      imgT.crossOrigin = "anonymous";
      imgT.src = listFiles[index];
      imgT.height = 300;
      imgT.width = 300;
      imgT.onload = function() {
        window.URL.revokeObjectURL(this.src);
      }
  //https://www.w3schools.com/jsref/met_node_appendchild.asp
  //https://www.w3schools.com/jsref/met_node_removechild.asp
      const list = document.getElementById('trainingImg');
      list.removeChild(list.childNodes[0]);    
      list.appendChild(imgT);
  return imgT;
}



//display first image
displayNewImage(imgIndex);


let net1;
//transfer learning
async function appTransfer(imgEl) {
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
    console.log("listFiles.length "+listFiles.length);

    if(imgIndex<listFiles.length-1)
    {
      imgIndex++;
    }
    const imgT = displayNewImage(imgIndex);
    
    // to the KNN classifier.
    const activation = net1.infer(imgT, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);

    //refresh prediction
    predictNew();
  };

  // When clicking a button, add an example for that class.
  document.getElementById("class-dog").addEventListener('click', () => addExample(0));
  document.getElementById("class-notDog").addEventListener('click', () => addExample(1));

  //diplay new prediction after each click
  async function predictNew() {
    console.log("classifier.getNumClasses()   "+classifier.getNumClasses()) ;
    if (classifier.getNumClasses() > 0) {      

      const activation2 = net1.infer(imgEl, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation2);

      const classes = ['Dog', 'B', 'C'];
      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
      document.getElementById('newPrediction').innerHTML = `
        <p><b>New Classification:</b> ${classes[result.classIndex]}</p>
        <p><b>New Probability:</b> ${result.confidences[result.classIndex]}</p>
      `;
    };
  }
}