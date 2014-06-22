(function(app) {
    var sandbox = app.sandbox;

    //related to generating
    sandbox.on('generate:pmd', function() {
        app.pmd.getView().render();
        app.netForm.getView().remove();
        app.pictogramForm.getView().remove();
    });

    //related to pictogram
    sandbox.on('pictogram:showForm', function() {
        app.pictogramForm.getView().render();
        app.netForm.getView().remove();
        app.pmd.getView().remove();
    });

    sandbox.on('pictogram:show', function(data) {
        app.pictogram.getView().render().$calculate(data);
        app.mainNavigation.getView().$showPictogramButtons();
    });

    sandbox.on('pictogram:showAddValueForm', function() {
        app.addValueForm.getView().render();
    });

    sandbox.on('pictogram:add', function(data) {
        app.pictogram.getView().createNewPict(data);
    });

    sandbox.on('pictogram:remove', function() {
        app.pictogram.getView().remove();
        app.addValueForm.getView().remove();
    });

    //related to net
    sandbox.on('net:showForm', function() {
        app.netForm.getView().render();
        app.pictogramForm.getView().remove();
        app.pmd.getView().remove();
    });

    sandbox.on('net:show', function(data) {
        app.net.getView().render().$calculate(data);
        app.mainNavigation.getView().$showNetButtons();
    });

    sandbox.on('net:changeVisibility', function() {
        app.net.getView().$changeVisibility();
    });

    sandbox.on('net:stopAnimation', function() {
        app.net.getView().$stopAnimation();
    });

    sandbox.on('net:stopAnimationFromNet', function() {
        app.mainNavigation.getView().$setStoppedState();
    });

    sandbox.on('net:animateMomentTimes', function(data) {
        app.net.getView().$animateMomentTimes(data);
    });

    sandbox.on('net:showPrevMomentTime', function() {
        app.net.getView().$showPrevMomentTime();
    });

    sandbox.on('net:showNextMomentTime', function() {
        app.net.getView().$showNextMomentTime();
    });

    sandbox.on('net:remove', function() {
        app.net.getView().$stopAnimation();
        app.net.getView().remove();
    });

})(app);