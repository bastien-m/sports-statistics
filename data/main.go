package main

import (
	"flag"
	"fmt"
	"os"
	"sport-data/basketball"
	"sport-data/football"
	"sport-data/handball"
	"sport-data/rugby"

	"github.com/joho/godotenv"
)

type Scraper interface {
	GetLeagues() error
	GetLeagueIdFromNameAndCountry(name, country string) (int, error)
	GetLeagueSeasonScore(leagueId, season int) error
}

type sportScraper struct {
	getLeagues                    func() error
	getLeagueIdFromNameAndCountry func(string, string) (int, error)
	getLeagueSeasonScore          func(int, int) error
}

func (s sportScraper) GetLeagues() error {
	return s.getLeagues()
}

func (s sportScraper) GetLeagueIdFromNameAndCountry(name, country string) (int, error) {
	return s.getLeagueIdFromNameAndCountry(name, country)
}

func (s sportScraper) GetLeagueSeasonScore(leagueId, season int) error {
	return s.getLeagueSeasonScore(leagueId, season)
}

var scrapers = map[string]Scraper{
	"rugby": sportScraper{
		getLeagues:                    rugby.GetLeagues,
		getLeagueIdFromNameAndCountry: rugby.GetLeagueIdFromNameAndCountry,
		getLeagueSeasonScore:          rugby.GetLeagueSeasonScore,
	},
	"football": sportScraper{
		getLeagues:                    football.GetLeagues,
		getLeagueIdFromNameAndCountry: football.GetLeagueIdFromNameAndCountry,
		getLeagueSeasonScore:          football.GetLeagueSeasonScore,
	},
	"basketball": sportScraper{
		getLeagues:                    basketball.GetLeagues,
		getLeagueIdFromNameAndCountry: basketball.GetLeagueIdFromNameAndCountry,
		getLeagueSeasonScore:          basketball.GetLeagueSeasonScore,
	},
	"handball": sportScraper{
		getLeagues:                    handball.GetLeagues,
		getLeagueIdFromNameAndCountry: handball.GetLeagueIdFromNameAndCountry,
		getLeagueSeasonScore:          handball.GetLeagueSeasonScore,
	},
}

var leaguesCmd = flag.NewFlagSet("leagues", flag.ExitOnError)
var leagueSeasonCmd = flag.NewFlagSet("league-season", flag.ExitOnError)
var leagueRangeCmd = flag.NewFlagSet("league-range", flag.ExitOnError)

func main() {
	godotenv.Load()

	if len(os.Args) < 2 {
		fmt.Println("Usage: sport-data <command> [options]")
		fmt.Println("  leagues        Fetch all leagues for a sport")
		fmt.Println("  league-season  Fetch scores for a league and season")
		fmt.Println("  league-range   Fetch scores for a league between two seasons")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "leagues":
		sport := leaguesCmd.String("sport", "", "Sport: football, basketball, handball, rugby (required)")
		leaguesCmd.Parse(os.Args[2:])

		if *sport == "" {
			fmt.Fprintln(os.Stderr, "Error: --sport is required")
			leaguesCmd.Usage()
			os.Exit(1)
		}

		scraper, ok := scrapers[*sport]
		if !ok {
			fmt.Fprintf(os.Stderr, "Error: unknown sport %q, must be one of: football, basketball, handball, rugby\n", *sport)
			os.Exit(1)
		}

		if err := scraper.GetLeagues(); err != nil {
			fmt.Fprintln(os.Stderr, "Error:", err)
			os.Exit(1)
		}

	case "league-season":
		sport := leagueSeasonCmd.String("sport", "", "Sport: football, basketball, handball, rugby (required)")
		league := leagueSeasonCmd.String("league", "", "League name (required)")
		country := leagueSeasonCmd.String("country", "", "Country name (required)")
		season := leagueSeasonCmd.Int("season", 0, "Season year (required)")
		leagueSeasonCmd.Parse(os.Args[2:])

		if *sport == "" || *league == "" || *country == "" || *season == 0 {
			fmt.Fprintln(os.Stderr, "Error: --sport, --league, --country and --season are required")
			leagueSeasonCmd.Usage()
			os.Exit(1)
		}

		scraper, ok := scrapers[*sport]
		if !ok {
			fmt.Fprintf(os.Stderr, "Error: unknown sport %q, must be one of: football, basketball, handball, rugby\n", *sport)
			os.Exit(1)
		}

		leagueId, err := scraper.GetLeagueIdFromNameAndCountry(*league, *country)
		if err != nil {
			fmt.Fprintln(os.Stderr, "Error:", err)
			os.Exit(1)
		}

		if err := scraper.GetLeagueSeasonScore(leagueId, *season); err != nil {
			fmt.Fprintln(os.Stderr, "Error:", err)
			os.Exit(1)
		}

	case "league-range":
		sport := leagueRangeCmd.String("sport", "", "Sport: football, basketball, handball, rugby (required)")
		league := leagueRangeCmd.String("league", "", "League name (required)")
		country := leagueRangeCmd.String("country", "", "Country name (required)")
		from := leagueRangeCmd.Int("from", 0, "Start season year (required)")
		to := leagueRangeCmd.Int("to", 0, "End season year (required)")
		leagueRangeCmd.Parse(os.Args[2:])

		if *sport == "" || *league == "" || *country == "" || *from == 0 || *to == 0 {
			fmt.Fprintln(os.Stderr, "Error: --sport, --league, --country, --from and --to are required")
			leagueRangeCmd.Usage()
			os.Exit(1)
		}

		scraper, ok := scrapers[*sport]
		if !ok {
			fmt.Fprintf(os.Stderr, "Error: unknown sport %q, must be one of: football, basketball, handball, rugby\n", *sport)
			os.Exit(1)
		}

		if *from > *to {
			fmt.Fprintln(os.Stderr, "Error: --from must be less than or equal to --to")
			os.Exit(1)
		}

		leagueId, err := scraper.GetLeagueIdFromNameAndCountry(*league, *country)
		if err != nil {
			fmt.Fprintln(os.Stderr, "Error:", err)
			os.Exit(1)
		}

		for season := *from; season <= *to; season++ {
			fmt.Printf("Fetching %s league %s season %d...\n", *sport, *league, season)
			if err := scraper.GetLeagueSeasonScore(leagueId, season); err != nil {
				fmt.Fprintf(os.Stderr, "Error for season %d: %v\n", season, err)
				os.Exit(1)
			}
		}

	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s\n", os.Args[1])
		os.Exit(1)
	}
}
