(function(app) {

    var View = Backbone.CustomView.extend({
        layout: '.main-nav',
        template: '#main-navigation',
        events: {
            'click #pict-create': 'showPictogramForm',
            'click #pict-add-value': 'addPictogram',
            'click #pict-delete': 'removePictograms',

            'click #net-create': 'showNetForm',
            'click #net-visibility': 'changeNetVisibility',
            'click #net-prev': 'showPrevMomentTime',
            'click #net-start': 'animateMomentTimes',
            'click #net-next': 'showNextMomentTime',
            'click #net-delete': 'removeNet',

            'click #generate-pmd': 'showGeneratePmd'
        },

        onStartAttach: function() {
            this.isMTAnimating = false;
        },

        showGeneratePmd: function() {
            app.sandbox.trigger('generate:pmd')
        },

        showPictogramForm: function() {
            app.sandbox.trigger('pictogram:showForm');
        },

        addPictogram: function() {
            app.sandbox.trigger('pictogram:showAddValueForm');
        },

        removePictograms: function() {
            this.$('#pict-buttons').slideToggle();
            this.$('#main-buttons').slideToggle();
            app.sandbox.trigger('pictogram:remove');
        },

        $showPictogramButtons: function() {
            this.$('#main-buttons').slideToggle();
            this.$('#pict-buttons').slideToggle();
        },

        showNetForm: function() {
            app.sandbox.trigger('net:showForm');
        },

        changeNetVisibility: function() {
            app.sandbox.trigger('net:changeVisibility');
        },

        showPrevMomentTime: function() {
            app.sandbox.trigger('net:showPrevMomentTime');
        },

        animateMomentTimes: function() {
            var $speedEl = this.$('.speed'),
                speed = $speedEl.val();

            if(this.isMTAnimating) {
                this.isMTAnimating = false;
                this.$('#net-start').text('Start');
                app.sandbox.trigger('net:stopAnimation');
            } else {
                //speed validation
                speed = +speed;
                if(!speed || isNaN(speed)) {
                    $speedEl.one('change', function(e) {
                        $(e.target).parent().removeClass('error');
                    });
                    $speedEl.parent().addClass('error');
                    return;
                }
                if(speed < 100) {
                    speed = 100;
                }
                if(speed > 5000) {
                    speed = 5000;
                }

                this.isMTAnimating = true;
                this.$('#net-start').text('Stop');
                app.sandbox.trigger('net:animateMomentTimes', speed);
            }
        },

        showNextMomentTime: function() {
            app.sandbox.trigger('net:showNextMomentTime');
        },

        $setStoppedState: function() {
            this.isMTAnimating = false;
            this.$('#net-start').text('Start');
        },

        removeNet: function() {
            this.$('#main-buttons').slideToggle();
            this.$('#net-buttons').slideToggle();
            this.isMTAnimating = false;
            this.$('#net-start').text('Start');
            app.sandbox.trigger('net:remove');
        },

        $showNetButtons: function() {
            this.$('#main-buttons').slideToggle();
            this.$('#net-buttons').slideToggle();
        }
    });

    app.on('start', function() {
        app.mainNavigation.view = new View();
        app.mainNavigation.view.render();
    });

    app.mainNavigation = {
        getView: function() {
            return this.view;
        }
    }
})(app);