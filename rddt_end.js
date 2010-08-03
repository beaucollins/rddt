if(window.top === window){
  var body = document.getElementsByTagName('body')[0];
  var alien = document.createElement('rddt_alien');
  var rddt = document.createElement('rddt');
  var throbber = document.createElement('rddt_throbber');
  var submit = document.createElement('a');
  submit.id = "rddt_submit";
  submit.href = '#';
  submit.appendChild(document.createTextNode('Submit Link'));
  
  var comments = document.createElement('a')
  comments.id = 'rddt_comments';
  
  rddt.id = "rddt"
  rddt.appendChild(throbber);
  rddt.appendChild(alien);

  body.appendChild(rddt);
  
  rddt.className = 'loaded';
  
  var canonical = document.querySelector('link[rel=canonical]');
  if (canonical) {
    url = canonical.href;
  } else {
    url = window.location.href;
    title = document.querySelector('title').nodeValue;
  };
  
  function getRddtData(event){
    if (event.name == "rddt:response") {
      throbber.className = "off";
  
      var listing = event.message;

      if(listing){
        var latest = listing.data.children[listing.data.children.length - 1].data;
        var count = latest.num_comments;
        comments.appendChild(document.createTextNode(count));
        comments.href = "http://reddit.com/" + latest.permalink;
        rddt.appendChild(comments);
        setTimeout(function(){
          rddt.className += ' comments';
        });
      }else{
        //not submitted, show a submission link/button
        rddt.appendChild(submit);
        submit.href = "http://reddit.com/submit?url=" + url + "&title=" + title;
        setTimeout(function(){
          rddt.className += ' submit';
        }, 100)
      }
    };
  }
  
  safari.self.addEventListener("message", getRddtData, false);
  safari.self.tab.dispatchMessage("rddt:request", url);  
}
