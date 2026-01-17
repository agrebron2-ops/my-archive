    
var num = 0;

        $(document).ready(function(){
             
            $("#sub").click(function(){
                var name = $("input[name=message]").val();
                $("#space").append("<h1>"+name+"'s bakery</h1>")
            })
            
            $("#cookie").on('click',function(){
                num+=1;
                $('#numbers').append("<p class = nm> " + num + " <p>");
                
                
                if(num >= 10 ){
                    num += 2;
                }
                
                if(num >= 500) {
                    num += 4;
                }
                if(num >= 3000) {
                    num += 10;
                }
                if(num >= 10000) {
                    num += 40;
                }
                if(num >= 40000) {
                    num += 100;
                }
                if(num >= 200000) {
                    num += 400;
                }
            });
           
            
            $("#cookie").draggable();
            
          $("#cookie").mouseenter(function(){
            $("#cookie").animate({
              width: '+= 5',
              height: '+= 5'
            });
          });
          
                      
          //$("#cookie").mouseleave(function(){
            /*$("#cookie").animate({
              width: '-= 5',
              height: '-= 5'
           });*/
   });