package common

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type MatchTeam struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

type League struct {
	Id     int    `json:"id"`
	Name   string `json:"name"`
	Season int    `json:"season"`
}

type Country struct {
	Name string `json:"name"`
}

type Score struct {
	Home int `json:"home"`
	Away int `json:"away"`
}

type Teams struct {
	Home MatchTeam `json:"home"`
	Away MatchTeam `json:"away"`
}

type MatchStatistics struct {
	Date    time.Time `json:"date"`
	Week    string    `json:"week"`
	Country Country   `json:"country"`
	League  League    `json:"league"`
	Teams   Teams     `json:"teams"`
	Scores  Score     `json:"scores"`
}

var sports = []string{"rugby", "basketball", "handball", "football"}

func FindLeagueDir(league string) (string, error) {
	for _, sport := range sports {
		dir := filepath.Join(sport, league)
		if _, err := os.Stat(dir); err == nil {
			return dir, nil
		}
	}
	return "", fmt.Errorf("league %q not found", league)
}

func IngestSeason(league string, season int) error {
	dir, err := FindLeagueDir(league)
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
		Response []MatchStatistics `json:"response"`
	}

	if err := json.Unmarshal(data, &result); err != nil {
		return err
	}

	return IngestMatches(result.Response)
}

func IngestMatches(matches []MatchStatistics) error {
	client, err := mongoClient()
	if err != nil {
		return err
	}
	defer client.Disconnect(context.Background())

	coll := client.Database("sport-data").Collection("matches")

	_, err = coll.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys: bson.D{{Key: "date", Value: 1}},
	})
	if err != nil {
		return err
	}

	if len(matches) == 0 {
		return nil
	}

	docs := make([]any, 0, len(matches))
	for _, m := range matches {
		docs = append(docs, m)
	}

	_, err = coll.InsertMany(context.Background(), docs)
	return err
}

func IngestMatch(stats MatchStatistics) error {
	return IngestMatches([]MatchStatistics{stats})
}

func mongoClient() (*mongo.Client, error) {
	uri := fmt.Sprintf("mongodb://%s:%s@%s", os.Getenv("MONGODB_USER"), os.Getenv("MONGODB_PASSWORD"), os.Getenv("MONGODB_HOST"))
	return mongo.Connect(options.Client().ApplyURI(uri))
}
