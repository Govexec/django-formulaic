var content_changed = false;

(function($){
	$(document).ready(function(){
        initEditFields();

        function initEditFields() {
            $(document).ready(function() {
                $("#edit_fields_dialog").dialog({
                    autoOpen: false,
                    width: 850,
                    resizeable: false,
                    modal: true,
                    draggable: false,
                    create: function(event) {
                        $(event.target).parent().css('position', 'fixed');
                    }
                });

                $("#edit_fields").click(function() {
                    $("#edit_fields_dialog").dialog("open");
                    return false;
                });
            });
        }

	});
 }(django.jQuery));
