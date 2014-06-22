(function(app) {

    var View = Backbone.CustomView.extend({
        layout: '.canvas',
        template: '#net-template',

        events: {
            'click .save-as-image': 'openImage',
            'click .save-as-gif': 'openGif'
        },

        width: 800, height: 600,

        visibility: true,

        onStartAttach: function() {
            this.wasRendered = false;
            this.numOfNodes = null;
            this.numOfEl = null;
            this.nodesOfEl = [];
            this.intCoorY = [];
            this.intCoorX = [];
            this.mTimes = [];
            this.needMTValue = [];
            this.encoder = null;
        },

        $changeVisibility: function() {
            this.visibility = !this.visibility;
            this.elementsColors = [];
            this.elementsColors.length = this.numOfEl;
            this.drawNet();
        },

        $stopAnimation: function() {
            this.finishGif();
            clearInterval(this.intervalID);
        },

        $animateMomentTimes: function(frequency) {
            var self = this,
                checkbox = this.el.querySelector('.saving-animation-flag'),
                ctx = this.el.querySelector('#drawCanvas').getContext('2d');

            if(checkbox.checked) {
                checkbox.setAttribute('disabled', 'disabled');
                this.el.querySelector('.save-as-gif').setAttribute('disabled', 'disabled');

                this.prevMomentTimeIndex = this.momentTimeIndex;
                this.encoder = new GIFEncoder();
                this.encoder.setRepeat(0); //loop forever
                this.encoder.setDelay(frequency);
                this.encoder.setQuality(100);
                this.encoder.start();
                this.encoder.addFrame(ctx);
            }

            this.intervalID = setInterval(function() {
                self.momentTimeIndex++;
                if(self.momentTimeIndex !== self.mTimes.length) {
                    self.setNewMTValue();
                } else {
                    self.finishGif();
                    self.momentTimeIndex--;
                    app.sandbox.trigger('net:stopAnimationFromNet');
                    clearInterval(self.intervalID);
                }
            }, frequency);
        },

        $showPrevMomentTime: function() {
            this.momentTimeIndex--;
            if(this.momentTimeIndex !== -1) {
                this.setNewMTValue();
            } else {
                this.momentTimeIndex++;
            }
        },

        $showNextMomentTime: function() {
            this.momentTimeIndex++;
            if(this.momentTimeIndex !== this.mTimes.length) {
                this.setNewMTValue();
            } else {
                this.momentTimeIndex--;
            }
        },

        finishGif: function() {
            if(this.encoder && this.prevMomentTimeIndex !== this.momentTimeIndex) {
                this.savedEncoder = this.encoder;
                this.savedEncoder.finish();
                this.el.querySelector('.save-as-gif').removeAttribute('disabled');
                this.el.querySelector('.saving-animation-flag').removeAttribute('disabled');
            }
            this.encoder = null;
        },

        openImage: function() {
            var canvas = this.el.querySelector('#drawCanvas'),
                newWindow = window.open(),
                image = document.createElement('img'),
                title = document.createElement('title');

            title.textContent = 'Картинка для сохранения';
            newWindow.document.querySelector('head').appendChild(title);
            image.src = canvas.toDataURL('image/jpeg');
            newWindow.document.body.appendChild(image);
        },

        openGif: function() {
            var newWindow = window.open(),
                image = document.createElement('img'),
                title = document.createElement('title');

            title.textContent = 'Анимация для сохранения';
            newWindow.document.querySelector('head').appendChild(title);
            image.src = 'data:image/gif;base64,' + encode64(this.savedEncoder.stream().getData());
            newWindow.document.body.appendChild(image);
        },

        setNewMTValue: function() {
            var needMomentTime,
                tempArr,
                i;

            needMomentTime = this.mTimes[this.momentTimeIndex].split('\n');
            //array MT находим нужной величины
            for(i = 1; i <= this.numOfEl; i++) {
                tempArr = needMomentTime[i].split(' ');
                this.needMTValue[i - 1] = parseFloat(tempArr[this.value]);
            }
            console.log(this.momentTimeIndex);
            this.setNetStats();
            this.drawNet();
        },

        setNetStats: function() {
            var indexMT = this.momentTimeIndex;

            this.$('.progressbar').val(indexMT);
            this.$('.current-mt').text('t = ' + parseFloat(this.mTimes[indexMT]));
        },

        $calculate: function(obj) {
            var i, j,
                timesLen,
                arrPmd = [],
                tempArr = [],
                nCoorX = [], nCoorY = [],
                needMomentTime = [],
                textPmd = obj.pmd,
                textDat = obj.dat;

            this.value = obj.value;
            this.momentTime = obj.momentTime;

            //обрабатываем данные в файде .pmd
            arrPmd = textPmd.split('\n');
            this.numOfNodes = parseInt(arrPmd[1].slice(8));
            this.numOfEl = parseInt(arrPmd[2].slice(11));
            for(i = 0; i < this.numOfEl; i++) {
                tempArr = arrPmd[i+6].split(' ');
                this.nodesOfEl[i] = [];
                for(j = 0; j < 3; j++) {
                    this.nodesOfEl[i][j] = parseInt(tempArr[j]);
                }
            }

            //coordinates magic
            for(i = 0; i < this.numOfNodes; i++) {
                nCoorX[i] = parseFloat(arrPmd[i * 2 + this.numOfEl + 7]);
            }
            for(i = 0; i < this.numOfNodes; i++) {
                nCoorY[i] = parseFloat(arrPmd[i * 2 + this.numOfEl + 8]);
            }
            for(i = 0; i < this.numOfNodes; i++) {
                this.intCoorY[i] = parseInt(nCoorY[i] * 1000);
                this.intCoorX[i] = parseInt(nCoorX[i] * 1000);
            }
            //мин, макс значения координат
            this.minX = this.intCoorX[0]; this.maxX = this.intCoorX[0];
            for(i=0; i < this.numOfNodes; i++) {
                if(this.minX > this.intCoorX[i]) { this.minX = this.intCoorX[i]; }
                if(this.maxX < this.intCoorX[i]) { this.maxX = this.intCoorX[i]; }
            }
            this.minY = this.intCoorY[0]; this.maxY = this.intCoorY[0];
            for(i=0; i < this.numOfNodes; i++) {
                if(this.minY > this.intCoorY[i]) { this.minY = this.intCoorY[i]; }
                if(this.maxY < this.intCoorY[i]) { this.maxY = this.intCoorY[i]; }
            }

            //обрабатываем данные в файле .dat
            this.mTimes = textDat.split('t=');
            this.mTimes.shift(); //remove first el, cause it's empty string
            timesLen = this.mTimes.length;
            for(i = 0; i < timesLen; i++) {
                if(this.momentTime == parseFloat(this.mTimes[i])) {
                    needMomentTime = this.mTimes[i].split('\n');
                    this.momentTimeIndex = i;
                }
            }
            //array MT находим нужной величины
            for(i = 1; i <= this.numOfEl; i++) {
                tempArr = needMomentTime[i].split(' ');
                this.needMTValue[i - 1] = parseFloat(tempArr[this.value]);
            }

            //set initial state of elements colors
            this.elementsColors = [];
            this.elementsColors.length = this.numOfEl;

            //set net stats
            this.$('.progressbar').attr('max', this.mTimes.length - 1);
            this.$('.max-mt').text('t = ' + parseFloat(this.mTimes[this.mTimes.length - 1]));
            this.setNetStats();
            //draw net
            this.drawNet();
        },

        drawNet: function() {
            var ctx = this.el.querySelector('#drawCanvas').getContext('2d'),
                elLen = this.numOfEl,
                minV, maxV,
                x1, x2, x3, y1, y2, y3, i,
                val1, val2, val3, val4, val5;

            //мин, макс значение момента времени
            minV = this.needMTValue[0]; maxV = this.needMTValue[0];
            for(i = 0; i < elLen; i++) {
                if(minV > this.needMTValue[i]) minV = this.needMTValue[i];
                if(maxV < this.needMTValue[i]) maxV = this.needMTValue[i];
            }
            val1 = minV+(maxV-minV)/6;
            val2 = minV+2*(maxV-minV)/6;
            val3 = minV+3*(maxV-minV)/6;
            val4 = minV+4*(maxV-minV)/6;
            val5 = minV+5*(maxV-minV)/6;

            ctx.fillStyle = '#fff'
            if(!this.wasRendered) {
                ctx.fillRect(0, 0, this.width, this.height);
                this.wasRendered = true;
            } else {
                ctx.fillRect(0, this.height - 69, this.width, this.height);
            }

            ctx.save();
            ctx.strokeRect(30, 30, this.width - 60, this.height - 100);

            for(i = 0; i < elLen; i++) {
                x1 = this.intCoorX[this.nodesOfEl[i][0]-1];
                x2 = this.intCoorX[this.nodesOfEl[i][1]-1];
                x3 = this.intCoorX[this.nodesOfEl[i][2]-1];
                y1 = this.intCoorY[this.nodesOfEl[i][0]-1];
                y2 = this.intCoorY[this.nodesOfEl[i][1]-1];
                y3 = this.intCoorY[this.nodesOfEl[i][2]-1];
                if(this.needMTValue[i] <= val1) {
                    if(this.elementsColors[i] !== 1) {
                        this.elementsColors[i] = 1;
                        ctx.fillStyle = 'rgb(0, 255, 255)';
                        ctx.strokeStyle = 'rgb(0, 255, 255)';
                    } else {
                        continue;
                    }
                }
                else {
                    if(this.needMTValue[i] <= val2) {
                        if(this.elementsColors[i] !== 2) {
                            this.elementsColors[i] = 2;
                            ctx.fillStyle = 'rgb(0, 89, 255)';
                            ctx.strokeStyle = 'rgb(0, 89, 255)';
                        } else {
                            continue;
                        }
                    }
                    else {
                        if(this.needMTValue[i] <= val3) {
                            if(this.elementsColors[i] !== 3) {
                                this.elementsColors[i] = 3;
                                ctx.fillStyle = 'rgb(26, 0, 255)';
                                ctx.strokeStyle = 'rgb(26, 0, 255)';
                            } else {
                                continue;
                            }
                        }
                        else {
                            if(this.needMTValue[i] <= val4) {
                                if(this.elementsColors[i] !== 4) {
                                    this.elementsColors[i] = 4;
                                    ctx.fillStyle = 'rgb(252, 15, 205)';
                                    ctx.strokeStyle = 'rgb(252, 15, 205)';
                                } else {
                                    continue;
                                }
                            }
                            else {
                                if(this.needMTValue[i] <= val5) {
                                    if(this.elementsColors[i] !== 5) {
                                        this.elementsColors[i] = 5;
                                        ctx.fillStyle = 'rgb(231, 84, 128)';
                                        ctx.strokeStyle = 'rgb(231, 84, 128)';
                                    } else {
                                        continue;
                                    }
                                }
                                else {
                                    if(this.elementsColors[i] !== 6) {
                                        this.elementsColors[i] = 6;
                                        ctx.fillStyle = 'rgb(255, 0, 0)';
                                        ctx.strokeStyle = 'rgb(255, 0, 0)';
                                    } else {
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                }

                ctx.beginPath();
                ctx.moveTo((x1 - this.minX) * (this.width - 60) / (this.maxX - this.minX) + 30,
                    this.height - (y1 - this.minY) * (this.height - 100) / (this.maxY - this.minY) - 70);
                ctx.lineTo((x2 - this.minX) * (this.width - 60) / (this.maxX - this.minX) + 30,
                    this.height - (y2 - this.minY) * (this.height - 100) / (this.maxY - this.minY) - 70);
                ctx.lineTo((x3 - this.minX) * (this.width - 60) / (this.maxX - this.minX) + 30,
                    this.height - (y3 - this.minY) * (this.height - 100) / (this.maxY - this.minY) - 70);
                ctx.fill();

                if(this.visibility) {
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 0.5;
                }
                else {
                    ctx.lineWidth = 0.8;
                }
                ctx.beginPath();
                ctx.moveTo((x1 - this.minX) * (this.width - 60) / (this.maxX - this.minX) + 30,
                    this.height - (y1 - this.minY) * (this.height - 100) / (this.maxY - this.minY) - 70);
                ctx.lineTo((x2 - this.minX) * (this.width - 60) / (this.maxX - this.minX) + 30,
                    this.height - (y2 - this.minY) * (this.height - 100) / (this.maxY - this.minY) - 70);
                ctx.lineTo((x3 - this.minX) * (this.width - 60) / (this.maxX - this.minX) + 30,
                    this.height - (y3 - this.minY) * (this.height - 100) / (this.maxY - this.minY) - 70);
                ctx.closePath();
                ctx.stroke();

            }
            //градация (не привязана к высоте и ширине)
            ctx.fillStyle = 'rgb(0, 255, 255)';
            ctx.fillRect(79, 550, 50, 10);
            ctx.fillStyle = 'rgb(0, 89, 255)';
            ctx.fillRect(178, 550, 50, 10);
            ctx.fillStyle = 'rgb(26, 0, 255)';
            ctx.fillRect(277, 550, 50, 10);
            ctx.fillStyle = 'rgb(252, 15, 205)';
            ctx.fillRect(376, 550, 50, 10);
            ctx.fillStyle = 'rgb(231, 84, 128)';
            ctx.fillRect(475, 550, 50, 10);
            ctx.fillStyle = 'rgb(255, 0, 0)';
            ctx.fillRect(574, 550, 50, 10);

            ctx.fillStyle = 'black';
            ctx.font = '12px sans-serif';
            for(i = 0; i <= 6; i++) {
                ctx.fillText(new Number(minV + i * (maxV - minV) / 6).toPrecision(6), 30 + i * 101, 575)
            }
            ctx.restore();

            /* animation */
            if(this.encoder) {
                this.encoder.addFrame(ctx);
            }
        }

    });

    app.net = {
        getView: function() {
            if(!this.view) {
                this.view = new View();
            }

            return this.view;
        }
    };

})(app);