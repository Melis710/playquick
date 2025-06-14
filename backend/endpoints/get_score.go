package endpoints

import (
	"graduation-system/crud"
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
)

type ScoreResponse struct {
	Username string `json:"username"`
	Score    int    `json:"score"`
}

func GetScore(c *gin.Context) {
	game := c.Param("game_name")

	available_games := []string{"car_game", "sliding_puzzle_game"}

	if !slices.Contains(available_games, game) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Game not found"})
		return
	}

	users := crud.GetUsersByGameName(game)
	if len(users) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No users in game"})
		return
	}

	var results []ScoreResponse

	for _, u := range users {
		results = append(results, ScoreResponse{
			Username: u.Username,
			Score:    u.Score,
		})
	}

	c.JSON(http.StatusOK, gin.H{"users": results})
}
