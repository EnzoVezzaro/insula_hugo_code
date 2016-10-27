  jQuery(document).ready(function($) {
    $('#commentform').validate({

    rules: {
      author: {
        required: true,
        minlength: 2
      },

      email: {
        required: true,
        email: true
      },

      comment: {
        required: true,
      }
    },

    messages: {
      author: "Please fill the required field(Name)",
      email: "Please enter a valid email address.",
      comment: "Please fill the required field(Comment)"
    },

    errorElement: "div",
    errorPlacement: function(error, element) {
      element.after(error);
    }

    });
    });