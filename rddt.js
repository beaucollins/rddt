
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
  
  var request = function (path, options){
    options = merge(options, {
      onSuccess: false,
      onFailure: false,
      method: 'GET',
      parameters: false
    });
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          if(options.onSuccess) options.onSuccess.apply(self, [xhr]);
        }else{
          if(options.onFailure) options.onFailure.apply(self, [xhr]);
        }
      };
    }
    
    xhr.open(options.method, 'http://www.reddit.com/' + path);
    xhr.send(options.parameters);
    
    
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
      console.log('Success?', xhr);
    }, function(){
      console.log('Failure?', xhr);
    });
  }
  
  this.getModhash = function(){

    var request = this.get('', {
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
        console.log('failure', this);
      }
    });
  }
  
  this.init = function(){
    // retrieve our modhash!
    this.getModhash();
  };
    
}

function rddtRequestData(messageEvent){
  if (messageEvent.name == "rddt:request"){
    var request = new XMLHttpRequest();
    var location = messageEvent.message;
    request.onreadystatechange = function(xhrEvent){
      if (request.readyState == 4) {
        var response_object;
        if (request.status == 404) {
          //error
          messageEvent.target.page.dispatchMessage('rddt:response', false);
        }else{
          
          eval("response_object = " + request.responseText);
          messageEvent.target.page.dispatchMessage('rddt:response',response_object);
        };
      };
    }
    
    request.open("GET", 'http://www.reddit.com/api/info.json?url=' + location);
    request.send();
    
  };        
}

var rddt = new Rddt();
rddt.init();

safari.application.addEventListener("message", rddtRequestData, false);

