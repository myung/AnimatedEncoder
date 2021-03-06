/*
AnimatedEncoder by Compukaze LLC
Visit

AnimatedWEBPs.com

AnimatedPNGs.com

for info on the formats this works with.

Inspired by the Animated PNG/GIF encoder of my Deckromancy.com and Punykura.com projects,
but built in Javascript rather than ActionScript 3 and leverages the native
(and in some cases hardware-accelerated) image encoders of the browser
via Canvas.toDataURL()
=============================================================================
The MIT License (MIT)
Copyright (c) 2016 Compukaze LLC
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
=============================================================================

Version 1.0.4

Format support is based on what formats a given browser supports as
an export type from <canvas> .toDataURL()
Takes a list of img/canvas/image URLs
and makes an Animated WEBP or Animated PNG.

Other Animated Formats could potentially be supported in the future,
but Animated PNG and Animated WEBP are the focus for now.
GIF support, for example, would be possible but with Firefox and Safari supporting Animated PNG
and Chrome tentatively adding Animated PNG support by the end of 2016,
GIF support could be pointless in the near future and not the best use of effort right now.
Remember that GIF would need heavy work, like LZW and indexed color selection implementations.

Here is what browsers would currently (late 2016) be capable of supporting
as output (note that Edge and Chrome CANNOT natively PLAY Animated PNG,
but they WILL the first frame or APNG default image):


The status of being able to GENERATE (NOT necessarily VIEW) animated images:

        | Animated PNG  | Animated WEBP
--------+---------------+---------------------------------------------------
Chrome, | Supported.    | Supported.
Opera   |               | 
--------+---------------+---------------------------------------------------
Firefox | Supported.    | Not supported.
        |               | * Firefox is reportedly considering/testing with
        |               |   experimental WEBP support. If it were to support
        |               |   toDataURL('image/webp'), it could work.
--------+---------------+---------------------------------------------------
Safari  | Supported.    | Not supported.
        |               | * Safari has reportedly been considering/testing,
        |               |   WEBP support and if it were to support
        |               |   toDataURL('image/webp'), it could work.
--------+---------------+---------------------------------------------------
Edge    | Supported.    | Not supported.
--------+---------------+---------------------------------------------------
IE      | Supported.    | Not supported.
--------+---------------+---------------------------------------------------
 * IE is being phased out and replaced with Edge.


The status of being able to VIEW animated images:

        | Animated PNG           | Animated WEBP                
--------+------------------------+------------------------------------------
Chrome, | Will tentatively       | Supported.
Opera   | be supported Q4 2016.  |
--------+------------------------+------------------------------------------
Firefox | Supported.             | Not supported.
        |      	                 | * Safari has reportedly been considering/
        |                        |   testing WEBP support. It is unclear if
        |                        |   this includes Animated WEBP or just
        |                        |   non-animated WEBP.
--------+------------------------+------------------------------------------
Safari  | Supported.             | Not Supported.
        |                        | * WEBP reportedly being considered/tested,
        |                        |   but it may only be non-animated for now.
--------+------------------------+------------------------------------------
Edge    | Not supported.         | Not supported.
        | (User only sees first  |
	| frame or default image)|
        | * Marked as under      |
        |   Review on Edge Dev   |
        |   User Voice, but with |
        |   no commitment so far.|
--------+------------------------+------------------------------------------
IE      | Not Supported.         | Not supported.
        | (User only sees first  |
	| frame or default image)|
--------+------------------------+------------------------------------------
 * IE is being phased out and replaced with Edge.


Note that Animated PNG support is possible in all major browsers without the need for a custom DEFLATE implementation
because all major browsers consistently produce RGBA non-interlaced output via toDataURL() in all cases.
It is unclear if this behavior is part of the HTML5 spec or not.
HTML5 does mandate that the image should be able to reproduce all original pixels
exactly, but it is unclear if this means an image with a low number of colors that
could be encoded with 8 bit indexed color is mandated to stay 32 bit RGBA.

USAGE:
var paramz = {
	"format":'<png|gif|webp|webm>',
	"quality":<0-1> 0% - 100% quality. Lower quality saves more space.
	"delay":<positive integer, 1 or greater>, delay in milliseconds
			(may get limited to 600 on GIF due to browser implementations)
	"width":<uint for pixel dimensions>,
	"height":<uint for pixel dimensions>,
	"autoDimensions":<true|false>, (if true it will fit the size to hold all images added)
	"fitting":<actual|stretch|crop|preserve>,
	"animationStyle":<movie|sprite>,(Only applies to some types like PNG. Movie has inter-frame compression
					by recycling pixels of previous frames with a transparent pixel,
					'sprite' can have changing transparent areas in different frames,
					but loses this extra compression savings.)
	"ppi":<uint for number of pixels per inch>
	"ppm":<uint for number of pixels per metre> ('meter' in the US)
					PNG can use ppi(pixels per inch) or ppm (pixels per metre)
					to create a pHYs chunk that ensures the image can
					be interpreted and/or printed at the desired physical size.
					If you are using ppcm(pixels per centimetre) you can take that
					times 100 to get the ppm.
------------Events----------------------------------------------------
	"onEncoded":<function to call when done>,
	"onProgress":<function to call as encoding progresses. receives a 0-1 number representing a percentage>,
	"onFrameAdded":<function that will get called when a frame image has been fully added, after loading and such>
}
var ae = new AnimatedEncoder(paramz);
	(The parameters can also be changed after initialization by setting ae.width = 500; for example.)
	"fitting" describes how images are fit into the animation bounds.
		'actual' = Draw image at actual size on the canvas at (0,0).
			The image may be cropped,
			or it may not fill the full area.
				('actual' is the default.)
		'stretch' = Stretch the image to fill dimensions.
			it may be skewed.
		'crop' = Make the image fill the canvas, but maintain aspect ratio
			without being skewed.
			The top and bottom may be cropped,
			or the left and right may be cropped.
			it will be centered either way.
		'preserve' = preserves all areas of all images and all aspect ratios of all images.
f = {
	"file":<[Object File]> OR "image":<[Object Image]>
	<more optional parameters will be added later>
};
ae.addFrame(f);
	(repeat this several times)
ae.saveAnimatedFile();
function onEncodedFunc(ae){
	//finally set the image src to the base 64 encoded animated image.
	anImage.src = ae.outputBase64;
}
	********** The following will be set internally and do *******
	*************** NOT need to be set in paramz *****************
	"frames":<frame setups>
	"payloads":<will store the bitstreams of extracted frames to build from>
	"sourceFormat":<png|gif|webp> (The format that the encodings will be extracted from based on the browser's supported Canvas.toDataURL() encodings. Internally set based on format, webm and webp will both use webp as the source since there is no webm toToDataURL and they share the same VPX bitstreams.)
	**************************************************************

[Featuroach] NOTE THAT IMAGE CREATION WILL FAIL IF
the image is NOT either
(A) Selected by the user from their device/photo gallery
(B) Locally located on the same server AND website domain name
This is because of a Javascript 'security' Featuroach ('Feature'/Bug that hides and creeps around in your code like a filthy roach)
This featuroach considers accessing the contents of those images a security risk and may scream about 'security' or a 'tainted' canvas in browser console.

UPDATE: You can mostly get around this by disabling CORS restrictions on your browser while testing your code locally.
	In most cases your website is not going to need the cross-domain images and it will not be a problem once live on your site,
	but the Cross-Origin Resource Sharing rules can create huge headaches when testing your code locally.

*/
function AnimatedEncoder(paramz,simpleQuality){
	if(paramz == 'webp'//only webp is implemented so far
	 ||paramz == 'png'
	 ||paramz == 'gif'
	 ||paramz == 'webm'){
		//type checking in Javascript is weird, so this will be more reliable
		//if called with an unsupported string it could break,
		//but that is not a valid value to call it with
		//Valid initialization values are:
//new AnimatedEncoder('webp'|'webm'|'png'|'gif'|Object)
		paramz = {
				"format":paramz
			};
		if(simpleQuality!==undefined){
			paramz.quality = simpleQuality;
		}
	}
	//set up defaults
	this.format = 'png';//Canvas.toDataURL('image/png'); supported in all browsers, so this is default.
	this.comment = 'Saved with AnimatedEncoder ( AnimatedWEBPs.com )';
	this.quality = '0.75';
	this.width = 1;
	this.height = 1;
	this.delay = 75;//The in milliseconds delay for all frames, unless frame-specific delay set.
	this.onEncoded = null;
	this.fitting = 'actual';
	this.animationStyle = 'movie';
	/*animationStyle is used by formats like PNG or GIF that use pixel recycling for their inter-frame compression
		leaving it 'movie' allows for this greater compression, but pixels with transparency must be locked on the first frame.
		changing it 'sprite' allows frames with differing transparent areas to work.
		it may not effect other types
	*/
	//following values should not be overridden:
	this.output64 = null;
	this.outputOctetStream = null;
	this.frames = [];
	this.chunkPackI = 0;
	
	for(var key in paramz){
		this[key] = paramz[key];
	}
	this.encoderCanvas = document.createElement('canvas');
}
AnimatedEncoder.prototype.supportsFormat = function(desiredFormat){
	//This means the animated format can be created in the user's current browser.
	//It does not always mean that browser can display the animation.
	desiredFormat = desiredFormat.toLowerCase();
	if(desiredFormat=='png'){
		return true;//HTML5 spec calls for canvas.toDataURL to always support PNG.
	}
	//===============these types are supported if .toDataURL() support is there:=============
	if(desiredFormat=='webp'){//check list of types(currently just WEBP)
		//Otherwise, check to see if it worked or defaulted to PNG.
		//If it did not default to PNG due to unsupported type, return true.
		var canv = document.createElement('canvas');
		canv.width = 1;canv.height = 1;
		if(canv.toDataURL('image/'+desiredFormat).substring(0,15)=='data:image/png;'){
			return false;
		}
		return true;
	}//===========end of types that are supported if toDataURL is available for them.========
	return false;
}
AnimatedEncoder.prototype.initAnimation = function(){
	//do stuff needed to initialize
	//GIF needs to come up with a common palette selection,
	//Other formats need other stuff
	if(this.format=='gif'){
		
	}
};
/*
Animated WEBP:
(made of RIFF chinks (FourCC,))
(note that WEBP integers are unsigned LITTLE ENDIAN)
RIFF/WEBP header
contents{
	VP8X chunk
	ANIM chunk (global animation paramz)
	ANMF (frame1 paramz and data)
	ANMF (frame2 paramz and data)
	...
	ANMF (frameX paramz and data)
}
*/
AnimatedEncoder.prototype.addFrame = function(frameParamz){
	/*a frame can be added 3 different ways.
	only ONE of these should be set
	{"image":[Object IMG]}
		creates frame from active <img> element, which can be access by
		creating it with document.createElement('img')
		OR locating it with document.getElementById('img_id')
	{"file":[Object File]}
		A file selected by a <input type="file" accept="image/*"> element.
		this.files[0] can access the file for a simple single selector
		from within 'onChange' for the input.
		This is a MODERN HTML input technique that works locally and
		DOES NOT REQUIRE SERVER-SIDE INTERACTION
	
	{"url":[String to be used as 'src']} (this one may still need to be finished...)
	*/
	this_this = this;
	//since a zero-length frame might be something some format supports at some point,
	//auto detect and set custom delay to true if any delay parameter is set.
	//depending on ===undefined is confusing and might be unreliable
	frameParamz.hasCustomDelay = false;
	for(var key in frameParamz){
		if(key=='delay'){
			frameParamz.hasCustomDelay = true;
		}
	}
	if(frameParamz.image){
		this.addFrameFromImage(frameParamz);
	}else if(frameParamz.file){
		//if input is not from <img>, an image must be generated first.
		
		var fImg = document.createElement('img');
		fImg.file = frameParamz.file;
		var fRead = new FileReader();
		fRead.onload = (function(imagin){return function(e){imagin.src=e.target.result;};})(fImg);
		fRead.readAsDataURL(fImg.file);
		frameParamz.image = fImg;
		fImg.onload = function(imgLoadInput){
			//once src is set, this will load and image will have data
			this_this.addFrameFromImage(frameParamz);
		};
	}else if(frameParamz.url){
		
	}
}
AnimatedEncoder.prototype.addFrameFromImage = function(frameParamz){
	//frames should be added, then processing will be done afterwards.
	this.frames.push(frameParamz);
	//alert('frame added, now there are '+this.frames.length+' f.image: '+frameParamz.image);
	if(this.onFrameAdded){this.onFrameAdded();}
}
AnimatedEncoder.prototype.procFrame = function(){
	var this_this = this;//works around access bugs with 'this'
	var curFrame = this.frames[this.frameBeingProcessed];
	var frameImg = curFrame.image;
	this.encoderCanvas.width = this.width;
	this.encoderCanvas.height = this.height;
	ctx = this.encoderCanvas.getContext('2d');
	ctx.save();//save context state before potentially transforming
	var scX = 1;//scaling
	var scY = 1;
	var trX = 0;//translation vars
	var trY = 0;
	if(this.fitting == 'stretch'){
		scX = this.width/frameImg.naturalWidth;
		scY = this.height/frameImg.naturalHeight;
		ctx.scale(scX,scY);
	}
	if(this.fitting == 'crop'){
		scX = this.width/frameImg.naturalWidth;
		scY = this.height/frameImg.naturalHeight;
		if(scX<scY){
			scX = scY;
			trX = -(frameImg.naturalWidth*scY-this.width)/2;
		}else{
			scY = scX;
			trY = -(frameImg.naturalHeight*scX-this.height)/2;
		}
		ctx.translate(trX,trY);
		ctx.scale(scX,scY);
	}
	if(this.fitting == 'preserve'){//preserves all areas of all images and all aspect ratios of all images.
		scX = this.width/frameImg.naturalWidth;
		scY = this.height/frameImg.naturalHeight;
		if(scX>scY){//currently the same logic as 'crop' completely, except this reversed condition.
			scX = scY;
			trX = -(frameImg.naturalWidth*scY-this.width)/2;
		}else{
			scY = scX;
			trY = -(frameImg.naturalHeight*scX-this.height)/2;
		}
		ctx.translate(trX,trY);
		ctx.scale(scX,scY);
	}
	ctx.drawImage(frameImg,0,0);
	ctx.restore();//return context to default state with no transforms
	//alert('quality: '+this.quality);
	var i;//used in various loops.
	
	//these dimensions may be updated if only  a smaller section of the image has updates on it.
	var frameFinalX = 0;//TODO, scrunch the frame down to only the region that is updated.
	var frameFinalY = 0;
	var frameFinalW = this.width;
	var frameFinalH = this.height;
	//TODO: Frame removal and make previous frame last longer if no changes.
	//for testing of inter-frame and such:
		//if(!this.encoderCanvas.parentNode){document.getElementsByTagName('body')[0].appendChild(this.encoderCanvas);}
	//TODO: Put inter-frame pixel recycling and quantization here.
	if(this.format=='png'||this.format=='gif'){//Inter-frame pixel recycling. Only PNG uses this currently. GIF will.
		var fRGBA = ctx.getImageData(0,0,this.encoderCanvas.width,this.encoderCanvas.height);
		if(this.procFrameStage == 0){//0 for final
		this.buildDithMasks();
		this.quant8Octets(fRGBA.data);
		//Canvas ImageData is in RGBA format(not ARGB).
		if(this.frameBeingProcessed>0){
			for(i=0;i<fRGBA.data.length;i+=4){
				//If the pixel is the same as previous frame, recycle it by drawing nothing over it.
				if(this.animationStyle=='movie'&& 
				   (this.transparencyLocks[i/4]
				    ||
				    (fRGBA.data[i]   == this.pRGBA.data[i]
				  && fRGBA.data[i+1] == this.pRGBA.data[i+1]
				  && fRGBA.data[i+2] == this.pRGBA.data[i+2]
				  && fRGBA.data[i+3] == this.pRGBA.data[i+3] ) )
				   ){
					fRGBA.data[i]   = 0x00;
					fRGBA.data[i+1] = 0x00;
					fRGBA.data[i+2] = 0x00;
					fRGBA.data[i+3] = 0x00;
				}else{//Otherwise, draw it on the previous ImageData to be compared next frame.
					this.pRGBA.data[i]   = fRGBA.data[i];
					this.pRGBA.data[i+1] = fRGBA.data[i+1];
					this.pRGBA.data[i+2] = fRGBA.data[i+2];
					this.pRGBA.data[i+3] = fRGBA.data[i+3];
				}
					/*fRGBA.data[i]   = 0xFF;
					fRGBA.data[i+1] = 0x00;
					fRGBA.data[i+2] = 0xFF;
					fRGBA.data[i+3] = 0x7F;*/
			}
		}else{
			this.transparencyLocks = [];
			for(i=0;i<fRGBA.data.length;i+=4){
				//only lock the pixels in type 'movie' sprite disposes frames and can change transparency
				this.transparencyLocks.push(this.animationStyle=='movie'&&fRGBA.data[i+3]<0xFF);//If any transparency, lock the pixel by setting true.
			}
			this.pRGBA = fRGBA;//If the first frame, just save the state of it for the next frame to compare.
		}
		ctx.putImageData(fRGBA,0,0);
		}else if(this.procFrameStage == 100){//end if final stage
			//====================== if stage 100, color count ======================
			//This will count all of the colors for all frames before processing the frames,
			//so that all frames use the same color frequency data.
			for(i=0;i<fRGBA.data.length;i+=4){
				this.incrementColorCount(fRGBA.data[i], fRGBA.data[i + 1], fRGBA.data[i + 2], fRGBA.data[i + 3]);
			}
			//alert(this.uniqueColors + ' colors');
			this.frameBeingProcessed++;
			if(this.frameBeingProcessed == this.frames.length){
				this.frameBeingProcessed = 0;
				this.procFrameStage = 0;//set stage to 0, final, so that it can draw and encode the image now that it has the color count.
			}
			setTimeout(function(){this_this.procFrame()},50);
			if(this.onProgress){
				this.progress += this.progressPerFrame;
				this.onProgress(this.progress);
			}
			return;//Exit here. This is a pre-processing stage that just counts the colors.
		}
	}
	
	var datB64 = this.encoderCanvas.toDataURL('image/'+this.sourceFormat,parseFloat(this.quality));

	//var datB64 = this.frames[this.frameBeingProcessed];
	//must strip:
	//data:image/png;base64, (22)
	//data:image/gif;base64, (22)
	//data:image/webp;base64, (23)
	var stripB64 = 22;
	if(this.sourceFormat=='webp'){stripB64 = 23;}
	//alert('datB64: '+datB64);
	//alert('stripped: '+datB64.substring(stripB64));
	var raw8 = this.string2uint8(atob(datB64.substring(stripB64)));
	var upd8;
	var frameDelay = this.delay;//delay in milliseconds
	if(curFrame.hasCustomDelay){frameDelay=curFrame.delay;}//use frame-specific delay if set.
	if(this.format == 'png'){//Only allocate this for formats that will use it.
		upd8 = new Uint8Array(new ArrayBuffer(raw8.length*1.05));//add some extra space to hold things like frame sequence count and fcTL chunks. 
	}
	//for(i=0;i<upd8.length;i++){
	//	upd8[i] = 0x50;//fill with 'P' to see if there are errors writing when viewed from text editor.
	//}
	var upd8_pos = 0;//this will keep track of how large
		//the final frame section will be
		//(fcTL chunk, IDAT/fdAT series of IDATs/fdATs)
	//upd8 will hold the updated
	//it must be able to hold extra bytes because fdAT chunks have
	//the FrameSequenceCount added to the front of the data payload
	//alert('dat8 len: '+raw8.length);
	//alert('dat8: '+String.fromCharCode.apply(null,raw8));
	var chunkSig;//aka 'FourCC'
	var chunkLen;
	var seekPos = 0;
	var iData32;//canvas ImageData needed for pixel recycling on PNG/GIF
	if(this.frameBeingProcessed==0){
		if(this.format=='png'){
			
		}
		if(this.format=='webp'){
			
		}
	}
	
	//########################### PNG ########################
	if(this.sourceFormat=='png'){
		//Skip:
		//(1) 0x89
		//(3) PNG
		//(4) CRLF, EOF, UnixLineFeed
		seekPos = 8;
		var endIDAT;
		var startIDAT = 0;//0 evaluates false for not set.
		var is_fdAT = this.payloads.length;//only the first IDAT,
			//or contiguous stream of IDATs will stay IDAT,
			//the rest will be Animated PNG fdAT chunks
		var crc;
		while(seekPos<raw8.length){
			chunkSig = String.fromCharCode.apply(null,raw8.subarray(seekPos+4,seekPos+8));
			chunkLen = raw8[seekPos]*0x1000000+raw8[seekPos+1]*0x10000+raw8[seekPos+2]*0x100+raw8[seekPos+3];//Big Endian
			//alert('chunk: '+chunkSig+' len: '+chunkLen);
			if(chunkSig == 'IDAT'){
				if(!startIDAT //if startIDAT is 0 due to starting at position 0 (first IDAT in sequence of IDATs)
					&& this.frames.length > 1 //At least one frame to be an Animated PNG
					){
					startIDAT=seekPos;
					//fcTL chunk needed for each animation frame
					//only one fcTL, though there maybe multiple contiguous fdAT following.
					this.writeUint32(upd8,26,upd8_pos,false);//length
					this.writeFourCC(upd8,'fcTL',upd8_pos+4);
					this.writeUint32(upd8,this.frameSequenceCount,upd8_pos+8,false);//Number of frames.
					this.writeUint32(upd8,frameFinalW,upd8_pos+12,false);//width
					this.writeUint32(upd8,frameFinalH,upd8_pos+16,false);//height
					this.writeUint32(upd8,frameFinalX,upd8_pos+20,false);//x
					this.writeUint32(upd8,frameFinalY,upd8_pos+24,false);//y
					this.writeUint16(upd8,frameDelay,upd8_pos+28,false);//Numerator (16-bit uint)
					this.writeUint16(upd8,1000,upd8_pos+30,false);//Denominator (16-bit uint)
					if(this.animationStyle=='movie'){
						upd8[upd8_pos+32] = 0x00;//Disposal. 0=none, 1=background, 2=previous
						upd8[upd8_pos+33] = 0x01;//Blending. 0=source, 1 = over
					}else{
						upd8[upd8_pos+32] = 0x01;//Disposal. 0=none, 1=background, 2=previous
						upd8[upd8_pos+33] = 0x00;//Blending. 0=source, 1 = over
					}
					this.writeUint32(upd8,this.getCRC32(upd8,upd8_pos+4,upd8_pos+34),34,false);
					upd8_pos += 38;
					this.frameSequenceCount++;
				}
				//there CAN and WILL be images with multiple IDATs.
				//Combine them together. IDATs must be right after eachother according to the spec.
				//will have to cycle thru, change IDAT to fdAT on frames after the first,
				//and recalculate CRC
				
				//break;
	//			var checkBrowserCRC = 
	//// (raw8[seekPos+chunkLen+8]*0x1000000)//do this by multiplying so that high bit is not interpreted as sign
	////+(
	// (raw8[seekPos+chunkLen+8]<<24)
	//|(raw8[seekPos+chunkLen+8+1]<<16)
	//|(raw8[seekPos+chunkLen+8+2]<<8)
	//| raw8[seekPos+chunkLen+8+3]
	//;//for testing to make sure CRC function is correct
				//alert('the browser CRC is: '+checkBrowserCRC.toString(16));
				//alert('the JS CRC is: '+this.getCRC32(raw8,seekPos+4,seekPos+8+chunkLen).toString(16));
				//CRC is calculated over the FourCC+Data
				var copyEnd;
				var destOffset;
				var sourceOffset;
				if(is_fdAT){
					this.writeUint32(upd8,chunkLen+4,upd8_pos,false);//extra 4 to store frameSeqCount
					this.writeFourCC(upd8,'fdAT',upd8_pos+4);//overwrite 'IDAT' with 'fdAT'
					this.writeUint32(upd8,this.frameSequenceCount,upd8_pos+8,false);//fdAT needs a uint32 to store frameSequenceCount
					copyEnd = 8+chunkLen;
					destOffset = upd8_pos+12;//destination start point.
					sourceOffset = seekPos+8;
					for(i=0;i<copyEnd;i++){//copy everything over starting after length, FourCC, and FrameSequenceCount.
						//Source starts after Length and FourCC.
						upd8[destOffset+i] = raw8[sourceOffset+i];
					}
					//The CRC must be recalculated to cover 'fdAT' and the frame sequence number.
					this.writeUint32(upd8,this.getCRC32(upd8,upd8_pos+4,upd8_pos+8+chunkLen),upd8_pos+12+chunkLen,false);//Must expand range to get the CRC over the FourCC and the extra 4 for the added FrameSequenceCount.
					this.frameSequenceCount++;
					upd8_pos += chunkLen+16;//must be 4 longer here to hold the FrameSequenceCount
				}else{
					copyEnd = 12+chunkLen;
					destOffset = upd8_pos;
					sourceOffset = seekPos;
					for(i=0;i<copyEnd;i++){//copy everything, including length, FourCC, and CRC.
						upd8[destOffset+i] = raw8[sourceOffset+i];
					}
					upd8_pos += chunkLen+12;
				}
			}else{
				//the first non-IDAT chunk after IDATs start appearing
				//will be the end of the contiguous stream of IDATs
				if(startIDAT){endIDAT=seekPos;}
			}
			seekPos += chunkLen+12;//skip length, FourCC, and CRC
		}
		//if(is_fdAT){
			//fdAT frames after the first must be altered to have fdAT instead of IDAT,
			//and include the fcTL and a sequence number starting in the data on each fdAT
			this.payloads.push(upd8.subarray(0,upd8_pos));

		//}else{
		//	this.payloads.push(raw8.subarray(startIDAT,endIDAT));
		//	alert('adding payload from '+startIDAT+' to '+endIDAT);
		//	//include FourCC and length itself (8)
		//}
		//alert('adding payload from '+startIDAT+' to '+endIDAT);
		//alert('end of png chunks');
	}//====================END PNG============================
	//########################### WEBP #######################
	if(this.sourceFormat=='webp'){
		//alert('...wat');
		seekPos = 12;
		//raw8 = fDat8.subarray(12);//skip RIFF<uint32>WEBP
			//note that WEBP ASCII signature has no length after it, the length before it is for the whole file(except RIFF<uint32>).
		//alert('...');
		while(seekPos<raw8.length){
			//Find and extract the VPX data stream
			//it will start with a signature like 'VP8 ', 'VP8L'
			chunkSig = String.fromCharCode.apply(null,raw8.subarray(seekPos+0,seekPos+4));
			chunkLen = raw8[seekPos+7]*0x1000000+raw8[seekPos+6]*0x10000+raw8[seekPos+5]*0x100+raw8[seekPos+4];//Little Endian
		
			//alert('chunk: '+chunkSig+' len: '+chunkLen);
			if(chunkSig.match(/^VP[0-9]+/)){
				this.payloads.push(raw8.subarray(seekPos,seekPos+chunkLen+8));//include FourCC and length itself (8)
				//alert('adding '+(chunkLen+8)+'-byte payload');
				break;
			}
			seekPos+=chunkLen+8;
		}
	}//=================END WEBP===================
	//################## GIF ######################
	if(this.sourceFormat=='gif'){
		//NOTE: toDataURL('image/gif') is currently ONLY supported in Safari,
			//so not much point to this yet.
		//skip:
		//GIF89a (6bytes)
		//Logical Screen Descriptor (7)
		//Global Color Table (768)
		while(seekPos<raw8.length){
			seekPos += 1000;
		}
	}
	
	this.frameBeingProcessed++;
	//alert(this.sourceFormat+' bitstream packed for frame '+this.frameBeingProcessed+' of '+this.frames.length);
	if(this.onProgress){
		//allow devs to create a progress bar to show the image is being built
		//by setting up this function which accepts a float of 0.0-1.0
		//half of the progress will be tracked in writing the octet stream,
		//the other half here, building payloads.
		this.progress += this.progressPerFrame;
		this.onProgress(this.progress);
	}
	if(this.frameBeingProcessed<this.frames.length){
		//put a delay between each frame because image encoding
		//can be very resource hungry, even with the browsers
		//native or even hardware-accelerated encoding.
		setTimeout(function(){this_this.procFrame()},100);
	}else{//all frame bitstreams encoded and ready to be packed into file.
		setTimeout(function(){this_this.packAnimatedFile()},100);
	}
};
AnimatedEncoder.prototype.saveAnimatedFile = function(){
	if(this.onProgress){this.onProgress(0);}
	this.outputString = '';//intermediate state before base64 conversion can be done.
	this.payloads = [];
	this.frameBeingProcessed = 0;

	this.sourceFormat = this.format;//in most cases these are the same.
	if(this.format == 'webm'){
		this.sourceFormat = 'webp';
	}
	if(this.format == 'png'){
		this.frameSequenceCount = 0;//Animated PNG needs this.
	}
	
	//===============Auto-Detect Image Size====================
	
	//autoDimensionsInternal will make the image size auto-calculated to hold all frames if .autoDimensions says that is desired,
	//or if an invalid width/height for image size is detected.
	this.autoDimensionsInternal = this.autoDimensions;//automatic dimensions
		//automatically turn this on if no width/height set.
		//it can be overridden with a paramz variable.
		//(though that may be a bad idea because defaults to 1x1,
		//allowing expansion when autoDim is true.)
	
	//TODO: maybe a reverse mode where it uses MINIMUM sizes?
	if(this.autoDimensionsInternal){//autoDim will need to expand to fit all images.
		//alert('autoDim updated from '+this.width+'x'+this.height+' ...');
		for(var f=0;f<this.frames.length;f++){
		//.naturalWidth/Height must be used to get the actual image size, NOT an html or styling that may be undefined.
			this.width  = Math.max(this.frames[f].image.naturalWidth,this.width);
			this.height = Math.max(this.frames[f].image.naturalHeight,this.height);
			
			//alert('...to '+this.width+'x'+this.height);
		}
	}
	
	//Note that webp will process through as a an Animated WEBP would even if it just has one frame
	//there are additional features that may be added later that will need this extracting and rebuilding process:
	//Insert EXIF or XMP Metadata,
	//or if toDataURL ever supports webp lossless,
	//possibly do quantization and dithering.
	
	this.progress = 0;
	this.procFrameStage = 0;//0 for final(there can be other stages like 100 for color counting.)
	this.progressPerFrame = 0.5 / this.frames.length;
	
	//initialize things that some formats need.
	if(this.format == 'png'){
		//The percentage of total pixels in the image this color represents will be tied to the quality level, for example:
		//quality level 0, the color must represent 1 in 1000 (0.1%) pixels for the quantization to be skipped on it.
		//quality level 0.90, the color must represent 1 in 10000 (0.01%) pixels
		//quality level 0.75, the color must represent 1 in 4000 (0.025%) pixels
		//quality level 0.5, the color must represent 1 in 2000 (0.05%) pixels
		//quality level 0.25, the color must represent 1 in 1333 (0.075%) pixels
		//quality level 1, the threshold to quantize would be 0, and never reached, but quantization is skipped for full quality anyways.
		this.quantThresh = this.width * this.height * this.frames.length * 0.001 * (1 - this.quality);
		this.initColorCounting();
		if(this.quality < 1){
			this.procFrameStage = 100;//100 for color counting
			this.progressPerFrame /= 2;//it will have twice as many, because it now has two stages of processing.
		}
	}
	this.procFrame();//begin the save process.
}

