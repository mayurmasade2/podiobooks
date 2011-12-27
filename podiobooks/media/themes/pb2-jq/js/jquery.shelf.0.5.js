/*
 * History:
 * 
 * 0.1: Initial plugin creation
 * 0.2: Internalized checking for change form, adding binding for onChange
 * 0.3: Added some more settings for custom classes
 * 0.4: Shelf position indicator
 * 0.5: Support for shelves that don't need ajax calls
 */
(function( $ ){

	$.fn.pbShelf = function( options ) {
  
		var settings = {
			"cookie"		: 		null,
			"checkCookie"	: 		false,
			"shelfItem"		: 		".shelf-item",
			"shelfItemCover": 		".shelf-cover",
		};
		
		/*
		 * Debugging function for logging the current shelf status
		 */
		var status = function(){
			l("cur: " + cur);
			l("where: " + where);
			l("maxWidth: "  + maxWidth);
			l("itemWidth: " + itemWidth);
			l("numItems: " + numItems);
			l("numSteps : " + numSteps);
			l("curStep : " + curStep);
		};
		
		return this.each(function(){
			
			if (options){
				$.extend(settings,options);
			}
			
			
			/*
			 * Shelf status variables
			 */
			var where = 0;			// How many "titles in" the user is (integer, 0-# of books)
			var cur = 0;			// current number of pixles have been shoved left
			var maxWidth = 0;		// maximum number of pixels the shelf can move to the left
			var itemWidth = 0;		// how wide each .shelf-item is
			var numItems = 0;
			var numSteps = 0;
			var curStep = 0;
			
			/*
			 * Some shelf element localization
			 */
			var wholeShelf;
			
			var shelf = $(this);
			shelf.height(shelf.height());
			
			var shelfSteps;
			var leftArrow;
			var rightArrow;
						
			/*
			 * Store the shelf as local variable,
			 * Set shelf height 
			 * 
			 * (otherwise it compresses when elements are removed)
			 */
			
			
			
			/*
			 * If the shelf has a select box,
			 * bind the on-change event to reset the plugin
			 */
			if (shelf.has("form select")){
				var sel = shelf.find("form select");
				
				sel.unbind("change");
				
				sel.change(function(){
					
					if (settings.cookie){
						shelf.pbShelf({
							"url" : sel.parents("form").attr("action") + sel.val(), 
							"cookie":settings.cookie
						});
					}
					else{
						shelf.pbShelf({"url" : sel.parents("form").attr("action") + sel.val()});
					}
				});				
			}
			
			
	
			var makeShelf = function(){
				
				shelfSteps = $("<ul class='shelf-step'/>").prependTo(shelf);
				
				/*
				 * If the appended data has shelf items,
				 * proceed with building shelf functionality
				 */
				if(shelf.find(settings.shelfItem).length){
					
					/*
					 * Find all shelf items that arent marked as covers being loaded
					 */
					$(shelf).find(settings.shelfItemCover).find("img:not(.shelf-cover-loading)").each(function(){
						
						var img = $(this);
						
						/*
						 * Hide the image, replace it with a progress loader graphic
						 */
						img.hide();
						var loader = $("<img class='shelf-cover-loading' src='" + siteVars("img") + "loading.gif' />").appendTo(img.parents(".shelf-cover"));
						
						/*
						 * Once the real cover has loaded,
						 * remove the loader graphic, fade in the cover
						 */
						img.imagesLoaded(function(){
							img.unbind("load");
							loader.remove();
							img.fadeIn();
							
						});
					});
					
					
					/*
					 * while the covers are loading, hide the progress bar
					 */
					if (progress){
						progress.hide();
					}
					
					
					/*
					 * Find all the shelf items,
					 * add up their total widths
					 */
					var shelfItems = shelf.find(settings.shelfItem);
					var w = 0;
					shelfItems.each(function(){
						numItems++;
						itemWidth = parseInt($(this).width()) + parseInt($(this).css("padding-left")) + parseInt($(this).css("padding-right")) + parseInt($(this).css("margin-left")) + parseInt($(this).css("margin-right"));
						w += itemWidth;
					});
					maxWidth = w;
					
					
					/*
					 * Wrap all the shelf items,
					 * create a "field of vision"
					 */
					shelf.children(settings.shelfItem).wrapAll("<div class='whole-shelf'/>");
					wholeShelf = shelf.children(".whole-shelf");
					wholeShelf.wrap("<div class='shelf-view'/>");
					
					
					/*
					 * Append the right/left arrows,
					 * let the arrow handler figure out
					 * if they should be shown or hidden
					 */
					leftArrow.appendTo(shelf);
					rightArrow.appendTo(shelf);
					handleArrows();
				}
				else{
					/*
					 * If there were no returned shelf items,
					 * Just hide the progress bar
					 */
					handleArrows();
					progress.hide();
				}
				
				
				/*
				 * Click events for right and left arrows
				 */
				if (rightArrow){
					rightArrow.click(function(e){
						e.preventDefault();
						if (cur < maxWidth - shelf.width()){							
							where += shelf.width() / itemWidth;
							if (where * itemWidth > maxWidth - shelf.width()){
								where = (maxWidth - shelf.width()) / itemWidth;
							}
							var targ = "-" + (where * itemWidth) + "px";
							
							
							cur = where * itemWidth;
							
							wholeShelf.animate({
								left:targ
							},600,"easeOutCirc");
						}
						handleArrows();
					});
				}
				
				if (leftArrow){
					leftArrow.click(function(e){
						e.preventDefault();
						
						if (cur > 0){							
							where -= shelf.width() / itemWidth;
							if (where < 0){
								where = 0;
							}
							var targ = "-" + (where * itemWidth) + "px";
							cur = where * itemWidth;							
							wholeShelf.animate({
								left:targ
							},600,"easeOutCirc");
						}
						handleArrows();
					});
				}
				/*
				 * Add arrow/positioner to window resize
				 * 
				 * I don't know if there are serious 
				 * performance implications here...
				 * 
				 */
				$(window).unbind("resize",handleArrows);
				$(window).bind("resize",handleArrows);
				
				
				/*
				 * Use the jquery.touchSwipe plugin
				 * to have swipes trigger click events 
				 * on the arrows
				 */
				if (wholeShelf){
					wholeShelf.swipe({
						swipeLeft:function(event){
							rightArrow.trigger("click");	
						},
						swipeRight:function(event){
							leftArrow.trigger("click");
						},
						allowPageScroll:"vertical"						
					});
				}
			};
			
			
			/*
			 * If we should be checking the cookie,
			 * check it, then set the inital select box value
			 */
			if (settings.checkCookie){
				if($.cookie(settings.cookie)){
					if (shelf.has("form select")){
						shelf.find("form select").val($.cookie(settings.cookie));
						settings.url += $.cookie(settings.cookie);
					}					
				}
			}
			
			
			/*
			 * If we have a cookie name to set, set it 
			 * based on the currently selected form>select
			 */
			if(settings.cookie){
				$.cookie(settings.cookie,shelf.find("form select").val(),{expires:7});
			}		
			
			
			
			/*
			 * Right/left shelf arrows
			 * create, added/removed to/from shelf later
			 */
			
			leftArrow = $("<a class='shelf-arrow shelf-arrow-left' href='#'></a>");
			rightArrow = $("<a class='shelf-arrow shelf-arrow-right' href='#'></a>");
			
			
			
			
			/*
			 * Swift step: 
			 * Moving via position dots
			 */
			var bindSwiftStep = function(a,i,per){
				a.unbind("click");
				a.click(function(e){
					e.preventDefault();
										
					var px = i * per * itemWidth;
					if (px > maxWidth - shelf.width()){
						px = maxWidth - shelf.width();
					}
					
					var targ = "-" + (px) + "px";
					where = px / itemWidth;
					cur = px;
					
					wholeShelf.animate({
						left:targ
					},600,"easeOutCirc");
					
					handleArrows();
				});
			};
				
			/*
			 * Current shelf position
			 */
			 var handleShelfPosition = function(){
			 	shelfSteps.children().remove();
			 	
			 	if (shelf.find(settings.shelfItem).length){
			 		
				 	// make sure we always round up
				 	numSteps = Math.ceil(maxWidth / shelf.width());	
				 	var perSlide = Math.floor(shelf.width() / itemWidth);
				 	
				 	curStep = Math.ceil((cur / itemWidth) / perSlide);
				 	
				 	for (var i = 0; i < numSteps; i++){
				 		var li;
				 		if (i == curStep){
				 			li = $("<li><a class='shelf-step-cur' href='#'></a></li>").appendTo(shelfSteps);
				 		}
				 		else{
				 			li = $("<li><a href='#'></a></li>").appendTo(shelfSteps);
				 		}
				 		
				 		circ = li.find("a");
				 		
				 		bindSwiftStep(circ,i,perSlide);
				 	}
				 	
				 	
				 	/*
				 	 * Center the step indicator based on percentage
				 	 */
				 	shelfSteps.css({'left':(shelf.width() / 2 - shelfSteps.width() / 2) / shelf.width() * 100 + "%"});
				 	
				 	
				 	/*
				 	 * If there is only 1 step and there 
				 	 * are less shelf items than shelf spaces,
				 	 * hide the shelf progress indicator
				 	 */
				 	if (numSteps < 2 && shelf.find(settings.shelfItem).length < perSlide){
				 		shelfSteps.children().remove();
				 		
				 	}
			 	}
			 };
			 
			 
			/*
			 * Hiding/showing arrows 
			 * based on shelf position
			 */
			var handleArrows = function(){
				
				if (cur == 0){
					leftArrow.hide();
				}
				else{
					leftArrow.show();
				}
				if (cur < maxWidth - shelf.width()){
					rightArrow.show();
				}
				else{
					rightArrow.hide();
				}
				//status();
				handleShelfPosition();
								
			};
			
			/*
			 * Big beefy ajax workhorse
			 */
			if (settings.url){
				
				/*
				 * Remove all content from shelf,
				 * except for the select box
				 * 
				 * This allows the plugin to call itself,
				 * instead of the calling script needing to declare
				 * an on-change event for the select box
				 */
				shelf.children().each(function(){
					if (!($(this).is("form"))){
						$(this).html("");
						$(this).remove();
					}
				});
				
				/*
				 * Ajax Progress element image, 
				 * appears in middle of shelf during onchange ajax call
				 * 
				 * Create it, append it to the body for caching, 
				 * move it into the shelf and show
				 */ 
				var progress = $("<p class='shelf-ajax-loader'><img src='" + siteVars("img") + "ajax-loader-bar.gif'/></p>");
				progress.appendTo($("body"));
				progress.appendTo(shelf).show();
			
				
				$.ajax({
					method:"get",
					url:settings.url,
					success:function(data){
						
						/*
						 * Ajax request should return HTML
						 * 
						 * Append all data to the shelf
						 */
						$(data).appendTo(shelf);
						makeShelf();			
					}
				});
			}
			else{				
				makeShelf();
			}
		});
	};
})( jQuery );


						