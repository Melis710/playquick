package endpoints

import (
	"graduation-system/crud"
	"graduation-system/util"
	"log"
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
)

type ScoreRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	GameName string `json:"game_name"`
	Score    int    `json:"score"`
}

func SaveScore(c *gin.Context) {
	var req ScoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	available_games := []string{"car_game", "sliding_puzzle_game"}

	if !slices.Contains(available_games, req.GameName) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Game not found"})
		return
	}

	user := crud.GetUserByUsernameAndGameName(req.Username, req.GameName)

	if user.ID == 0 {
		//User doesn't exist for that game create user and save score
		hashed_password, err := util.HashPassword(req.Password)
		if err != nil {
			log.Printf("Error hashing password %v", err)
		}
		user = crud.User{
			Username: req.Username,
			Password: hashed_password,
			Score:    req.Score,
			GameName: req.GameName,
		}

		crud.CreateUser(&user)
		c.JSON(http.StatusOK, gin.H{"message": "New user with score saved successfully"})
		return
	}

	//User does exist

	//Check password
	if !util.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wrong Password"})
		return
	}

	//Check if new score less or equal to old score
	log.Printf("%v", req.Score)
	if req.Score <= user.Score {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not highest score"})
		return
	}

	//Save new score
	user.Score = req.Score
	crud.UpdateUser(user)

	c.JSON(http.StatusOK, gin.H{"message": "Score saved successfully"})
}
