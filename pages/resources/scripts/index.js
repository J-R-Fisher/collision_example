class EventEmitter {
    constructor() {//constructor method is executed when a new instance of the class is made
      this.listeners = {};
    }
  
    on(message, listener) {
      if (!this.listeners[message]) {
        this.listeners[message] = [];
      }
      this.listeners[message].push(listener);
    }
  
    emit(message, payload = null) {
      if (this.listeners[message]) {
        this.listeners[message].forEach((l) => l(message, payload));
      }
    }
}
const Messages = {
    MOVE_LEFT: 'MOVE_LEFT',
    MOVE_RIGHT: 'MOVE_RIGHT',
    MOVE_UP: 'MOVE_UP',
    MOVE_DOWN: 'MOVE_DOWN',
}; const eventEmitter = new EventEmitter();
const imageUrls = [ //once all of these are loaded, the main loop starts
    "./resources/images/kevin.png",
    "./resources/images/klara.png"
];
const loadImage = (src) => //promise for each individual image from imageURLs
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
});
class Sprite {//centralizing information for context.drawImage() method
    constructor(src, sX, sY, sWidth, sHeight){
        this.src = src;
        this.sX = sX;
        this.sY = sY;
        this.sWidth = sWidth;
        this.sHeight = sHeight;
    }
    *[Symbol.iterator](){//custom iterator for easier access to sprite properties
        yield this.src;
        yield this.sX;
        yield this.sY;
        yield this.sWidth;
        yield this.sHeight;
    }
}
class gameObject {
    constructor(display, sprite, x, y){
        this.display = display;
        this.sprite = sprite;
        this.x = x;
        this.y = y;
    }
    *[Symbol.iterator](){
        yield this.sprite.src;
        yield this.sprite.sX;
        yield this.sprite.sY;
        yield this.sprite.sWidth;
        yield this.sprite.sHeight;
        yield this.x;
        yield this.y;
        yield this.sprite.sWidth;
        yield this.sprite.sHeight;
    }
}
class player extends gameObject {
    constructor(display, sprite, x, y){
        super(display, sprite, x, y);
        eventEmitter.on(Messages.MOVE_LEFT, ()=>{
            this.x = this.x - 1;
        });
        eventEmitter.on(Messages.MOVE_RIGHT, ()=>{
            this.x = this.x + 1;
        });
        eventEmitter.on(Messages.MOVE_UP, ()=>{
            this.y = this.y - 1;
        });
        eventEmitter.on(Messages.MOVE_DOWN, ()=>{
            this.y = this.y + 1;
        });
    }
}
document.addEventListener('DOMContentLoaded', event => {
    const canvas = document.getElementById('gamePanel');
    const context = canvas.getContext('2d');
    const sources = [];
    var keyDown = [];

    document.addEventListener('keydown', event => {
        if(!keyDown.includes(event.key)){
            keyDown.push(event.key);
        }
    });
    document.addEventListener('keyup', event => {
        keyDown.splice(keyDown.indexOf(event.key), 1);
    });
    function handleInput(keyDown){
        if(keyDown.includes('ArrowLeft')){
            eventEmitter.emit(Messages.MOVE_LEFT);
        }
        if(keyDown.includes('ArrowRight')){
            eventEmitter.emit(Messages.MOVE_RIGHT);
        }
        if(keyDown.includes('ArrowUp')){
            eventEmitter.emit(Messages.MOVE_UP);
        }
        if(keyDown.includes('ArrowDown')){
            eventEmitter.emit(Messages.MOVE_DOWN);
        }
    }
    function collisionCheck(object1, object2){
        //offsets change the size of the area being tested for collision
        var offsetXone = -50;
        var offsetYone = -25;

        var offsetXtwo = 0;
        var offsetYtwo = 0;

        //modified values for the width and height of the collision area
        var modWidthone = object1.sprite.sWidth + offsetXone;
        var modWidthtwo = object2.sprite.sWidth + offsetXtwo;

        var modHeightone = object1.sprite.sHeight + offsetYone;
        var modHeighttwo = object2.sprite.sHeight + offsetYtwo;

        if(//checking each corner of the collision areas for a match
            object1.x < object2.x + modWidthtwo &&
            object1.x + modWidthone > object2.x &&
            object1.y < object2.y + modHeighttwo &&
            object1.y + modHeightone > object2.y
        ){
            return true; 
        } else {
            return false;
        }
    }
    Promise.all(imageUrls.map(loadImage)).then(images => { //once all images are loaded, add them to the available sources array
        images.forEach(function(img){
            sources.push(new Sprite(img, 0, 0, img.width, img.height));
        });//beginning of game loop

        var kevin = new player(true, sources[0], 0, 0);
        var klara = new gameObject(true, sources[1], 280, 300);

        function animate(){
            context.clearRect(0, 0, canvas.width, canvas.height);
            handleInput(keyDown);
            if(collisionCheck(kevin, klara)){//If objects collide, game ends and resets
                window.alert('YOU GOT KEVIN BACK TO HIS LOVE! CONGRATULATIONS!');
                kevin.x = 0;
                kevin.y = 0;
                keyDown = [];
            }
            
            context.drawImage(...kevin);
            context.drawImage(...klara);

            requestAnimationFrame(animate);
        } animate();
    });//end of image load promise
});//end of document event listener