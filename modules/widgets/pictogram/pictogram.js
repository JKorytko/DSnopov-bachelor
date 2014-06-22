(function(app) {

    /* ********************************************************** */
    /*  Yes, i know. This code is awful. I coded it one year ago  */
    /*     and this was my first Backbone app. I don't wanna      */
    /*               investigate and rewrite it.                  */
    /* ********************************************************** */

    var PictCollection = Backbone.Collection.extend({

        width: 800, height: 600,              //width and height of the canvas
        minX: null, maxX: null,
        minY: null, maxY: null,
        dminX: null, dmaxX: null,
        dminY: null, dmaxY: null,

        initialize: function() {
            this.on('add', this.addModel);
        },
        addModel: function(model, col, options) {
            var i,
                x_pictD = model.get('x_pictD'),
                x_pictI = model.get('x_pictI'),
                y_pictD = model.get('y_pictD'),
                y_pictI = model.get('y_pictI'),
                len = x_pictD.length;
            //X постоянные поэтому, мы мин и макс мы для них будем искать только один раз
            if(!this.minX) {
                this.dminX = x_pictD[0];   this.minX = x_pictI[0];
                this.dmaxX = x_pictD[0];   this.maxX = x_pictI[0];
                for(i = 0; i < len; i++) {
                    if(this.dminX > x_pictD[i]) {this.minX = x_pictI[i]; this.dminX = x_pictD[i];}
                    if(this.dmaxX < x_pictD[i]) {this.maxX = x_pictI[i]; this.dmaxX = x_pictD[i];}
                }
            }
            //для Y
            if(!this.minY) {
                this.dminY = y_pictD[0];   this.minY = y_pictI[0];
                this.dmaxY = y_pictD[0];   this.maxY = y_pictI[0];
            }
            for(i = 0; i < len; i++) {
                if(this.dminY > y_pictD[i]) {this.minY = y_pictI[i]; this.dminY = y_pictD[i];}
                if(this.dmaxY < y_pictD[i]) {this.maxY = y_pictI[i]; this.dmaxY = y_pictD[i];}
            }
            this.drawPictograms();
        },
        drawPictograms: function() {
            var model;
            var ctx,
                x_pictI = [],
                y_pictI = [],
                length = null;
            ctx = document.getElementById('drawCanvas').getContext('2d');
            ctx.clearRect(0, 0, this.width, this.height);
            //?????? ???, ?? ????????? ? height\width (?? ???? ???? :( )
            ctx.strokeRect(80, 30, this.width - 90, this.height - 60);
            //?????? ???????? ????
            ctx.font = '12px sans-serif';
            //?? Y
            ctx.fillText(new Number(this.dmaxY).toPrecision(6), 0, 40);
            ctx.fillText(new Number(this.dminY + (this.dmaxY - this.dminY) / 4 * 3).toPrecision(6), 0, 170);
            ctx.fillText(new Number(this.dminY + (this.dmaxY - this.dminY) / 4 * 2).toPrecision(6), 0, 305);
            ctx.fillText(new Number(this.dminY + (this.dmaxY - this.dminY) / 4).toPrecision(6), 0, 440);
            ctx.fillText(new Number(this.dminY).toPrecision(6), 0, 570);
            //?? X
            ctx.fillText(new Number(this.dmaxX).toPrecision(6), 735, 580);
            ctx.fillText(new Number(this.dminX + (this.dmaxX - this.dminX) / 4 * 3).toPrecision(6), 560, 580);
            ctx.fillText(new Number(this.dminX + (this.dmaxX - this.dminX) / 4 * 2).toPrecision(6), 400, 580);
            ctx.fillText(new Number(this.dminX + (this.dmaxX - this.dminX) / 4).toPrecision(6), 240, 580);
            ctx.fillText(new Number(this.dminX).toPrecision(6), 80, 580);
            for(var index = 0; index < this.length; index++) {
                ctx.save();
                model = this.at(index);
                x_pictI = model.get('x_pictI');
                y_pictI = model.get('y_pictI');
                if(model.get('color')) ctx.strokeStyle = model.get('color');
                if(model.get('thick')) ctx.lineWidth = model.get('thick');
                if(!length) length = x_pictI.length;
                ctx.beginPath();
                ctx.moveTo((x_pictI[0] - this.minX) * (this.width - 90) /
                    (this.maxX - this.minX) + 80, this.height - (y_pictI[0] - this.minY) * (this.height - 60) /
                    (this.maxY - this.minY) - 30);
                for(var i = 1; i < length; i++) {
                    ctx.lineTo((x_pictI[i] - this.minX) * (this.width - 90) / (this.maxX - this.minX) + 80,
                        this.height - (y_pictI[i] - this.minY) * (this.height - 60) / (this.maxY - this.minY) - 30);
                }
                ctx.stroke();
                ctx.restore();
            }
        }
    });

    var View = Backbone.CustomView.extend({
        layout: '.canvas',
        template: '#pictogram-template',

        onStartAttach: function() {
            //.measure
            this.elForNeedLine = [];             //массив, в котором будут храниться номера элементов, через которые проходит выбранная линия
            this.xy_nline = [];                  //массив, в котором будут храниться координаты начала и конца линии ([X_b, Y_b, X_end, Y_end])
            //.pmd
            this.numOfNodes = null;              //полное количество узлов
            this.numOfEl = null;                 //полное количество элементов
            this.nodesOfEl = [];                 //"двойной массив" узлов для каждого элемента типа [[узел, узел, узел], [узел, узел, узел], ...]
            this.nCoorX = [];                    //массив X-ов для каждого узла
            this.nCoorY = [];                    //...    Y-ов
            this.mTimes = [];                    //каждый элемент - это строка момента времени. Первая цифра == momentTime

            //pictogram
            this.x_pictD = null;                  //X для графика постоянно одинаковы, поэтому объявим их "глобально" для этой модели,
            this.x_pictI = null;                  //чтобы не вычислять их несколько раз
            //pictParameters
            this.pictParameters = {};

            this.pictCollection = new PictCollection();
        },

        $calculate: function(data) {
            var arrMeasure = [], tempElForNeedLine = [], temp_xy_nline = [];      //temp variables for .measure
            var arrPmd = [], tempArr = [];                                        //temp variables for .pmd

            //some magic
            this.pictParameters.momentTime = data.momentTime;
            this.pictParameters.value = data.value;
            this.pictParameters.thickness = data.thickness;
            this.pictParameters.color = data.color;
            //обрабатываем данные в файле .measure
            arrMeasure = data.measure.split('\n');
            tempElForNeedLine = arrMeasure[data.line * 4 - 1].split(' ');
            temp_xy_nline = arrMeasure[data.line * 4 - 3].split(' ');
            for(var i = 0, length = tempElForNeedLine.length; i < length; i++) {
                if(!isNaN(parseInt(tempElForNeedLine[i]))) this.elForNeedLine[i] = parseInt(tempElForNeedLine[i]);
            }
            for(i = 0; i < temp_xy_nline.length; i++) {
                if(!isNaN(parseFloat(temp_xy_nline[i]))) this.xy_nline[i] = parseFloat(temp_xy_nline[i]);
            }

            //обрабатываем данные в файде .pmd
            arrPmd = data.pmd.split('\n');
            this.numOfNodes = parseInt(arrPmd[1].slice(8));
            this.numOfEl = parseInt(arrPmd[2].slice(11));
            for(i = 0; i < this.numOfEl; i++) {
                tempArr = arrPmd[i+6].split(' ');
                this.nodesOfEl[i] = [];
                for(var j = 0; j < 3; j++) {
                    this.nodesOfEl[i][j] = parseInt(tempArr[j]);
                }
            }
            for(i = 0; i < this.numOfNodes; i++)
                this.nCoorX[i] = parseFloat(arrPmd[i * 2 + this.numOfEl + 7]);
            for(i = 0; i < this.numOfNodes; i++)
                this.nCoorY[i] = parseFloat(arrPmd[i * 2 + this.numOfEl + 8]);

            //обрабатываем данные в файле .dat
            this.mTimes = data.dat.split('t=');

            //СОЗДАЕМ НОВЫЙ ГРАФИК
            this.createNewPict();
        },

        createNewPict: function(pictParam) {
            pictParam = pictParam || this.pictParameters;
            var i, j, k, len = this.elForNeedLine.length, timesLen = this.mTimes.length;
            var v3x, v3y, x_cg = [], y_cg = [], arrForDet = [];
            var line_length, sinL, cosL;
            var needMomentTime = [], tempArr = [];
            var y_pictD = [], y_pictI = [];
            //определяем x для графика, если они еще не существуют!!!
            if(!this.x_pictD && !this.x_pictI) {
                this.x_pictD = [];
                this.x_pictI = [];
                //x центра тяжести, y центра тяжести
                for(i = 0; i < len; i++) {
                    v3x = 0;
                    v3y = 0;
                    arrForDet = this.nodesOfEl[this.elForNeedLine[i] - 1];
                    for(j = 0; j < 3; j++) {
                        for(k = 0; k < 2; k++) {
                            if(k == 0)
                                v3x += this.nCoorX[arrForDet[j] - 1];
                            else
                                v3y += this.nCoorY[arrForDet[j] - 1]
                        }
                    }
                    x_cg[i] = v3x/3;
                    y_cg[i] = v3y/3;
                }
                //определяем x для графика
                line_length = Math.sqrt((this.xy_nline[2] - this.xy_nline[0])*(this.xy_nline[2] - this.xy_nline[0]) +
                    (this.xy_nline[3] - this.xy_nline[1]) * (this.xy_nline[3] - this.xy_nline[1]));
                sinL = (this.xy_nline[3] - this.xy_nline[1]) / line_length;
                cosL = (this.xy_nline[2] - this.xy_nline[0]) / line_length;
                for( i = 0; i < len; i++)
                    this.x_pictD[i] = x_cg[i]*cosL + y_cg[i]*sinL;
                //переводим в int
                for(i = 0; i < len; i++) {
                    this.x_pictI[i] = parseInt(this.x_pictD[i] * 1000);
                }
            }
            //определяем y для графика!!!
            //нужный момент времени
            for(i = 0; i < timesLen; i++) {
                if(pictParam.momentTime == parseFloat(this.mTimes[i])) {
                    needMomentTime = this.mTimes[i].split('\n');
                }
            }
            //y находим
            for(i = 0; i < len; i++) {
                tempArr = needMomentTime[this.elForNeedLine[i]].split(' ');
                y_pictD[i] = parseFloat(tempArr[pictParam.value]);
            }
            //преобразуем в int
            for(i = 0; i < len; i++) {
                y_pictI[i] = parseInt(y_pictD[i] * 1000);
            }


            this.pictCollection.add({
                x_pictD: this.x_pictD,
                x_pictI: this.x_pictI,
                y_pictD: y_pictD,
                y_pictI: y_pictI,
                thick: pictParam.thickness,
                color: pictParam.color
            });
        }
    });

    app.pictogram = {
        getView: function() {
            if(!this.view) {
                this.view = new View();
            }

            return this.view;
        }
    };
})(app);