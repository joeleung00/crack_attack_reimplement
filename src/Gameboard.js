export class Gameboard{
    constructor(pos_x, pos_y, width, height, row_num, column_num, ctx){
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.width = width;
        this.height = height;
        this.row_num = row_num;
        this.column_num = column_num;
        this.ctx = ctx;

        this.board = Array(this.row_num).fill(Array(this.column_num).fill(0))
        // square block
        this.block_length = width / column_num;
        this.block_bg_color = "White";
        this.padding = this.block_length / 10;
    }

    draw_block(x, y, length, bg_color, color, padding){
        this.ctx.fillStyle(bg_color);
        this.ctx.fillRect(x, y, length, length);

        this.ctx.fillStyle(color);
        this.ctx.fillRect(x + padding, y + padding, length - 2 * padding, length - 2 * padding);
    }

    draw(){
        // draw all blocks
        var i;
        for (i = 0; i < this.row_num; i++){
            for (j = 0; j < this.column_num; j++){
                let color = this.board[i][j];
                let x = this.pos_x + i * this.block_length;
                let y = this.pos_y + j * this.block_length;
                this.draw_block(x, y,  this.block_length, this.block_bg_color, Color[color], this.padding);
            }
        }
    }

}

const Color = {
    0: "White",
    1: "Red",
    2: "Orange",
    3: "Yellow",
    4: "Green",
    5: "Blue",
    6: "Purple"
};
