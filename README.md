# volunteer-central-site

This is a website. It attaches to a database, which you have to also setup. Instructions below.

## Database setup

Follow the instructions at [volunteer-central-db](https://github.com/rcgla/volunteer-central-db/tree/dev)

## Loading test data

You only have to do this once, or anytime you need to refresh the database.

1. Copy `example.env` to `.env` and to `/test/.env`
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
* Server uses graphQL internally (this reflects a personal preference for writing GraphQL instead of SQL). There is no production endpoint (at this time) for handling data queries (e.g. HTML + API style of client)

### Philosophy

* HTML first
* Uses JS and CSS as progressive enhancements
* No heavy front-end frameworks
* Mobile-friendly layout
* Meets [accessibility standards](https://www.w3.org/TR/WCAG21/)

### Routes

In the routes below, the version of the page that a user gets and also sometimes access to the route at all depends on their access level (ADMIN, STAFF, CLIENT)

* `/`
    home
* `/login`
    login form
* `/logout`
    logout

#### Users
* `/users/dashboard/`
    user dashboard
* `/users/`
    all the users ever
* `/users/:ID/`
    profile
* `/users/new`
    add a new person
* `/users/:ID/edit`
    edit person details
* `/users/:ID/delete`
    confirm delete a participant
* `/users/role/:ROLEID`
    all the users ever, with the given role

#### Events
* `/events`
    all events
* `/events/new`
    add a new event
* `/events/:ID`
    event details
* `/events/:ID/delete`
    confirm delete an event

Subtopics within events, e.g. 
* `/events/:ID/users`
* `/events/:ID/schedule` (activities)

#### Activities

Following the same pattern as above

* `/activities`
* `/activities/:ID`
* `/activities/new`
* `/activities/:ID/delete`


#### Tracks
* `/tracks`
* `/tracks/:ID`
* `/tracks/new`
* `/tracks/:ID/delete`


#### User groups

* `/user-groups`
* `/user-groups/:ID`
* `/user-groups/new`
* `/user-groups/:ID/delete`

#### Settings

* `/settings`
    Edit enums (User Group Types, Track Types, Roles, etc)

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
* Switch logins quickly: For parents with multiple campers enrolled. maybe work with cookies and swap out the token behind the scenes

### Caveats and other thoughts

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

#### Photos

Photos are organized by user and event; a standalone user does not have a photo, but when they are placed in an event, they can have a photo.

UI idea: import user's most recent photo to new event placements

## TODO

### Activities + role, activities + user groups
* user groups may participate in activities, e.g. band practice with "band #2"
* roles may participate in activities, e.g. front desk checkin with "Front desk support". It's complicated (see events.json 'roles' property for a sketch of what we need to store in DB).
* restrictVisibility option 

### Document templates

* See `volunteer-central-db/initial-schema/tables/TODO` for an outline of the document template system.
* This will be used for creating application, waiver, and other user form data storage.
