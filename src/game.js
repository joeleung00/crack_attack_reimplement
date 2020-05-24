// import { UserInput } from './UserInput.js';
// import { Gameboard } from './Gameboard.js';
// import { Textbox } from './Textbox.js';

var Main = {
    gamestart: function(){
        this.game = new Game();
        document.getElementById("start").style.visibility = "hidden";
        document.getElementById("end").style.visibility = "visible";
        this.canvas = document.getElementById("CANVAS").style.background = null;
    },
    endgame: function(){
        this.game.clearInterval();
        this.game.clear();
        document.getElementById("start").style.visibility = "visible";
        document.getElementById("end").style.visibility = "hidden";
        this.canvas = document.getElementById("CANVAS").style.background = "url('./img/bg.png')";

    }
}



class Game{
    constructor(){
        this.canvas = document.getElementById("CANVAS");
        this.ctx = this.canvas.getContext("2d");
        this.fps = 30;
        this._interval = null;
        UserInput.listenInput();
        this.gameboard = new Gameboard(100, 40 , 300, 600, 12, 6);
        this.scorebox = new Textbox(500, 50, "30px Arial");
        this.second_per_new_blocks = 6;
        this.offset_increment = 1 / (this.second_per_new_blocks * this.fps);
        //offsetRate is a value between 0 to 1
        this.offsetRate = 0;
        this.animationHandler = new AnimationHandler(UserInput, this.gameboard, this.scorebox, this.fps);
        this.gameover = false;
        this.interval = setInterval(this.gameLoop.bind(this), 1000/this.fps);
        this.gameover_text = new Textbox(150, 300, "40px Arial");
    }


    clearInterval(){
        clearInterval(this.interval);
    }

    gameLoop(){
        if (!this.gameover){
            this.update();
            this.clear();
            this.draw();

        }
        else{
            this.clear();
            this.gameover_text.text = "Game Over! Your Score is " +  this.animationHandler.score;
            this.show_game_over();
        }


    }

    show_game_over(){
        this.gameover_text.draw(this.ctx);
    }

