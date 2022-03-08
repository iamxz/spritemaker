
const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const Spritesmith = require('spritesmith');
const gmsmith = require('gmsmith');
const templater = require('./templates');
const url = require('url2');
const safeWriteStream = require('safe-write-stream')

// Define helper for coordinate naming
function getCoordinateName(filepath) {
  // Extract the image name (exlcuding extension)
  const fullname = path.basename(filepath);
  const nameParts = fullname.split('.');

  // If there is are more than 2 parts, pop the last one
  if (nameParts.length >= 2) {
    nameParts.pop();
  }

  // Return our modified filename
  return nameParts.join('.');
}

let spritesmith = new Spritesmith({
  engine: gmsmith,
  engineOpts:{imagemagick: true},
});

function sprite(images,filepath,config) {

  return new Promise((resolve,reject) =>{

    const imgName =  "sprite.png";
    const cssName =  'sprite.styl';

  // If there are settings for retina, verify our all of them are present

 
    if (images.length === 0) {
        console.error("缺少文件")
    }

    // Determine the format of the image
    
    // If we have retina settings, filter out the retina images
  
    // Prepare spritesmith parameters
  
    

    // Construct our spritesmiths
   

    spritesmith.createImages(images,function (err, resultArr) {

      // If an error occurred, emit it
      if (err) {
        reject(err);
      }
      
      // Process our images now
      const result = spritesmith.processImages(resultArr, {
        algorithm: config.algorithm || "binary-tree",
        padding: config.padding*1 || 0,
        // algorithmOpts:{},
        exportOpts: {
          format: 'png',
          quality:  config.quality || 100
        },
      });
    
  

      // START OF DUPLICATE CODE FROM grunt-spritesmith
      // Generate a listing of CSS variables
      const coordinates = result.coordinates;
      const properties = result.properties;
      const spritePath = url.relative(cssName, imgName);
      const spritesheetData = {
        width: properties.width,
        height: properties.height,
        image: spritePath
      };
      const cssVarMap = function noop() {};
      const cleanCoords = [];

      // Clean up the file name of the file
      Object.getOwnPropertyNames(coordinates).sort().forEach(function (file) {
        // Extract out our name
        var name = getCoordinateName(file);
        var coords = coordinates[file];

        // Specify the image for the sprite
        coords.name = name;
        coords.source_image = file;
        // DEV: `image`, `total_width`, `total_height` are deprecated as they are overwritten in `spritesheet-templates`
        coords.image = spritePath;
        coords.total_width = properties.width;
        coords.total_height = properties.height;

        // Map the coordinates through cssVarMap
        coords = cssVarMap(coords) || coords;

        // Save the cleaned name and coordinates
        cleanCoords.push(coords);
      });


      var cssStr = templater({
        sprites: cleanCoords,
        spritesheet: spritesheetData
      });
    
     let writeStream = safeWriteStream(path.resolve(filepath,"sprite.png"))
     
      writeStream.on('finish', function() {
      
        console.log('file finish');

        resolve({
          path: imgName,
          css : cssStr
        })
      });
    
      result.image.pipe(writeStream)
        
    });

  })
  
  };


module.exports = sprite;