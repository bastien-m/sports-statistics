package football

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sport-data/common"
	"strconv"
	"time"
)

type League struct {
	common.League
	Country string `json:"country"`
}

type Fixture struct {
	Date time.Time `json:"date"`
}

type Goals struct {
	Home int `json:"home"`
	Away int `json:"away"`
}

type FootballMatchStatistics struct {
	Fixture Fixture      `json:"fixture"`
	League  League       `json:"league"`
	Teams   common.Teams `json:"teams"`
	Goals   Goals        `json:"goals"`
}

func IngestSeason(league string, season int) error {
	dir, err := common.FindLeagueDir(league)
	if err != nil {
		return err
	}

	seasonDir := filepath.Join(dir, strconv.Itoa(season))
	file := filepath.Join(seasonDir, "scores.json")
	if _, err := os.Stat(file); os.IsNotExist(err) {
		file = filepath.Join(seasonDir, "season.json")
	}

	data, err := os.ReadFile(file)
	if err != nil {
		return err
	}

	var result struct {
		Response []FootballMatchStatistics `json:"response"`
	}

	if err := json.Unmarshal(data, &result); err != nil {
		return err
	}

	matches := make([]common.MatchStatistics, 0, len(result.Response))
	for _, r := range result.Response {
		matches = append(matches, common.MatchStatistics{
			Date:    r.Fixture.Date,
			Country: common.Country{Name: r.League.Country},
			League:  r.League.League,
			Teams:   r.Teams,
			Scores:  common.Score{Home: r.Goals.Home, Away: r.Goals.Away},
		})
	}

	return common.IngestMatches(matches)
}
