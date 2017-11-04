$(document).ready(function() {
  let upvotes = $('.upper');
  let downvotes = $('.downer');
  let message = $('#message');

  upvotes.click(function(event) {
    event.preventDefault();
      var id = this.name;
      let rating = $(this).next();
      let ratingNum = Number(rating.text());
      ratingNum++;
      rating.text(ratingNum++);
      $.ajax({
        type: "POST",
        url: 'http://localhost:3000/post/' + id +'/upvote',
      });
      $(this).css('visibility', 'hidden');
      message.text('Vote submitted!');
  });
  downvotes.click(function(event) {
    event.preventDefault();
    voted = true;
    var id = this.name;
    let rating = $(this).prev();
    let ratingNum = Number(rating.text());
    ratingNum--;
    rating.text(ratingNum--);
    $.ajax({
      type: "POST",
      url: 'http://localhost:3000/post/' + id +'/downvote',
    });
    $(this).css('visibility', 'hidden');
    message.text('Vote submitted!');
  });
});


// $(document).ready(function() {
//   var form = $('#submitForm');
//
//   form.click(function(event) {
//     event.preventDefault();
//
//   });
// });
