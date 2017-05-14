var Help = {
	init: function() {
		window.onload = function() {
			var helpIcon = document.getElementById('help-icon');
			helpIcon.addEventListener('click', function() {
				// Displaying the help dialog
				alertify.okBtn("Close").alert(_.template(document.getElementById('helpTmpl').innerHTML));
			});
		}
	}
};

Help.init();