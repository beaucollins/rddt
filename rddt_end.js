(function(){
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
    alien.className = 'loading';

    var canonical = document.querySelector('link[rel=canonical]');
    var titleNode;
    if(titleNode = document.querySelector('title')) {
      var title = titleNode.firstChild.nodeValue;
    }else{
      title = false;
    }
    var loc = window.location;
    if (canonical) {
      url = canonical.href;
      if (loc.hash != "") {
        url += "#" + loc.hash;
      };
    } else {
      url = loc.href;
    };

    var topComments = function(list){
      var top;
      for(var i=0;i<list.length;i++){
        if(!top){
          top = list[i];
        }else if(list[i].data.num_comments > top.data.num_comments){
          top = list[i]
        }
      }
      return top;
    };

    function getRddtData(event){
      if (event.name == "rddt:response") {
        alien.className = '';
        throbber.className = "off";

        var listing = event.message;

        if(listing){
          var latest = topComments(listing.data.children).data;
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
          submit.href = "http://reddit.com/submit?url=" + url;
          if(title) submit.href += "&title=" + title;
          setTimeout(function(){
            rddt.className += ' submit';
          }, 100)
        }
      };
    }

    safari.self.addEventListener("message", getRddtData, false);
    safari.self.tab.dispatchMessage("rddt:request", url);  
  }
  
})()
