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
            var value = this.$('[name="value"]').val(),
                momentTime = this.$('[name="momentTime"]').val(),
                thickness = this.$('[name="thickness"]').val(),
                color = this.$('[name="color"]').val(),
                pictParam,
                $wrongEl;

            pictParam = {
                value: parseInt(value),
                momentTime: parseFloat(momentTime),
                thickness: parseInt(thickness),
                color: color
            };

            for(var i = 0, l = this.pictProps.length; i < l; i++) {
                if(!pictParam[this.pictProps[i]]) {
                    $wrongEl = this.$('[name="' + this.pictProps[i] + '"]');
                    $wrongEl.one('change', function(e) {
                        $(e.target).parent().removeClass('error');
                    });
                    $wrongEl.parent().addClass('error');
                    return;
                }
            }

            app.sandbox.trigger('pictogram:add', pictParam);
            this.remove();
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