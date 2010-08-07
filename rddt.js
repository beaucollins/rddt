
var Rddt = function(){
  var self = this;
  var modhash;
  
  var merge = function(options, defaults){
    var setting;
    for(setting in options){
      defaults[setting] = options[setting];
    }
    return defaults;
  }
  
  var object_to_params = function(object){
    if (!object) { return };
    var str_pairs = [];
    var param;
    for (param in object){
      str_pairs.push(param + "=" + object[param]);
    }
    return str_pairs.join("&");
  }
  
  var request = function (path, options){
    options = merge(options, {
      onSuccess: false,
      onFailure: false,
      onTimeout: false,
      method: 'GET',
      parameters: false,
      timeout: 15
    });
    var xhr = new XMLHttpRequest();
    var id = setTimeout(function(){
      xhr.abort();
      if(options.onTimeout) options.onTimeout.apply(self, [xhr]);
    }, options['timeout'] * 1000);
    
    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        clearTimeout(id);
        if (xhr.status == 200) {
          var response_object;
          if (path.match(/\.json/)) {
            eval("response_object = " + xhr.responseText);
          };
          if(options.onSuccess) options.onSuccess.apply(self, [xhr, response_object]);
        }else{
          if(options.onFailure) options.onFailure.apply(self, [xhr]);
        }
      };
    }
    
    xhr.open(options.method, 'http://www.reddit.com/' + path);
    xhr.setRequestHeader('Accept', "application/json, text/javascript, */*");
    if(options.method == 'POST' && options.parameters != false){
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      options.parameters['uh'] = this.modhash;
    }
    xhr.send(object_to_params(options.parameters));
    
    return xhr;
  }
  
  this.get = function(){
    request.apply(this, arguments);
  }
  
  this.post = function(){
    var args = arguments;
    if(args[1]) args[1] = merge({method:'POST'}, args[1]);
    request.apply(this, args);
  }
  
  this.checkMessages = function(){
    var request = this.get('message/unread.json', function(xhr){
      console.log('Messages?', xhr);
    }, function(){
      console.log('Messages Failure?', xhr);
    });
  }
  
  this.getModhash = function(){

    this.get('', {
      onSuccess: function(xhr){
        var match;
        if (match = xhr.responseText.match(/<input[^>]+name="uh"[\s]+value="([^"]+)?"[^>]+>/i)) {
          this.modhash = match[1] || false;
        }else{
          this.modhash = false;
        }
      },
      onFailure: function(xhr){
        delete this.modhash;
        console.log("Couldn't get modhash", this.modhash);
      }
    });

  }
  
  this.getInfo = function(url, page){
    this.get('api/info.json?url=' + url, {
      onSuccess:function(xhr, response_json){
        page.dispatchMessage('rddt:response',response_json);
      },
      onFailure:function(xhr){
        page.dispatchMessage('rddt:response', false);
      }
    });
  }
  
  this.getMessages = function(){
    console.log("Getting messages:", new Date());
    this.get('message/unread.json', {
      onSuccess:function(xhr, response_json){
        console.log('messages', response_json);
        this.messages = response_json;
      },
      onFailure:function(xhr, response_json){
        
      }
    });
  };
  
  this.clearMessages = function(){
    this.messages = null;
    this.stopPolling();
    setTimeout(function(){
      self.pollMessages();
    }, 10000);
  }
  
  this.pollMessages = function(){
    this.getMessages();
    this.pollId = setInterval(function(){
      self.getMessages();
    }, 2 * 60 * 1000); // 2 minutes, is that sane?
  }
  
  this.stopPolling = function(){
    clearInterval(this.pollId)
  };
  
  this.vote = function(options){
    // we need the thing_id the direction note sure about the votehash, is it required?, nope
    this.post('api/vote.json', {
      parameters:options,
      onSuccess:function(xhr, response_json){
        console.log("I voted!", options, response_json);
      },
      onFailure:function(xhr, response_json){
        console.log("Voting sucks anyway", options, response_json);
      }
    });
  }
  
  this.init = function(){
    // retrieve our modhash!
    this.getModhash();
    this.pollMessages();
  };
    
}

var rddt = new Rddt();
rddt.init();

function rddtMessage(messageEvent){
  if (messageEvent.name == "rddt:request"){
    rddt.getInfo(messageEvent.message, messageEvent.target.page);
  }else if (messageEvent.name == 'rddt:vote') {
    rddt.vote(messageEvent.message);
  }else if (messageEvent.name == 'rddt:unread') {
    messageEvent.target.page.dispatchMessage('rddt:unread', rddt.messages);
  }else if (messageEvent.name == 'rddt:clicked_envelope'){
    rddt.clearMessages();
  };        
}

safari.application.addEventListener("message", rddtMessage, false);

