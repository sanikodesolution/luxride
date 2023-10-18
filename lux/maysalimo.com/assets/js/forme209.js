(function ($) {
  ("use strict");

  $(document).ready(function () {
    
    $("#submitForm").on("click", function (e) {
      
      e.preventDefault();
      $.ajax({
        url: "https://us-central1-maysalimo.cloudfunctions.net/sendEmail",
        type: "POST",
        data: {
          fullname: $("#fullname").val(),
          email: $("#email").val(),
          subject: $("#subject").val(),
          message: $("#message").val(),
        },
        success: function (data) {
          console.log("Data sent successfully");
          $("#dialog-message").dialog({
            modal: true,
            buttons: {
              Ok: function () {
                $(this).dialog("close");
              },
            },
          });
          $("#submitForm").prop("disabled", true);
        },
        error: function (data) {
          console.error("An error occurred.");
        },
      });
    });
  });
})(jQuery);
