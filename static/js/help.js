var Help = {
	init: function() {
		alertify.alert(_.template(document.getElementById('helpTmpl').innerHTML));
		var testElement = document.getElementById('testElement');
		testElement.innerText = 'Injecting text in a dialog template';
	},

	log: function(msg) {
		console.log(msg);
	}
};

Help.init();