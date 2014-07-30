var app = (function() {
    var app = {},
        MAIN_URI;

    //parameters
    MAIN_URI = 'http://app.diserver.com/bachelor_program_files/';
    app.PMD_URI = MAIN_URI + 'Kirsha_3.pmd';
    app.MEASURE_URI = MAIN_URI + 'Kirsha_1.measure';
    app.DAT_URI = MAIN_URI + 'res_K_03_cutted.dat';
    app.PICTOGRAM_PARAMS = {
        line: 1,
        momentTime: 0,
        value: 1,
        thickness: 1,
        color: 'black'
    };
    app.NET_PARAMS = {
        momentTime: 0,
        value: 1
    };

    app.sandbox = {};

    _.extend(app, Backbone.Events);
    _.extend(app.sandbox, Backbone.Events);

    return app;
})();

window.onload = function() {
    app.trigger('start');
};