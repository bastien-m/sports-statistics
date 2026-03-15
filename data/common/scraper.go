package common

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func GetLeagues(dataDir, API string) error {
	url := fmt.Sprintf("%s/leagues", API)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}
	req.Header.Set(os.Getenv("APIKEY_HEADER"), os.Getenv("APIKEY"))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	return os.WriteFile(dataDir+"/leagues.json", body, 0644)
}

func GetLeagueSeasonScore(dataDir, url string, leagueId, season int) error {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}
	req.Header.Set(os.Getenv("APIKEY_HEADER"), os.Getenv("APIKEY"))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	leagueName, err := GetLeagueNameFromId(dataDir, leagueId)
	if err != nil {
		return err
	}

	dir := fmt.Sprintf("%s/%s/%d", dataDir, leagueName, season)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	return os.WriteFile(dir+"/scores.json", body, 0644)
}

func GetLeagueIdFromNameAndCountry(dataDir, name, country string) (int, error) {
	data, err := os.ReadFile(dataDir + "/leagues.json")
	if err != nil {
		return 0, err
	}

	var result struct {
		Response []struct {
			ID      int    `json:"id"`
			Name    string `json:"name"`
			Country struct {
				Name string `json:"name"`
			} `json:"country"`
		} `json:"response"`
	}
	if err := json.Unmarshal(data, &result); err != nil {
		return 0, err
	}

	for _, league := range result.Response {
		if league.Name == name && league.Country.Name == country {
			return league.ID, nil
		}
	}

	return 0, fmt.Errorf("league %q not found in country %q", name, country)
}

func GetLeagueNameFromId(dataDir string, id int) (string, error) {
	data, err := os.ReadFile(dataDir + "/leagues.json")
	if err != nil {
		return "", err
	}

	var result struct {
		Response []struct {
			ID   int    `json:"id"`
			Name string `json:"name"`
		} `json:"response"`
	}
	if err := json.Unmarshal(data, &result); err != nil {
		return "", err
	}

	for _, league := range result.Response {
		if league.ID == id {
			return league.Name, nil
		}
	}

	return "", fmt.Errorf("league %d not found", id)
}
