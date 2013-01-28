var config = [{project : "Timeout", 
               AppURL : [{id : "1" , name: "local" , url : "http://10.200.200.201:8888/ns_timeout/"},
                           {id : "2" , name: "app engine" , url : "http://timeout.ask-services.appspot.com/ns_timeout/"},
                           {id : "3" , name: "add your own" , url : "http://replaceYourOwn/ns_timeout/"}], 
               scriptURL : "test_timeout.html"},
              {project : "Deal", 
                  AppURL : [{id : "1" , name: "local" , url : "http://10.200.200.201:8888/ns_deal/"},
                              {id : "2" , name: "app engine" , url : "http://test.ask-services.appspot.com/ns_timeout/"}],
                  scriptURL : "test_deal.html"}
              ];


var renderClientList = function(container){
    $.each(config,function(i,proj){
        var urlSelector = createURLselector(proj);
        var testButton = createTestButton(proj);
        container.append("<tr><td>"+proj.project+"</td><td>"+ urlSelector+"</td><td>"+testButton+"</td></tr>");
    });
}

var createURLselector = function(proj){
    var ret = "<div class=\"input-append\">";
    ret += "<input class=\"input-xlarge\" id="+proj.project+"_appURL"+" type=\"text\" " +
    		" placeholder =\"Please select or input a AppService URL.\" style=\"height: 30px;\" >"; 
    
    ret += "<div class=\"btn-group\">";
    ret += "<button class=\"btn dropdown-toggle\" data-toggle=\"dropdown\">";
    ret += "    select  ";
    ret += "<span class=\"caret\"></span>";
    ret += "</button>";
    ret += "<ul class=\"dropdown-menu\">";
    ret += "    <li><a href=\"#\">Select</a></li>";
    
    $.each(proj.AppURL , function(i,item){
        ret += "    <li><a href=\"javascript:fillURL('"+item.url+"','"+proj.project+"_appURL"+"')\">"+item.name+"</a></li>";
    });
    
    ret += "</ul>";
    ret += "</div>";
    ret += "</div>";
    
    return ret;
}

var fillURL = function(url,targetId){
    console.log($("#"+targetId).val(url));
}

var createTestButton = function(proj){
    var ret = "<a class=\"btn btn-primary\" href=\"javascript:gotoTest('"+proj.project+"_appURL"+"','"+proj.scriptURL+"')\" >Go for a Test</a>";
    return ret;
}

var gotoTest = function(appInput,testScript){
    if($.trim($("#"+appInput).val()) == ""){
        alert("Please fill the testing URL." );
        return false;
    }
    
    sessionStorage.setItem("appService",$("#"+appInput).val());
    window.location.href = "/script/"+testScript;
}
