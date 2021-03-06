"""
Create a PB2 Title Object by parsing a libsyn RSS feed.
"""

# pylint: disable=R0904,W0231

from xml.etree import ElementTree
import urllib
from podiobooks.core.models import Episode, License, Title
from django.template.defaultfilters import slugify
from email.utils import mktime_tz, parsedate_tz
import datetime
import time
from django.utils import timezone
import re
from podiobooks.core.util import strip_tags


def create_title_from_libsyn_rss(rss_feed_url):
    """Parses a libsyn-generated RSS feed"""

    if rss_feed_url.startswith('http'):
        feed = urllib.urlopen(rss_feed_url)
        feed_tree = ElementTree.parse(feed).getroot()
        libsyn_slug = re.search('//(.*).podiobooks', rss_feed_url).group(1)
    else:  # Only unit tests hit this side
        feed_tree = ElementTree.parse(rss_feed_url).getroot()
        libsyn_slug = 'linus'

    if feed_tree is None:
        return None

    feed_tree = feed_tree.find('channel')

    title = Title()

    title.name = feed_tree.find('title').text

    title.slug = slugify(title.name)
    existing_slug_count = Title.objects.all().filter(slug=title.slug).count()
    if existing_slug_count > 0:
        title.slug += "---CHANGEME--" + str(time.time())

    title.old_slug = title.slug
    title.libsyn_slug = libsyn_slug

    title.description = strip_tags(feed_tree.find('description').text).strip()
    if feed_tree.find('{http://www.itunes.com/dtds/podcast-1.0.dtd}explicit').text == 'yes':
        title.is_explicit = True
    title.deleted = True

    title.libsyn_cover_image_url = feed_tree.find('image').find('url').text

    default_license = License.objects.get(slug='by-nc-nd')
    title.license = default_license

    title.save()
    items = feed_tree.findall('item')

    start_date = datetime.datetime.now(timezone.utc)

    for item in items:
        episode = Episode()
        episode.title = title
        episode.name = item.find('title').text
        episode.description = strip_tags(item.find('description').text).strip()
        episode.filesize = item.find('enclosure').get('length')
        episode.url = item.find('enclosure').get('url').replace('traffic.libsyn.com', 'media.podiobooks.com')
        episode.duration = item.find('{http://www.itunes.com/dtds/podcast-1.0.dtd}duration').text
        episode.media_date_created = datetime.datetime.fromtimestamp(mktime_tz(parsedate_tz(item.find('pubDate').text)),
                                                                     timezone.utc)
        try:
            episode.sequence = int(
                episode.url[episode.url.rfind('.') - 2:episode.url.rfind('.')])  # Use URL File Name to Calc Seq
            episode.media_date_created = start_date + datetime.timedelta(10, episode.sequence)
        except ValueError:
            print (episode.url)
            episode.sequence = 0
        episode.save()

    return title
