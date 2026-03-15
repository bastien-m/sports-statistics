package football

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

const (
	API     = "https://v3.football.api-sports.io"
	dataDir = "football"
)

type leaguesResponse struct {
	Response []struct {
		League struct {
			ID   int    `json:"id"`
			Name string `json:"name"`
		} `json:"league"`
		Country struct {
			Name string `json:"name"`
		} `json:"country"`
	} `json:"response"`
}

func fetch(url string) ([]byte, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set(os.Getenv("APIKEY_HEADER"), os.Getenv("APIKEY"))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}

func readLeagues() (leaguesResponse, error) {
	var result leaguesResponse
	data, err := os.ReadFile(dataDir + "/leagues.json")
	if err != nil {
		return result, err
	}
	err = json.Unmarshal(data, &result)
	return result, err
}

func GetLeagues() error {
	body, err := fetch(fmt.Sprintf("%s/leagues", API))
	if err != nil {
		return err
	}
	return os.WriteFile(dataDir+"/leagues.json", body, 0644)
}

func GetLeagueSeasonScore(leagueId, season int) error {
	body, err := fetch(fmt.Sprintf("%s/fixtures?league=%d&season=%d", API, leagueId, season))
	if err != nil {
		return err
	}

	leagueName, err := GetLeagueNameFromId(leagueId)
	if err != nil {
		return err
	}

	dir := fmt.Sprintf("%s/%s/%d", dataDir, leagueName, season)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	return os.WriteFile(dir+"/scores.json", body, 0644)
}

func GetLeagueIdFromNameAndCountry(name, country string) (int, error) {
	result, err := readLeagues()
	if err != nil {
		return 0, err
	}
	for _, item := range result.Response {
		if item.League.Name == name && item.Country.Name == country {
			return item.League.ID, nil
		}
	}
	return 0, fmt.Errorf("league %q not found in country %q", name, country)
}

func GetLeagueNameFromId(id int) (string, error) {
	result, err := readLeagues()
	if err != nil {
		return "", err
	}
	for _, item := range result.Response {
		if item.League.ID == id {
			return item.League.Name, nil
		}
	}
	return "", fmt.Errorf("league %d not found", id)
}
