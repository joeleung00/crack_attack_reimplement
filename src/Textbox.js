export class Textbox{
    constructor(ctx, pos_x, pos_y, font){
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.font = font;
        this.ctx = ctx;
        this._text = 0;
    }
    set text(msg){
        this._text = msg;
    }
    draw()
        this.ctx.font = this.font;
        this.ctx.fillText(this._text, pos_x, pos_y);
    }

}
