
(function(){
  
  if(window.top !== window) return; //short circuit for frames
  
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
  
  
  var TimeDifference = function(time_point){

    var thresholds = 
      {'second': 60,
      'minute': 60,
      'hour': 24,
      'day': 7,
      'week': 4,
      'month': 12,
      'year': null};

    this.timeDifference = function(){
      var d = new Date();
      return d.getTime() - time_point;
    }

    this.humanReadable = function(){
      var milli = this.timeDifference();
      var units;
      var unit;
      var mx = 1000;
      for(unit in thresholds){
        units = Math.floor(milli/mx);
        if (units < thresholds[unit]) {
          break;
        }else{
         mx *= thresholds[unit];
        }
      }
      return units + ' ' + (unit + (units != 1 ? 's' : ''));
    }
  };
  
  var RddtBar = (function(container){

    var submission;
    
    var bar = document.createElement('rddt-bar');
    var vote_panel = document.createElement('rddt-vote-panel');
    var up_button = document.createElement('rddt-upvote');
    var down_button = document.createElement('rddt-downvote');
    var throbber = document.createElement('rddt-throbber');
    var alien = document.createElement('rddt-alien');
    
    var score_panel = document.createElement('rddt-score-panel');
    score_panel.className = 'rddt-panel';
    var submission_score = document.createElement('rddt-submission-score');
    var comments = document.createElement('a');
    comments.className = 'rddt-comments';

    var info_panel = document.createElement('rddt-submission-info-panel');
    info_panel.className = 'rddt-panel';
    var info_wrapper = document.createElement('rddt-submission-info');
    var title = document.createElement('a');
    title.className = 'rddt-submission-title';
    var time = document.createElement('rddt-time');
    var user = document.createElement('a');
    user.className = 'rddt-user';
    var subreddit = document.createElement('a');
    subreddit.className = 'rddt-sub';
    
    var message_panel = document.createElement('rddt-message-panel');
    var message_link = document.createElement('a');
    message_link.className = 'rddt-message-bttn';
    var message_image = document.createElement('rddt-envelope');
    
    
    var close_btn = document.createElement('rddt-close-bttn');
    var close_inner = document.createElement('rddt-close-bttn-padding');

    close_inner.appendChild(document.createTextNode("◀"));
    close_btn.appendChild(close_inner);
    close_btn.className = 'rddt-panel';

    container.appendChild(bar);

    //append time!
    score_panel.appendChild(alien);
    vote_panel.appendChild(throbber);
    info_wrapper.appendChild(title);
    info_wrapper.appendChild(document.createTextNode(' '));
    info_wrapper.appendChild(time)
    info_wrapper.appendChild(user)
    info_wrapper.appendChild(subreddit);
    info_panel.appendChild(info_wrapper);

    message_link.appendChild(message_image);
    message_link.href = 'http://www.reddit.com/message/unread';
    message_link.addEventListener('click', function(e){
      safari.self.tab.dispatchMessage("rddt:clicked_envelope");
    });
    
    message_panel.appendChild(message_link);
    
    bar.appendChild(message_panel);
    bar.appendChild(vote_panel);
    bar.appendChild(score_panel);
    
    var toggle = function(e){
      container.className = (container.className == '' ? 'off' : '');
    }

    var toggleUp = function(e){
      if (vote_panel.className == 'up') {
        vote_panel.className = '';
        safari.self.tab.dispatchMessage("rddt:vote", {
          dir: 0,
          id: submission.name
        });  
      } else {
        vote_panel.className = 'up'
        safari.self.tab.dispatchMessage("rddt:vote", {
          dir: 1,
          id: submission.name
        });  
      }
    }

    var toggleDown = function(e){
      if (vote_panel.className == 'down') {
        vote_panel.className = '';
        safari.self.tab.dispatchMessage("rddt:vote", {
          dir: 0,
          id: submission.name
        });  
      } else {
        vote_panel.className = 'down'
        safari.self.tab.dispatchMessage("rddt:vote", {
          dir: -1,
          id: submission.name
        });  
      }
    }

    this.up_button = up_button;
    this.down_button = down_button;

    this.setSubmission = function(new_submission){
      
      
      submission = new_submission;
      
      
      var permalink_url = 'http://www.reddit.com' + submission.permalink;
      var subreddit_url = 'http://www.reddit.com/r/' + submission.subreddit;
      var user_url = 'http://www.reddit.com/user/' + submission.user;
      var submission_url = submission.url;
      
      if (submission.likes === true) {
        vote_panel.className = 'up';
      } else if(submission.likes === false) {
        vote_panel.className = 'down';
      } else {
        vote_panel.className = '';
      }
      
      vote_panel.appendChild(up_button);
      vote_panel.appendChild(down_button);

      score_panel.appendChild(submission_score);
      score_panel.appendChild(comments);

      var score_txt = document.createTextNode(submission.score);
      var comments_txt = document.createTextNode(submission.num_comments);

      submission_score.appendChild(score_txt);
      comments.appendChild(comments_txt);
      comments.href = permalink_url;

      title.appendChild(document.createTextNode(submission.title));
      title.title = submission.title;
      title.href = submission_url;

      var td = new TimeDifference(submission.created_utc * 1000);
      time.appendChild(document.createTextNode(td.humanReadable()));
      user.appendChild(document.createTextNode(submission.author));
      user.href = user_url;
      subreddit.appendChild(document.createTextNode(submission.subreddit));
      subreddit.href = subreddit_url;

      bar.appendChild(info_panel);

      bar.appendChild(close_btn);

      close_btn.addEventListener('click', toggle);
      up_button.addEventListener('click', toggleUp);
      down_button.addEventListener('click', toggleDown);
    }
    
    this.unreadMessages = function(){
      message_panel.className = 'on';
    }
    
    this.noMessages = function(){
      message_panel.className = '';
    }
    
    this.finishedLoading = function(){
      alien.parentNode.removeChild(alien);
      throbber.parentNode.removeChild(throbber);
    }

  });
  
  document.addEventListener('DOMContentLoaded', function(){

    var b = document.getElementsByTagName('body')[0];
    var rddt = document.createElement('rddt');
    rddt.id = "rddt";
    rddt.className = 'loading';

    b.appendChild(rddt);

    var bar = new RddtBar(rddt);  


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
    
    function getRddtData(event){
      if (event.name == "rddt:response") {
        if(event.message){
          var listing = event.message;
          var submissions = listing.data.children;
          if(submissions.length > 0){
            var latest = listing.data.children[listing.data.children.length-1].data;
            bar.setSubmission(latest);
            var count = latest.num_comments;
          }else{
            console.log('no listings');
          }
          setTimeout(function(){
            rddt.className = '';
            
            setTimeout(function(){
              bar.finishedLoading();
            }, 500);
            
          }, 100)
        } else {
          console.log("Failure people!");
        }
      } else if (event.name == 'rddt:unread') {
        console.log('rddt:unread', event.message);
        if (event.message && event.message.data.children.length > 0) {
          bar.unreadMessages();
        }else{
          bar.noMessages();
        };
      };
    }

    safari.self.addEventListener("message", getRddtData, false);
    
    safari.self.tab.dispatchMessage("rddt:request", url);  
    safari.self.tab.dispatchMessage("rddt:unread");
    setInterval(function(){
      safari.self.tab.dispatchMessage("rddt:unread");
    }, 30 * 1000); //this doesn't actually cause any HTTP requests

  });

})()


