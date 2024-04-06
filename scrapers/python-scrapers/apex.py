import sys
import json
import requests
from bs4 import BeautifulSoup

import locale
from datetime import datetime
locale.setlocale(locale.LC_TIME, 'de_DE.UTF-8')

url='https://www.apex-goe.de/veranstaltungen/'
file='../test_data/apex_new.html'
json_file='../../data/events.json'

CONSTANTS = {
    'place': 'Apex',
    'not_applicable': 'N/A',
    'url_root': 'https://www.apex-goe.de'
}


debug = True

# HELPERS
def make_soup_from_file(file):
    with open(file) as fp:
        soup = BeautifulSoup(fp)
    return soup

def make_soup_from_url(url):
    html = requests.get(url).text
    return BeautifulSoup(html, html.parser)

def write_json(events, json_file):
    with open(json_file) as f:
        all_events = json.load(f)
        all_events = all_events + events

    with open(json_file, "w") as f:
        json.dump(all_events, f)

def get_name(event):
    # Artist 
    try:
        artist = event.find(attrs={ 'class': 'kuenstler' }).text
    except(Exception) as err:
        pass
        print(err)
        artist = ''

    # Event name 
    try:
        event_name = event.find('div', {'class', 'title'}).text
    except(Exception) as err:
        pass
        print(err)
        name = CONSTANTS['not_applicable']

    return artist + ': ' + event_name

def get_type(ev):
    try:
        event_type = ev.find('div', { 'class': 'datloc'}).text.split('|')[1].strip()
    except(Exception) as err:
        pass
        print(err)
        event_type = CONSTANTS['not_applicable']

    return event_type

def get_link(ev):
    try:
        link = ev.find('div', { 'class': 'more'}).find('a').get('href')
    except(Exception) as err:
        pass
        print(err)
        link = CONSTANTS['not_applicable']

    return CONSTANTS['url_root'] + link

def get_date(ev):
    date_format = '%A, %d. %B %Y, %H:%M'

    try:
        _date = ev.find('div', { 'class': 'datloc'}).text.split('|')[0].split('Uhr')[0].strip()

        # Format date
        date = datetime.strptime(_date, date_format)
        # Turn date into an ISO string and add time zone info
        date = date.isoformat() + '.000Z'
    except(Exception) as err:
        pass
        print(err)
        date = CONSTANTS['not_applicable']

    return date

# GET DATA
def parse_events(soup):
    events = []
    html_events = soup.findAll('article')

    for ev in html_events:

        event = {
            'name': get_name(ev),
            'date': get_date(ev),
            'type': get_type(ev),
            'place': CONSTANTS['place'],
            'link': get_link(ev),
        }

        events.append(event)

        if debug:
            print(event)
            print('-----')

    return events


def init():
    # Make soup
    if !debug:
        soup = make_soup_from_url(url)
    else:
        soup = make_soup_from_file(file)

    # Parse data
    events = parse_events(soup)

    # Write it into a file
    write_json(events, json_file)

init()

