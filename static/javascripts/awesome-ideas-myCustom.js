   
/*****FOR single POST PAGE FORMAT*****/
(function($){
  	$('.variation_pro a').on('click',function(){

        var varion_select_id="#"+$(this).closest('.variation_pro').data('name');
        var variation_select_val=$(this).data('val');
        $(varion_select_id).val(variation_select_val);
        $('.variations_li').removeClass('selected');
        $(this).closest('.variations_li').addClass('selected');
        $(varion_select_id).trigger('change');      
        
    });
    $(".lktr").on("click",function()
	{			

		var post_id=$(this).data("src");			
		var data={action:"postLike",post_id:post_id};		
		$.post(aisettings.ajaxurl,data,function(res)
		{	
			if(res!=-1)
			{		
				$(".p_like_"+post_id).html(res);	
                                
			}
			else
			{					
				alert("Already Liked");	
			}
		});			
	});
	if(jQuery('.work-fig').length){
           var container = document.querySelector('.work-fig');
           //create empty var msnry
           var msnry;
           // initialize Masonry after all images have loaded
           imagesLoaded( container, function() {
               msnry = new Masonry( container, {
                   itemSelector: '.masonry-entry',
                "gutter": 20
               });
           });
            }
    
 })(jQuery);

