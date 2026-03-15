package basketball

import (
	"fmt"
	"sport-data/common"
)

const (
	API         = "https://v1.basketball.api-sports.io"
	Top14       = "Top 14"
	Premiership = "Premiership Rugby"
	dataDir     = "basketball"
)

func GetLeagues() error {
	return common.GetLeagues(dataDir, API)
}

func GetLeagueSeasonScore(leagueId, season int) error {
	url := fmt.Sprintf("%s/games?league=%d&season=%d", API, leagueId, season)
	return common.GetLeagueSeasonScore(dataDir, url, leagueId, season)
}

func GetLeagueIdFromNameAndCountry(name, country string) (int, error) {
	return common.GetLeagueIdFromNameAndCountry(dataDir, name, country)
}

func GetLeagueNameFromId(id int) (string, error) {
	return common.GetLeagueNameFromId(dataDir, id)
}
