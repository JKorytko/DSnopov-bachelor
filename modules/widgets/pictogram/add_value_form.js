(function(app) {

    var View = Backbone.CustomView.extend({
        layout: '.secondary-nav',
        template: '#add-value-form',
        events: {
            'click .ok': 'addValue',
            'click .cancel': 'cancel'
        },

        pictProps: ['value', 'momentTime', 'thickness'],

        addValue: function() {
            var pictParam = {
                value: parseInt(this.$('[name="value"]').val()),
                momentTime: parseFloat(this.$('[name="momentTime"]').val()),
                thickness: parseInt(this.$('[name="thickness"]').val()),
                color: this.$('[name="color"]').val()
            };

            if(this.validate(pictParam)) {
                app.sandbox.trigger('pictogram:add', pictParam);
                this.remove();
            }
        },

        validate: function(pictParam) {
            var $wrongEl,
                mTimes, MTExists, existingMT = [],
                value, maxValue = 0, valuesArr, possibleValues = [],
                i, l;

            for(i = 0, l = this.pictProps.length; i < l; i++) {
                if(!pictParam[this.pictProps[i]]) {
                    $wrongEl = this.$('[name="' + this.pictProps[i] + '"]');
                    $wrongEl.one('change', function(e) {
                        $(e.target).parent().removeClass('error');
                    });
                    $wrongEl.parent().addClass('error');
                    return;
                }
            }

            mTimes = _.clone(app.pictogram.getView().mTimes); //dn!
            mTimes.shift();
            value = parseInt(pictParam.value);
            valuesArr = mTimes[0].split('\n')[1].split(' ');
            for(i = 1; i < valuesArr.length; i++) {
                if(!isNaN(parseFloat(valuesArr[i]))) {
                    maxValue++;
                    possibleValues.push(i);
                }
            }
            if(value < 1 || value > 5) {
                alert('Вы ввели несуществующую величину. Возможные величины: ' + possibleValues.join(', ') + '.');
                return;
            }

            for(i = 0, l = mTimes.length; i < l; i++) {
                existingMT[i] = parseFloat(mTimes[i]);
                if(pictParam.momentTime == existingMT[i]) {
                    MTExists = true;
                }
            }
            if(!MTExists) {
                alert('Вы ввели несуществующий момент времени. Моменты времени, которые находяться в файле: ' + existingMT.join(', ') + '.');
                return;
            }

            return true;
        },

        cancel: function() {
            this.remove();
        }
    });

    app.addValueForm = {
        getView: function() {
            if(!this.view) {
                this.view = new View();
            }

            return this.view;
        }
    };
})(app);