# volunteer-central-site

This is a website. It is part of a set of projects related to RCGLA Volunteer Central:

* [The database](https://github.com/rcgla/volunteer-central-db)
* [The database API](https://github.com/rcgla/volunteer-central-db-api)
* [The site (this one)](https://github.com/rcgla/volunteer-central-site)


## Running the site

1. Setup [the database](https://github.com/rcgla/volunteer-central-db) and make sure PostgreSQL is running on your machine. You only have to setup the database once. Whatever PostgreSQL app you have running in the background will find the database when it is requested.
2. Start [the database API](https://github.com/rcgla/volunteer-central-db-api)
3. Open a terminal and go to the directory where you've cloned this repository. Make sure you're on the `dev` branch.
4. `cp example.env .env`
5. (one time only) `npm install`
6. (Every time you want to start it up) `npm run dev`
7. Point your browser to [localhost:8000](http://localhost:8000)
8. Optionally, login as an admin: `betro@example.com`/`dancingpaint`

## Background

### Architecture

* Express running on Node
* [Nunjucks](https://mozilla.github.io/nunjucks) templates
* Interacts with database by submitting GraphQL queries to [the database API](https://github.com/rcgla/volunteer-central-db-api)

### Philosophy

* HTML first
* Uses JS and CSS as progressive enhancements
* No heavy front-end frameworks
* Mobile-friendly layout
* Meets [accessibility standards](https://www.w3.org/TR/WCAG21/)
