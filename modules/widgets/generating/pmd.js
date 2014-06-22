(function(app) {

    var View = Backbone.CustomView.extend({
        layout: '.secondary-nav',
        template: '#pmd-template',
        events: {
            'click .ok': 'checkInput',
            'click .cancel': 'cancel',
            'change .inputData': 'onFormChange'
        },

        dataProps: ['nlist', 'elist'],

        onStartAttach: function() {
            this.data = {};
        },

        onFormChange: function(e) {
            var target = e.target,
                name = target.name,
                self = this,
                file, reader;

            file = target.files[0];
            reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function() {
                $('.' + name + '-name').text(file.name);
                self.data[name] = reader.result;
            }
        },

        checkInput: function() {
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
            this.generatePmdAndSave();
        },

        generatePmdAndSave: function() {
            var result = [],
                blob,
                nListSplitted = this.data['nlist'].split('\n'),
                eListSplitted = this.data['elist'].split('\n'),
//                dListSplitted = this.data['dlist'].split('\n'),
                nodesForElements = [],
                koordsForNodes = [],
                contacts = [],
                tempArr, tempStr, counter,
                i, j, l;

            //calculating
            //NLIST
            for(i = 3, l = nListSplitted.length; i < l; i++) {
                tempArr = nListSplitted[i].split(' ');
                if(!isNaN(parseInt(tempArr[tempArr.length - 1]))) {
                    tempStr = '';
                    counter = 0;
                    for(j = 0; j < tempArr.length; j++) {
                        if(!isNaN(parseFloat(tempArr[j]))) {
                            if(counter) {
                                tempStr += tempArr[j] + '\n';
                            }
                            counter++;
                        }
                        if(counter === 3) {
                            koordsForNodes.push(tempStr);
                            break;
                        }
                    }
                }
            }
            //ELIST
            for(i = 3, l = eListSplitted.length; i < l; i++) {
                tempArr = eListSplitted[i].split(' ');
                if(!isNaN(parseInt(tempArr[tempArr.length - 1]))) {
                    tempStr = '\n';
                    counter = 0;
                    for(j = tempArr.length - 2; j > 0; j--) {
                        if(!isNaN(parseInt(tempArr[j]))) {
                            tempStr = tempArr[j] + ' ' + tempStr;
                            counter++;
                        }
                        if(counter === 3) {
                            nodesForElements.push(tempStr);
                            break;
                        }
                    }
                }
            }
            //DLIST
//            for(i = 3, l = dListSplitted.length; i < l; i++) {
//                counter = parseFloat(dListSplitted[i]);
//                if(!isNaN(counter)) {
//                    tempStr = counter.toString();
//                    if(/UX/.test(dListSplitted[i])) {
//                        counter = 2;
//                    } else {
//                        counter = 1;
//                    }
//                    tempStr += ' ' + counter + '\n';
//                    contacts.push(tempStr);
//                }
//            }
            //SFLIST
            //TODO!!!

            //[settings]
            result.push('[settings]\n');
            result.push('n_nodes=' + koordsForNodes.length + '\n');
            result.push('n_elements=' + nodesForElements.length + '\n');
            result.push('n_contacts=' + contacts.length + '\n');
            result.push('n_forces=' + 0 + '\n'); //TODO!!!
            //[inds]
            result.push('[inds]\n');
            result = result.concat(nodesForElements);
            //[koor]
            result.push('[koor]\n');
            result = result.concat(koordsForNodes);
            //[concat] TODO!!!
//            result.push('[concat]\n');
//            result = result.concat(contacts);
            //[force] TODO!!!
//            result.push('[force]\n');

            //saving

            blob = new Blob(result, {type: "text/plain;charset=utf-8"});
            saveAs(blob, 'out.pmd');

        },

        cancel: function() {
            this.remove();
        }
    });

    app.pmd = {
        getView: function() {
            if(!this.view) {
                this.view = new View();
            }

            return this.view;
        }
    };
})(app);