AnimatedEncoder.prototype.packAnimatedFile = function(){
	var outputLen = 0;
	var out8;
	var i;
	var chunkSig;
	var numVal;
	var writePos = 0;
	var payload;
	var p;
	var frameDelay;//if frame delay logic is being done here rather than elsewhere
	//(NOTE: webp/webm may need logic to swap out VP8 for VP9/VP10, etc
	//if it is detected that through a browser update, this has become
	//the output of Canvas.toDataURL('webp'))
	//===============================WEBP==================================
	if(this.format == 'webp'){
		outputLen += 12;//RIFF,uint32,WEBP
		outputLen += 18;//VP8X extension chunk needed for animation
		if(this.frames.length > 1){//If Animated WEBP, not just one frame.
			outputLen += 14;//ANIM global animation parameters needed
		}
		
		//for(i=0;i<1;i++){
		for(i=0;i<this.payloads.length;i++){
			if(this.frames.length > 1){//If Animated WEBP, not just one frame.
				outputLen += 24;//ANMF chunk needed for each frame
			}
			outputLen += this.payloads[i].length;
			//alert('payload['+i+'] has: '+this.payloads[i].length);
		}
		//alert('creating target octet with size: '+outputLen);
		out8 = new Uint8Array(new ArrayBuffer(outputLen));
		
		this.writeFourCC(out8,'RIFF',0);
		this.writeUint32(out8,outputLen-8,4,true);
		this.writeFourCC(out8,'WEBP',8);
		
		this.writeFourCC(out8,'VP8X',12);
		this.writeUint32(out8,10,16,true);//length of contents (not including VP8X & length)
		//out8[20] = 0x00;//testing VP8X without animation
		if(this.frames.length > 1){//If Animated WEBP
			out8[20] = 0x02;//packed field, just set animation bit on, alpha bit is hint only and alpha not currently working in canvas.toDataURL('image/webp') as of early 2016 anyways
		}else{//if single frame WEBP
			out8[20] = 0x00;
		}
		this.writeUint24(out8,0,21,true);//reserved bits that should be 0
		this.writeUint24(out8,this.width-1,24,true);//width-1
		this.writeUint24(out8,this.height-1,27,true);//height-1
		writePos += 30;
		
		if(this.frames.length > 1){//A single frame WEBP with animation chunks could cause breakage and the chunks are not needed in that case
			this.writeFourCC(out8, 'ANIM', writePos + 0);
			this.writeUint32(out8, 6, writePos + 4, true);//length of contents (not including ANIM & length)
			this.writeUint32(out8, 0x00000000, writePos + 8, true);//BGColor RGBA, just setting to 0x00000000, the viewer can and does seem to ignore this.
			out8[writePos + 12] = 0;//16-bit loop count, leave 0 for infinite.
			out8[writePos + 13] = 0;
			writePos += 14;
		}
		//writePos = 30;
		//writePos = 12;
		//for(i=0;i<1;i++){//testing with a simple WEBP
		for(i=0;i<this.payloads.length;i++){
			payload = this.payloads[i];
			if(this.frames.length > 1){//A single frame WEBP with animation chunks could cause breakage and the chunks are not needed in that case
				this.writeFourCC(out8,'ANMF',writePos);
				this.writeUint32(out8,16+payload.length,writePos+4,true);//length of ANMF (which INCLUDES a VP8/VP8L chunk at the end of it contained within the ANMF)
				this.writeUint24(out8,0,writePos+8,true);//x
				this.writeUint24(out8,0,writePos+11,true);//y
				this.writeUint24(out8,this.width-1,writePos+14,true);//width-1
				this.writeUint24(out8,this.height-1,writePos+17,true);//height-1
				frameDelay = this.delay;//delay in milliseconds
				if(this.frames[i].hasCustomDelay){frameDelay=this.frames[i].delay;}//use frame-specific delay if set.
				this.writeUint24(out8,frameDelay,writePos+20,true);//duration (milliseconds)
				out8[writePos+23]= 0x00;//1 byte here can be skipped (left all 0)
					//6 reserved bits and alphablend/dispose which are not usable with the only option of full frame updates (no way of giving frame back references in toDataURL)
				writePos += 24;
			}//end if has multiple frames(is Animated WEBP)
			for(p=0;p<payload.length;p++){
				out8[writePos+p] = payload[p];
			}
			writePos += payload.length;
		}
		
	}//============================== END WEBP ==============================
	//=============================== WEBP ==================================
	if(this.format == 'webm'){
		/*
(EMBL is Big Endian)
opt = optional
mnd = mandatory
a length byte of all 1's (11111111) means it is a list of EBML sub elements.
There is no end marker. it ends based on the ID of a property when
a property is encountered that is not a defined sub-element of that parent entry
This must be guessed based on the doctype's definition of IDs
EMBL Header(Lv 0, multi, total: 11 bytes)
ID = 0x1A45DFA3
			//Should inherit mandatory properties
			//from the Matroska Spec.
			//and override some things that WEBM changes
			{4} 
			                 |ID        |Length   |Payload
  EBMLVer.     {4} (0x4286,    0x81,     0x01)
  EBMLReadVer. {4} (0x42F7,    0x81,     0x01)
  MaxIDLen.    {4} (0x42F2,    0x81,     0x04)
  MaxSizeLen.  {4} (0x42F3,    0x81,     0x08)
  DocType      {7} (0x4282,    0x84,     'webm')
  DocTypeVer.  {4} (0x4287,    0x81,     0x02) (look into this not sure)
  DocT.ReadVer.{4} (0x4285,    0x81,     0x02)
Segment(Lv 0, multi) (All top-level fields, the whole rest of the file)
ID=0x18538067
  Info(Lv 1, multi)
  ID=0x1549A966
    Title <opt,UTF-8>      {0x7BA9, }
    DateUTC <opt,UTF-8>      {0x7BA9, }
    TimecodeScale <uint>    {0x2AD7B1, 0x83, 0x0F4240}
		time measuring unit. 1,000,000 means milliseconds
    Duration <float>        {}
    MuxingApp <mnd,UTF-8>       {0x4D80, 0x9C, 'Deckromancy Animated Encoder'}
    WritingApp <mnd,UTF-8>      {0x5741, 0x9C, 'Deckromancy Animated Encoder'}
                                      x-- 1001_1100 (first bit is expansion indicator)
  Tracks(Lv 1, multi)
  ID=0x1654AE6B
    Track Entry(Lv 2, multi)
    ID=0xAE
       TrackNumber <mnd,uint>   {0xD7, 0x8?, 'Deckromancy Animated Encoder'}
       CodecID      {4} (0x86,      0x85,     'V_VP8' or 'V_VP9')
       (No CodecPrivate data for VP 8/9)
       CodecName    {4} (0x86,      0x83,     'VP8' or 'VP9')(not sure if needed?)
			{}
			{7} Doctype, [2] ID = 0x4282,
					[1] byte length = 0x84 = 10000100, meaning 4
						(first bit defines 1 byte length size)
						(In Unicode fashion, each leading 0 adds an expansion byte)
					[4] Payload = 'webm'
			{} DoctypeReadVersion, [2] ID = 0x4285
						[1] length = 0x81, meaning 1
						[1] Payload = 0x02
		*/
		outputLen = 4;
	}//============================== END WEBM ==============================

	if(this.format == 'png'){
		var crc32;
		outputLen += 8;//Header is& MagicNumber
		outputLen += 25;//IHDR (whole chunks include length,sig,data,CRC)
		if(this.frames.length > 1){//Must have 2+ frames to be Animated PNG (Check frames not payloads, payloads do not get built until after this.)
			//do not output Animated PNG chunks if not needed.
			//there are a few websites or software that
			//might reject these chunks as unknown chunks and exit,
			//even though custom chunks are allowed and
			//the spec says just to ignore them not to fail.
			outputLen += 20;//acTL
		}
		for(i=0;i<this.payloads.length;i++){
			outputLen += this.payloads[i].length;
			//alert('payload['+i+'] has: '+this.payloads[i].length);
		}
		outputLen += 12;//IEND (empty chunk);
		if(this.ppi || this.ppm){//pHYs is optional
			outputLen += 21;//pHYs
		}
		//The length has been calculated. Now allocate the space and write it.
		out8 = new Uint8Array(new ArrayBuffer(outputLen));
		//for(i=0;i<out8.length;i++){
		//	out8[i] = 0x50;//fill with 'P' to see if there are errors writing when viewed from text editor.
		//}
		//PNG always starts with a series of set codes
		out8[0] = 0x89;//set high bit, to not be interpreted as text, 10001001
		out8[1] = 0x50;//P
		out8[2] = 0x4E;//N
		out8[3] = 0x47;//G
		out8[4] = 0x0D;//CR
		out8[5] = 0x0A;//LF
		out8[6] = 0x1A;//End of File
		out8[7] = 0x0A;//Unix LF
		//IHDR Header Chunk
		this.writeUint32(out8,13,8,false);//IHDR length (Counts data only, not FourCC or CRC)
		this.writeFourCC(out8,'IHDR',12);
		this.writeUint32(out8,this.width,16,false);//width
		this.writeUint32(out8,this.height,20,false);//height
		out8[24] = 0x08;//bit depth, 8 bits per color channel.
		out8[25] = 0x06;//Packed field. Truecolor and alpha bits set, 00000110
		out8[26] = 0x00;//Compression Mode, 0=DEFLATE, the only defined type
		out8[27] = 0x00;//Filter Mode, 0=Adaptive, the only defined type
		out8[28] = 0x00;//Interlace Method, 0=No interlacing.
		crc32 = this.getCRC32(out8,12,29);
		this.writeUint32(out8,crc32,29,false);//CRC calculated over Data AND FourCC.
		
		writePos += 33;
		
		//optional pHYs, if ppi or ppm is specified 
		//1 inch is 0.0254 metres. The X/Y in pHYs is metre-based. ('meter' in the US)
		//X and Y could potentially be different for 'non-square' pixels, but that is an odd case, so not currently supporting.
		if(this.ppi || this.ppm){
			var ppm;
			if(this.ppm){
				ppm = this.ppm;
			}else{
				var inch2Meter = 1 / 0.0254
				ppm = this.ppi * inch2Meter;
			}
			this.writeUint32(out8, 9, writePos,false);
			this.writeFourCC(out8, 'pHYs', writePos + 4);
			this.writeUint32(out8, ppm, writePos + 8, false);//X pixels per unit
			this.writeUint32(out8, ppm, writePos + 12, false);//Y pixels per unit
			out8[writePos + 16] = 0x01;//Unit type 1 for meter, 0 for unknown.
			this.writeUint32(out8, this.getCRC32(out8, writePos + 4, writePos + 17), writePos + 17,false);
			writePos += 21;
		}//end if has pHYs
		
		if(this.payloads.length > 1){//At least one frame to be an Animated PNG
			//do not output Animated PNG chunks if not needed.
			//writePos = 33;//would be 33 with no acTL
			this.writeUint32(out8, 8, writePos, false);
			this.writeFourCC(out8, 'acTL', writePos + 4);
			this.writeUint32(out8, this.payloads.length, writePos + 8, false);//Number of frames.
			this.writeUint32(out8, 0, writePos + 12, false);//Loops. 0 for infinite.
			this.writeUint32(out8, this.getCRC32(out8, writePos + 4, writePos + 16), writePos + 16, false);
		
			writePos += 20;
		}//end is more than one frame
		
		//Write each payload that was generated
		for(i=0;i<this.payloads.length;i++){
			payload = this.payloads[i];
			for(p=0;p<payload.length;p++){
				out8[writePos+p] = payload[p];
			}
			writePos += payload.length;
		}
		
		//now close the image with the IEND chunk.
		this.writeUint32(out8, 0, writePos, false);//IEND is empty
		this.writeFourCC(out8, 'IEND', writePos + 4);
		crc32 = this.getCRC32(out8, writePos + 4, writePos + 8);
		this.writeUint32(out8, crc32, writePos + 8, false);
	}
	//alert('before outputOctetStream set');
	this.outputOctetStream = out8;
	
	//alert('after outputOctetStream set: '+this.outputOctetStream.length);
	this.chunkPackI = 0;
	this.packChunk();
	
	//alert('outputOctetStream: '+String.fromCharCode.apply(null,out8));
	
}
AnimatedEncoder.prototype.packChunk = function(){
	//alert('pack: len: '+this.outputOctetStream.length);
	if(this.chunkPackI<this.outputOctetStream.length){
		this.outputString += String.fromCharCode.apply(null,this.outputOctetStream.subarray(this.chunkPackI,Math.min(this.outputOctetStream.length,this.chunkPackI+2048)));
		this.chunkPackI += 2048;
		var this_this = this;//needed to stop breakage.
		setTimeout(function(){this_this.packChunk()},5);//must wrap function this way or it will break variables
		if(this.onProgress){
			//allow devs to create a progress bar to show the image is being built
			//by setting up this function which accepts a float of 0.0-1.0
			//half of the progress will be tracked in building payloads,
			//the other half here, writing the octet stream.
			this.onProgress(0.5+0.5*Math.min(this.chunkPackI/this.outputOctetStream.length,1));
		}
	}else{
		//the base 64 conversion sometimes creating Maximum call stack size exceeded
		//breaking it up so that conversion of each frame is done asynchronously
		//when selected may help so not too much is done in one call
		//it seems to be related to too huge of a value sent to String.fromCharCode.
		this.outputBase64 = 'data:image/'+this.format+';base64,'+btoa(this.outputString);
		//alert('done packing b64: '+this.outputBase64.length);
		if(this.onEncoded){
			//alert('onencoded go');
			this.onEncoded(this);
		}
	}
}
AnimatedEncoder.prototype.string2uint8 = function(str){
	var u8 = new Uint8Array(new ArrayBuffer(str.length));
	for(var i=0;i<str.length;i++){
		u8[i] = str.charCodeAt(i);
	}
	return u8;
};
AnimatedEncoder.prototype.writeFourCC = function(out8,chunkSig,pos){
	out8[pos+0] = chunkSig.charCodeAt(0);
	out8[pos+1] = chunkSig.charCodeAt(1);
	out8[pos+2] = chunkSig.charCodeAt(2);
	out8[pos+3] = chunkSig.charCodeAt(3);
}
AnimatedEncoder.prototype.writeUint32 = function(out8,u32,pos,isLittleEndian){
	if(isLittleEndian){
		out8[pos+0] = u32&0xFF;
		out8[pos+1] = u32>>8&0xFF;
		out8[pos+2] = u32>>16&0xFF;
		out8[pos+3] = u32>>24&0xFF;
	}else{
		out8[pos+0] = u32>>24&0xFF;
		out8[pos+1] = u32>>16&0xFF;
		out8[pos+2] = u32>>8&0xFF;
		out8[pos+3] = u32&0xFF;
	}
}
AnimatedEncoder.prototype.writeUint24 = function(out8,u24,pos,isLittleEndian){
	if(isLittleEndian){
		out8[pos+0] = u24&0xFF;
		out8[pos+1] = u24>>8&0xFF;
		out8[pos+2] = u24>>16&0xFF;
	}else{
		out8[pos+0] = u24>>16&0xFF;
		out8[pos+1] = u24>>8&0xFF;
		out8[pos+2] = u24&0xFF;
	}
}
AnimatedEncoder.prototype.writeUint16 = function(out8,u16,pos,isLittleEndian){
	if(isLittleEndian){
		out8[pos+0] = u16&0xFF;
		out8[pos+1] = u16>>8&0xFF;
	}else{
		out8[pos+0] = u16>>8&0xFF;
		out8[pos+1] = u16&0xFF;
	}
}
AnimatedEncoder.prototype.int2uint = function(theNumber){
	//Javascript converts numbers to signed int 32 when doing bitwise ops.
	//cut off the last bit that it is using as a sign, and add
	//it to a number with just that high bit set.
	//this will turn it into what the uint32 would be.
	//(although it may still be internally stored by javascript as signed with the bits expanded.)
	//TODO: check into this. 2's complement negatives are supposed to be based on
	//inverted bits, so not sure why this seems to work.
	if(theNumber<0){
		theNumber &= 0x7FFFFFFF;
		theNumber += 0x80000000;
	}
	return theNumber;
}
AnimatedEncoder.prototype.initCRCTable = function(){
	this.crcTable = new Uint32Array(256);//this broke when using ArrayBuffer(256), not sure why
	var calc;
	var i;
	var i2;
	//var testStr = '';
	for(i=0x00000000;i<256;i++){
		calc = i;
		for(i2=0;i2<8;i2++){
			if(calc&1){
				calc = ((0xEDB88320) ^ (calc >>> 1));
			}else{
				calc = (calc >>> 1);
			}
		}
		//calc = this.int2uint(calc);
		this.crcTable[i] = calc;
		//testStr += '\r\n'+calc.toString(16);
	}
	//alert('table at 127: '+this.crcTable[127]);
	//alert('crcTable: '+testStr);
	//alert((0x80000F00 ^ 0x00000E00).toString(16)+', u: '+this.int2uint(0x80000F00 ^ 0x00000E00).toString(16));
}
AnimatedEncoder.prototype.getCRC32 = function(u8,startIndex,endIndex){
	//if the CRC table has not been initialized, set it up.
	if(!this.crcTable){
		this.initCRCTable();
	}
	var i;
	var crc = 0xFFFFFFFF;
	var cIndex;
	//Note that endIndex is actually 1 greater than the last
	//index read (like array loop length logic)
	for(i=startIndex;i<endIndex;i++){
		cIndex = ((crc^(u8[i]))&(0xFF));
		crc = this.crcTable[cIndex] ^ (crc>>>8) ;
	}
	//Note that Javascript converts numbers to SIGNED 32 bit ints before
	//doing most bitwise operations.
	//It is still doing the exact same thing in most cases when it comes to
	//manipulating bits, it is just the interpretation of the number
	//that changes (an exception is sign-propogating >> done on a negative)
	//(two's complement would be padded with 1's to the left after shift)
	//(whether signed or unsigned it is still a row of 32 bits)
	return crc ^ 0xFFFFFFFF;
}
AnimatedEncoder.prototype.buildDithMasks = function(){
	var maskSize = this.width*this.height*4;
	if(this.width==this.ditherWidth&&this.height==this.ditherHeight){return;}//do not need to remake it if it was already done on the same dimensions
	this.ditherWidth = this.width;//must check these rather than maskSize because 10x20 or 20x10 could be the same maskSize
	this.ditherHeight = this.height;
	this.ditherMaskSize = maskSize;
	this.dithMaskHalf = [];//new Uint8Array(new ArrayBuffer(maskSize));
	this.dithMaskFourth = [];//new Uint8Array(new ArrayBuffer(maskSize));
	//just storing them as bools should be better.
	var dHalf = true;
	//var dFourth;
	var d = 0;
	var evenW = this.width%2==0;
	//var wFourthAdj = 0;
	for(var h=0;h<this.height;h++){
		for(var w=0;w<this.width;w++){
			//dFourth = h%2==(wFourthAdj+w)%2;
			
			//this.dithMaskHalf[d] = dHalf;
			//for(var c=0;c<4;c++){
			//stagger the channels. this should make artifacting less noticeable.
			this.dithMaskHalf[d]   =  dHalf;
			this.dithMaskHalf[d+1] = !dHalf;
			this.dithMaskHalf[d+2] =  dHalf;
			this.dithMaskHalf[d+3] = !dHalf;
			this.dithMaskFourth[d]   = (((h+3)%4==2&&(w  )%4==0) || ((h+3)%4==0&&(w  )%4==2));//dFourth;
			this.dithMaskFourth[d+1] = (((h+2)%4==2&&(w+1)%4==0) || ((h+2)%4==0&&(w+1)%4==2));//dFourth;
			this.dithMaskFourth[d+2] = (((h+1)%4==2&&(w+2)%4==0) || ((h+1)%4==0&&(w+2)%4==2));//dFourth;
			this.dithMaskFourth[d+3] = (((h  )%4==2&&(w+3)%4==0) || ((h  )%4==0&&(w+3)%4==2));//dFourth;
			d+=4;
			dHalf = !dHalf;
		}
		//wFourthAdj++;
		if(evenW){
			dHalf = !dHalf;//toggle it on each new scanline to make checkers.
		}
	}
}
AnimatedEncoder.prototype.quant8Octets = function(octets){
		var quant8 = 0;//full quality. no quantization or dithering.
		if(this.quality<1){
			quant8 = 1;//Not usually much savings, but hard to tell the difference from the full quality.
		}
		if(this.quality<0.9){
			quant8 = 2;//Starts saving a good portion usually, and still can be fairly hard to tell from full quality.
		}
		if(this.quality<0.8){
			quant8 = 3;//This level has allot of savings and the artifacting can be noticed but is not too bad.
			//This is ideal in many cases. It sometimes even cuts the size in half without much noticeable difference.
		}
		if(this.quality<0.7){
			quant8 = 4;//This can save allot of extra file size, the but artifacts really start showing up here.
		}
		if(this.quality<0.5){
			quant8 = 5;//The dither artifacting becomes very noticeable here, but it still looks OK in some cases.
				//The size savings are quite good.
		}
		if(this.quality<0.3){
			quant8 = 6;//Starts too look quite blocky. It has a color-banding effect even with help from dithering.
			//The size savings are very strong, but the quality is becoming weak at this point.
		}
		if(this.quality<0.1){
			quant8 = 7;//Even smaller size and less quality. Heavy artifacting and color banding.
		}
		if(this.quality<=0){
			quant8 = 8;//Saves more size, but the artifacting and color banding are extreme.
		}
		if(!quant8){return;}//no need to do anything if leaving fully lossless.
		
		
		//quant level 5 and below start getting really ugly fast, so there are bigger ranges there.
		//There are only 8 bits so only full quality and 8 levels of quantization possible with this,
		//so 0-8 is guessed based on the 0.0-1.0 quality number.
		var QUANT_INC = new Uint16Array(9);
		var QUANT_MASK = new Uint8Array(9);
		QUANT_INC[0] = 0x01;//00000001 not quantized(ultimately best quality over all with no savings from quantization)
		QUANT_INC[1] = 0x02;//00000010 best quality quantized
		QUANT_INC[2] = 0x04;//00000100
		QUANT_INC[3] = 0x08;//00001000
		QUANT_INC[4] = 0x10;//00010000
		QUANT_INC[5] = 0x20;//00100000
		QUANT_INC[6] = 0x40;//01000000
		QUANT_INC[7] = 0x80;//10000000
		QUANT_INC[8] =0x100;//00000001 00000000
				//remember if the channel hits 256 when adding the increment,
				//set the channel to 0xFF
				//if just doing &0xFF mask on 0x100, it will get 0!
				
		QUANT_MASK[0] = 0xFF;//11111111
		QUANT_MASK[1] = 0xFE;//11111110
		QUANT_MASK[2] = 0xFC;//11111100
		QUANT_MASK[3] = 0xF8;//11111000
		QUANT_MASK[4] = 0xF0;//11110000
		QUANT_MASK[5] = 0xE0;//11100000
		QUANT_MASK[6] = 0xC0;//11000000
		QUANT_MASK[7] = 0x80;//10000000
		QUANT_MASK[8] = 0x00;//00000000
	var oBits;
	var quantizePixel;
	for(var i=0;i<octets.length;i++){
		if(i%4 == 0){
			quantizePixel = this.getColorCount(octets[i], octets[i + 1], octets[i + 2], octets[i + 3]) < this.quantThresh;
		}
		if(quantizePixel){
			oBits = octets[i];
			var incrementDif = oBits%QUANT_INC[quant8];
			var nChange = incrementDif/QUANT_INC[quant8];
			var roundUp;
			if(nChange>0.375&&nChange<0.625){//value about in the middle
				roundUp = this.dithMaskHalf[i];//?Math.floor(nVal):Math.ceil(nVal);//checkered even split
				//dithOrg[0][dithClr][dithI]? -- old code, maybe expiriment before dropping patterned dith at one point?
			}else if(nChange>0.125&&nChange<=0.375){//value relatively close to lower number
				roundUp = this.dithMaskFourth[i];//return dithAltB?Math.ceil(nVal):Math.floor(nVal);//sparse ceiling
			}else if(nChange>=0.625&&nChange<0.875){//value relatively close to upper number
				roundUp = !this.dithMaskFourth[i];//return dithAltB?Math.floor(nVal):Math.ceil(nVal);//sparse floor
			}else{
				roundUp = Math.round(nChange);
			}
			
			oBits &= QUANT_MASK[quant8];
			if(roundUp){oBits+=QUANT_INC[quant8];}
			if(oBits>0xFF){oBits=0xFF;} 
			octets[i] = oBits;
		}//end if quantize this pixel
	}
}


AnimatedEncoder.prototype.initColorCounting = function(){
	this.colorRangeByAlpha = [];
	for(var i = 0;i < 256;i++){//create an array for each potential level of opacity.
		this.colorRangeByAlpha.push([]);
	}
	//having one array indexed by argb or rgba would be a problem since 32 bit numbers in javascript are signed.
	this.uniqueColors = 0;
}
AnimatedEncoder.prototype.incrementColorCount = function(red, green, blue, alpha){
	var rgb = red << 16 | green << 8 | blue;
	if(this.colorRangeByAlpha[alpha][rgb]){
		this.colorRangeByAlpha[alpha][rgb]++;
	}else{
		this.colorRangeByAlpha[alpha][rgb] = 1;
		this.uniqueColors++;
	}
}
AnimatedEncoder.prototype.getColorCount = function(red, green, blue, alpha){
	var rgb = red << 16 | green << 8 | blue;
	if(this.colorRangeByAlpha[alpha][rgb]){//Remember, undefined will evaluate as false.
		return this.colorRangeByAlpha[alpha][rgb];
	}else{
		return 0;
	}
}