    clear(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(){
        this.gameboard.draw(this.ctx,this.offsetRate);
        this.scorebox.draw(this.ctx);

    }
    update(){
        if (this.offsetRate >= 1){
            if (this.gameboard.checkGameover()){
                this.gameover = true;
            }
            this.gameboard.addNewBlocks();
            this.gameboard.cursor_action("up");
            this.animationHandler.change_mask_board();
            this.offsetRate = 0;
        }
        this.offsetRate += this.offset_increment;
        this.animationHandler.update();

    }
}

var UserInput = {
    listenInput: function(){
        this.move = false;
        window.addEventListener('keydown', function (e){
            var move;
            switch (e.keyCode) {
                case 37:
                    move = "left";
                    break;
                case 38:
                    move = "up";
                    break;
                case 39:
                    move = "right";
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


const Color = {
    0: "White",
    1: "Red",
    2: "Orange",
    3: "Yellow",
    4: "Green",
    5: "Blue",
    6: "Violet",
    7: "DarkRed",
    8: "DarkOrange",
    9: "Gold",
    10: "DarkGreen",
    11: "DarkBlue",
    12: "DarkViolet"
};


const Mode = {Droping: 0, Eliminating: 1, Normal: 2};

class AnimationHandler{
    constructor(userInput, gameboard, scorebox, fps){
        this.mode = Mode.Normal;
        this.userInput = userInput;
        this.gameboard = gameboard;
        this.scorebox = scorebox;
        this.change_color_period = fps / 4 + 0.5;
        this.drop_period = fps / 5;
        this.frame = 0;
        this.score = 0;
        this.mask_board = false;
    }

    change_mask_board(){
        if (this.mask_board == false){
            return;
        }
        this.mask_board.shift();
        var empty_blocks = new Array(this.mask_board[0].length);
        empty_blocks.fill(0);
        this.mask_board.push(empty_blocks);
    }

    update(){
        this.scorebox.text = "Score: " + this.score;

        let action = this.userInput.move;
        if (this.mode == Mode.Normal){
            if (action != false){
                this.gameboard.cursor_action(action);
                this.userInput.move = false;
            }

            this.mask_board = this.gameboard.check_eliminate_blocks();

            if (this.gameboard.check_falling()){
                this.mode = Mode.Droping;
                this.frame = 0;
            }
            else if (this.mask_board != false){
                this.mode = Mode.Eliminating;
                this.frame = 0;
            }


        }
        else if (this.mode == Mode.Eliminating){
            if (action != false && action != "swap"){
                this.gameboard.cursor_action(action);
                this.userInput.move = false;
            }

            this.frame += 1;
            console.log(this.change_color_period);
            if (this.frame % this.change_color_period == 0){
                this.gameboard.toggle_color(this.mask_board);
            }
            if (this.frame > 4 * this.change_color_period){
                //elim block
                // check go to dropping or normal
                this.score += this.gameboard.eliminate_blocks(this.mask_board);
                if (this.gameboard.check_falling()){
                    this.mode = Mode.Droping;
                    this.frame = 0;
                }
                else{
                    this.mode = Mode.Normal;
                }

            }

        }
        else if (this.mode == Mode.Droping){
            if (action != false && action != "swap"){
                this.gameboard.cursor_action(action);
                this.userInput.move = false;
            }

            this.frame += 1;
            if (this.frame % this.drop_period == 0){
                this.gameboard.fall_one_step();
            }

            if (!this.gameboard.check_falling()){
                this.mask_board = this.gameboard.check_eliminate_blocks();
                if (this.mask_board != false){
                    this.mode = Mode.Eliminating;
                    this.frame = 0;
                }
                else{
                    this.mode = Mode.Normal;
                }
            }
        }
    }



}

class Gameboard{
    constructor(pos_x, pos_y, width, height, row_num, column_num){
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.width = width;
        this.height = height;
        this.row_num = row_num;
        this.column_num = column_num;
        this.filter_size = 3;
        this.number_of_color = 6;
        this.init_block_height = 6;
        this.cursor = {row: row_num / 2, col: column_num / 2 - 1};
        this.newBlocks = this.getNewBlocks();
        this.init_gameboard();
        // square block
        this.block_length = width / column_num;
        this.block_bg_color = "White";
        this.padding = this.block_length / 15;
    }


    getNewBlocks(){
        var newBlocks = new Array(this.column_num);
        newBlocks.fill(0);
        newBlocks[0] = this.get_random_color();
        for (let j = 1; j < this.column_num; j++){
            do{
                newBlocks[j] = this.get_random_color();
            } while (newBlocks[j] == newBlocks[j-1]);
        }
        return newBlocks;
    }

    addNewBlocks(){
        this.board.shift();
        this.board.push(this.newBlocks);
        this.newBlocks = this.getNewBlocks();
    }

    checkGameover(){
        for (let j = 0; j < this.column_num; j++){
            if (this.board[0][j] != 0){
                return true;
            }
        }
        return false;
    }

    cursor_action(action){
        if (action == "left"){
            if (this.cursor.col > 0){
                this.cursor.col -= 1;
            }
        }
        else if (action == "right"){
            if (this.cursor.col < this.column_num - 2){
                this.cursor.col += 1;
            }
        }
        else if (action == "up"){
            if (this.cursor.row  > 0){
                this.cursor.row -= 1;
            }
        }
        else if (action == "down"){
            if (this.cursor.row < this.row_num - 1){
                this.cursor.row += 1;
            }
        }

        else if (action == "swap"){
            this.swap(this.cursor.row, this.cursor.col);
        }

    }

    swap(row, col){
        if (col == this.column_num - 1){
            return false;
        }
        var tmp = this.board[row][col];
        this.board[row][col] = this.board[row][col + 1];
        this.board[row][col + 1] = tmp;
        return true;
    }

    get_random_color(){
        return Math.floor(Math.random() * this.number_of_color) + 1;
    }

    init_gameboard(){
        this.board = new Array(this.row_num);
        for (let i = 0; i < this.row_num; i++){
            this.board[i] = new Array(this.column_num);
            this.board[i].fill(0);
        }

        for (let i = this.row_num - 1; i >= this.init_block_height; i--){
            for (let j = this.column_num - 1; j >= 0; j--){
                this.board[i][j] = this.get_random_color();
                while (this.check_same_color(i, j, "horizontal") || this.check_same_color(i, j, "vertical")){
                    this.board[i][j] = this.get_random_color();
                }
            }
        }
    }



    mark_pos(i, j, mask_board, dir){
        if (dir == "horizontal"){
            for (let k = j; k < j + this.filter_size; k++){
                mask_board[i][k] = true;
            }
        }
        else if (dir == "vertical"){
            for (let k = i; k < i + this.filter_size; k++){
                mask_board[k][j] = true;
            }
        }

    }

    check_same_color(i, j, dir){
        var color = this.board[i][j];
        // 0 means empty space
        if (color == 0){
            return false;
        }
        // outside the board
        if (i + this.filter_size > this.row_num && dir == "vertical"){
            return false;
        }
        if (j + this.filter_size > this.column_num && dir == "horizontal"){
            return false;
        }

        if (dir == "horizontal"){

            for (let k = j + 1; k < j + this.filter_size; k++){
                if (this.board[i][k] != color){
                    return false;
                }
            }
        }

        else if (dir == "vertical"){
            for (let k = i + 1; k < i + this.filter_size; k++){
                if (this.board[k][j] != color){
                    return false;
                }
            }
        }

        return true;
    }


    check_eliminate_blocks(){
        var mask_board = new Array(this.row_num);
        for (let i = 0; i < this.row_num; i++){
            mask_board[i] = new Array(this.column_num);
            mask_board[i].fill(false);
        }
        var should_elim = false;
        for (let i = 0; i < this.row_num; i++){
            for (let j = 0; j < this.column_num; j++){
                if (this.check_same_color(i, j, "horizontal")){
                    this.mark_pos(i, j, mask_board, "horizontal");
                    console.log("h", i, j);
                    console.log(this.board[i][j], this.board[i][j+1], this.board[i][j+2]);
                    should_elim = true;
                }
                if (this.check_same_color(i, j, "vertical")){
                    this.mark_pos(i, j, mask_board, "vertical");
                    should_elim = true;
                    console.log("v", i, j);
                    console.log(this.board[i][j], this.board[i+1][j], this.board[i+2][j]);
                }
            }
        }
        if (should_elim){
            return mask_board
        }
        else{
            return false;
        }

    }
    check_falling(){
        for (let i = this.row_num - 2; i >= 0; i--){
            for (let j = 0; j < this.column_num; j++){
                if (this.board[i + 1][j] == 0 && this.board[i][j] != 0){
                    return true;
                }
            }
        }
    }


    fall_one_step(){
        for (let i = this.row_num - 2; i >= 0; i--){
            for (let j = 0; j < this.column_num; j++){
                if (this.board[i + 1][j] == 0 && this.board[i][j] != 0){
                    this.board[i + 1][j] = this.board[i][j];
                    this.board[i][j] = 0;
                }
            }
        }
    }

    eliminate_blocks(mask_board){
        var count = 0;
        for (let i = 0; i < this.row_num; i++){
            for (let j = 0; j < this.column_num; j++){
                if (mask_board[i][j] == true){
                    this.board[i][j] = 0;
                    count++;
                }
            }
        }
        return count;
    }

    toggle_color(mask_board){
        for (let i = 0; i < this.row_num; i++){
            for (let j = 0; j < this.column_num; j++){
                if (mask_board[i][j]){
                    if (this.board[i][j] <= this.number_of_color){
                        this.board[i][j] += this.number_of_color;
                    }
                    else{
                        this.board[i][j] -= this.number_of_color;
                    }

                }
            }
        }
    }
    draw_block(x, y, length, bg_color, color, padding, ctx){
        ctx.fillStyle = bg_color;
        ctx.fillRect(x, y, length, length);

        ctx.fillStyle = color;
        ctx.fillRect(x + padding, y + padding, length - 2 * padding, length - 2 * padding);
    }

    draw(ctx, offsetRate){
        //draw background;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.lineWidth = "4";
        ctx.strokeStyle = "black";
        ctx.rect(this.pos_x, this.pos_y, this.width, this.height);
        ctx.stroke();

        // draw all blocks
        for (let i = 0; i < this.row_num; i++){
            for (let j = 0; j < this.column_num; j++){
                let color = this.board[i][j];
                let y = this.pos_y + i * this.block_length - offsetRate * this.block_length;
                let x = this.pos_x + j * this.block_length;
                this.draw_block(x, y,  this.block_length, this.block_bg_color, Color[color], this.padding, ctx);
            }
        }

        // draw cursor
        ctx.beginPath();
        ctx.lineWidth = "4";
        ctx.strokeStyle = "grey";
        let y = this.pos_y + this.cursor.row * this.block_length - offsetRate * this.block_length;
        let x = this.pos_x + this.cursor.col * this.block_length;
        ctx.rect(x, y, this.block_length * 2, this.block_length);
        ctx.stroke();


        //draw pre new blocks
        ctx.globalAlpha = 0.15;
        for (let j = 0; j < this.column_num; j++){
            let color = this.newBlocks[j];
            let y = this.pos_y + this.row_num * this.block_length - offsetRate * this.block_length;
            let x = this.pos_x + j * this.block_length;
            let blockHeight = offsetRate * this.block_length;
            this.draw_block(x, y,  this.block_length, this.block_bg_color, Color[color], this.padding, ctx);
        }
    }

}

class Textbox{
    constructor(pos_x, pos_y, font){
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.font = font;
        this._text = 0;
    }
    set text(msg){
        this._text = msg;
    }
    draw(ctx){
        ctx.globalAlpha = 1;
        ctx.font = this.font;
        ctx.fillStyle = "red";
        ctx.fillText(this._text, this.pos_x, this.pos_y);
    }

}
