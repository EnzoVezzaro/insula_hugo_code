/*****FOR BLOG PAGE TEMPLATE OPTION*****/
  
    jQuery("div#ideas_cmb_page_metabox").show();
   if(jQuery('#page_template').val()=='page_templates/page-blog.php')
    {
        jQuery("div#ideas_cmb_post_cat_blog_page_option").show();
        jQuery("div#ideas_cmb_page_metabox").show();
    }
    
    jQuery('#page_template').on('change', function() {
    
    if(jQuery(this).val()=='page_templates/page-blog.php')
    {
    
    jQuery("div#ideas_cmb_post_cat_blog_page_option").show();    
    }
    else{
    jQuery("div#ideas_cmb_post_cat_blog_page_option").hide();
    }
}); 

/************************SERVICE PAGE TEMPLATE********************************/
 if(jQuery('#page_template').val()=='page_templates/page-service.php'){jQuery("div#ideas_cmb_service_metabox").show();}
   

    
    jQuery('#page_template').on('change', function() {
    
    if(jQuery(this).val()=='page_templates/page-service.php'){
    
    jQuery("div#ideas_cmb_service_metabox").show();
    }
    else{
    jQuery("div#ideas_cmb_service_metabox").hide();
    }
}); 

    /************************SHOP PAGE TEMPLATE********************************/
if(jQuery('#page_template').val()=='page_templates/archive-product-template.php')
{
    jQuery("div#ideas_cmb_shop_page_option").show();
    jQuery("div#ideas_cmb_page_metabox").hide();

}
   

    
    jQuery('#page_template').on('change', function() {
    
    if(jQuery(this).val()=='page_templates/archive-product-template.php'){
    
    jQuery("div#ideas_cmb_shop_page_option").show();
    jQuery("div#ideas_cmb_page_metabox").hide();
    }
    else{
    jQuery("div#ideas_cmb_shop_page_option").hide();
    jQuery("div#ideas_cmb_page_metabox").show();

    }
}); 
    
/*****FOR single POST PAGE FORMAT*****/
jQuery( document ).ready(function() {
  	if(jQuery('.post-format#post-format-gallery').is(':checked')){jQuery("#ideas_cmb_gallery_post_format_metabox").show();}
	if(jQuery('.post-format#post-format-quote').is(':checked')){jQuery("#ideas_cmb_quote_post_format_metabox").show();}
	if(jQuery('.post-format#post-format-audio').is(':checked')){jQuery("#ideas_cmb_audio_post_format_metabox").show();}
	if(jQuery('.post-format#post-format-video').is(':checked')){jQuery("#ideas_cmb_video_post_format_metabox").show();}


jQuery('.woocommerce_variation.wc-metabox h3').live('click',function()
  {   
    jQuery('.colorpicker').wpColorPicker();
  });

    
});

jQuery('.post-format').on('change', function() {
    
  
    if(jQuery(this).val()=='gallery'){    
    jQuery("#ideas_cmb_gallery_post_format_metabox").show();
    }
    else{
    jQuery("#ideas_cmb_gallery_post_format_metabox").hide();
    }
        
    
    if(jQuery(this).val()=='quote'){    
    jQuery("#ideas_cmb_quote_post_format_metabox").show();
    }
    else{
    jQuery("#ideas_cmb_quote_post_format_metabox").hide();
    }
    
    
    if(jQuery(this).val()=='audio'){    
    jQuery("#ideas_cmb_audio_post_format_metabox").show();
    }
    else{
    jQuery("#ideas_cmb_audio_post_format_metabox").hide();
    }
    
    if(jQuery('.post-format').val()=='video'){jQuery("#video_post_format_metabox").show();}
    if(jQuery(this).val()=='video'){   
    jQuery("#ideas_cmb_video_post_format_metabox").show();
    }
    else{
    jQuery("#ideas_cmb_video_post_format_metabox").hide();
    }
    
    
    
});