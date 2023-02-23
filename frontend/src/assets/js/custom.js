$(document).ready(function () {
  $(".form-select").select2();

  $(".navbar-toggle").click(function () {
    $("body").toggleClass("sidebar-collapsein");
  });
  $(".sidebar-toggle").click(function () {
    $("body").toggleClass("sidebar-collapsein");
  });
  //     $(".menu-sidebar").mouseenter(function(){
  //          $("body").addClass("sidebar-collapsein");
  //     });
  //     $(".menu-sidebar").mouseleave(function(){
  //          $("body").removeClass("sidebar-collapsein");
  //     });

  $(".dark-light-toggle").click(function () {
    $("body").toggleClass("dark-active");
  });
});

document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((tooltip) => {
  new bootstrap.Tooltip(tooltip);
});
