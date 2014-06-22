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
            var $wrongEl;

            for(var i = 0, l = this.dataProps.length; i < l; i++) {
                if(!this.data[this.dataProps[i]]) {
                    $wrongEl = this.$('[name="' + this.dataProps[i] + '"]');
                    $wrongEl.one('change', function(e) {
                        $(e.target).parent().removeClass('error');
                    });
                    $wrongEl.parent().addClass('error');
                    return;
                }
            }
            this.remove();
            app.sandbox.trigger('pictogram:show', this.data);
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