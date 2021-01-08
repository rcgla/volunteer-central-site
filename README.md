# volunteer-central-site

This is a website. It attaches to a database, which you have to also setup. Instructions below.

## Database setup

You only have to do this once.

1. Install PostgreSQL on your machine. There are many options, just google it.
1. Clone the volunteer central [database project](https://github.com/rcgla/volunteer-central-db). 
1. Switch to the `dev` branch
1. Open a terminal and go to the directory where you've cloned it.
1. Copy the environment variables file: `cp example.env .env`
1. Create a fresh (empty) database: `run-to-init-test-db.sh`

## Loading test data

You only have to do this once, or anytime you need to refresh the database.

1. From the `volunteer-central-site` directory: `npm run load-test-data`

## Starting the site

1. Start the web server: (Every time you want to start it up) `npm run dev`
1. Point your browser to [localhost:8000](http://localhost:8000)
1. Optionally, login as an admin: `mayor`/`dancingpaint`

## Tips

1. To test out a GraphQL query via an external tool like GraphiQL, start the site in development mode (`npm run dev`) and you'll have an endpoint at `localhost:8000/graphql`. 

## Background

### Architecture

* Express running on Node
* [Nunjucks](https://mozilla.github.io/nunjucks) templates
* Interacts with database by submitting GraphQL queries on the server. This reflects a personal preference for writing GraphQL instead of SQL. 

### Philosophy

* HTML first
* Uses JS and CSS as progressive enhancements
* No heavy front-end frameworks
* Mobile-friendly layout
* Meets [accessibility standards](https://www.w3.org/TR/WCAG21/)

### Routes

`/`
    home

`/login`
    login form

`/users/:ID/`
    profile

`/users/:ID/events/`
    camp events you're participating in

`/users/:ID/events/:ID/`
    event details

`/users/:ID/events/:ID/schedule`
    event schedule
    your events are highlighted (e.g. giving a workshop, teaching a class)

`/users/:ID/events/:ID/schedule/:ID`
    schedule entry details

`/users/:ID/events/:ID/groups`
    your groups (bands, crews, huddles)

`/admin/events/`
    all events

`/admin/events/:ID`
    event details

`/admin/events/new`
    add a new event

`/admin/events/:ID/delete`
    confirm delete an event

`/admin/events/:ID/schedule`
    event schedule

`/admin/events/:ID/schedule/:ID`
    schedule entry details

`/admin/events/:ID/participants`
    participants (e.g. vols and campers) for an event

`/admin/events/:ID/participants/volunteers`
    volunteers for an event

`/admin/events/:ID/participants/campers`
    campers for an event

`/admin/events/:ID/tracks`
    tracks in an event

`/admin/events/:ID/tracks/:ID`
    track details

`/admin/events/:ID/tracks/:ID/groups`
    groups for an event track

`/admin/groups/:ID`
    group details

`/admin/participants/`
    all the participants ever

`/admin/participants/:ID`
    volunteer details

`/admin/participants/campers`
    all the campers ever

`/admin/participants/volunteers`
    all the volunteers ever

`/admin/participants/new`
    add a new person

`/admin/participants/:ID/edit`
    edit person details

`/admin/participants/:ID/delete`
    confirm delete a participant

`/admin/events/:ID/schedule/new`
    new schedule entry

`/admin/events/:ID/schedule/:ID/delete`
    confirm delete schedule entry

## Featureset 

### Basic features

* Admin CRUD operations for camp data
* Volunteer logins and editing of own profile + availability
* Camper (camper parent) login and editing of own profile and view camp details
* Vols and campers can fill out applications

### Advanced features

* Band formation tool: based on a set of rules, create bands. Allow adjusting and regenerating.
* Visualize camp schedule: who goes where when. Possibly superimposed on a map of camp.
* Carpooler: Who can carpool based on address.
* Switch logins quickly: maybe work with cookies and swap out the token behind the scenes

### Caveats

#### UI for scheduling
Editing for repeating events can be for:
1. all events
2. one event, in which case the repeat flag is set to false after the edits are made and it's treated as a standalone event

Creating repeating events: 
* UI determines what options to offer (e.g. DAILY, WEEKDAYS) and creates DB entries for each event in the repeating sequence

Events may span multiple days; activities do not.

#### Displaying schedule times

Event start and end times should be adjusted to show the start and end times that are relevant to whoever is viewing the event.

E.g., an event that is client-visible, such as camp week, has a start date and time of Sunday 9am for Admins, Sunday 12pm for Volunteers, and Monday 9am for campers. 

#### Event and activity visibility rules

* Events are visible to 'CLIENT', 'STAFF', or 'ADMIN' usertypes, with cascades (e.g. Admin can view Staff events, Staff can view Client events)
* Activities should inherit the usertype visibility of their parent event, and are also able to narrow it down further via applying a different usertype that has a narrower scope than the event setting.
* In addition to usertype visibility, activities may be restricted in visibility to only the roles and user groups participating in that activity. 

TODO 

* role participation for activities
* optional "restrict visibility to participants" setting for activities
* RLS policies for activity visibility restriction

Activities
* user groups may participate in activities, e.g. band practice with "band #2"
* roles may participate in activities, e.g. front desk checkin with "Front desk team"

#### Photos

Photos are organized by user and event; a standalone user does not have a photo, but when they are placed in an event, they can have a photo.

UI idea: import user's most recent photo to new event placements