(function(app) {

    var View = Backbone.CustomView.extend({
        layout: '.secondary-nav',
        template: '#pictogram-form',
        events: {
            'change .inputData': 'onFormChange',
            'click .ok': 'showPictogram',
            'click .cancel': 'cancel'
        },
        dataProps: ['dat', 'measure', 'pmd', 'line', 'momentTime', 'value', 'thickness'],

        onStartAttach: function() {
            this.data = {};
        },

        showPictogram: function() {
            if(this.validate()) {
                this.remove();
                app.sandbox.trigger('pictogram:show', this.data);
            }
        },

        validate: function() {
            var $wrongEl,
                mTimes, MTExists, existingMT = [],
                value, maxValue = 0, valuesArr, possibleValues = [],
                lines, line,
                i, l;

            for(i = 0, l = this.dataProps.length; i < l; i++) {
                if(!this.data[this.dataProps[i]]) {
                    $wrongEl = this.$('[name="' + this.dataProps[i] + '"]');
                    $wrongEl.one('change', function(e) {
                        $(e.target).parent().removeClass('error');
                    });
                    $wrongEl.parent().addClass('error');
                    return;
                }
            }

            line = parseInt(this.data.line);
            lines = this.data.measure.split('\n').length / 4 >> 0;
            if(line < 1 || line > lines) {
                alert('Вы ввели номер несуществующей линии. Количествой линий в файле .measure: ' + lines + '.');
                return;
            }

            mTimes = this.data.dat.split('t=');
            mTimes.shift();
            for(i = 0, l = mTimes.length; i < l; i++) {
                existingMT[i] = parseFloat(mTimes[i]);
                if(this.data.momentTime == existingMT[i]) {
                    MTExists = true;
                }
            }
            if(!MTExists) {
                alert('Вы ввели несуществующий момент времени. Моменты времени, которые находяться в файле: ' + existingMT.join(', ') + '.');
                return;
            }

            value = parseInt(this.data.value);
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

            return true;
        },

        onFormChange: function(e) {
            var target = e.target,
                name = target.name,
                self = this,
                file, reader;

            if(name === 'pmd' || name === 'dat' || name === 'measure') {
                file = target.files[0];
                reader = new FileReader();
                reader.readAsText(file);
                reader.onload = function() {
                    $('.' + name + '-name').text(file.name);
                    self.data[name] = reader.result;
                }
            } else {
                this.data[name] = target.value;
            }
        },

        cancel: function() {
            this.remove();
        }
    });

    app.pictogramForm = {
        getView: function() {
            if(!this.view) {
                this.view = new View();
            }

            return this.view;
        }
    };
})(app);