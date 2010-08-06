
(function(){
  if (document.getElementsByTagName('rddt').length > 0) { return; };
  if(window.top !== window) return; //short circuit for frames
  
  console.log('must be an image or something');
  
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
    
    var self = this;
    
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
    var comments = document.createElement('rddt-comments');
    var alien = document.createElement('rddt-alien');

    var info_panel = document.createElement('rddt-submission-info-panel');
    info_panel.className = 'rddt-panel';
    var info_wrapper = document.createElement('rddt-submission-info');
    var title = document.createElement('rddt-submission-title');
    var time = document.createElement('rddt-time');
    var user = document.createElement('rddt-user');
    var subreddit = document.createElement('rddt-sub');

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

    bar.appendChild(vote_panel);
    bar.appendChild(score_panel);

    var toggle = function(e){
      container.className = (container.className == '' ? 'off' : '');
    }

    var toggleUp = function(e){
      console.log(this, submission);
    }

    var toggleDown = function(e){
      console.log(this, submission);
    }

    this.up_button = up_button;
    this.down_button = down_button;

    this.setSubmission = function(new_submission){
      submission = new_submission;

      vote_panel.appendChild(up_button);
      vote_panel.appendChild(down_button);

      score_panel.appendChild(submission_score);
      score_panel.appendChild(comments);

      var score_txt = document.createTextNode(submission.score);
      var comments_txt = document.createTextNode(submission.num_comments);

      submission_score.appendChild(score_txt);
      comments.appendChild(comments_txt);

      title.appendChild(document.createTextNode(submission.title));
      title.title = submission.title;

      var td = new TimeDifference(submission.created_utc * 1000);
      time.appendChild(document.createTextNode(td.humanReadable()));
      user.appendChild(document.createTextNode(submission.author));
      subreddit.appendChild(document.createTextNode(submission.subreddit));

      bar.appendChild(info_panel);

      bar.appendChild(close_btn);

      close_btn.addEventListener('click', toggle);
      up_button.addEventListener('click', toggleUp);
      down_button.addEventListener('click', toggleDown);
    }

  });
  


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
        var listing = event.message;
        var submissions = listing.data.children;
        if(submissions.length > 0){
          var latest = listing.data.children[0].data;
          bar.setSubmission(latest);
          var count = latest.num_comments;
        }else{
          console.log('no listings');
        }

        setTimeout(function(){
          rddt.className = '';
        }, 100)
      };
    }

    safari.self.addEventListener("message", getRddtData, false);

    safari.self.tab.dispatchMessage("rddt:request", url);  


})()


