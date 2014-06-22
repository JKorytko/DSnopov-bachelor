Backbone.CustomView = Backbone.View.extend({
    getTemplate: function() {
        return $(this.template).text();
    },

    render: function() {
        var template = this.getTemplate(),
            $layout = $(this.layout);

        this.onStartAttach();
        this.$el.html(template);
        $layout.append(this.$el);

        return this;
    },

    remove: function() {
        this.$el.html('');
    },

    onStartAttach: function() {}
});