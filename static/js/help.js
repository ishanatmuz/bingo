var Help = {
	init: function() {
		window.onload = function() {
			var helpIcon = document.getElementById('help-icon');
			helpIcon.addEventListener('click', function() {
				// Displaying the help dialog
				alertify.okBtn("Close").alert(_.template(document.getElementById('helpTmpl').innerHTML));
			});
			var xpadIcon = document.getElementById('xpad-icon');
			xpadIcon.addEventListener('click', function() {
				// Displayig the gamepad dialog
				alertify.okBtn("Close").alert(_.template(document.getElementById('xpadTmpl').innerHTML));
			});
		}
	}
};

Help.init();