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
    setTimeout(handleDownloadTags, 100)

    function pollAsyncResults(data) {
            $.ajaxSetup({ cache: false, timeout: 360000 });
            context: this
                  const pollAsyncUrl = `/formulaic/api/poll_async_results/${data.task}`
                  $.get(pollAsyncUrl)
                    .done(function(asyncData, status, xhr) {
                      context: this
                      if (xhr.status === 202) {
                        clearTimeout(pollAsyncResults);
                        const a = document.createElement('a');
                        document.body.appendChild(a);
                        a.style='display: none';
                        a.href=asyncData.location;
                        a.download=asyncData.filename;
                        a.click();
                      }
                      else {
                          console.log('here')
                        setTimeout(function() { pollAsyncResults(data) }, 5000);
                      }
                    })

                    .fail(function(xhr, status, error) {
                      clearTimeout(pollAsyncResults);

                    })
    }

    function handleDownloadTags(){
        let allTags = document.getElementsByClassName('form-download-tag')
            for( let item of allTags){
              item.addEventListener('click', function(e) {
              const attribute = item.getAttribute('data-target-id')
              e.preventDefault();
              const url = `/formulaic/download/submissions/?form=${attribute}`;
              $.get(url)
                .done(data => pollAsyncResults(data))
            })
            }
    }
	});
 }(django.jQuery));

