# Sport Statistics

This project show simple data about

- rugby
- football
- basketball
- handball

about win rate, championship distribution and similar data to get a grasp of equity in these sports

Data come from [api-sports.io](https://api-sports.io/)

## Scraper

We store data from `api-sports.io` in our db so we call this API only once during scraping.

Scraper is a CLI tools, command usage

```sh
# Retrieve every basketball leagues availables (should be ran before any other command for a sport)
go run . leagues --sport basketball

# Retrieve all score for France basketball 1st division from 2018 to 2024
go run . league-range --sport basketball --league LNB --country France --from 2018 --to 2024
```

## Website (not done yet)

Built using NextJS for SSG, allowing to serve this project as a simple HTML/JS/CSS website without requiring
any backend.

## Visit (not done yet)

Would be deployed on github pages
