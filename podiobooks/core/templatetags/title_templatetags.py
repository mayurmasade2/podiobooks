""" Tags used for working with Titles """

from django import template

register = template.Library()

@register.inclusion_tag('core/title/tags/show_awardshow.html')
def show_awardshow(title):
    """ Show a slideshow of all the awards for a title, used on title detail page """
    return { 'award_list': title.awards.order_by('-date_updated').all() }

@register.inclusion_tag('core/title/tags/show_categories.html')
def show_categories(title):
    """ Pulls and formats a list of all the categories for a Title """
    categories = title.categories.all()
    return { 'categories': categories }

@register.inclusion_tag('core/title/tags/show_contributors.html')
def show_contributors(title):
    """ Pulls and formats a list of all the contributors for a Title """
    titlecontributors = title.titlecontributors.all().order_by('contributor_type__slug', 'date_created')
    return { 'titlecontributors' : titlecontributors }

@register.inclusion_tag('core/title/tags/show_titlecover.html')
def show_titlecover(title, cover_height, cover_width):
    """ Pulls and formats the cover for a Title """
    return { 'title': title, 'cover_height': cover_height, 'cover_width': cover_width }

@register.inclusion_tag('core/title/tags/show_titlelist.html')
def show_titlelist(title_list, page_name):
    """ Formats a list of titles, used on search, category, author list pages """
    return { 'title_list': title_list, 'page_name': page_name }

@register.inclusion_tag('core/title/tags/show_episodelist.html')
def show_episodelist(title):
    """ Show a list of all the episodes for a title, used on title detail page """
    return { 'episode_list': title.episodes.order_by('sequence').all() }