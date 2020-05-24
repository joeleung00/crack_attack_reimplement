export var UserInput = {
    listenInput: function(eventhandler){
        //set eventhandler
        this.eventhandler = eventhandler
        this.move = false;
        window.addEventListener('keydown', function (e){
            var move;
            switch (e.keyCode) {
                case 37:
                    move = "left";
                    break;
                case 38:
                    move = "right";
                    break;
                case 39:
                    move = "up";
                    break;
                case 40:
                    move = "down";
                    break;
                case 32:
                    move = "swap";
                    break;
                default:
                    // invalid input
                    console.log("Invalid input")
            }
            UserInput.move = move
        })
    }
}
