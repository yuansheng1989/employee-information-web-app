function hidePasswordMessages() {
    $("#passwordChangeSuccess").addClass("hide");
    $("#passwordChangeError").addClass("hide");
}

function requestPasswordChange(username) {
    $.ajax({
        url: "/api/updatePassword",
        type: "POST",
        data: JSON.stringify({
            user: username,
            currentPassword: $("#currentPassword").val(),
            password: $("#password").val(),
            password2: $("#password2").val(),
        }),
        contentType: "application/json"
    })
    .done(function(data) {
        hidePasswordMessages();
        if (data.successMessage) {
            $("#passwordChangeSuccess").removeClass("hide").children(".alert").text(data.successMessage);
        } else if (data.errorMessage) {
            $("#passwordChangeError").removeClass("hide").children(".alert").text(data.errorMessage);
        }
    })
    .fail(function(jqXHR) {
        $("#passwordChangeError").removeClass("hide").children(".alert").text("AJAX Error: " + jqXHR.responseText);
    });
}

$(document).ready(function() {
    // Bootstrap Modal Event - "hidden.bs.modal"
    // This event is fired when the modal has finished being hidden from the user
    $("#profileModal").on("hidden.bs.modal", function() {
        $(".passwordReset").val("");
        hidePasswordMessages();
    });
});