var app = {};

app.sandbox = {};

_.extend(app, Backbone.Events);
_.extend(app.sandbox, Backbone.Events);

window.onload = function() {
    app.trigger('start');
}