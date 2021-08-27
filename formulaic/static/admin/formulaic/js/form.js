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

setTimeout(handleDownloadTags, 100)




function handleDownloadTags(){
    let allTags = document.getElementsByClassName('form-download-tag')
        for( let item of allTags){
          item.addEventListener('click', function(e) {
          const attribute = item.getAttribute('data-target-id')
          e.preventDefault();
          const url = `/download/submissions/?form=${attribute}`;
          $.get(url)
            .done(function pollAsyncResults(data) {
              context: this
              const pollAsyncUrl = `/api/poll_async_results/${data.task_id}`
              $.get(pollAsyncUrl)
                .done(function(asyncData, status, xhr) {
                  context: this
                  if (xhr.status !== 202) {
                    clearTimeout(pollAsyncResults);
                    const a = document.createElement('a');
                    document.body.appendChild(a);
                    a.style='display: none';
                    a.href=asyncData.location;
                    a.download=asyncData.filename;
                    a.click();

                  }
                  else {

                    setTimeout(function() { pollAsyncResults(data) }, 500);
                  }
                })

                .fail(function(xhr, status, error) {
                  clearTimeout(pollAsyncResults);

                })
            })
            .fail(function(xhr, status, error) {

            })
        })
        }
}